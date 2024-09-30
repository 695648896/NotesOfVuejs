function patch(n1, n2, container, anchor) {
    if (n1 && n1.type != n2.type) {
        unmount(n1)
        n1 = null
    }
    const { type } = n2

    if (typeof type === 'string') {

    } else if (type === Text) {

    } else if (type === Fragment) {

    } else if (typeof type === 'object') {
        // vnode.type的值是选项对象,作为组件来处理
        if (!n1) {
            // 挂载组件
            mountComponent(n2, container, anchor)
        } else {
            // 更新组件
            patchComponent(n1, n2, anchor)
        }
    }
}

// 渲染器中真正完成组件渲染任务的是mountComponent函数
function mountComponent(vnode, container, anchor) {
    // 通过vnode获取组件的选项对象,即vnode.type
    const componentOptions = vnode.type
    // 获取组件的渲染函数render
    const { render } = componentOptions
    // 执行渲染函数,获取组件要渲染的内容,即render函数返回的虚拟DOM
    const subTree = render()
    // 最后调用patch函数来挂载组件所描述的内容
    patch(null, subTree, container, anchor)
}