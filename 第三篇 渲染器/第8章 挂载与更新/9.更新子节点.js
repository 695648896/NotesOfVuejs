function patchElement(n1, n2) {
    const el = n2.el = n1.el
    const oldProps = n1.props
    const newProps = n2.props
    // 把新属性都更新到节点上
    for (const key in newProps) {
        if (newProps[key] !== oldProps[key]) {
            patchProps(el, key, oldProps[key], newProps[key])
        }
    }
    // 删除旧属性
    for (const key in oldProps) {
        if (!(key in newProps)) {
            patchProps(el, key, oldProps[key], null)
        }
    }

    // 第二步:更新children
    patchChildren(n1, n2, el)
}

function patchChildren(n1, n2, container) {
    if (typeof n2.children === 'string') {
        // 旧子节点的类型有三种可能: 没有子节点,文本子节点以及一组子节点
        // 只有当旧子节点为一组子节点时,才需要逐个卸载,其他情况下什么都不需要做
        if (Array.isArray(n1.children)) {
            n1.children.forEach((c) => unmount(c))
        }
        setElementText(container, n2.children)
    } else if (Array.isArray(n2.children)) {
        // 说明新子节点是一组子节点
        // 判断旧子节点是否也是一组子节点
        if (Array.isArray(n1.children)) {
            // 双方都是一组子节点,这里涉及核心的diff算法,暂时用傻瓜式替代
            n1.children.forEach(c => unmount(c))
            n2.children.forEach(c => patch(null, c, container))
        } else {
            // 旧子节点为空或者文本,此时需要将容器清空,然后将新子节点逐个挂载即可
            setElementText(container, '')
            n2.children.forEach(c => patch(null, c, container))
        }
    } else {
        // 代码运行到这里,说明新子节点不存在,卸载旧子节点即可
        if (Array.isArray(n1.children)) {
            n1.children.forEach(c => unmount(c))
        } else if (typeof n1.children === 'string') {
            setElementText(container, '')
        }
    }
}