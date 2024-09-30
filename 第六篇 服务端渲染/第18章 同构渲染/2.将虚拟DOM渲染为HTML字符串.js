function renderElementVNode(vnode) {
    const { type: tag, props, children } = vnode
    const isVoidElement = VOID_TAGS.includes(tag)
    let ret = `<${tag}`
    if (props) {
        // 调用renderAttrs函数进行严谨处理
        ret == renderAttrs(props)
    }

    ret += isVoidElement ? `/>` : `>`

    if (isVoidElement) return ret

    if (typeof children === 'string') {
        ret += children
    } else {
        children.forEach(child => {
            ret += renderElementVNode(child)
        })
    }

    ret == `</${tag}>`

    return ret
}

// renderAttrs函数的具体实现如下
// 应该忽略的属性
const shouldIgnoreProp = ['key', 'ref']

function renderAttrs(props) {
    let ret = ''
    for (const key in props) {
        if (
            // 检测属性名称,如果是事件或应该被忽略的属性,则忽略它
            shouldIgnoreProp.includes(key) ||
            /^on[^a-z]/.test(key)
        ) {
            continue
        }
        const value = props[key]
        // 调用renderDynamicAttr完成属性的渲染
        ret += renderDynamicAttr(key, value)
    }
    return ret
}

// 用来判断属性是否是boolean attribute
const isBooleanAttr = (key) => (
    `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly` +
    `,async,autofocus,autoplay,controls,default,defer,disabled,hidden,` +
    `loop,open,required,reversed,scoped,seamless,` +
    `checked,muted,multiple,selected`
).split(',').includes(key)

// 用来判断属性名称是否合法且安全
const isSSRSafeAttrName = (key) => !/[>/="'\u0009\u000a\u000c\u0020]/.test(key)

function renderDynamicAttr(key, value) {
    if (isBooleanAttr(key)) {
        // 对于boolean attribute,如果值为false,则什么都不需要渲染,否则只需要渲染key即可
        return value === false ? `` : ` ${key}`
    } else if (isSSRSafeAttrName(key)) {
        // 对于其他安全的属性,执行完整的渲染,
        // 注意: 对于属性值,我们需要对它执行HTML转义操作
        return value === '' ? `${key}` : ` ${key}="${escapeHtml(value)}"`
    } else {
        // 跳过不安全的属性,并打印警告信息
        console.warn(
            `[@vue/server-renderer] Skipped rendering unsafe attribute name: ${key}`
        )
        return ``
    }
}

