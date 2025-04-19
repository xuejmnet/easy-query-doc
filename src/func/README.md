---
title: 内置函数
---
`eq`内置了大量的函数工具方便用户只需要记录一整api即可适配所有的数据库,包含字符串相关，数字相关，时间相关，数学函数Math表达式等

`eq`跟随数据库将属性分成如下几大类型
- `String` 对应java `String`类型
- `Number` 对应java的 `Long`、`Integer`、`BigDecimal`...
- `DateTime` 对应java的 `LocalDateTime`、`LocalDate`、`Date`...
- `Boolean` 对应java的 `Boolean`
- `Any` 对应java的 `List`或者其他未知类型
- `JsonMap`(未实现)
- `JsonArray`(未实现)

不同系统之间拥有不同的函数和编译时类型接受比如`String`的比较只能是`String`，每个系统都拥有自己的函数,当然也可以使用`toStr`,`toNumber`等函数转成对应函数或者使用`asAny`转成任意类型后可以使用任意函数，区别是`toxxxx`是数据库层面的函数`asAny()`或`asAnyType(Long.class)`是编译时欺骗编译器行为

聚合函数筛选,比如`o.column().aggregateFunction().filter()`
- avg
- sum
- max
- min
- count
- joining

各个函数之间支持链式调用,并且支持循环嵌套使用