// 异步组件加载失败后的重试机制,与请求服务端接口失败后的重试机制一样
function fetch() {
    return new Promise((resolve, reject) => {
        // 请求会在1秒后失败
        setTimeout(() => {
            reject('err')
        }, 1000)
    })
}

// load函数接收一个onError回调函数
function load(onError) {
    // 请求接口,得到Promise实例
    const p = fetch()
    // 捕获错误
    return p.catch(err => {
        // 当错误发生时,返回一个新的Promise实例,并调用onError回调,
        // 同时将retry函数作为onError回调的参数
        return new Promise((resolve, reject) => {
            // retry函数,用来执行重试的函数,执行该函数会重新调用load函数并发送请求
            const retry = () => resolve(load(onError))
            const fail = () => reject(err)
            onError(retry, fail)
        })
    })
}


// 展示用户是如何重试加载的
// 调用load函数加载资源
load(
    // onError回调
    (retry) => {
        // 失败后重试
        retry()
    }
).then(res => {
    // 成功
    console.log(res)
})

// 基于这个原理,将重试机制整合到异步组件的加载流程中,具体实现如下
function defineAsyncComponent(options) {
    if (typeof options === 'function') {
        options = {
            loader: options
        }
    }

    const { loader } = options

    let InnerComp = null

    // 记录重试次数
    let retries = 0
    // 封装load函数用来加载异步组件
    function load() {
        return loader().catch(err => {
            // 捕获加载器的错误
            if (options.onError) {
                // 返回一个新的Promise实例
                return new Promise((resolve, reject) => {
                    // 重试
                    const retry = () => {
                        resolve(load())
                        retries++
                    }
                    // 失败
                    const fail = () => reject(err)
                    // 作为onError回调函数的参数,让用户来决定下一步怎么做
                    options.onError(retry, fail, retries)
                })
            } else {
                throw error
            }
        })
    }

    return {
        name: 'AsyncComponentWrapper',
        setup() {
            const loaded = ref(false)
            const error = shallowRef(null)
            const loading = ref(false)

            let loadingTimer = null
            if (options.delay) {
                loadingTimer = setTimeout(() => {
                    loading.value = true
                }, options.delay)
            } else {
                // 如果配置项中没有delay,则直接标记为加载中
                loading.value = true
            }

            // 调用load函数加载组件
            load().then(c => {
                InnerComp = c
                loaded.value = true
            })
                .catch((err) => error.value = err)
                .finally(() => {
                    loading.value = false
                    clearTimeout(loadingTimer)
                })

            let timer = null
            if (options.timeout) {
                timer = setTimeout(() => {
                    const err = new Error(`Async component timed out after ${options.timeout}ms.`)
                    error.value = err
                }, options.timeout)
            }

            const placeholder = { type: Text, children }

            return () => {
                if (loaded.value) {
                    return { type: InnerComp }
                } else if (error.value && options.errorComponent) {
                    return { type: options.errorComponent, props: { error: error.value } }
                } else if (loading.value && options.loadingComponent) {
                    // 如果异步组件正在加载,并且用户指定了Loading组件,则渲染Loading组件
                    return { type: options.loadingComponent }
                } else {
                    return placeholder
                }

            }

        }
    }
}