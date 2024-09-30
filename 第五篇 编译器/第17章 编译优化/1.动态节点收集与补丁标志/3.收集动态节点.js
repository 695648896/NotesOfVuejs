// 动态节点栈
const dynamicChildrenStack = []
// 当前动态节点集合
let currentDynamicChildren = null
// openBlock用来创建一个新的动态节点集合,并将该集合压入栈中
function openBlock() {
    dynamicChildrenStack.push((currentDynamicChildren = []))
}
// closeBlock用来将通过openBlock创建的动态节点集合从栈中弹出
function closeBlock() {
    currentDynamicChildren = dynamicChildrenStack.pop()
}

function createVNode(tag, props, children, flags) {
    const key = props && props.key
    props && delete props.key

    const vnode = {
        tag,
        props,
        children,
        key,
        patchFlags: flags
    }

    if (typeof flags !== 'undefined' && currentDynamicChildren) {
        // 动态节点,将其添加到当前动态节点集合中
        currentDynamicChildren.push(vnode)
    }
    return vnode
}

// 最后,我们需要重新设计渲染函数的执行方式
function render() {
    // 1.使用createBlock代替createVNode来创建block
    // 2.每当调用createBlock之前,先调用openBlock
    return (openBlock(), createBlock('div', null, [
        createVNode('p', { class: 'foo' }, null, 1 /* patch flag */),
        createVNode('p', { class: 'bar' }, null)
    ]))
}

function createBlock(tag, props, children) {
    // block本质上也是一个vnode
    const block = createVNode(tag, props, children)
    // 将当前动态节点集合作为block.dynamicChildren
    block.dynamicChildren = currentDynamicChildren

    // 关闭block
    closeBlock()
    // 返回
    return block
}