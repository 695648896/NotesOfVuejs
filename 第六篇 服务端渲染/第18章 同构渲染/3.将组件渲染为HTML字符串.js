// 客户端组件渲染时初始化流程 
// beforeCreate -> 初始化data/props等 -> 创建组件实例 -> setup执行 -> created -> 设置render effect完成渲染

// 服务端组件渲染时初始化流程
// beforeCreate - > 初始化data/props等(非响应式数据) -> 创建组件实例 -> setup执行 -> created

function renderComponentVNode(vnode) {
    const isFunctional = typeof vnode.type === 'function'
    let componentOptions = vnode.type
    if (isFunctional) {
        componentOptions = {
            render: vnode.type,
            props: vnode.type.props
        }
    }
    let { render, data, setup, beforeCreate, created, props: propsOptions } = componentOptions

    beforeCreate && beforeCreate()

    // 无须使用reactive()创建data的响应式版本
    const state = data ? data() : null
    const [props, attrs] = resolveProps(propsOptions, vnode.props)

    const slots = vnode.children || {}

    const instance = {
        state,
        props, // props无序shallowReactive
        isMounted: false,
        subTree: null,
        slots,
        mounted: [],
        keepAliveCtx: null
    }

    function emit(event, ...payload) {
        const eventName = `on${event[0].toUpperCase() + event.slice(1)}`
        const handler = instance.props[eventName]
        if (handler) {
            handler(...payload)
        } else {
            console.error('事件不存在')
        }
    }

    //setup
    let setupState = null
    if (setup) {
        const setupContext = { attrs, emit, slots }
        const prevInstance = setCurrentInstance(instance)
        const setupResult = setup(shallowReadonly(instance.props), setupContext)
        setCurrentInstance(prevInstance)
        if (typeof setupResult === 'function') {
            if (render) console.error('setup函数返回渲染函数,render选项将被忽略')
            render = setupResult
        } else {
            setupState = setupContext
        }
    }

    vnode.component = instance

    const renderContext = new Proxy(instance, {
        get(t, k, r) {
            const { state, props, slots } = t

            if (k === '$slots') return slots

            if (state && k in state) {
                return state[k]
            } else if (k in props) {
                return props[k]
            } else if (setupState && k in setupState) {
                return setupState[k]
            } else {
                console.error('不存在')
            }
        },
        set(t, k, v, r) {
            const { state, props } = t
            if (state && k in state) {
                state[k] = v
            } else if (k in props) {
                props[k] = v
            } else if (setupState && k in setupState) {
                setupState[k] = v
            } else {
                console.error('不存在')
            }
        }
    })

    created && created.call(renderContext)

    const subTree = render.call(renderContext, renderContext)

    return renderComponentVNode(subTree)
}