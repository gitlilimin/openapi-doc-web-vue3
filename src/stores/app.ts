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
            /** 请求参数 */
            requestSetting: {
                post: {
                    contentType: 'application/json', // 默认的Content-Type
                    contentTypeOptions: [
                        { label: 'application/json', value: 'application/json' },
                        {
                            label: 'application/x-www-form-urlencoded',
                            value: 'application/x-www-form-urlencoded',
                        },
                        { label: 'multipart/form-data', value: 'multipart/form-data' },
                    ],
                },
            },
        }
    },
    getters: {},
})
