function parseTag(context, type = 'start') {
    const { advanceBy, advanceSpaces } = context

    const match = type === 'start'
        ? /^<([a-z][^\t\r\n\f />]*)/i.exec(context.source)
        : /^<\/([a-z][^\t\r\n\f />]*)/i.exec(context.source)
    const tag = match[1]


    advanceBy(match[0].length)
    advanceSpaces()
    // 调用parseAttributes函数完成属性与指令的解析,并得到props数组,
    // props数组是由指令节点与属性节点共同组成的数组
    const props = parseAttributes(context)

    const isSelfClosing = context.source.startsWith('/>')
    advanceBy(isSelfClosing ? 2 : 1)

    // 返回标签节点
    return {
        type: 'Element',
        tag,
        props, // 将props数组添加到标签节点上
        children: [],
        isSelfClosing
    }
}

// 实际上parseAttributes函数消费模板内容的过程,就是不断地解析属性名称、等于号、属性值的过程
function parseAttributes(context) {
    const { advanceBy, advanceSpaces } = context
    const props = []

    while (
        !context.source.startsWith('>') &&
        !context.source.startsWith('/>')
    ) {
        // 该正则用于匹配属性名称
        const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source)
        // 得到属性名称
        const name = match[0]
        // 消费属性名称
        advanceBy(name.length)
        // 消费属性名称与等于号之间的空白字符
        advanceSpaces()
        // 消费等于号
        advanceBy(1)
        // 消费等于号与属性值之间的空白字符
        advanceSpaces()

        // 属性值
        let value = ''

        // 获取当前模板内容的第一个字符
        const quote = context.source[0]
        // 判断属性值是否被引号引用
        const isQuoted = quote === '"' || quote === "'"

        if (isQuoted) {
            // 属性值被引号引用,消费引号
            advanceBy(1)
            // 获取下一个引号的索引
            const endQuoteIndex = context.source.indexOf(quote)
            if (endQuoteIndex > -1) {
                // 获取下一个引号之前的内容作为属性值
                value = context.source.slice(0, endQuoteIndex)
                // 消费属性值
                advanceBy(value.length)
                // 消费引号
                advanceBy(1)
            } else {
                // 缺少引号错误
                console.error('缺少引号')
            }
        } else {
            // 代码运行到这里,说明属性值没有被引号引用
            // 下一个空白字符之前的内容全部作为属性值
            const match = /^[^\t\r\n\f >]+/.exec(context.source)
            // 获取属性值
            value = match[0]
            // 消费属性值
            advanceBy(value.length)
        }
        // 消费属性值后面的空白字符
        advanceSpaces()

        // 使用属性名称 + 属性值创建一个属性节点,添加到props数组中
        props.push({
            type: 'Attribute',
            name,
            value
        })
    }
    // 返回
    return props
}