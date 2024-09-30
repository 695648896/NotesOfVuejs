// 与KeepAlive组件一样,Teleport组件也需要渲染器的底层支持
// 我们将渲染逻辑从渲染器分离出来,挂在Teleport组件上,1是为了避免渲染器逻辑代码“膨胀”,2是可以利用TreeShaking机制,在用户没有使用Teleport组件的时候删除组件代码
function patch(n1, n2, container, anchor) {
    if (n1 && n1.type !== n2.type) {
        unmount(n1)
        n1 = null
    }

    const { type } = n2

    if (typeof type === 'string') {
        // 省略部分代码
    } else if (type === Text) {
        // 省略部分代码
    } else if (type === Fragment) {
        // 省略部分代码
    } else if (typeof type === 'object' && type.__isTeleport) {
        // 组件选项中如果存在__isTeleport标识,则它是Teleport组件,
        // 调用Teleport组件选项中的process函数将控制权交接出去
        // 传递给process函数的第五个参数是渲染器的一些内部方法
        type.process(n1, n2, container, anchor, {
            patch,
            patchChildren,
            unmount,
            move(vnode, container, anchor) {
                insert(vnode.component ? vnode.component.subTree.el : vnode.el, container, anchor)
            }
        })
    } else if (typeof type === 'object' || typeof type === 'function') {
        // 省略部分代码
    }
}

// 实现Teleport组件
const Teleport = {
    __isTeleport: true,
    process(n1, n2, container, anchor, internals) {
        // 通过internals参数取得渲染器的内部方法
        const { patch } = internals
        // 如果旧VNode n1不存在,则是全新的挂载,否则执行更新
        if (!n1) {
            // 挂载
            // 获取容器, 即挂载点
            const target = typeof n2.props.to === 'string'
                ? document.querySelector(n2.props.to)
                : n2.props.to

            // 将n2.children渲染到指定挂载点即可
            n2.children.forEach(c => patch(null, c, target, anchor))
        } else {
            // 更新
            patchChildren(n1, n2, container)
            // 如果新旧to参数的值不同,则需要对内容进行移动
            if (n2.props.to !== n1.props.to) {
                // 获取新的容器
                const newTarget = typeof n2.props.to === 'string' ? document.querySelector(n2.props.to) : n2.props.to
                // 移动到新的容器
                n2.children.forEach(c => move(c, newTarget))
            }
        }
    }
}