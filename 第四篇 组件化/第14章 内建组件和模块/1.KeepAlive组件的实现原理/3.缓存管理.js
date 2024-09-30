// 通过KeepAlive的max属性来设置
// Vuejs官方的RFCs中已经有相关提议

// 自定义实现
const _cache = new Map()
const cache: KeepAliveCache = {
    get(key) {
        _cache.get(key)
    },
    set(key, value) {
        _cache.set(key, value)
    },
    delete(key) {
        _cache.delete(key)
    },
    forEach(fn) {
        _cache.forEach(fn)
    }
}