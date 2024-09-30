// 在Vue.js3中使用函数式组件,主要是因为它的简单性,而不是因为它的性能好
// 因为即使是有状态组件,其初始化性能消耗也非常小

// 在用户接口层面,一个函数式组件就是一个返回虚拟DOM的函数
function MyFuncComp(props) {
    return { type: 'h1', children: props.title }
}

// 函数式组件自身没有状态,但它仍然可以接收由外部传入的props.为了给函数式组件定义props,我们需要在组件函数上添加净态的props属性
// 定义props
MyFuncComp.props = {
    title: string
}

// 挂载组件逻辑可言复用mountComponent,为此需要在patch函数内支持函数类型的vnode.type
function patch(n1, n2, anchor) {
    if (n1 && n1.type !== n2.type) {
        unmount(n1)
        n1 = null
    }

    const { type } = n2
    if (typeof type === 'string') {
        // 省略部分代码
    } else if (type === Text) {
        // 省略部分代码
    } else if (type === Fragment) {
        // 省略部分代码
    } else if (
        // type是对象 --> 有状态组件
        // type是函数 --> 函数式组件
        typeof type === 'object' || typeof type === 'function'
    ) {
        // component
        if (!n1) {
            mountComponent(n2, container, anchor)
        } else {
            patchComponent(n1, n2, anchor)
        }
    }
}

// 下面是修改后的mountComponent函数,它支持挂载函数式组件
function mountComponent(vnode, container, anchor) {
    // 检查是否是函数式组件
    const isFunctional = typeof vnode.type === 'function'

    let componentOptions = vnode.type
    if (isFunctional) {
        // 如果是函数式组件,则将vnode.type作为渲染函数,将vnode.type.props选项定义即可
        componentOptions = {
            render: vnode.type,
            props: vnode.type.props
        }
    }

    // 省略部分代码
}