while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (!oldStartVNode) {
        oldStartVNode = oldChildren[++oldStartIdx]
    } else if (!oldEndVNode) {
        oldEndVNode = oldChildren[++oldEndIdx]
    } else if (oldStartVNode.key === newStartVNode.key) {
        // 省略部分代码
    } else if (oldEndVNode.key === newEndVNode.key) {
        // 省略部分代码
    } else if (oldStartVNode.key === newEndVNode.key) {
        // 省略部分代码
    } else if (oldEndVNode.key === newStartVNode.key) {
        // 省略部分代码
    } else {
        const idxInOld = oldChildren.findIndex(node => node.key === newStartVNode.key)
        if (idxInOld > 0) {
            const vnodeToMove = oldChildren[idxInOld]
            patch(vnodeToMove, newStartVNode, container)
            insert(vnodeToMove.el, container, oldStartVNode.el)
            oldChildren[idxInOld] = undefined

        } else {
            // 将newStartVNode作为新节点挂载到头部,使用当前头部节点oldStartVNode.el作为锚点
            patch(null, newStartVNode, container, oldStartVNode.el)
        }
        newStartVNode = newChildren[++newStartIdx]
    }
}
// 对于 p-4 p-1 p-2 p-3 与p-1 p-2 p-3 一直尾key相同的,新增节点p-4会被遗漏,为了弥补这个缺陷,添加额外处理代码
// 循环结束后检查索引值的情况
if (oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
    // 如果满足条件,则说明有新的节点遗留,需要挂载它们
    for (let i = newStartIdx; i <= newEndIdx; i++) {
        const anchor = newChildren[newEndIdx + 1] ? newChildren[newEndIdx + 1].el : null
        patch(null, newChildren[i], container, anchor)
    }
}