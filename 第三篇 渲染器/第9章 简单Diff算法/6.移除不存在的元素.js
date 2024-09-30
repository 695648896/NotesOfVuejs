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
            let find = false
            for (j; j < oldChildren.length; j++) {
                const oldVNode = newChildren[i]
                if (newVNode.key === oldVNode.key) {
                    find = true
                    patch(oldVNode, newVNode, container)
                    if (j < lastIndex) {
                        const prevVNode = newChildren[i - 1]
                        if (prevVNode) {
                            const anchor = prevVNode.el.nextSibling
                            insert(newVNode.el, container, anchor)
                        }
                    } else {
                        lastIndex = j
                    }
                    break
                }
                if (!find) {
                    const prevVNode = newChildren[i - 1]
                    let anchor = null
                    if (prevVNode) {
                        anchor = prevVNode.el.nextSibling
                    } else {
                        anchor = container.firstChild
                    }
                    patch(null, newVNode, container, anchor)
                }
            }
        }

        // 上一步的更新操作完成后
        // 遍历旧的一组子节点
        for (let i = 0; i < oldChildren.length; i++) {
            const oldVNode = oldChildren[i]
            // 拿旧子节点oldVNode去新的一组子节点中寻找具有相同key值的节点
            const has = newChildren.find(
                vnode => vnode.key === oldVNode.key
            )
            if (!has) {
                // 如果没有找到具有相同key值的节点,则说明需要删除该节点
                // 调用unmount函数将其卸载
                unmount(oldVNode)
            }
        }

    } else {

    }
}