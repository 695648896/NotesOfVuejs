function patchProps(el, key, preValue, nextValue) {
    if (/^on/.test(key)) {
        const invokers = el._vei || (el._vei = {})
        let invoker = invokers[key]
        const name = key.slice(2).toLowerCase()
        if (nextValue) {
            if (!invoker) {
                invoker = el._vei[key] = (e) => {
                    // e.timeStamp是事件发生的时间
                    // 如果事件发生的时间早于事件处理函数绑定的时间,则不执行事件处理函数
                    if (e.timeStamp < invoker.attached) return
                    if (Array.isArray(invoker.value)) {
                        invoker.value.forEach(fn => fn(e))
                    } else {
                        invoker.value(e)
                    }
                }
                invoker.value = nextValue
                // 添加invoker.attached属性,存储事件处理函数被绑定的时间
                invoker.attached = performance.now()
                el.addEventListener(name, invoker)
            } else {
                invoker.value = nextValue
            }
        } else if (invoker) {
            el.removeEventListener(name, invoker)
        }
    } else {
        // 其他代码省略
    }
}