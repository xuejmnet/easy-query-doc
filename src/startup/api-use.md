---
title: api使用风格说明
---


::: tip 注意点及说明!!!
> 下面所有方法包括`where`、`select`、`groupBy`、`orderBy`、`having`都是相同原理,支持单参数时为主表,全参数时为一一对应的表,注意表达式应该以`select`作为整个表达式的终结方法,相当于`select`之后就是对之前的表达式进行匿名表处理,`select * from (select id,name from user) t` 如果提前`select`相当于是进行了一次匿名表,最后的终结方法收集器比如`toList`、`firstOrNull`、`count`等会自动判断是否需要`select`，如果需要会对当前表达式的主表进行`select(o->o.columnAll())`操作
> 不建议select返回双括号初始化譬如`new HelpProvinceProxy(){{......}}`可能会造成内存泄露
:::

## api说明

简单的查询编写顺序

<img src="/sql-executor.png" width="500">


::: tip 注意点及说明!!!
> 其中6和7可以互相调换,如果先`select`后`order`那么将会对匿名表进行排序,如果先`order`后`select`那么会先排序后生成匿名表但是因为匿名表后续没有操作所以会展开
:::


