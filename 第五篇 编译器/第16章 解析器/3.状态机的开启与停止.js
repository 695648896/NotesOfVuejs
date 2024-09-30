// 当解析器遇到开始标签时,会将该标签压入父级节点栈,同时开启新的状态机.当解析器遇到结束标签,并且父级节点栈中存在与该标签同名的开始标签节点时,会停止当前正在运行的状态机
// 根据以上规则,给出isEnd函数实现
function isEnd(context, ancestors) {
    // 当模板内容解析完毕后,停止
    if (!context.source) return true
    // 与父级节点栈内所有节点做比较
    for (let i = ancestors.length - 1; i >= 0; --i) {
        // 只要栈中存在与当前结束标签同名的节点,就停止状态机
        if (context.source.startsWith(`</${ancestors[i].tag}`)) {
            return true
        }
    }
}

function parseElement(context, ancestors) {
    // 调用parseTag函数解析开始标签
    const element = parseTag(context)
    if (element.isSelfClosing) return element

    ancestors.push(element)
    element.children = parseChildren(context, ancestors)
    ancestors.pop()

    if (context.source.startsWith(`</${element.tag}`)) {
        // 再次调用parseTag函数解析结束标签,传递了第二个参数:‘end'
        parseTag(context, 'end')
    } else {
        // 缺少闭合标签
        console.error(`${element.tag}标签缺少闭合标签`)
    }
    return element
}