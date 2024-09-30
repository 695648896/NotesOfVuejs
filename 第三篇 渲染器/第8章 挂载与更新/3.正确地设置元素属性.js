function createRenderer(options) {
    const { createElement, insert, setElementText, patchProps } = options
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
                patchProps(el, key, null, vnode.props[key])
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
    },
    patchProps(el, key, prevValue, nextValue) {
        function shouldSetAsProps(el, key, value) {
            if (key === 'form' && el.tagName === 'INPUT') return false
            return key in el
        }
        if (key === 'class') {
            // 对class进行特殊处理
            el.className = nextValue || ''
        } else if (shouldSetAsProps(el, key, nextValue)) {
            const type = typeof el[key]
            if (type === 'boolean' && nextValue === '') {
                el[key] = true
            } else {
                el[key] = nextValue
            }
        } else {
            el.setAttribute(key, nextValue)
        }
    }
})