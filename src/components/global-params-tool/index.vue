<template>
    <a-modal
        class="cp-top-menu-question-modal"
        :open="innerShow"
        title="设置"
        width="800px"
        :footer="false"
        @update:open="(e) => open(e)"
    >
        <div class="tools-content">
            <a-table
                :data-source="appStore.storeSetting.globalParams"
                bordered
                size="small"
                :pagination="false"
            >
                <a-table-column key="in" title="位置" data-index="in" :width="80"></a-table-column>
                <a-table-column
                    key="name"
                    title="Key"
                    data-index="name"
                    :width="100"
                ></a-table-column>
                <a-table-column
                    key="value"
                    title="值"
                    data-index="value"
                    :width="140"
                ></a-table-column>
                <a-table-column key="operate" title="操作" :width="60" align="center">
                    <template #default="{ index }">
                        <a-button size="small" danger @click="onClickDelIndex(index)"
                            >删除</a-button
                        >
                    </template>
                </a-table-column>
            </a-table>
            <div class="bottom-action mt-4 flex-box space-x-2 p-2 rounded bg-gray-100">
                <a-select v-model:value="addFormdata.in" style="flex: 86" placeholder="参数位置">
                    <a-select-option value="query">Query</a-select-option>
                    <a-select-option value="header">Header</a-select-option>
                </a-select>
                <a-input v-model:value="addFormdata.name" style="flex: 90" placeholder="参数名" />
                <a-input v-model:value="addFormdata.value" style="flex: 130" placeholder="值" />
                <a-button
                    type="primary"
                    style="margin-left: 28px; margin-right: 10px"
                    @click="onClickAddParam"
                    >添加 +</a-button
                >
            </div>
        </div>
    </a-modal>
</template>
<script setup lang="ts">
import { reactive, computed, watch, ref } from 'vue'
import { cloneDeep } from 'lodash-es'
import { useAppStore } from '@/stores/app'

const props = defineProps({
    /**
     * @props 是否显示，支持v-model
     */
    show: {
        type: Boolean,
        default: false,
    },
})

const appStore = useAppStore()

const innerShow = ref(props.show)

const emit = defineEmits(['update:show', 'update:params'])

const createAddFormData = () => ({
    name: '',
    in: '',
    value: '',
})
const addFormdata = reactive(createAddFormData())

const onClickDelIndex = (index: number) => {
    appStore.storeSetting.globalParams.splice(index, 1)
}

const onClickAddParam = () => {
    appStore.storeSetting.globalParams.push(cloneDeep(addFormdata))
    Object.assign(addFormdata, createAddFormData())
}

const open = (onoff = true) => {
    innerShow.value = onoff
    emit('update:show', onoff)
}

defineExpose({ open })
</script>
