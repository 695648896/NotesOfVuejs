function patchChildren(n1, n2, container) {
    if (typeof n2.children === 'string') {
        // 省略部分代码
    } else if (Array.isArray(n2.children)) {
        const oldChildren = n1.children
        const newChildren = n2.children

        // 用来存储寻找过程中遇到的最大索引值
        let lastIndex = 0
        for (let i = 0; i < newChildren.length; i++) {
            const newVNode = newChildren[i]
            for (let j = 0; j < oldChildren.length; j++) {
                const oldVNode = newChildren[i]
                // 如果找到了具有相同key值的两个节点,说明可以复用,但仍然需要调用patch函数更新
                if (newVNode.key === oldVNode.key) {
                    patch(oldVNode, newVNode, container)
                    if (j < lastIndex) {
                        // 如果当前找到的节点在旧children中的索引小于最大索引值lastIndex,
                        // 说明该节点对应的真实DOM需要移动
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