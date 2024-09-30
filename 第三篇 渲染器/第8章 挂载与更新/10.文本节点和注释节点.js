// 注释节点与文本节点不具有标签名称,需要人为创造一些唯一的标识,并作为节点的type属性值
const Text = Symbol()
const Comment = Symbol()

const renderer = createRenderer({
    // 省略其他代码
    createText(text) {
        return document.createTextNode(text)
    },
    setText(el, text) {
        el.nodeValue = text
    },
    createComment(comment) {
        return document.createComment(comment)
    },
})

function patch(n1, n2, container) {
    if (n1 && n1.type !== n2.type) {
        unmount(n1)
        n1 = null
    }
    // 代码运行到这里,证明n1和n2所描述的内容相同
    const { type } = n2
    if (typeof type === 'string') {
        if (!n1) {
            mountElement(n2, container)
        } else {
            patchElement(n1, n2)
        }
    } else if (typeof type === Text) {
        if (!n1) {
            const el = n2.el = createText(n2.children)
            insert(el, container)
        } else {
            const el = n2.el = n1.el
            if (n2.children !== n1.children) {
                setText(el, n2.children)
            }
        }
    } else {
        // 其他类型
    }

}

