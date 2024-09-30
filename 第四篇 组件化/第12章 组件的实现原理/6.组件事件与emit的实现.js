function mountComponent(vnode, container, anchor) {
    // 省略部分代码

    const instance = {
        state,
        props: shallowReactive(props),
        isMounted: false,
        subTree: null
    }

    // 定义emit函数,它接收两个参数
    // event: 事件名称
    // payload: 传递给事件处理函数的参数
    function emit(event, ...payload) {
        // 根据约定对事件名称进行处理,例如change --> onChange
        const eventName = `on${event[0].toUpperCase() + event.slice(1)}`
        // 根据处理后的事件名称去props中寻找对应的事件处理函数
        const handler = instance.props[eventName]
        if (handler) {
            // 调用事件处理函数并传递参数
            handler(...payload)
        } else {
            console.error('事件不存在')
        }
    }

    // 将emit函数添加到setupContext中,用户可以通过setupContext取得emit函数
    const setupContext = { attrs, emit }

    // 省略部分代码

}

function resolveProps(options, propsData) {
    const props = {}
    const attrs = {}
    for (const key in propsData) {
        // 以字符串on开头的props,无论是否显式地声明,都将其添加到props数据中,而不是添加到attrs中
        if (key in options || key.startsWith('on')) {
            props[key] = propsData[key]
        } else {
            attrs[key] = propsData[key]
        }
    }
    return [props, attrs]
}