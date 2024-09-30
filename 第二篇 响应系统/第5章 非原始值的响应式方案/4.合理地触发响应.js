/**
 * 问题1: 设置相同值时也会触发反应,并且存在NaN!== NaN问题
 * 问题2: 原型继承问题
 * 问题3: 浅响应和深响应
 * 问题4: 只读和浅只读
 */
let activeEffect
const effectStack = []
const bucket = new WeakMap()

// 这里由于ownkeys只能获取到target,所以需要构造唯一的key进行标识
const ITERATE_KEY = Symbol()

function createReactive(obj, isShallow = false, isReadonly = false) {
    return new Proxy(obj, {
        deleteProperty(target, key) {
            if (isReadonly) {
                console.warn(`属性${key}是只读的`)
                return true
            }
            const hadKey = Object.prototype.hasOwnProperty.call(target, key)
            const res = Reflect.deleteProperty(target, key)
            if (res && hadKey) {
                trigger(target, key, 'DELETE')
            }
            return res
        },
        has(target, key) { // 拦截in操作符
            track(target, key)
            return Reflect.get(target, key)
        },
        ownKeys(target) { // 拦截for...in
            track(target, ITERATE_KEY)
            return Reflect.ownKeys(ITERATE_KEY)
        },
        get(target, key, receiver) {
            if (key === 'raw') {
                return target
            }
            if (!isReadonly) {
                track(target, key)
            }
            if (isShallow) {
                return res
            }
            const res = Reflect.get(target, key, receiver)
            if (typeof res === 'object' && res !== null) {
                // 调用reactive将结果包装成响应式数据并返回
                return isReadonly ? readonly(res) : reactive(res)
            }
            return res
        },
        set(target, key, newVal, receiver) {
            if (isReadonly) {
                console.warn(`属性${key}是只读的`)
                return true
            }
            const oldVal = target[key]
            // 这里for...in迭代器如果是add需要触发iterate_key相关的effects
            const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
            const res = Reflect.set(target, key, newVal, receiver)
            if (target === receiver.raw) { // 屏蔽由于继承导致的多次触发
                if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
                    trigger(target, key, type)
                }
            }

            return res

        }
    })
}

function reactive(obj) {
    return createReactive(obj)
}

function shallowReactive(obj) {
    return createReactive(obj, true)
}

function readonly(obj) {
    return createReactive(obj, false, true)
}

function shallowReadonly(obj) {
    return createReactive(obj, true, true)
}

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

function trigger(target, key, type) {
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
    if (type === 'ADD' || type === 'DELETE') {
        const iterateEffects = depsMap.get(ITERATE_KEY)
        iterateEffects && iterateEffects.forEach(effectFn => {
            if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn)
            }
        })
    }
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



const obj = reactive({ foo: { bar: 1 } })

effect(() => {
    console.log(obj.foo.bar)
})

obj.foo.bar = 2



