function createRenderer(options) {
    const { createElement, insert, setElementText } = options
    function mountElement(vnode, container) {
        const el = createElement(vnode.type)
        if (typeof vnode.children === 'string') {
            setElementText(el, vnode.children)
        } else if (Array.isArray(vnode.children)) {
            vnode.children.forEach(child => {
                patch(null, child, el)
            })
        }

        if (vnode.props) {
            for (const key in vnode.props) {
                el[key] = vnode.props[key]
            }
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