function transform(ast) {
    const context = {
        // 增加currentNode,用来存储当前正在转换的节点
        currentNode: null,
        // 增加childIndex,用来存储当前节点在父节点的children中的位置索引
        childIndex: 0,
        // 增加parent,用来存储当前转换节点的父节点
        parent: null,
        // 用于替换节点的函数,接收新节点作为参数
        replaceNode(node) {
            // 为了替换节点,我们需要修改AST
            // 找到当前节点在父节点的children中的位置:context.childIndex
            // 然后使用新节点替换即可
            context.parent.children[context.childIndex] = node
            // 由于当前节点已经被新节点替换掉了,因此我们需要将currentNode更新为新节点
            context.currentNode = node
        },
        // 用于删除当前节点
        removeNode() {
            if (context.parent) {
                // 调用数组的splice方法,根据当前节点的索引删除当前节点
                context.parent.children.splice(context.childIndex, 1)
                // 将context.currentNode置空
                context.currentNode = null
            }
        },
        nodeTransforms: [
            transformElement,
            transformText
        ]
    }

    traverseNode(ast, context)
    console.log(dump(ast))
}

function traverseNode(ast, context) {
    // 设置当前转换的节点信息context.currentNode
    context.currentNode = ast

    const transforms = context.nodeTransforms
    for (let i = 0; i < transforms.length; i++) {
        transforms[i](context.currentNode, context)
        // 由于任何转换函数都可能移除当前节点,因此每个转换函数执行完毕后,
        // 都应该检查当前节点是否已经被移除,如果被移除了,直接返回即可
        if (!context.currentNode) return
    }

    const children = context.currentNode.children
    if (children) {
        for (let i = 0; i < children.length; i++) {
            // 递归地调用traverseNode转换子节点之前,将当前节点设置为父节点
            context.parent = context.currentNode
            // 设置位置索引
            context.childIndex = i
            // 递归地调用时,将context透传
            traverseNode(children[i], context)
        }
    }
}

function transformText(node, context) {
    if (node.type === 'Text') {
        // 如果当前转换的节点是文本节点,则调用context.replaceNode函数将其替换为元素节点
        context.replaceNode({
            type: 'Element',
            tag: 'span'
        })
    }
}
function transformText(node, context) {
    if (node.type === 'Text') {
        // 如果是文本节点,直接调用context.removeNode函数将其移除即可
        context.removeNode()
    }
}

function transformElement(node) {
    if (node.type === 'Element' && node.tag === 'p') {
        node.tag = 'h1'
    }
}

