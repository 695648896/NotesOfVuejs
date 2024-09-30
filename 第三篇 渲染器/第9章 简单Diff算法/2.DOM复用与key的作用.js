function patchChildren(n1, n2, container) {
    if (typeof n2.children === 'string') {
        // 省略部分代码
    } else if (Array.isArray(n2.children)) {
        const oldChildren = n1.children
        const newChildren = n2.children

        // 遍历新的children
        for (let i = 0; i < newChildren.length; i++) {
            const newVNode = newChildren[i]
            for (let j = 0; j < oldChildren.length; j++) {
                const oldVNode = newChildren[i]
                // 如果找到了具有相同key值的两个节点,说明可以复用,但仍然需要调用patch函数更新
                if (newVNode.key === oldVNode.key) {
                    patch(oldVNode, newVNode, container)
                    break
                }
            }
        }

    } else {

    }
}