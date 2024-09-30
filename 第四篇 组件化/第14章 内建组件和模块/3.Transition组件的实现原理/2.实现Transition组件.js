// 核心原理: 1.当DOM元素被挂载时,将动效附加到该DOM元素上.2.当DOM元素被卸载时,不要立即卸载DOM元素,而是等到附加到该DOM元素上的动效执行完成后再卸载它.

// 被编译后的虚拟DOM设计,可以看到Transition组件的子节点被编译为默认插槽
function render() {
    return {
        type: Transition,
        children: {
            default() {
                return { type: 'div', children: '我是需要过渡的元素' }
            }
        }
    }
}

// 实现Transition组件
const Transition = {
    name: 'Transition',
    setup(props, { slots }) {
        return () => {
            // 通过默认插槽获取需要过渡的元素
            const innerVNode = slots.default()

            // 在过渡元素的VNode对象上添加transition相应的钩子函数
            innerVNode.transition = {
                beforeEnter(el) {
                    // 设置初始状态
                    el.classList.add('enter-from')
                    el.classList.add('enter-active')
                },
                enter(el) {
                    // 在下一帧切换到结束状态
                    nextFrame(() => {
                        el.classList.remove('enter-from')
                        el.classList.add('enter-to')
                        el.addEventListener('transitionend', () => {
                            el.classList.remove('enter-to')
                            el.classList.remove('enter-active')
                        })
                    })
                },
                leave(el, performRemove) {
                    // 设置离场过渡的初始状态
                    el.classList.add('leave-from')
                    el.classList.add('leave-active')
                    // 强制reflow,使得初始状态生效
                    document.body.offsetHeight
                    // 在下一帧修改状态
                    nextFrame(() => {
                        // 移除leave-from类,添加leave-to类
                        el.classList.remove('leave-from')
                        el.classList.add('leave-to')
                        el.addEventListener('transitionend', () => {
                            el.classList.remove('leave-to')
                            el.classList.remove('leave-active')
                            performRemove()
                        })
                    })
                }
            }

            // 渲染需要过渡的元素
            return innerVNode
        }
    }
}

//观察上面的代码,可以发现几点重要信息:
// Transition组件本身不会渲染任何内容,它只是通过默认插槽读取过渡元素,并渲染需要过渡的元素
// Transition组件的作用,就是在过渡元素的虚拟节点上添加transition相关的钩子函数
// 具体会在渲染器渲染需要过渡的虚拟节点时,会在合适的时机调用附加到该虚拟节点上的过渡相关的生命周期钩子函数,具体体现在mountElement以及unmount函数中
function mountElement(vnode, container, anchor) {
    const el = vnode.el = createElement(vnode.type)

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

    // 判断一个VNode是否需要过渡
    const needTransition = vnode.transition
    if (needTransition) {
        //调用transition.beforeEnter钩子,并将DOM元素作为参数传递
        vnode.transition.beforeEnter(el)
    }

    insert(el, container, anchor)
    if (needTransition) {
        // 调用transition.enter钩子,并将DOM元素作为参数传递
        vnode.transition.enter(el)
    }
}

// 除了挂载之外,卸载元素时我们也应该调用transition.leave钩子函数
function unmount(vnode) {
    // 判断VNode是否需要过渡处理
    const needTransition = vnode.transition
    if (vnode.type === Fragment) {
        vnode.children.forEach(c => unmount(c))
        return
    } else if (typeof vnode.type === 'object') {
        if (vnode.keepAliveInstance) {
            vnode.keepAliveInstance._deActivate(vnode)
        } else {
            unmount(vnode.component.subTree)
        }
        return
    }
    const parent = vnode.el.parentNode
    if (parent) {
        // 将卸载动作封装到performRemove函数中
        const performRemove = () => parent.removeChild(vnode.el)
        if (needTransition) {
            // 如果需要过渡处理,则调用transition.leave钩子,
            // 同时将DOM元素和performRemove函数作为参数传递
            vnode.transition.leave(vnode.el, performRemove)
        } else {
            // 如果不需要过渡处理,则直接执行卸载操作
            performRemove()
        }
    }
}