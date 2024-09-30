function mountComponent(vnode, container, anchor) {
    const componentOptions = vnode.type
    // 从组件选项中取出setup函数
    let { render, data, setup, /*省略其他选项*/ } = componentOptions

    beforeCreate && beforeCreate()

    const state = data ? reactive(data()) : null
    const [props, attrs] = resolveProps(propsOption, vnode.props)

    const instance = {
        state,
        props: shallowReactive(props),
        isMounted: false,
        subTree: null
    }

    // setupContext,由于我们呢还没有讲解emit和slots,所以暂时只需要attrs
    const setupContext = { attrs }
    // 调用setup函数,将只读版本的props作为第一个参数传递,避免用户意外地修改props的值,
    // 将setupContext作为第二个参数传递
    const setupResult = setup(shallowReadonly(instance.props), setupContext)
    // setupState用来存储由setup返回的数据
    let setupState = null
    // 如果setup函数的返回值是函数,则将其作为渲染函数
    if (typeof setupResult === 'function') {
        // 报告冲突
        if (render) console.error('setup 函数返回渲染函数,render选项将被忽略')
        // 将setupResult作为渲染函数
        render = setupResult
    } else {
        // 如果setup的返回值不是函数,则作为数据状态赋值给setupState
        setupState = setupResult
    }

    vnode.component = instance

    const renderContext = new Proxy(instance, {
        get(t, k, r) {
            // 取得组件自身状态与props数据
            const { state, props } = t
            // 先尝试读取自身状态数据
            if (state && k in state) {
                return state[k]
            } else if (k in props) { // 如果组件自身没有该数据,则尝试从props中读取
                return props[k]
            } else if (setupState && k in setupState) {
                // 渲染上下文需要增加对setupState的支持
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
                console.warn(`Attempting to mutate prop "${k}". Props are readonly`)
            } else if (setupState && k in setupState) {
                // 渲染上下文需要增加对setupState的支持
                setupState[k] = v
            } else {
                console.error('不存在')
            }
        }
    })
    // 生命周期函数调用时要绑定渲染上下文对象
    created && created.call(renderContext)


    // 省略部分代码
}