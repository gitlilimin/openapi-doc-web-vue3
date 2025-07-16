<template>
    <div class="cp-side-menu">
        <div class="tip-box">
            <div v-if="!loading && !tags.length" class="text-center py-8 bg-gray-100 rounded">
                暂无Api数据
            </div>
            <div v-else-if="loading" class="text-center py-8 bg-gray-100 rounded">
                <a-spin tip="加载中..." />
            </div>
        </div>

        <div class="tags" v-for="(tag, tag_index) in show_tags" :key="`tag-${tag_index}`">
            <div class="tag-name" @click="emit('click-tag', tag)">{{ tag.name }}</div>
            <div class="apis" v-for="(path_data, path) in tag.paths" :key="`api-${path}`">
                <div
                    class="api"
                    v-for="(operation, operation_method) in path_data"
                    :key="`operation-${operation_method}`"
                    @click="emit('click-path', path, path_data)"
                >
                    {{ (operation as Operation).summary }}
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import type { Swagger } from '@/constants/swagger'
import type { Tag } from '@/constants/app'

interface Operation extends Swagger.Operation3 {}

const props = withDefaults(
    defineProps<{
        tags: Tag[]
        searchWord?: string
        loading?: boolean
    }>(),
    {
        tags: () => [],
        searchWord: '',
        loading: false,
    }
)

const emit = defineEmits(['click-tag', 'click-path'])

const show_tags = computed(() => {
    if (props.searchWord) {
        let resultTags: Tag[] = []
        props.tags.forEach((tag) => {
            let currentTag = { name: tag.name, paths: {} }
            Object.keys(tag.paths).forEach((pathName) => {
                let is_push = false
                let pathOperations = tag.paths[pathName]
                Object.keys(pathOperations).forEach((optName) => {
                    if (is_push) return
                    let opt = pathOperations[optName] as Swagger.Operation3
                    if (
                        (opt.summary && opt.summary.includes(props.searchWord)) ||
                        pathName.includes(props.searchWord)
                    ) {
                        currentTag.paths[pathName] = pathOperations
                        is_push = true
                    }
                })
            })
            if (Object.keys(currentTag.paths).length) resultTags.push(currentTag)
        })
        return resultTags
    }

    return props.tags
})
</script>
<style scoped lang="less">
.cp-side-menu {
    padding: 10px 12px;
    // color: #fff;
    line-height: 1.2;
    width: 100%;
    overflow: hidden;
    .tags {
        .tag-name {
            padding: 8px 10px;
            cursor: pointer;
            border-radius: 4px;
            font-size: 16px;
            &:hover {
                background: #e2e2e2;
            }
        }
        .apis {
            .api {
                font-size: 14px;
                padding: 8px 10px;
                padding-left: 26px;
                cursor: pointer;
                border-radius: 4px;
                &:hover {
                    background: #e2e2e2;
                }
            }
        }
    }
}
</style>
