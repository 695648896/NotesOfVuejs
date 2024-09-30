/**
 * 问题1: 根据规范,设置索引值大于数组当前的长度,那么要更新数组的length属性.所以需要触发length相关的副作用函数
 * 问题2: 修改数组的length长度也会隐式地影响数组元素
 * 问题3: 数组遍历,拦截for...in和for...of
 * 问题4: 隐式修改原型数组长度的原型方法:push,pop等,这里由于这之类的方法语义是修改数组,所以并不需要做track动作,所以在相关操作时,直接不收集副作用函数
 */
let activeEffect
const effectStack = []
const bucket = new WeakMap()
const reactiveMap = new Map()

// 这里由于ownkeys只能获取到target,所以需要构造唯一的key进行标识
const ITERATE_KEY = Symbol()

function reactive(obj) {
    const existionProxy = reactiveMap.get(obj)
    if (existionProxy) return existionProxy

    const proxy = createReactive(obj)
    reactiveMap.set(obj, proxy)
    return proxy
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
    if (!activeEffect || !shouldTrack) {
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

function trigger(target, key, type, newVal) {
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
    if (type === 'ADD' && Array.isArray(target)) {
        const lengthEffects = depsMap.get('length')
        lengthEffects && lengthEffects.forEach(effectFn => {
            if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn)
            }
        })
    }
    if (Array.isArray(target) && key === 'length') {
        depsMap.forEach((effects, key) => {
            if (key > newVal) {
                effects.forEach(effectFn => {
                    if (effectFn !== activeEffect) {
                        effectsToRun.add(effectFn)
                    }
                })
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
            track(target, Array.isArray(target) ? 'length' : ITERATE_KEY)
            return Reflect.ownKeys(ITERATE_KEY)
        },
        get(target, key, receiver) {
            if (key === 'raw') {
                return target
            }

            if (Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)) {
                return Reflect.get(arrayInstrumentations, key, receiver)
            }


            if (!isReadonly && typeof key !== 'symbol') {
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
            const type = Array.isArray(target)
                ? Number(key) < target.length ? 'SET' : 'ADD'
                : Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'

            const res = Reflect.set(target, key, newVal, receiver)
            if (target === receiver.raw) { // 屏蔽由于继承导致的多次触发
                if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
                    trigger(target, key, type, newVal)
                }
            }

            return res

        }
    })
}



const arrayInstrumentations = {}
    ;['includes', 'indexOf', 'lastIndexOf'].forEach(method => {
        const originMethod = Array.prototype[method]
        arrayInstrumentations[method] = function (...args) {
            let res = originMethod.apply(this, args)
            if (res === false || res === -1) {
                res = originMethod.apply(this.raw, args)
            }
            return res
        }
    })
let shouldTrack = true
    ;['push', 'pop', 'shift', 'unshift', 'splice'].forEach(method => {
        const originMethod = Array.prototype[method]
        arrayInstrumentations[method] = function (...args) {
            shouldTrack = false
            let res = originMethod.apply(this, args)
            shouldTrack = true
            return res
        }
    })


const arr = reactive([])
effect(() => {
    console.log('effect1')
    // 这里由于push语义为修改,所以并不需要收集副作用函数
    arr.push(1)


})
effect(() => {
    console.log('effect2')
    arr.push(1)
})


