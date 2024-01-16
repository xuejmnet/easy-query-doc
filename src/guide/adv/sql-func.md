---
title: 数据库函数
---

# 数据库函数
框架默认提供了部分数据库函数,并且支持适配所有的数据库.

方法  |    描述  
--- |  --- 
ifNull| 如果列为null则返回默认值
abs|  绝对值
round|  四舍五入
dateTimeFormat|  时间格式格式化 格式化参数为语言java的格式化
dateTimeSQLFormat|  时间格式格式化 格式化参数为语言数据库的格式化
concat|  多列以字符串形式相加
now|  当前时间
utcNow|  当前UTC时间

## 返回列函数
```java

String sql1 = easyClient.queryable(Topic.class)
        .where(o -> o.eq(Topic::getId, "1"))
        .select(String.class, o -> o.sqlFunc(o.fx().nullOrDefault(Topic::getId, "1"))).toSQL();
Assert.assertEquals("SELECT IFNULL(t.`id`,?) FROM `t_topic` t WHERE t.`id` = ?", sql1);
```

## 条件函数
```java

String sql = easyQuery.queryable(Topic.class)
                .where(o -> o.eq(o.fx().nullOrDefault(Topic::getId, "123"), o.fx().nullOrDefault(Topic::getTitle, "456")))
                .toSQL();
Assert.assertEquals("SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE IFNULL(`id`,?) = IFNULL(`title`,?)", sql);

String sql = easyQuery.queryable(Topic.class)
            .where(o -> o.eq(Topic::getId, "1")
            )
            .orderByDesc(o -> o.column(Topic::getCreateTime))
            .select(Topic.class, o -> o.sqlFuncAs(o.fx().dateTimeFormat(Topic::getCreateTime, "yyyy-MM-dd"), Topic::getTitle)).toSQL();
Assert.assertEquals("SELECT DATE_FORMAT(t.`create_time`,'%Y-%m-%d') AS `title` FROM `t_topic` t WHERE t.`id` = ? ORDER BY t.`create_time` DESC", sql);
```