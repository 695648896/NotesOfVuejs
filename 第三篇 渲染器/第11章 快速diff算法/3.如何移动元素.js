if (j > oldEnd && j <= newEnd) {
    // 省略部分代码
} else if (j > newEnd && j <= oldEnd) {
    // 省略部分代码
} else {

    for (let i = oldStart; i <= oldEnd; i++) {
        // 省略部分代码
    }
    if (moved) {
        // 计算最长递增子序列
        const seq = lis(sources)

        // s指向最长递增子序列的最后一个元素
        let s = seq.length - 1
        // i 指向新的一组子节点的最后一个元素
        let i = count - 1
        // for循环使得i递减,即按照图11-24中箭头的方向移动
        for (i; i >= 0; i--) {
            if (souce[i] === -1) {
                // 说明索引为i的节点是全新的节点,应该将其挂载
                // 该节点在新children中的真实位置索引
                const pos = i + newStart
                const newVNode = newChildren[pos]
                // 该节点的下一个节点的位置索引
                const nextPos = pos + 1
                // 锚点
                const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null
                // 挂载
                patch(null, newVNode, container, anchor)
            } else if (i !== seq[s]) {
                // 如果节点的索引i不等于seq[s]的值,说明该节点需要移动
                // 该节点在新的一组子节点中的真实位置索引
                const pos = i + newStart
                const newVNode = newChildren[pos]
                // 该节点的下一个节点的位置索引
                const nextPos = pos + 1
                // 锚点
                const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null
                // 移动
                insert(newVNode.el, container, anchor)

            } else {
                // 当i === seq[s],说明该位置的节点不需要移动
                // 只需要让s指向下一个位置
                s--
            }
        }
    }

}