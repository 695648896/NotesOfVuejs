// 首先,设计用户接口
const AsyncComp = defineAsyncComponent({
    loader: () => import('CompA.vue'),
    timeout: 2000, // 超时时长,其单位为ms
    errorComponent: MyErrorComp // 指定出错时要渲染的组件
})

function defineAsyncComponent(options) {
    // options可以是配置项,也可以说加载器
    if (typeof options === 'function') {
        // 如果options是加载器,则将其格式化为配置项形式
        options = {
            loader: options
        }
    }

    const { loader } = options

    let InnerComp = null

    return {
        name: 'AsyncComponentWrapper',
        setup() {
            const loaded = ref(false)
            // 定义error,当错误发生时,用来存储错误对象
            const error = shallowRef(null)

            loader().then(c => {
                InnerComp = c
                loaded.value = true
            }).catch((err) => error.value = err)// 添加catch语句来捕获加载过程中的错误

            let timer = null
            if (options.timeout) {
                // 如果指定了超时时长,则开启一个定时器计时
                timer = setTimeout(() => {
                    // 超时后创建一个错误对象,并复制给error.value
                    const err = new Error(`Async component timed out after ${options.timeout}ms.`)
                    error.value = err
                }, options.timeout)
            }
            // 包装组件被卸载时清除定时器
            onUmounted(() => clearTimeout(timer))

            // 占位内容
            const placeholder = { type: Text, children }

            return () => {
                if (loaded.value) {
                    // 如果组件异步加载成功,则渲染被加载的组件
                    return { type: InnerComp }
                } else if (error.value && options.errorComponent) {
                    // 只有当错误存在且用户配置了errorComponent时才展示Error组件,同时,将error作为props传递
                    return options.errorComponent ? { type: options.errorComponent } : placeholder
                } else {
                    return placeholder
                }

            }

        }
    }
}