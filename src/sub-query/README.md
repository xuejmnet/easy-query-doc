---
title: 子查询篇章
---
`eq`提供了丰富的子查询功能,包括隐式子查询和手动子查询,并且子查询还支持无限级嵌套来实现任意sql功能

- 隐式子查询(必看)🔥 能够快速的基于对象关系来进行子查询的编写相比于手写子查询开发效率有一个质的飞跃
- 手动子查询 能够快速的基于sql的表达式进行mock来实现达到相同功能

隐式子查询默认使用`LEFT JOIN`来保证数据的准确性,如果你认为子项一定存在可以再`@Navigate(required=true)`这样框架会认为子项一定存在的情况下使用`INNER JOIN`来代替`LEFT JOIN`


::: danger 说明!!!
> 手动子查询的创建方式有两种一种是`eq实例`创建一个queryable一种是通过表达式内部的`expression().subQeuryable()`，在使用时我们应该尽可能的使用上下文来创建子查询表达式,区别就是`eq实例`创建的表达式必须子查询作为左侧的表而不是外部表作为左侧表而`expression().subQeuryable()`创建的子查询则不需要考虑这个问题
:::




## 隐式子查询断言api
子查询  | api类型  
---   | --- 
select子查询   | 类型片段
where子查询   | 执行片段
join子查询   | 表达式片段
from子查询   | 表达式片段


## 隐式子查询断言api
api  | 说明  
---   | --- 
any(expression)   | 表示符合条件的至少有一个简单理解为`exists`
none(expression)   | 表示符合条件的一个都没有 简单理解为`no exists`
all(expression)   | 表示all前面的集合都需要满足all里面的条件，如果all前面的集合为空则默认为true
where(expression)   | 对子查询增加条件
orderBy(expression)   | 对子查询进行排序常用于和elements相关
firstElement()   | 获取子查询的第一个
element(index)   | 获取子查询的第n个,第一个索引值为0
elements(start,end)   | 获取子查询的一部分,第一个索引值为0
flatElement()   | 展开子查询,后面加条件等于`any`的简写方式
configure(expression)   | 用来配置子查询相关参数比如是否启用逻辑删除等
distinct()   | 对结果进行去重比如`bankCards().distinct().count(x->x.type())`
anyValue()   | 返回是否存在的true/false
noneValue()   | 返回是否存在的true/false
count()   | 对结果进行数量统计
sum(expression)   | 对结果进行求和,参数是统计的列表达式`bankCards().sum(card->card.amount())`对各个银行卡的余额求和
avg(expression)   | 对结果进行取平均值
max(expression)   | 对结果进行取最大值
min(expression)   | 对结果进行取最小值
joining(expression)   | 对结果进行组合成一列

## 隐式子查询相关api

api  | 说明  
---  | --- 
`user->user.bankCards().any()`   | 用户至少有一张银行卡卡
`user->user.bankCards().none()`  | 用户银行卡卡一张都没有
`user->user.bankCards().all(bc->bc.type().eq("储蓄卡"))`  | 用户银行卡全部都是储蓄卡，如果用户用户没有银行卡那么也会查询出来
`user->user.bankCards().where(card->card.type().eq("储蓄卡")).any()` | 用户拥有的银行卡里面至少有一张储蓄卡
`user->user.bankCards().any(card->card.type().eq("储蓄卡"))`| 用户拥有的银行卡里面至少有一张储蓄卡,`where+any`可以简写为`any`
`user->user.bankCards().where(card->card.type().eq("储蓄卡")).none()`  | 用户拥有的银行卡里面储蓄卡一张都没有
`user->user.bankCards().none(card->card.type().eq("储蓄卡"))` | 用户拥有的银行卡里面储蓄卡一张都没有,`where+none`可以简写为`none`
`user->user.bankCards().where(card->card.type().eq("储蓄卡")).count()` | 用户拥有的储蓄卡数量支持断言
`user->user.bankCards().where(card->card.type().eq("储蓄卡")).count().eq(1L)` | 用户拥有的储蓄卡数量等于1
`user->user.bankCards().where(card->card.type().eq("储蓄卡")).elements(0,1).none(card->card.bank().name().eq("建设银行"))` | 用户前两张银行卡不是建设银行的
