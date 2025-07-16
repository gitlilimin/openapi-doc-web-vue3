<template>
    <div class="cp-top-menu h-full flex-box justify-between items-stretch">
        <div class="left h-full flex-box">
            <div class="navbar-icon-item" @click="emit('update:siderCollapsed', !siderCollapsed)">
                <DoubleLeftOutlined :rotate="siderCollapsed ? 180 : 0" />
            </div>
            <div class="navbar-icon-item" @click="show_question_modal = true">
                <QuestionCircleOutlined />
            </div>
            <template v-if="width >= 800">
                <div class="ml-2 mr-4">OpenApi Doc</div>
                <a href="https://gitee.com/lilimin/open-api-doc-vue3/stargazers" target="_blank">
                    <img
                        src="https://gitee.com/lilimin/open-api-doc-vue3/badge/star.svg?theme=white"
                        alt="star"
                    />
                </a>
            </template>
        </div>
        <div class="right h-full flex-box items-stretch">
            <div class="navbar-icon-item" @click="emit('click-params-tool')">
                <SendOutlined :rotate="-50" />
            </div>

            <a-dropdown class="h-full" v-if="servers.length" trigger="click">
                <a-button type="text">
                    <span v-if="!servers[currentServerIndex]">切换环境</span>
                    <span v-else>{{ servers[currentServerIndex].description }}</span>
                    <DownOutlined />
                </a-button>
                <template #overlay>
                    <a-menu>
                        <a-menu-item
                            v-for="(it, index) in servers"
                            :key="index"
                            @click="emit('update:currentServerIndex', index)"
                        >
                            <div>{{ it.description }}</div>
                        </a-menu-item>
                    </a-menu>
                </template>
            </a-dropdown>

            <a-dropdown class="h-full" v-if="apiGroups.length" trigger="click">
                <a-button type="text">
                    <span v-if="!currentGroup">选择API文档</span>
                    <span v-else>{{ currentGroup.name }}</span>
                    <DownOutlined />
                </a-button>
                <template #overlay>
                    <a-menu>
                        <a-menu-item
                            v-for="(it, index) in apiGroups"
                            :key="index"
                            @click="emit('change-group', { group: it, index })"
                        >
                            <div>{{ it.name }}</div>
                        </a-menu-item>
                    </a-menu>
                </template>
            </a-dropdown>
        </div>

        <QuestionModal v-model:show="show_question_modal" />
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useWindowSize } from '@vueuse/core'
import {
    DoubleLeftOutlined,
    DownOutlined,
    QuestionCircleOutlined,
    SendOutlined,
} from '@ant-design/icons-vue'
import { Swagger } from '@/constants/swagger'
import { OriginApiGroup } from '@/constants/app'
import QuestionModal from '@/components/question-modal/index.vue'

const props = withDefaults(
    defineProps<{
        /**
         * @props 左侧是否折叠，支持v-model
         */
        siderCollapsed?: boolean
        /**
         * @props api分组数据
         */
        apiGroups?: OriginApiGroup[]
        /**
         * @props 当前分组下标
         */
        currentGroup?: OriginApiGroup | null
        /**
         * @props 服务环境
         */
        servers?: Swagger.Server[]
        /**
         * @props 当前服务下标，支持v-model
         */
        currentServerIndex?: number
    }>(),
    {
        siderCollapsed: false,
        apiGroups: () => [],
        currentGroup: null,
        servers: () => [],
        currentServerIndex: -1,
    }
)

// 处理屏幕宽度变化自动收缩
const { width } = useWindowSize()

// 显示说明文档
const show_question_modal = ref(false)

const emit = defineEmits([
    'update:siderCollapsed',
    'update:currentServerIndex',
    'change-group',
    'click-params-tool',
])
</script>
<style scoped lang="less">
.cp-top-menu {
    .navbar-icon-item {
        padding: 0 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        cursor: pointer;
        font-size: 18px;
        &:hover {
            background: #eee;
        }
    }
}
</style>
