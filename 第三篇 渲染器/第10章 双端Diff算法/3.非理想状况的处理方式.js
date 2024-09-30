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
        // 遍历旧的一组子节点,试图寻找与newStartVNode拥有相同key值的节点
        // idxInOld就是新的一组子节点的头部节点在旧的一组子节点中的索引
        const idxInOld = oldChildren.findIndex(node => node.key === newStartVNode.key)
        if (idxInOld > 0) {
            // idxInOld 位置对应的vnode就是需要移动的节点
            const vnodeToMove = oldChildren[idxInOld]
            // 不要忘记除移动操作外还应该打补丁
            patch(vnodeToMove, newStartVNode, container)
            // 将vnodeToMove.el移动到头部节点oldStartVNode.el之前,因此使用后者作为锚点
            insert(vnodeToMove.el, container, oldStartVNode.el)
            // 由于位置idxInOld处的节点所对应的真实DOM已经移动到了别处,因此将其设置为undefined
            oldChildren[idxInOld] = undefined
            // 最后更新newStartIdx到下一个位置
            newStartVNode = newChildren[++newStartIdx]
        }
    }
}