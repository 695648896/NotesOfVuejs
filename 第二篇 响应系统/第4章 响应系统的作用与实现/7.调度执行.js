const data = { foo: 1 }
let activeEffect
const effectStack = []

function effect(fn, options = {}) {
    const effectFn = () => {
        cleanup(effectFn)
        activeEffect = effectFn
        effectStack.push(effectFn)
        fn()
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
    }
    effectFn.options = options
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

// effect(() => { console.log(obj.foo) }, {
//     scheduler(fn) {
//         setTimeout(fn)
//     }
// })
// obj.foo++
// console.log('结束了')

const jobQueue = new Set()
const p = Promise.resolve()

let isFlushing = false
function flushJob() {
    if (isFlushing) return
    isFlushing = true
    p.then(() => {
        jobQueue.forEach(job => job())
    }).finally(() => { isFlushing = false })
}

effect(() => { console.log(obj.foo) }, {
    scheduler(fn) {
        jobQueue.add(fn)
        flushJob()
    }
})
obj.foo++
obj.foo++