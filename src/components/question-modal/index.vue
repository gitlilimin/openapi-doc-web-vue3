<template>
    <a-modal
        class="cp-top-menu-question-modal"
        :open="show"
        title="使用说明"
        width="800px"
        @update:open="emit('update:show', $event)"
    >
        <template #footer>
            <a-button type="primary" @click="emit('update:show', false)">知道了</a-button>
        </template>
        <div class="question-contents space-y-4">
            <div class="question-item">
                <div class="title">如何获得API数据？</div>
                <div class="answer">
                    <div class="line">
                        如果是单个接口文档（标准的OAS文档），直接把获取文档json数据的接口地址以url为参数名放在query中。
                    </div>
                    <div class="line">例：http://localhost:8000/?url={url}</div>
                    <div class="line">
                        PS：其中{url}地址返回的数据格式参考 /example/url.json ，这也是一个标准的OSA
                        3.0数据
                    </div>
                    <div class="line mt-2">
                        如果是多个接口文档，将输出多个文档地址的接口地址以group为参数名放在query中。
                    </div>
                    <div class="line">例：http://localhost:8000/?group={group}</div>
                    <div class="line">PS：其中{group}地址返回的数据参考 /example/group.json</div>
                </div>
            </div>
            <div class="question-item">
                <div class="title">顶部右侧工具栏</div>
                <div class="answer">
                    <div class="line">
                        当使用多文档模式（即query中是group）时，会出现不同文档切换的工具栏，可以点击进行切换
                    </div>
                </div>
            </div>
            <div class="question-item">
                <div class="title">什么是Servers？</div>
                <div class="answer">
                    <div class="line">
                        每个标准的OAS文档中都会有servers字段，它表示服务器的信息，也可以用于区分不同环境（开发、生产）的接口地址。
                    </div>
                    <div class="line">
                        当文档中存在多个servers时，顶部右侧工具栏中会出现下拉菜单，用于切换不同的server
                    </div>
                    <div class="line mt-2">
                        切换server仅会影响【调试】功能，页面会向对应的server发起请求
                    </div>
                </div>
            </div>
            <div class="question-item">
                <div class="title">
                    全局参数
                    <SendOutlined class="ml-2" :rotate="-50" />
                </div>
                <div class="answer">
                    <div class="line">
                        点击顶部右侧
                        <SendOutlined class="ml-2" :rotate="-50" />图标，可管理全局参数。
                    </div>
                    <div class="line mt-2">
                        全局参数与api文档的url地址关联，即不同的api文档有各自独立的全局参数。
                    </div>
                    <div class="line">
                        全局参数会自动储存在Local Storage中，刷新或下次打开不变。
                    </div>
                </div>
            </div>
            <div class="question-item">
                <div class="title">左侧导航的操作</div>
                <div class="answer">
                    <div class="line">点击分组或某个API，右侧会自动滚动到对应分组或API位置</div>
                    <div class="line">搜索时，支持搜索API的名字或路径（虽然路径没有显示出来）</div>
                </div>
            </div>
        </div>
    </a-modal>
</template>
<script setup lang="ts">
import { SendOutlined } from '@ant-design/icons-vue'

const props = withDefaults(
    defineProps<{
        show: boolean
    }>(),
    {
        show: false,
    }
)

const emit = defineEmits(['update:show'])
</script>
<style lang="less">
.cp-top-menu-question-modal {
    .question-contents {
        .question-item {
            .answer {
                padding-top: 10px;
            }
            .title {
                font-size: 18px;
                font-weight: 600;
            }
            .line {
                font-size: 14px;
                line-height: 1.4;
                padding: 0 20px;
            }
        }
    }
}
</style>
