function patchChildren(n1, n2, container) {
    if (typeof n2.children === 'string') {
        // 省略部分代码
    } else if (Array.isArray(n2.children)) {
        const oldChildren = n1.children
        const newChildren = n2.children
        // 旧的一组子节点的长度
        const oldLen = oldChildren.length
        // 新的一组子节点的长度
        const newLen = newChildren.length
        // 两组子节点的公共长度,即两者中较短的那一组子节点的长度
        const commonLength = Math.min(oldLen, newLen)
        // 遍历commonLenth次
        for (let i = 0; i < commonLength; i++) {
            patch(oldChildren[i], newChildren[i], container)
        }

        if (newLen > oldLen) {
            for (let i = commonLength; i < newLen; i++) {
                patch(null, newChildren[i], container)
            }
        } else if (oldLen > newLen) {
            for (let i = commonLength; i < oldLen; i++) {
                unmount(oldChildren[i])
            }
        }

    } else {

    }
}