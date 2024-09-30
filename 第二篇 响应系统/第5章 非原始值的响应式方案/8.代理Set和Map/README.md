## Set类型的原型属性和方法如下
- size: 返回集合中元素的数量
- add(value): 向集合中添加给定的值
- clear(): 清空集合
- delete(value): 从集合中删除给定的值
- has(value): 判断集合中是否存在给定的值
- keys(): 返回一个迭代器对象.可用于for...of循环,迭代器对象产生的值为集合中的元素值
- values():对于Set集合类型来说,keys()与value()等价
- entries():返回一个迭代器对象.迭代过程中为集合中的每一个元素产生一个数组值[value,value]
- forEach(callback,[,thisArg]):forEach函数会遍历集合中的所有元素,并对每一个元素调用callback函数.forEach函数接收可选的第二个参数thisArg,用于指定callback函数执行时的this值

## Map类型的原型属性和方法如下
- size: 返回Map数据中的键值对数量
- clear(): 清空Map
- delete(key): 删除指定key的键值对
- has(key): 判断Map中是否存在指定key的键值对
- get(key): 读取指定key对应的值
- set(key, value): 为Map设置新的键值对
- keys(): 返回一个迭代器对象.迭代过程中会产生键值对的key值
- values(): 返回一个迭代器对象.迭代过程中会产生键值对的value值
- entries(): 返回一个迭代器对象.迭代过程中会产生由[key, value]组成的数组值
- forEach(callback[, thisArg]): forEach函数会遍历Map数据的所有键值对,并对每一个键值对调用callback函数.forEach函数接收可选的第二个参数thisArg,用于指定callback函数执行时的this值