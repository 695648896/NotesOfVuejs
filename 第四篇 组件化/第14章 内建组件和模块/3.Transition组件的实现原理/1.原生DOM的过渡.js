// 进场动画
// 创建class为box的DOM元素
const el = document.createElement('div')
el.classList.add('box')
// 在DOM元素被添加到页面之前,将初始状态和运动过程定义到元素上
el.classList.add('enter-from') // 初始状态
el.classList.add('enter-active') // 运动过程

// 将元素添加到页面
document.body.appendChild(el)

// 嵌套调用requestAnimationFrame
requestAnimationFrame(() => {
    requestAnimationFrame(() => {
        el.classList.remove('enter-from') // 移除enter-from
        el.classList.add('enter-to')

        // 监听transitionend事件完成收尾工作
        el.addEventListener('transitionend', () => {
            el.classList.remove('enter-to')
            el.classList.remove('enter-active')
        })
    })
})
// 创建DOM-beforeEnter->挂载DOM-enter->
// beforeEnter阶段:添加enter-from和enter-active类
// enter阶段:在下一帧中移除enter-from类,添加enter-to
// 进场动效结束:移除enter-to和enter-active类


// 离场动效实现如下
el.addEventListener('click', () => {
    // 将卸载动作封装到performRemove函数中
    const performRemove = () => el.parentNode.removeChild(el)

    // 设置初始状态:添加leave-from和leave-active类
    el.classList.add('leave-from')
    el.classList.add('leave-active')

    // 强制reflow:使初始状态生效
    document.body.offsetHeight

    // 在下一帧切换状态
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            // 切换到结束状态
            el.classList.remove('leave-from')
            el.classList.add('leave-to')

            // 监听transitionend事件完成收尾工作
            el.addEventListener('transitionend', () => {
                el.classList.remove('leave-to')
                el.classList.remove('leave-active')
                // 当过渡完后,记得调用performRemove函数将DOM元素移除
                performRemove()
            })
        })
    })

})
