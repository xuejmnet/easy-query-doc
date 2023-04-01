---
title: select
order: 40
---

# select
`easy-query`的`select`是用来终结当前表达式生成新的表达式的方式

## API
方法  | 参数 | 返回  | 描述
--- | --- | --- | --- 
`select(SqlExpression selectExpression)` | 列选择器  | this | 返回当前`Queryable`对象指定的列,用于按需查询
`select(Class<TR> resultClass)` | 列选择器返回对象  | this | 返回当前`Queryable`对象属性映射所对应的列名和返回结果属性列名一样的列,即两者属性名可以不一致但是只要两者属性名都是映射为相同`columnName`即可互相映射，如果返回结果属性类型不包容原属性类型，比如`String->Integer` 那么可能会出现转换失败
`select(Class<TR> resultClass, SqlExpression selectExpression)` | 列选择器返回对象,列选择器  | this | 返回当前`Queryable`对象属性映射所对应的列名和返回结果属性列名一样的列,即两者属性名可以不一致但是只要两者属性名都是映射为相同`columnName`即可互相映射，如果返回结果属性类型不包容原属性类型，比如`String->Integer` 那么可能会出现转换失败,区别就是可以自己手动指定列,<font color="red">**！！！该方法默认不查询任何列需要手动在第二个参数表达式指定！！！**</font>


