---
title: 性能说明
---
`easy-query`本身没有benchmark的测试,都是依托于网上orm的性能测试后加入其中,orm的性能主要有3部分组成

- toSQL就是表达式到字符串SQL的过程消耗的时间
- jdbc,这个所有orm都是一样的
- toBean就是ResultSet到Bean对象的过程消耗的时间

## 结论

::: tip 结论!!!
> - `easy-query`的toSQL性能中规中矩,在所有orm中偏中上并不是天花板
> - `easy-query`的toBean性能在orm中算是比较出色优秀的
:::

**以下所有测试来自于BeetlSQL**

## toSQL性能附带双列toBean
<img src="/toSQL.png">



## toBean数据库表20列
<img src="/toBean.png">