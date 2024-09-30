function patchChildren(n1, n2, container) {
    if (typeof n2.children === 'string') {
        // 省略部分代码
    } else if (Array.isArray(n2.children)) {
        const oldChildren = n1.children
        const newChildren = n2.children

        let lastIndex = 0
        for (let i = 0; i < newChildren.length; i++) {
            const newVNode = newChildren[i]
            for (let j = 0; j < oldChildren.length; j++) {
                const oldVNode = newChildren[i]
                if (newVNode.key === oldVNode.key) {
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