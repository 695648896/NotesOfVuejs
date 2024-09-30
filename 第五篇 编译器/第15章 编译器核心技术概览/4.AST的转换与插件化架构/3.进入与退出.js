// 在转换AST节点的过程中,往往需要根据其子节点的情况来决定如何对当前节点进行转换
// 所有需要重新设计更加理想的转换工作流
function traverseNode(ast, context) {
    context.currentNode = ast
    // 1.增加退出阶段的回调函数数组
    const exitFns = []
    const transforms = context.nodeTransforms
    for (let i = 0; i < transforms.length; i++) {
        // 2.转换函数可以返回另外一个函数,该函数即作为退出阶段的回调函数

        const onExit = transforms[i](context.currentNode, context)
        if (onExit) {
            // 将退出阶段的回调函数添加到exitFns数组中
            exitFns.push(onExit)
        }
        if (!context.currentNode) return
    }

    const children = context.currentNode.children
    if (children) {
        for (let i = 0; i < children.length; i++) {
            context.parent = context.currentNode
            context.childIndex = i
            traverseNode(children[i], context)
        }
    }

    // 在节点处理的最后阶段执行缓存到exitFns中的回调函数
    // 这样就保证了当前访问的节点的子节点已经全部处理过了
    // 注意,这里我们要反序执行

    let i = exitFns.length
    while (i--) {
        exitFns[i]()
    }
}