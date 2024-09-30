// defineAsyncComponent是一个高阶组件,它最基本的实现如下:

// defineAsyncComponent函数用于定义一个异步组件,接收一个异步组件加载器作为参数
function defineAsyncComponent(loader) {
    // 一个变量,用来存储异步加载的组件
    let InnerComp = null
    // 返回一个包装组件
    return {
        name: 'AsyncComponentWrapper',
        setup() {
            // 异步组件是否加载成功
            const loaded = ref(false)
            // 执行加载器函数,返回一个Promise实例
            // 加载成功后, 将加载成功的组件赋值给InnerComp,并将loaded标记为true,代表加载成功
            loader().then(c => {
                InnerComp = c
                loaded.value = true
            })

            return () => {
                // 如果异步组件加载成功,则渲染该组件,否则渲染一个占位内容
                return loaded.value ? { type: InnerComp } : { type: Text, children: '' }
            }
        }
    }
}