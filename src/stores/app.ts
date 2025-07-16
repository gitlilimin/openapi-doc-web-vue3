import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLocalStorage, useUrlSearchParams } from '@vueuse/core'

export const useAppStore = defineStore('app', {
    state: () => {
        // 全局url
        const urlParams = useUrlSearchParams('history', {
            initialValue: {
                group: '', // API组的接口url
                url: '', // 单个API的url
                cur_group_index: 0, // 当前选中的分组索引
            },
        })

        // 全局持久化的参数
        const storeSetting = useLocalStorage('store-setting', {
            globalParams: [] as any[],
        })

        return {
            urlParams,
            storeSetting,
        }
    },
    getters: {},
})
