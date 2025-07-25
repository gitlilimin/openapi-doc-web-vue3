<template>
    <div class="cp-page-content px-2">
        <div class="tip-box">
            <div v-if="!loading && !my_tags.length" class="text-center py-8 bg-gray-100 rounded">
                暂无Api数据
            </div>
            <div v-else-if="loading" class="text-center py-8 bg-gray-100 rounded">
                <a-spin tip="加载中..." />
            </div>
        </div>

        <div class="tag-box" v-for="(tag, tag_index) in my_tags" :key="`tag-${tag_index}`">
            <div class="tag-title card shadow-lg" :data-tag-name="tag.name">{{ tag.name }}</div>
            <div class="api-box">
                <!-- 这里遍历每个API -->
                <div
                    class="api-item"
                    v-for="(path_data, path) in tag.paths"
                    :key="`api-${path}`"
                    @click="current_active_path = path"
                >
                    <div
                        class="operation-item card shadow"
                        :class="{ active: current_active_path == path }"
                        v-for="(operation, operation_method) in path_data"
                        :key="`operation-${operation_method}`"
                        :data-path="path"
                    >
                        <div class="title">{{ (operation as Operation).summary }}</div>
                        <div
                            class="description py-2 px-2"
                            v-if="(operation as Operation).description"
                        >
                            <div
                                v-for="it,index in (operation as any).description.split('<br/>')"
                                :key="index"
                            >
                                {{ it }}
                            </div>
                        </div>
                        <div class="path-box flex-box overflow-x-auto">
                            <div class="path copy-path flex-1 flex-box" :data-path="path">
                                <a-tag color="#87d068">{{
                                    strFirstToUpper(operation_method)
                                }}</a-tag>
                                <div class="flex-1">{{ path }}</div>
                            </div>
                            <a-tag
                                class="cursor-pointer mx-2 px-4 py-2"
                                color="#40a9ff"
                                @click="sendDebug(path, operation_method, operation)"
                                >发起请求</a-tag
                            >
                        </div>

                        <a-table
                            v-if="(operation as Operation).parameters && (operation as any).parameters.length"
                            :dataSource="(operation as Operation).parameters"
                            bordered
                            size="small"
                            :pagination="false"
                            :scroll="{ x: 'max-content' }"
                            @resizeColumn="(w, col) => (col.width = w)"
                        >
                            <a-table-column key="name" title="Key" :width="100">
                                <template #default="{ record }">
                                    <div
                                        class="param-name copy-param cursor-pointer"
                                        :data-name="record.name"
                                    >
                                        {{ record.name }}
                                    </div>
                                </template>
                            </a-table-column>
                            <a-table-column key="schema" title="类型" :width="70">
                                <template #default="{ record }">
                                    {{ record.schema && record.schema.type }}
                                </template>
                            </a-table-column>
                            <a-table-column key="required" title="默认值" :width="160">
                                <template #default="{ record }">
                                    <a-tag v-if="record.required" color="green">必须</a-tag>
                                    <div v-else>{{ record.schema?.example }}</div>
                                </template>
                            </a-table-column>
                            <a-table-column key="in" title="位置" data-index="in" :width="80" />
                            <a-table-column
                                key="description"
                                title="描述"
                                data-index="description"
                                :min-width="300"
                                :width="320"
                            />
                            <a-table-column key="debug" title="调试" :width="320">
                                <template #default="{ record }">
                                    <a-switch
                                        v-if="record.schema?.type === 'boolean'"
                                        v-model:checked="record._debug_value"
                                    />
                                    <a-textarea
                                        v-else-if="
                                            ['array', 'object'].includes(record.schema?.type)
                                        "
                                        v-model:value="record._debug_value"
                                    />
                                    <a-input
                                        v-else
                                        v-model:value="record._debug_value"
                                        :type="
                                            ['number', 'integer'].includes(record.schema?.type)
                                                ? 'number'
                                                : 'text'
                                        "
                                    />
                                </template>
                            </a-table-column>
                        </a-table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import clipboard from 'clipboard'
import axios from 'axios'
import { cloneDeep } from 'lodash-es'
import { message } from 'ant-design-vue'
import { strFirstToUpper } from '@/libs/tools'
import type { Tag } from '@/constants/app'
import type { Swagger } from '@/constants/swagger'
import { useAppStore } from '@/stores/app'

interface Operation extends Swagger.Operation3 {}

const props = defineProps({
    tags: {
        type: Array as PropType<Tag[]>,
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: false,
    },
    server: {
        type: Object as PropType<Swagger.Server | null>,
        default: null,
    },
})

const appStore = useAppStore()

const emit = defineEmits([])

// 当前激活效果
const current_active_path = ref<string | number>('')

// 滚动到指定Path
const scrollToPath = (path: string, offset: number = 0, smooth: boolean = false) => {
    let find = Array.from(document.getElementsByClassName('operation-item')).find(
        (it) => (it as any).dataset.path == path
    )
    if (find) {
        window.scrollTo({
            top: (find as any).offsetTop + offset,
            behavior: smooth ? 'smooth' : undefined,
        })
        current_active_path.value = path
    }
}
/**
 * 滚动到指定Tag
 * @param tagName Tag名
 * @param offset 上下偏移量
 * @param smooth 是否平滑
 */
const scrollToTag = (tagName: string, offset: number = 0, smooth: boolean = false) => {
    let find = Array.from(document.getElementsByClassName('tag-title')).find(
        (it) => (it as any).dataset.tagName == tagName
    )
    if (find) {
        window.scrollTo({
            top: (find as any).offsetTop + offset,
            behavior: smooth ? 'smooth' : undefined,
        })
    }
}

// 添加debug属性
const my_tags = ref<Tag[]>([])

watch(
    () => props.tags,
    (tags) => {
        let result = cloneDeep(tags)
        result.forEach((tag) => {
            Object.keys(tag.paths).forEach((pathStr) => {
                Object.keys(tag.paths[pathStr]).forEach((methodName) => {
                    tag.paths[pathStr][methodName].parameters.forEach(
                        (param: Operation & { _debug_value?: any; schema: Swagger.Schema3 }) => {
                            // 对array/object特殊处理
                            param._debug_value = param.schema?.example
                            const paramType = param.schema?.type || 'string'

                            if (paramType == 'boolean') {
                                param._debug_value = !!param.schema?.example
                            } else if (['array', 'object'].includes(paramType)) {
                                param._debug_value =
                                    'example' in param.schema && param.schema.example !== null
                                        ? JSON.stringify(
                                              param.schema?.example ??
                                                  (param.schema.type == 'array' ? [] : {})
                                          )
                                        : undefined
                            } else if (['number', 'integer'].includes(paramType)) {
                                param._debug_value =
                                    'example' in param.schema && param.schema.example !== null
                                        ? Number(param.schema.example)
                                        : undefined
                            }
                        }
                    )
                })
            })
        })
        my_tags.value = result
    },
    { immediate: true, deep: true }
)

// 发起调试事件
const sendDebug = (path, method, apiItemData) => {
    if (!props.server) return message.error('请先选择环境')

    let url = `${props.server.url}${path}`

    // 处理全局参数
    let globalQuery = {}
    let globalHeaders = {}
    let globalBody = {}

    if (Array.isArray(appStore.storeSetting.globalParams)) {
        appStore.storeSetting.globalParams.forEach((p) => {
            if (p.in == 'query') {
                globalQuery[p.name] = p.value
            } else if (p.in == 'header') {
                globalHeaders[p.name] = p.value
            } else if (p.in == 'body') {
                globalBody[p.name] = p.value
            }
        })
    }

    // 本接口设置的参数
    let params = {}
    if (Array.isArray(apiItemData.parameters)) {
        apiItemData.parameters.forEach((p) => {
            // 考虑参数类型，转换一下
            const paramType = p.schema?.type || 'string'
            if (p._debug_value === 'null') {
                params[p.name] = null
            } else if (paramType === 'number' || paramType === 'integer') {
                params[p.name] =
                    '_debug_value' in p && p._debug_value !== null
                        ? Number(p._debug_value)
                        : undefined
            } else if (paramType === 'boolean') {
                params[p.name] = Boolean(p._debug_value)
            } else if (['array', 'object'].includes(paramType)) {
                try {
                    if ('_debug_value' in p && p._debug_value !== null) {
                        params[p.name] = JSON.parse(p._debug_value)
                    }
                } catch (e) {
                    params[p.name] = p._debug_value ? p._debug_value : undefined
                    message.warning(`注意 ${p.name} 的值不是合法的JSON格式，将以字符串形式发送`)
                }
            } else {
                params[p.name] = p._debug_value
            }
        })
    }

    if (['post', 'put', 'patch'].includes(method.toLowerCase())) {
        axios({
            url,
            method,
            params: globalQuery,
            data: { ...globalBody, ...params },
            headers: {
                ...globalHeaders,
                'Content-Type': appStore.requestSetting.post.contentType || 'application/json',
            },
        })
            .then((res) => console.log('请求成功', res.data))
            .catch((e) => console.log('请求失败', e))
    } else {
        axios({ url, method, params: globalQuery, headers: globalHeaders })
            .then((res) => console.log('请求成功', res.data))
            .catch((e) => console.log('请求失败', e))
    }
    message.success('发起请求成功，详情参见Console或Network')
}

watch(current_active_path, (path) => {
    // 在url上加一个hash，值为当前激活的path
    location.hash = `${path}`
})

// 处理可点击复制的内容
let clips: clipboard[] = [] // 所有粘贴板实例，为了unmounted时销毁
onMounted(() => {
    const copyPath = new clipboard('.copy-path', {
        text: function (trigger) {
            return (trigger as any).dataset.path
        },
    }).on('success', () => {
        message.success('Path已复制到粘贴板')
    })
    clips.push(copyPath)

    const copyParam = new clipboard('.copy-param', {
        text: function (trigger) {
            return (trigger as any).dataset.name
        },
    }).on('success', () => {
        message.success('参数已复制到粘贴板')
    })
    clips.push(copyParam)

    // 根据hash自动滚动
    if (location.hash) {
        const path = location.hash.slice(1)
        setTimeout(() => {
            scrollToPath(path, -80)
        }, 1000)
    }
})
onUnmounted(() => {
    clips.forEach((clip) => clip.destroy())
})

// 暴露方法
defineExpose({ scrollToTag, scrollToPath })
</script>
<style scoped lang="less">
.cp-page-content {
    .card {
        border-radius: 6px;
        padding: 10px 18px;
        margin: 12px 8px;
        background: #fff;
    }

    .tag-box {
        .tag-title {
            background: #5c91b7;
            color: #fff;
            font-size: 18px;
            font-weight: 600;
        }
    }

    .api-box {
        .operation-item {
            &.active {
                box-shadow: 0 0 10px rgba(255, 0, 0, 0.6);
            }

            .title {
                font-size: 17px;
                font-weight: 600;
                margin-top: 6px;
            }

            .path {
                background: #eee;
                padding: 8px 16px;
                margin: 10px 0;
                border-radius: 2px;
                cursor: pointer;
            }
        }
    }
}
</style>
