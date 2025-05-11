---
title: 分页查询count慢
order: 60
---

`eq`的toPageResult提供了3个参数其中第三个参数如果你传入大于等于0的参数表示你告知了框架本次查询的total有多少个,那么框架就不会去查询`count`而是直接使用`toList`将结果条数`pageSize`以`limit+toList`的方式返回

配合前端不进行跳页即可优化分页+count的情况下性能低下,可以固定使用`Integer.MAX_VALUE`

<!-- ## mysql
mysql下大数据表的并行手动拆分可行性

比如查询有一个条件是2020年到2024年是否可以拆分成4年然后4条sql进行并行查询将结果聚合呢？splitCountBy进行设置的可行性???设置splitColumn比如时间然后再count前查询条件结果是max和min额外一次查询来加快count的可行性？？ -->