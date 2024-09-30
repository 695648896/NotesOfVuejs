// dump工具函数,用来打印当前AST中的节点信息
function dump(node, indent = 0) {
    // 节点的类型
    const type = node.type
    // 节点的描述,如果是根节点,则没有描述
    // 如果是Element类型的节点,则使用node.tag作为节点的描述
    // 如果是Text类型的节点,则使用node.content作为节点的描述
    const desc = node.type === 'Root'
        ? '' : node.type === 'Element'
            ? node.tag : node.content

    // 打印节点的类型和描述信息
    console.log(`${'-'.repeat(indent)}${type}:${desc}`)

    // 递归地打印子节点
    if (node.children) {
        node.children.forEach(n => dump(n, indent + 2))
    }
}

// 以深度优先遍历来访问AST节点
function traverseNode(ast, context) {
    const currentNode = ast

    // context.nodeTransforms是一个数组,其中每一个元素都是一个函数
    const transforms = context.nodeTransforms
    for (let i = 0; i < transforms.length; i++) {
        // 将当前节点currentNode和context都传递给nodeTransforms中注册的回调函数
        transforms[i](currentNode, context)
    }

    const children = currentNode.children
    if (children) {
        for (let i = 0; i < children.length; i++) {
            traverseNode(children[i], context)
        }
    }
}

// 有了修改后的traverseNode函数,我们就可以如下所示使用它了
function transform(ast) {
    // 在transform函数内创建context对象
    const context = {
        // 注册nodeTransforms 数组,这里把转换方法抽出,避免traverseNode函数“臃肿”
        nodeTransforms: [
            transformElement, // transformElement函数用来转换标签节点
            transformText // transformText函数用来转换文本节点
        ]
    }
    // 调用traverseNode完成转换
    traverseNode(ast, context)
    // 打印AST信息
    console.log(dump(ast))
}

// 其中transformElement函数和transformText函数如下
function transformElement(node) {
    if (node.type === 'Element' && node.tag === 'p') {
        node.tag = 'h1'
    }
}

function transformText(node) {
    if (node.type === 'Text') {
        node.content = node.content.repeat(2)
    }
}