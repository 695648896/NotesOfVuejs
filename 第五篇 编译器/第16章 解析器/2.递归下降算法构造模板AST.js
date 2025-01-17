// 定义文本模式,作为一个状态表
const TextModes = {
    DATA: 'DATA',
    RCDATA: 'RCDATA',
    RAWTEXT: 'RAWTEXT',
    CDATA: 'CDATA'
}
// 解析器函数,接收模板作为参数
function parse(str) {
    // 定义上下文对象
    const context = {
        // source是模板内容,用于在解析过程中进行消费
        source: str,
        // 解析器当前处于文本模式,初始模式为DATA
        mode: TextModes.DATA
    }
    // 调用parseChildren函数开始进行解析,它返回解析后得到的子节点
    // parseChildren函数接收两个参数:
    // 第一个参数是上下文对象context
    // 第二个参数是由父代节点构成的节点栈,初始时栈为空
    const nodes = parseChildren(context, [])

    // 解析器返回Root根节点
    return {
        type: 'Root',
        // 使用nodes作为根节点的children
        children: nodes
    }
}

function parseChildren(context, ancestors) {
    // 定义nodes数组存储子节点,它将作为最终的返回值
    let nodes = []
    // 从上下文对象中取得当前状态,包括模式mode和模板内容source
    const { mode, source } = context

    // 开启while循环,只要满足条件就会一直对字符串进行解析
    // 关于isEnd()后文会详细讲解
    while (!isEnd(context, ancestors)) {
        let node
        // 只有DATA模式和RCDATA模式才支持插值节点的解析
        if (mode === TextModes.DATA || mode === TextModes.RCDATA) {
            // 只有DATA模式才支持标签节点的解析
            if (mode === TextModes.DATA && source[0] === '<') {
                if (source[1] === '!') {
                    if (source.startsWith('<!--')) {
                        // 注释
                        node = parseComment(context)
                    } else if (source.startsWith('<![CDATA[')) {
                        // CDATA
                        node = parseCDATA(context, ancestors)
                    }
                } else if (source[1] === '/') {
                    // 结束标签,这里需要抛出错误,后文会详细解释原因
                } else if (/[a-z]/i.test(source[1])) {
                    // 标签
                    node = parseElement(context, ancestors)
                }
            } else if (source.startsWith('{{')) {
                // 解析插值
                node = parseInterpolation(context)
            }
        }

        // node不存在,说明处于其他模式,即非DATA模式且非RCDATA模式
        // 这时一切内容都作为文本处理
        if (!node) {
            // 解析文本节点
            node = parseText(context)
        }

        // 将节点添加到nodes数组中
        nodes.push(node)
    }

    // 当while循环停止后,说明子节点解析完毕,返回子节点
    return nodes
}

// parseElement函数会做三件事:解析开始标签,解析子节点,解析结束标签
function parseElement() {
    // 解析开始标签
    const element = parseTag()
    // 这里递归地调用parseChildren函数进行<div>标签子节点的解析
    element.children = parseChildren()
    // 解析结束标签
    praseEndTag()

    return element
}

// 什么事递归下降算法?
// 通过上述例子我们能够认识到parseChildren解析函数是整个状态机的核心,状态迁移操作都在该函数内完成.在parseChildren函数运行过程中,为了处理标签节点,会调用parseElement解析函数,这会间接的调用parseChildren函数,并产生一个新的状态机.
// 随着标签嵌套层次的增加,新的状态机会随着parseChildren函数被递归地调用而不断的创建,这就是“递归下降”中“递归”二字的含义
// 而上级parseChildren函数的调用用于构造上级模板AST节点,被递归调用的下级parseChildren函数则用于构造下级模板AST节点.最终,会构造出一颗树形结构的模板AST,这就是“递归下降”中“下降”二字的含义