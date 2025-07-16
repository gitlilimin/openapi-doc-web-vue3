<template>
    <a-config-provider :locale="app.locale">
        <a-layout class="view-home">
            <a-layout-sider
                class="sider-box"
                :theme="layout.sider_theme"
                v-model:collapsed="layout.sider_collapsed"
                :width="layout.sider_width"
                :collapsedWidth="layout.sider_collapsed_width"
            >
                <!-- LOGO区域 -->
                <div
                    class="logo-box flex-box justify-center"
                    :style="{
                        width: layout.sider_collapsed
                            ? layoutStyle.sider_collapsed_width
                            : layoutStyle.sider_width,
                    }"
                >
                    <div v-if="!layout.sider_collapsed" class="flex-box w-full mx-4">
                        <a-input
                            class="logo-search rounded-full"
                            v-model:value="side_menu.search_word"
                            allow-clear
                            placeholder="可搜索名称、Path"
                        >
                            <template #suffix v-if="!side_menu.search_word">
                                <SearchOutlined />
                            </template>
                        </a-input>
                    </div>
                    <div v-else></div>
                </div>
                <!-- 左侧菜单 -->
                <div class="sider-menu-box scroll-bar scroll-bar-white">
                    <SideMenu
                        :tags="apidata.tags_data"
                        :search-word="side_menu.search_word"
                        :loading="apidata.api_data_loading"
                        @click-tag="side_menu.onClickTag"
                        @click-path="side_menu.onClickPath"
                    />
                </div>
            </a-layout-sider>
            <a-layout>
                <!-- 顶部导航条 -->
                <a-layout-header
                    class="navbar-box"
                    style="padding: 2px"
                    :style="{
                        height: layoutStyle.navbar_height,
                        left: layout.sider_collapsed
                            ? layoutStyle.sider_collapsed_width
                            : layoutStyle.sider_width,
                    }"
                >
                    <TopMenu
                        v-model:sider-collapsed="layout.sider_collapsed"
                        v-model:current-server-index="apidata.current_server_index"
                        :servers="
                            apidata.api_data && Array.isArray(apidata.api_data.servers)
                                ? apidata.api_data.servers
                                : []
                        "
                        :api-groups="apidata.groups"
                        :current-group="currentApiGroup"
                        @change-group="(e) => (apidata.current_group_index = e.index)"
                        @click-params-tool="SettingModalRef?.open()"
                    />
                </a-layout-header>
                <a-layout-content
                    class="layout-content-box"
                    :style="{
                        marginTop: layoutStyle.navbar_height,
                        marginLeft: layout.sider_collapsed
                            ? layoutStyle.sider_collapsed_width
                            : layoutStyle.sider_width,
                    }"
                >
                    <PageContent
                        ref="PageContentRef"
                        :tags="apidata.tags_data"
                        :loading="apidata.api_data_loading"
                        :server="currentServer"
                    />
                </a-layout-content>
            </a-layout>
        </a-layout>

        <SettingModal ref="SettingModalRef" />
    </a-config-provider>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useWindowSize } from '@vueuse/core'

import { Modal } from 'ant-design-vue'
import zh_Cn from 'ant-design-vue/es/locale/zh_CN'

import SideMenu from '@/components/side-menu/index.vue'
import TopMenu from '@/components/top-menu/index.vue'
import PageContent from '@/components/page-conetent/index.vue'
import SettingModal from '@/components/setting-modal/index.vue'

import type { Swagger } from '@/constants/swagger'

import type { OriginApiGroup, Tag } from '@/constants/app'
import { SearchOutlined } from '@ant-design/icons-vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

// refs
const PageContentRef = ref()
const SettingModalRef = ref()

// 全局配置
const app = reactive({
    locale: zh_Cn,
})

// 布局
const layout = reactive({
    // 顶部栏高度
    navbar_height: 56,
    // 左侧导航宽度
    sider_width: 254,
    // 左侧导航折叠宽度
    sider_collapsed_width: 0,
    // 左侧菜单主题
    sider_theme: 'light',

    // 左侧导航是否折叠
    sider_collapsed: false,
})
const layoutStyle = computed(() => ({
    navbar_height: `${layout.navbar_height}px`,
    sider_width: `${layout.sider_width}px`,
    sider_collapsed_width: `${layout.sider_collapsed_width}px`,
}))

// 处理屏幕宽度变化自动收缩
const { width } = useWindowSize()
watch(
    () => width.value,
    (w) => (layout.sider_collapsed = w <= 650),
    { immediate: true }
)

/** 刷新api数据 */
const fetchApiGroupData = () => {
    if (appStore.urlParams.group) {
        apidata.groups_loading = true
        fetch(appStore.urlParams.group)
            .then((res) => res.json())
            .then((res) => {
                apidata.groups = res
                if (!currentApiGroup.value) {
                    apidata.current_group_index = 0
                }
                fetchApiData(currentApiGroup.value.link)
            })
            .catch((e) => {
                Modal.error({ title: `从${appStore.urlParams.group}获取Group信息失败` })
            })
            .finally(() => (apidata.groups_loading = false))
    } else {
        // 从单个url获取一个api文档
        fetchApiData(appStore.urlParams.url)
    }
}

// 加载一个api文档数据
const fetchApiData = (url: string) => {
    apidata.tags_data = []
    apidata.api_data_loading = true
    fetch(url)
        .then((res) => res.json())
        .then((res) => {
            apidata.api_data = res as Swagger.Spec3
            // 处理server默认值
            if (Array.isArray(apidata.api_data.servers) && apidata.api_data.servers.length)
                apidata.current_server_index = 0

            // 处理api分组
            if (apidata.api_data.paths) {
                Object.keys(apidata.api_data.paths).forEach((path) => {
                    let api = (apidata.api_data as Swagger.Spec3).paths[path]
                    Object.keys(api).forEach((opt) => {
                        let operation = api[opt] as Swagger.Operation3
                        if (operation.tags) {
                            operation.tags.forEach((tag_name) => {
                                let find_tag = apidata.tags_data.find((t) => t.name == tag_name)
                                if (!find_tag)
                                    apidata.tags_data.push({
                                        name: tag_name,
                                        paths: { [path]: api },
                                    })
                                else find_tag.paths[path] = api
                            })
                        }
                    })
                })
            }
        })
        .catch((e) => {
            Modal.error({ title: `从${url}获取Api信息失败` })
        })
        .finally(() => (apidata.api_data_loading = false))
}

// 左侧导航的数据
const side_menu = reactive({
    // 搜索词
    search_word: '',
    // 点击Tag
    onClickTag: (tag) => PageContentRef.value?.scrollToTag(tag.name, -layout.navbar_height - 10),
    // 点击Path
    onClickPath: (path) => PageContentRef.value?.scrollToPath(path, -layout.navbar_height - 10),
})

// api整体数据
const apidata = reactive({
    // 多个api分组
    groups: [] as OriginApiGroup[],
    groups_loading: false,
    current_group_index: appStore.urlParams.cur_group_index ?? 0,

    // api原始数据
    api_data: null as null | Swagger.Spec3,
    api_data_loading: false,

    // servers
    current_server_index: -1,

    // 处理后的Tags数据
    tags_data: [] as Tag[],
})

const currentServer = computed<any>(() => {
    if (!apidata.api_data) return []
    return apidata.api_data.servers[apidata.current_server_index] ?? null
})

const currentApiGroup = computed(() => apidata.groups[apidata.current_group_index] ?? null)

// 当前选择的分组变化，重新获取api数据
watch(
    () => apidata.current_group_index,
    (index) => {
        if (!currentApiGroup.value) {
            apidata.api_data = null
            return
        }
        // 更新store
        appStore.urlParams.cur_group_index = index
        // url上push锚点
        fetchApiData(currentApiGroup.value.link)
    }
)

onMounted(() => {
    // 获取api数据
    fetchApiGroupData()
})
</script>
<style lang="less" scoped>
.view-home {
    min-height: 100vh;

    .sider-box {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 900;
    }

    .logo-box {
        height: v-bind('layoutStyle.navbar_height');
        color: #fff;
        transition: width 0.2s;
    }

    .navbar-box {
        position: relative;
        height: v-bind('layoutStyle.navbar_height');
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.12);
        background: #fff;
        position: fixed;
        top: 0;
        right: 0;
        z-index: 100;
        transition: left 0.2s;
    }

    .sider-menu-box {
        height: calc(100vh - v-bind('layoutStyle.navbar_height'));
        overflow-y: auto;
    }

    .layout-content-box {
        transition: margin-left 0.2s;
    }

    .layout-footer-box {
        transition: margin-left 0.2s;
    }

    // :deep(.logo-search){
    //     .ant-input-affix-wrapper{
    //         border-top-left-radius: 9999px;
    //         border-bottom-left-radius: 9999px;
    //     }
    //     .ant-input-group-addon{
    //         border-top-right-radius: 9999px;
    //         border-bottom-right-radius: 9999px;
    //     }
    //     .ant-input-search-button{
    //         border-top-right-radius: 9999px;
    //         border-bottom-right-radius: 9999px;
    //     }
    // }
}
</style>
