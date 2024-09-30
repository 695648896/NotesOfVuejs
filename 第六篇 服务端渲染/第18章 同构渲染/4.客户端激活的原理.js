// 由于浏览器在渲染了由服务端发送过来的HTML字符串之后,页面已经存在对应的DOM元素了,所以组件代码在客户端运行时,不需要再次创建相应的DOM元素.但是组件在客户端运行时,仍然需要做两件重要的事:
// 为页面中的DOM元素与虚拟节点对象之间建立联系
// 为页面中的DOM元素添加事件绑定

// 用代码模拟从服务端渲染到客户端激活的整个过程
// html代表由服务端渲染的字符串
const html = renderComponentVNode(compVNode)

// 假设客户端已经拿到了由服务端渲染的字符串
// 获取挂载点
const container = document.querySelector('#app')
// 设置挂载点的innerHTML,模拟由服务端渲染的内容
container.innerHTML = html

// 接着调用hydrate函数完成激活
renderer.hydrate(compVNode, container)


//与renderer.render函数一样,renderer.hydrate函数也是渲染器的一部分,因此它也会作为createRenderer函数的返回值
function createRenderer(options) {
    function hydrate(node, vnode) {
        // ...
    }

    return {
        render,
        // 作为createRenderer函数的返回值
        hydrate
    }
}

// 真实DOM元素与虚拟DOM对象都是树型结构,并且节点之间存在一一对应的关系.因此在激活的时候,应该从容器元素的第一个子节点开始,如下所示
function hydrate(vnode, container) {
    // 从容器元素的第一个子节点开始
    hydrateNode(container.firstChild, vnode)
}

// 其中hydrateNode函数接收两个参数,分别是真实DOM元素和虚拟DOM元素.hydrateNode函数的具体实现如下:
function hydrateNode(node, vnode) {
    const { type } = vnode
    // 1.让vnode.el引用真实DOM
    vnode.el = node

    // 2.检查虚拟DOM的类型,如果是组件,则调用mountComponent函数完成激活
    if (typeof type === 'object') {
        mountComponent(vnode, container, null)
    } else if (typeof type === 'string') {
        // 3.检查真实DOM的类型与虚拟DOM的类型是否匹配
        if (node.nodeType !== 1) {
            console.error('mismatch')
            console.error('服务端渲染的真实DOM节点是: ', node)
            console.error('客户端渲染的虚拟DOM节点是: ', vnode)
        } else {
            // 4.如果是普通元素,则调用hydrateElement完成激活
            hydrateElement(node, vnode)
        }
    }
    // 5. 重要:hydrateNode函数需要返回当前节点的下一个兄弟节点,以便继续进行后续的激活操作
    return node.nextSibling
}

// 用来激活普通元素类型的节点
function hydrateElement(el, vnode) {
    //1. 为DOM元素添加事件
    if (vnode.props) {
        for (const key in vnode.props) {
            // 只有事件类型的props需要处理
            if (/^on/.test(key)) {
                patchProps(el, key, null, vnode.props[key])
            }
        }
    }
    // 递归地激活子节点
    if (Array.isArray(vnode.children)) {
        // 从第一个子节点开始
        let nextNode = el.firstChild
        const len = vnode.children.length
        for (let i = 0; i < len; i++) {
            // 激活子节点,注意,每当激活一个子节点,hydrateNode函数都会返回当前子节点的下一个兄弟节点
            // 于是可以进行后续的激活了
            nextNode = hydrateNode(nextNode, vnode.children[i])
        }
    }
}

// 由于服务端渲染的页面中已经存在真实的DOM元素,所以当调用mountComponent函数进行组件的挂载时,无须再次创建真实DOM元素
function mountComponent(vnode, container, anchor) {
    // 省略部分代码

    instance.update = effect(() => {
        const subTree = render.call(renderContext, renderContext)
        if (!instance.isMounted) {
            beforeMount && beforeMount.call(renderContext)
            // 如果vnode.el存在,则意味着要执行激活
            if (vnode.el) {
                // 直接调用hydrateNode完成激活
                hydrateNode(vnode.el, subTree)
            } else {
                // 正常挂载
                patch(null, subTree, container, anchor)
            }
            instance.isMounted = true
            mounted && mounted.call(renderContext)
            instance.mounted && instance.mounted.forEach(hook => hook.call(renderContext))
        } else {
            beforeUpdate && beforeUpdate.call(renderContext)
            patch(instance.subTree, subTree, container, anchor)
            updated && updated.call(renderContext)
        }
        instance.subTree = subTree
    }, {
        scheduler: queueJob
    })
}