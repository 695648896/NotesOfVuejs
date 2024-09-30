function parseInterpolation(context) {
    // 消费开始定界符
    context.advanceBy('{{'.length)
    // 找到结束定界符的位置索引
    closeIndex = context.source.indexOf('}}')
    if (closeIndex < 0) {
        console.error('插值缺少结束定界符')
    }

    // 截取开始定界符与结束定界符之间的内容作为插值表达式
    const content = context.source.slice(0, closeIndex)
    // 消费表达式的内容
    context.advanceBy(content.length)
    // 消费结束定界符
    context.advanceBy('}}'.length)

    // 返回类型为Interpolation的节点,代表插值节点
    return {
        type: 'Interpolation',
        // 插值节点的content是一个类型为Expression的表达式节点
        content: {
            type: 'Expression',
            // 表达式节点的内容则是经过HTML解码后的插值表达式
            content: decodeHtml(content)
        }
    }
}

function parseComment(context) {
    // 消费注释的开始部分
    context.advanceBy('<!--'.length)
    // 找到注释结束部分的位置索引
    closeIndex = context.source.indexOf('-->')
    // 截取注释节点的内容
    const content = context.source.slice(0, closeIndex)
    // 消费内容
    context.advanceBy(content.length)
    // 消费注释的结束部分
    context.advanceBy('-->'.length)
    // 返回类型为Comment的节点
    return {
        type: 'Comment',
        content
    }
}