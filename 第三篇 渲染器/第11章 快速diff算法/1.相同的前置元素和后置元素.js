function patchKeyedChildren(n1, n2, container) {
    const newChildren = n2.children
    const oldChildren = n1.children
    // 处理相同的前置节点
    // 索引j指向新旧两组子节点的开头
    let j = 0
    let oldVNode = oldChildren[j]
    let newVNode = newChildren[j]
    // while循环向后遍历,直到遇到拥有不同key值的节点为止
    while (oldVNode.key === newVNode.key) {
        // 调用patch函数进行更新
        patch(oldVNode, newVNode, container)
        // 更新索引j,让其递增
        j++
        oldVNode = oldChildren[j]
        newVNode = newChildren[j]
    }

    // 更新相同的后置节点
    // 索引oldEnd指向旧的一组子节点的最后一个节点
    let oldEnd = oldChildren.length - 1
    // 索引newEnd指向新的一组子节点的最后一个节点
    let newEnd = newChildren.length - 1

    oldVNode = oldChildren[oldEnd]
    newVNode = newChildren[newEnd]

    // while循环从后向前遍历,直到遇到拥有不同key值的节点为止
    while (oldVNode.key === newVNode.key) {
        // 调用patch函数进行更新
        patch(oldVNode, newVNode, container)
        // 递减oldEnd和nextEnd
        oldEnd--
        newEnd--
        oldVNode = oldChildren[oldEnd]
        newVNode = newChildren[newEnd]
    }

    // 预处理完毕后,如果满足如下条件,则说明从j-->newEnd之间的节点应作为新节点插入
    if (j > oldEnd && j <= newEnd) {
        // 锚点的索引
        const anchorIndex = newEnd + 1
        // 锚点元素
        const anchor = anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null
        // 采用while循环,调用patch函数逐个挂载新增节点
        while (j <= newEnd) {
            patch(null, newChildren[j++], container, anchor)
        }
    } else if (j > newEnd && j <= oldEnd) {
        // j->oldEnd之间的节点应该被卸载
        while (j <= oldEnd) {
            unmount(oldChildren[j++])
        }
    }
}