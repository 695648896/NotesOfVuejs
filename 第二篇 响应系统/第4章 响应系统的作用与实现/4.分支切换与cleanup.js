const data = { ok: true, text: 'hello world' }
let activeEffect
function effect(fn) {
    const effectFn = () => {
        cleanup(effectFn)
        activeEffect = effectFn
        fn()
    }
    // 初始化effectFn相关联的依赖合集
    effectFn.deps = []
    effectFn()
}

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
    const effectsToRun = new Set(effects)
    effectsToRun.forEach(effectFn => effectFn())
}

function cleanup(effectFn) {
    for (let i = 0; i < effectFn.deps.length; i++) {
        const deps = effectFn.deps[i]
        deps.delete(effectFn)
    }
    effectFn.deps.length = 0
}

effect(() => {
    console.log(obj.ok ? obj.text : 'not')
})