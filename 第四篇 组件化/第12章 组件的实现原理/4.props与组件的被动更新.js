// 1. 结合vnode.props对象及MyComponent.props对象来解析出组件在渲染时需要用到的props数据
function mountComponent(vnode, container, anchor) {
    const componentOptions = vnode.type
    // 从组件选项对象中取出props定义,即propsOption
    const { render, data, props: propsOptions /* 其他省略*/ } = componentOptions

    beforeCreate && beforeCreate()

    const state = reactive(data())
    // 调用resolve Props函数解析出最终的props数据与attrs数据
    const [props, attrs] = resolveProps(propsOption, vnode.props)

    const instance = {
        state,
        // 将解析出的props数据包装为shallowReactive并定义到组件实例上
        props: shallowReactive(props),
        isMounted: false,
        subTree: null
    }
    vnode.component = instance

    // 省略部分代码
}

// resolveProps函数用于解析组件props和attrs数据
function resolveProps(options, propsData) {
    const props = {}
    const attrs = {}
    // 遍历为组件传递的props数据
    for (const key in propsData) {
        if (key in options) {
            // 如果为组件传递的props数据在组件自身的props选项中有定义,则将其视为合法的props
            props[key] = propsData[key]
        } else {
            // 否则将其作为attrs
            attrs[key] = propsData[key]
        }
    }
    return [props, attrs]
}

// 父组件进行自更新时,渲染器发现父组件的subTree包含组件类型的虚拟节点,会调用patchComponent函数完成子组件的更新
// 这种由父组件引起的子组件更新叫作子组件的被动更新.需要做两个事情:1.检查子组件是否要更新2.需要更新的话,则更新子组件的props、slots等内容
function patchComponent(n1, n2, anchor) {
    // 获取组件实例,即n1.component,同时让新的组件虚拟节点n2.component也指向组件实例
    const instance = (n2.component = n1.component)
    // 获取当前的props数据
    const { props } = instance
    // 调用hasPropsChanged检测为子组件传递的props是否发生变化,如果没有变化,则不需要更新
    if (hasPropsChanged(n1.props, n2.props)) {
        // 调用resolveProps函数重新获取props数据
        const [nextProps] = resolveProps(n2.type.props, n2.props)
        // 更新props
        for (const k in nextProps) {
            props[k] = nextProps[k]
        }
        // 删除不存在的props
        for (const k in props) {
            if (!(k in nextProps)) delete props[k]
        }
    }
}

function hasPropsChanged(prevProps, nextProps) {
    const nextKeys = Object.keys(nextProps)
    // 如果新旧props的数量变了,则说明有变化
    if (nextKeys.length !== Object.keys(prevProps).length) {
        return true
    }
    for (let i = 0; i < nextKeys.length; i++) {
        const key = nextKeys[i]
        // 有不想等的props,则说明有变化
        if (nextProps[key] !== prevProps[key]) return true
    }
    return false
}

// 由于props数据与组件自身状态数据都需要暴露到渲染函数中,并使得渲染函数能够通过this访问它们,因此我们需要风中一个渲染上下文对象
function mountComponent(vnode, container, anchor) {
    // 省略部分代码
    const instance = {
        state,
        props: shallowReactive(props),
        isMounted: false,
        subTree: null
    }
    vnode.component = instance

    // 创建渲染上下文对象,本质上是组件实例的代理
    const renderContext = new Proxy(instance, {
        get(t, k, r) {
            // 取得组件自身状态与props数据
            const { state, props } = t
            // 先尝试读取自身状态数据
            if (state && k in state) {
                return state[k]
            } else if (k in props) { // 如果组件自身没有该数据,则尝试从props中读取
                return props[k]
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
            } else {
                console.error('不存在')
            }
        }
    })
    // 生命周期函数调用时要绑定渲染上下文对象
    created && created.call(renderContext)


    // 省略部分代码
}