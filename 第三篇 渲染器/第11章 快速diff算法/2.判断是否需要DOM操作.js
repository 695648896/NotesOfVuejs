function patchKeyedChildren(n1, n2, container) {
    const newChildren = n2.children
    const oldChildren = n1.children

    // 更新相同的前置节点
    // 省略部分代码

    // 更新相同的后置节点
    // 省略部分代码

    // 预处理完毕后,如果满足如下条件,则说明从j-->newEnd之间的节点应作为新节点插入
    if (j > oldEnd && j <= newEnd) {
        // 省略部分代码
    } else if (j > newEnd && j <= oldEnd) {
        // 省略部分代码
    } else {
        // 增加else分之来处理非理想情况->新旧都还有节点存在
        // 构造source数组,用来存储新的一组子节点中的节点在旧的一组子节点中的位置索引
        const count = newEnd - j + 1
        const source = new Array(count)
        source.fill(-1)

        // oldStart和newStart分别为起始索引,即j
        const oldStart = j
        const newStart = j

        // 新增两个变量,moved和pos
        let moved = false
        let pos = 0

        // 构建索引表
        const keyIndex = {}
        for (let i = newStart; i <= newEnd; i++) {
            keyIndex[newChildren[i].key] = i
        }

        // 新增patched变量,代表更新过的节点数量
        let patched = 0
        for (let i = oldStart; i <= oldEnd; i++) {
            oldVNode = oldChildren[i]
            if (patched <= count) {
                const k = keyIndex[oldVNode.key]
                if (typeof k !== 'undefined') {
                    newVNode = newChildren[k]
                    patch(oldVNode, newVNode, container)
                    // 每更新一个节点,都将patched变量+1
                    patched++
                    source[k - newStart] = i
                    // 判断节点是否需要移动
                    if (k < pos) {
                        moved = true
                    } else {
                        pos = k
                    }
                } else {
                    // 没找到
                    unmount(oldVNode)
                }
            } else {
                unmount(oldVNode)
            }
        }

    }
}