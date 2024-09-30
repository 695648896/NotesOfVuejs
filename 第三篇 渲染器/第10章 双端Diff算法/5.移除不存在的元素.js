while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // 省略部分代码
}

if (oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
    // 添加新节点 
    // 省略部分代码
} else if (newEndIdx < newStartIdx && oldStartIdx <= oldEndIdx) {
    // 移除操作
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
        unmount(oldChildren[i])
    }
}