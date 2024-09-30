const data = { foo: 1, bar: 2 }
let activeEffect
const effectStack = []

const bucket = new WeakMap()

const obj = new Proxy(data, {
    get(target, key) {
        track(target, key)
        return target[key]
    },
    set(target, key, newValue) {
        target[key] = newValue
        trigger(target, key)
    }
})

function track(target, key) {
    if (!activeEffect) {
        return target[key]
    }
    let depsMap = bucket.get(target)
    if (!depsMap) {
        bucket.set(target, (depsMap = new Map()))
    }
    let deps = depsMap.get(key)
    if (!deps) {
        depsMap.set(key, (deps = new Set()))
    }
    deps.add(activeEffect)
    // 这里收集当前effect所在的所有deps依赖合集
    activeEffect.deps.push(deps)
}

function trigger(target, key) {
    const depsMap = bucket.get(target)
    if (!depsMap) {
        return
    }
    const effects = depsMap.get(key)
    // 这里使用新set避免forEach无限循环的问题
    // effectFn执行时,cleanup删除后,deps又收集effect,导致deps数量边减边加,可能引起forEach无限循环的问题
    const effectsToRun = new Set()
    effects && effects.forEach(effectFn => {
        // 这里如果effectFn与activeEffect相同的话,就避免重复执行
        if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn)
        }
    })

    effectsToRun.forEach(effectFn => {
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
}

function cleanup(effectFn) {
    for (let i = 0; i < effectFn.deps.length; i++) {
        const deps = effectFn.deps[i]
        deps.delete(effectFn)
    }
    effectFn.deps.length = 0
}

function effect(fn, options = {}) {
    const effectFn = () => {
        cleanup(effectFn)
        activeEffect = effectFn
        effectStack.push(effectFn)
        const res = fn()
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
        return res
    }
    effectFn.options = options
    // 初始化effectFn相关联的依赖合集
    effectFn.deps = []
    if (!options.lazy) { // lazy时必须手动自行
        effectFn()
    }

    return effectFn
}

function traverse(value, seen = new Set()) {
    if (typeof value !== 'object' || value === null || seen.has(value)) return
    seen.add(value)
    for (const k in value) {
        traverse(value[k], seen)
    }
    return value
}

function watch(source, cb) {
    // getter
    let getter
    if (typeof source === 'function') {
        getter = source
    } else {
        getter = () => traverse(source)
    }

    let oldValue, newValue

    let cleanup // 用来存储用户注册的过期回调 解决竞态问题
    function onInvalidate(fn) {
        cleanup = fn
    }
    const job = () => {
        newValue = effectFn()
        if (cleanup) { // 再调用cb前,先调用过期回调
            cleanup()
        }
        cb(newValue, oldValue, onInvalidate)
        oldValue = newValue
    }
    const effectFn = effect(() => getter(),// 这里只触发track执行读取操作,数据变动时才会触发trigger执行下面的scheduler
        {
            lazy: true,
            scheduler: () => {
                if (options.flush === 'post') { // 回调执行时机
                    const p = Promise.resolve()
                    p.then(job)
                } else {
                    job()
                }
            }
        })
    // 立即执行
    if (options.immediate) {
        job()
    } else {
        oldValue = effectFn()
    }
}

// test
watch(obj, () => {
    console.log('变化了')
}, {
    flush: 'pre' // 还可以指定为'post' | 'sync'
})


