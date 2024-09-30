## 引入ref的概念
由于Proxy的代理目标必须事非原始值,所以需要非原始值进行包装
```javascript
// 封装一个ref函数
function ref(val){
    // 在ref函数内部创建包裹对象
    const wrapper = {
        value: val
    }

    Object.defineProperty(wrapper, '__v__isRef',{
        value: true
    })

    // 将包裹对象变成响应式
    return reactive(wrapper)
}
```
## 响应式丢失问题
由于展开运算符(...)会返回普通对象,所以会丢失响应
```javascript
function toRef(obj, key){
    const wrapper = {
        get value(){
            return obj[key]
        },
        set value(val) {
            obj[key] = val
        }
    }

    Object.defineProperty(wrapper, '__v__isRef', {
        value: true
    })
    return  
}

function toRefs(obj) {
    const ret = {}
    for(const key in obj){
        ret[key] = toRef(obj, key)
    }
    return ret
}
```
## 自动脱ref
- 在编写组件时,组件中setup函数所返回的数据会传递给proxyRefs函数进行处理
```javascript
function proxyRefs(target){
    return new Proxy(target, {
        get(target, key, receiver){
            const value = Reflect.get(target, key, receiver)
            return value.__V__isRef ? value.value : value
        },
        set(target, kety, newValue, receiver){
            const value = target[key]
            if(value.__v__isRef){
                value.value = newValue
                return true
            }
            return Reflect.set(target, key, newValue, receiver)
        }
    })
}
```