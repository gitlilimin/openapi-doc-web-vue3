/**
 * 字符串首字母转大写
 * @param str 字符串
 */
export const strFirstToUpper = (str: string): string => {
    return str.trim().toLowerCase().replace(str[0], str[0].toUpperCase())
}
