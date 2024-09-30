function patchChildren(n1, n2, container) {
    if (typeof n2.children === 'string') {
        // 省略部分代码
    } else if (Array.isArray(n2.children)) {
        const oldChildren = n1.children
        const newChildren = n2.children

        let lastIndex = 0
        for (let i = 0; i < newChildren.length; i++) {
            const newVNode = newChildren[i]
            let j = 0
            // 在第一层循环中定义变量find,代表是否在旧的一组子节点中找到可复用节点
            // 初始值为false,代表没找到
            let find = false
            for (j; j < oldChildren.length; j++) {
                const oldVNode = newChildren[i]
                if (newVNode.key === oldVNode.key) {
                    find = true
                    patch(oldVNode, newVNode, container)
                    if (j < lastIndex) {
                        // 代码运行到这里,说明newVNode对应的真实DOM需要移动
                        // 先获取newVNode的前一个vnode,即prevVNode
                        const prevVNode = newChildren[i - 1]
                        // 如果prevVNode不存在,则说明当前newVNode是第一个节点,它不需要移动
                        if (prevVNode) {
                            // 由于我们要将newVNode对应的真实DOM移动到prevVNode所对应真实DOM后面,
                            // 所以我们需要获取prevVNode所对应真实DOM的下一个兄弟节点,并将其作为锚点
                            const anchor = prevVNode.el.nextSibling
                            // 调用insert方法将newVNode对应的真实DOM插入到锚点元素前面
                            // 也就是prevVNode对应真实DOM后面,这里insert根据不同的平台由createRenderer传入
                            insert(newVNode.el, container, anchor)
                        }
                    } else {
                        // 如果当前找到的节点在旧children中的索引不小于最大索引值,
                        // 则更新lastIndex的值
                        lastIndex = j
                    }
                    break
                }
                // 如果代码运行到这里,find仍然为false
                // 说明当前newVNode没有在旧的一组子节点中找到可复用的节点
                // 也就是说,当前newVNode是新增节点,需要挂载
                if (!find) {
                    // 为了将节点挂载到正确位置,我们需要先获取锚点元素
                    // 首先获取当前newVNode的前一个vnode节点
                    const prevVNode = newChildren[i - 1]
                    let anchor = null
                    if (prevVNode) {
                        // 如果有前一个vnode节点,则使用它的下一个兄弟节点作为锚点元素
                        anchor = prevVNode.el.nextSibling
                    } else {
                        // 如果没有前一个vnode节点,说明即将挂载的新节点是第一个子节点
                        // 这时我们使用容器元素的firstChild作为锚点
                        anchor = container.firstChild
                    }
                    // 挂载newVNode
                    patch(null, newVNode, container, anchor)
                }
            }
        }

    } else {

    }
}

const renderer = createRenderer({
    // 省略部分代码

    insert(el, parent, anchor = null) {
        // insertBefore需要锚点元素anchor
        parent.insertBefore(el, anchor)
    }

    // 省略部分代码
})

// patch函数需要接收第四个参数,即锚点元素
function patch(n1, n2, container, anchor) {
    // 省略部分代码
    if (typeof type === 'string') {
        if (!n1) {
            // 挂载时将锚点元素作为第三个参数传递给mountElement函数
            mountElement(n2, container, anchor)
        } else {
            patchElement(n1, n2)
        }
    } else {
        // 省略其他代码
    }
}
// mountElement函数需要增加第三个参数,即锚点元素
function mountElement(vnode, container, anchor) {
    // 省略部分代码

    // 在插入节点时,将锚点元素偷穿给insert函数
    insert(el, container, anchor)
}