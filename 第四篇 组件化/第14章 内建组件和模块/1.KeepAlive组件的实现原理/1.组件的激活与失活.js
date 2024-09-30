// KeepAlive一词借鉴于HTTP协议.在HTTP协议中,KeepAlive又称HTTP持久连接(HTTP persistent connection),其作用是允许多个请求或响应共用一个TCP连接.
// 其实KeepAlive的本质是缓存管理,再加上特殊的挂载/卸载逻辑
// KeepAlive组件在卸载时,我们不能真的卸载,否则就无法维持组件的当前状态了,而是将组件从原容器搬运到另一个隐藏的容器中.实现“假卸载”,
// 当再次要挂载时,也不能真挂载,而是把组件从隐藏容器中搬运到原容器

// 下面是一个最基本的KeepAlive组件实现
const KeepAlive = {
    // KeepAlive组件独有的属性,用作标识
    __isKeepAlive: true,
    setup(props, { slots }) {
        // 创建一个缓存对象
        // key: vnode.type
        // value: node
        const cache = new Map()
        // 当前KeepAlive组件的实例
        const instance = currentInstance
        // 对于KeepAlive组件来说,它的实例上存在特殊的keepAliveCtx对象,该对象由渲染器注入
        // 该对象会暴露渲染器的一些内部方法,其中move函数用来将一段DOM移动到另一个容器中
        const { move, createElement } = instance.keepAliveCtx

        // 创建隐藏容器
        const storageContainer = createElement('div')

        // keepAlive组件的实例上会被添加两个内部函数,分别是_deActivate和_activate
        // 这两个函数会在渲染器中被调用
        instance._deActivate = (vnode) => {
            move(vnode, storageContainer)
        }
        instance._activate = (vnode, container, anchor) => {
            move(vnode, container, anchor)
        }

        return () => {
            // KeepAlive的默认插槽就是要被KeepAlive的组件
            let rawVNode = slots.default()
            // 如果不是组件,直接渲染即可,因为非组件的虚拟节点无法被KeepAlive
            if (typeof rawVNode.type !== 'object') {
                return rawVNode
            }

            // 在挂载时先获取缓存的组件vnode
            const cachedVNode = cache.get(rawVNode.type)
            if (cachedVNode) {
                // 如果有缓存的内容,则说明不应该执行挂载,而应该执行激活
                // 继承组件实例
                rawVNode.component = cachedVNode.component
                // 在vnode上添加keptAlive属性,标记为true,避免渲染器重新挂载它
            } else {
                // 如果没有缓存,则将其添加到缓存中,这样下次激活组件时就不会执行新的挂载动作了
                cache.set(rawVNode.type, rawVNode)
            }

            // 在组件vnode上添加shouldKeepAlive属性,并标记为true,避免渲染器真的将组件卸载
            rawVNode.shouldKeepAlive = true
            // 将KeepAlive组件的实例也添加到vnode上,以便在渲染器中访问
            rawVNode.keepAliveInstance = instance
            // 渲染组件vnode
            return rawVNode
        }
    }
}

// KeepAlive组件会对“内部组件”进行操作,主要是加一些标记属性,以便渲染器能够据此执行特定的逻辑
// shouldKeepAlive
function unmount(vnode) {
    if (vnode.type === Fragment) {
        vnode.children.forEach(c => unmount(c))
        return
    } else if (typeof vnode.type === 'object') {
        // vnode.shouldKeepAlive是一个布尔值,用来标识该组件是否应该被KeepAlive
        if (vnode.shouldKeepAlive) {
            // 对于需要被KeepAlive的组件,我们不应该真的卸载它,而应该调用该组件的父组件,
            // 即KeepAlive组件的_deActivate(vnode)
            vnode.keepAliveInstance._deActivate(vnode)
        } else {
            unmount(vnode.component.subTree)
        }
        return
    }
    const parent = vnode.el.parentNode
    if (parent) {
        parent.removeChild(vnode.el)
    }

}

// keepAliveInstance 在unmount函数中会通过keepAliveInstance来访问_deActivate函数
// keptAlive "内部组件"如果已经被缓存,则还会为其添加一个keptAlive标记.这样当“内部组件”重新渲染时,渲染器并不会重新挂载它,而会将其激活
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
    } else if (typeof type === 'object' || typeof type === 'function') {
        // component
        if (!n1) {
            // 如果该组件已经被KeepAlive,则不会重新挂载它,而是会调用_activate来激活它
            if (n2.keptAlive) {
                n2.keepAliveInstance._activate(n2, container, anchor)
            } else {
                mountComponent(n2, container, anchor)
            }
        } else {
            patchComponent(n1, n2, anchor)
        }
    }
}

// 上面这段代码中涉及的move函数是由渲染器注入的,如下面mountComponent函数的代码所示
function mountComponent(vnode, container, anchor) {
    // 省略部分代码

    const instance = {
        state,
        props: shallowReactive(props),
        isMounted: false,
        subTree: null,
        slots,
        mounted: [],
        // 只有KeepAlive组件的实例下会有keepAliveCtx属性
        keepAliveCtx: null
    }

    // 检查当前要挂载的组件是否是KeepAlive组件
    const isKeepAlive = vnode.type.__isKeepAlive
    if (isKeepAlive) {
        // 在KeepAlive组件实例上添加keepAliveCtx对象
        instance.keepAliveCtx = {
            // move函数用来移动一段vnode
            move(vnode, container, anchor) {
                // 本质上是将组件渲染的内容移动到指定容器中,即隐藏容器中
                IntersectionObserverEntry(vnode.component.subTree.el, container, anchor)
            },
            createElement
        }
    }

    // 省略部分代码

}