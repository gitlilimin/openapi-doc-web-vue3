import type { Swagger } from './swagger'

export interface Tag {
    name: string
    paths: { [name: string]: Swagger.Path3 }
}
export interface OriginApiGroup {
    name: string
    link: string
}

export type RequestMethodLower = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'
export type RequestMethodUpper = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'
export type RequestMethod = RequestMethodLower | RequestMethodUpper

/**
 * 全局参数
 */
export interface GlobalParam {
    name: string
    in: 'query' | 'header'
    value: any
}
