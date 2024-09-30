function createRenderer(options) {
    const { createElement, insert, setElementText } = options
    function mountElement(vnode, container) {
        const el = createElement(vnode.type)
        if (typeof vnode.children === 'string') {
            setElementText(el, vnode.children)
        }
        insert(el, container)
    }

    function patch(n1, n2, container) {
        if (!n1) {
            mountElement(n2, container)
        } else {
            // patch
        }
    }
    function render(vnode, container) {
        if (vnode) {
            patch(container._vnode, vnode, container)
        } else {
            if (container._vnode) {
                container.innerHTML = ''
            }
        }
        container._vnode = vnode
    }
    return {
        render
    }
}

createRenderer({
    createElement(tag) {
        return document.createElement(tag)
    },
    setElementText(el, text) {
        el.textContent = text
    },
    insert(el, parent, anchor = null) {
        parent.insertBefore(el, anchor)
    }
})
