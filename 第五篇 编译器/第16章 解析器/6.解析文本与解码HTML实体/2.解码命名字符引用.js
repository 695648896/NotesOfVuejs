// 第一个参数为要被解码的文本内容
// 第二个参数是一个布尔值,代表文本内容是否作为属性值
function decodeHtml(rawText, asAttr = false) {
    let offset = 0
    const end = rawText.length
    // 经过解码后的文本将作为返回值被返回
    let decodedText = ''
    // 引用表中实体名称的最大长度
    let maxCRNameLength = 0

    // advance函数用于消费指定长度的文本
    function advance(length) {
        offset += length
        rawText = rawText.slice(length)
    }

    // 消费字符串,直到处理完毕为止
    while (offset < end) {
        // 用于匹配字符引用的开始部分,如果匹配成功,那么head[0]的值将有三种可能:
        // 1.head[0]==='&',这说明该字符引用是命名字符引用
        // 2.head[0]==='&#',这说明该字符引用是用十进制表示的数字字符引用
        // 3.head[0]==='&#x',这说明该字符引用是用十六进制表示的数字字符引用
        const head = /&(?:#x?)?/i.exec(rawText)
        // 如果没有匹配,说明已经没有需要解码的内容了
        if (!head) {
            // 计算剩余内容长度
            const remaining = end - offset
            // 剩余内容加到decodedText上
            decodedText += rawText.slice(0, remaining)
            // 消费剩余内容
            advance(remaining)
            break
        }

        // head.index为匹配的字符&在rawText中的位置索引
        // 截取字符&之前的内容加到decodedText上
        decodedText += rawText.slice(0, head.index)
        // 消费字符&之前的内容
        advance(head.index)

        // 如果满足条件,则说明是命名字符的引用,否则为数字引用
        if (head[0] === '&') {
            let name = ''
            let value
            // 字符&的下一个字符必须是ASCII字母或数字,这样才是合法的命名字符引用
            if (/[0-9a-z]/i.test(rawText[1])) {
                // 根据引用表计算实体名称的最大长度
                if (!maxCRNameLength) {
                    maxCRNameLength = Object.keys(namedCharacterReferences).reduce(
                        (max, name) => Math.max(max, name.length),
                        0
                    )
                }
                // 从最大长度开始对文本进行截取,并试图去引用表中找到对应的项
                for (let length = maxCRNameLength; !value && length > 0; --length) {
                    // 截取字符&到最大长度之间的字符作为实体名称
                    name = rawText.subStr(1, length)
                    // 使用实体名称去索引表中查找对应项的值
                    value = (namedCharacterReferences)[name]
                }
                // 如果找到了对应项的值,说明解码成功
                if (value) {
                    // 检查实体名称的最后一个匹配字符是否是分号
                    const semi = name.endsWith(';')
                    // 如果解码的文本作为属性值,最后一个匹配的字符不是分号,
                    // 并且最后一个匹配字符的下一个字符是等于号(=)、ASCII字母或数字,
                    // 由于历史原因,将字符&和实体名称name作为普通文本
                    if (
                        asAttr &&
                        !semi &&
                        /[=a-z0-9]/i.test(rawText[name.length + 1] || '')
                    ) {
                        decodedText += '&' + name
                        advance(1 + name.length)
                    } else {
                        // 其他情况下,正常使用解码后的内容拼接到decodedText上
                        decodedText += value
                        advance(1 + name.length)
                    }
                } else {
                    // 如果没有找到对应的值,说明解码失败
                    decodedText += '&' + name
                    advance(1 + name.length)
                }
            } else {
                // 如果字符&的下一个字符不是ASCII字母或数字,则将字符&作为普通文本
                decodedText += '&'
                advance(1)
            }
        }
    }
    return decodedText
}