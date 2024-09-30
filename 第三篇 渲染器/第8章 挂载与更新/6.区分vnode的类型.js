function patch(n1, n2, container) {
    if (n1 && n1.type !== n2.type) {
        unmount(n1)
        n1 = null
    }
    // 代码运行到这里,证明n1和n2所描述的内容相同
    const { type } = n2
    if (typeof type === 'string') {
        if (!n1) {
            mountElement(n2, container)
        } else {
            patchElement(n1, n2)
        }
    } else if (typeof type === 'object') {
        // 组件
    } else {
        // 其他类型
    }

}