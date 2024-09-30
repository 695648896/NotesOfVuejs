function mountComponent(vnode, container, anchor) {
    const componentOptions = vnode.type
    // 从组件选项对象中取得组件的生命周期函数
    const { render, data, beforeCreate, created, beforeMount, mounted, beforeUpdate, updated } = componentOptions

    // 从这里调用beforeCreate钩子
    beforeCreate && beforeCreate()

    const state = reactive(data())

    // 定义组件实例,一个组件实例本质上就是一个对象,它包含与组件有关的状态信息
    const instance = {
        // 组件自身的状态数据,即data
        state,
        // 一个布尔值,用来表示组件是否已经被挂载,初始值为false
        isMounted: false,
        // 组件所渲染的内容,即子树(subTree)
        subTree: null
    }

    // 将组件实例设置到vnode上,用于后续更新
    vnode.component = instance

    // 在这里调用created钩子
    created && created.call()

    effect(() => {
        const subTree = render.call(state, state)
        if (!instance.isMounted) {
            // 在这里调用beforeMount钩子
            beforeMount && beforeMount.call(state)
            patch(null, subTree, container, anchor)
            instance.isMounted = true
            // 在这里调用mounted钩子
            mounted && mounted.call(state)
        } else {
            // 在这里调用beforeUpdate钩子
            beforeUpdate && beforeUpdate.call(state)
            patch(instance.subTree, subTree, container, anchor)
            // 在这里调用updated钩子
            updated && updated.call(state)
        }
        instance.subTree = subTree
    }, {
        scheduler: queueJob
    })

}