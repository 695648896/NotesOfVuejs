// KeepAlive组件的props定义如下
const cache = new Map()
const KeepAlive = {
    __isKeepAlive: true,
    // 定义include和exclude,为了简化问题,这里只允许为include和exclude设置正则类型的值
    props: {
        include: RegExp,
        exclude: RegExp
    },
    setup(props, { slots }) {
        // 省略部分代码

        return () => {
            let rawVNode = slots.default()
            if (typeof rawVNode.type !== 'object') {
                return rawVNode
            }
            // 获取“内部组件”的name
            const name = rawVNode.type.name
            // 对name进行匹配
            if (name && (
                // 如果name无法被include匹配
                (props.include && !props.include.test(name)) ||
                // 或者被exclude匹配
                (props.exclude && props.exclude.test(name))
            )) {
                // 则直接渲染“内部组件”,不对其进行后续的缓存操作
                return rawVNode
            }

            // 省略部分代码
        }
    }
}

