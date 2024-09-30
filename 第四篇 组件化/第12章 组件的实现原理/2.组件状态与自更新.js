function mountComponent(vnode, container, anchor) {
    const componentOptions = vnode.type
    const { render, data } = componentOptions

    const state = reactive(data())

    effect(() => {
        const subTree = render.call(state, state)
        patch(null, subTree, container, anchor)
    }, {
        scheduler: queueJob
    })
}

// 任务缓存队列,用一个Set数据结构来表示,这样就可以自动对任务进行去重
const queue = new Set()
// 一个标志,代表是否正在刷新任务队列
let isFlushing = false
// 创建一个立即resolve的Promise实例
const p = Promise.resolve()

// 调度器的主要函数,用来将一个任务添加到缓冲队列,并开始刷新队列
function queueJob(job) {
    // 将job添加到任务队列queue中
    queue.add(job)
    // 如果还没有开始刷新队列,则刷新之
    if (!isFlushing) {
        // 将该标志设置为true以避免重复刷新
        isFlushing = true
        // 在微任务中刷新缓冲队列
        p.then(() => {
            try {
                // 执行任务队列中的任务
                queue.forEach(job => job())
            } finally {
                // 重置状态
                isFlushing = false
                queue.clear = 0
            }
        })
    }
}