// 在日常开发中,我们经常会使用第三方模块,而它们不一定对SSR友好,这时候就需要<ClientOnly>组件
// 实现
import { ref, onMounted, defineComponent } from 'vue'

export const ClientOnly = defineComponent({
    setup(_, { slots }) {
        // 标记变量,仅在客户端渲染时为true
        const show = ref(false)
        // onMounted钩子只会在客户端执行
        onMounted(() => {
            show.value = true
        })
        // 在服务端什么都不渲染,在客户端才会渲染<ClientOnly>组件的插槽内容
        return () => (show.value && slots.default ? slots.default() : null)
    }
})

// <ClientOnly>组件并不会导致客户端激活失败.因为客户端激活的时候,mounted钩子还没有出发,所以服务端与客户端渲染的内容一致,即什么都不渲染.等到激活完成,且mounted钩子触发执行之后,才会在客户端将<ClientOnly>组件的插槽内容渲染出来