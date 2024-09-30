function patchProps(el, key, preValue, nextValue) {
    if (/^on/.test(key)) {
        const invokers = el._vei || (el._vei = {})
        let invoker = invokers[key]
        const name = key.slice(2).toLowerCase()
        if (nextValue) {
            if (!invoker) {
                invoker = el._vei[key] = (e) => {
                    if (Array.isArray(invoker.value)) {
                        invoker.value.forEach(fn => fn(e))
                    } else {
                        invoker.value(e)
                    }
                }
                invoker.value = nextValue
                el.addEventListener(name, invoker)
            } else {
                invoker.value = nextValue
            }
        } else if (invoker) {
            el.removeEventListener(name, invoker)
        }
    }
}