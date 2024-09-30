// 有了dynamicChildren之后,我们可以直接对比动态节点
function patchElement(n1, n2) {
    const el = n2.el = n1.el
    const oldProps = n1.props
    const newProps = n2.props



    if (n2.dynamicChildren) {
        // 调用patchBlockChildren函数,这样只会更新动态节点
        patchBlockChildren(n1, n2)
    } else {
        // 对于单个动态节点的更新来说,由于它存在对应的补丁标志,因此我们可以针对性地完成靶向更新
        if (n2.patchFlags) {
            // 靶向更新
            if (n2.patchFlags === 1) {
                // 只需要更新class
            } else if (n2.patchFlags === 2) {
                // 只需要更新style
            } else {
                // ...
            }
        } else {
            // 全量更新
            for (const key in newProps) {
                if (newProps[key] !== oldProps[key]) {
                    patchProps(el, key, oldProps[key], newProps[key])
                }
            }

            for (const key in oldProps) {
                if (!(key in newProps)) {
                    patchProps(el, key, oldProps[key], null)
                }
            }
        }
        // 在处理children时,调用patchChildren函数
        patchChildren(n1, n2, el)
    }
}

function patchBlockChildren(n1, n2) {
    // 只更新动态节点即可
    for (let i = 0; i < n2.dynamicChildren.length; i++) {
        patchElement(n1.dynamicChildren[i], n2.dynamicChildren[i])
    }
}