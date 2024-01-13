---
title: 数据库函数(新)
---

# 数据库函数
框架默认提供了部分数据库函数,并且支持适配所有的数据库.包括常见的字符串函数和时间格式化函数,包括数学函数等

方法  |    描述  
--- |  --- 
nullDefault| 如果列为null则返回参数值
nullEmpty| 如果列为null则返回空值
subString| 切割字符串,默认其实0
count| 统计数量返回long
intCount| 统计数量返回int
min| 最小值
max| 最大值
concat| 链接多个列或者值
toLower| 转成小写
toUpper| 转成大写
trim| 去掉前后空格
trimStart| 去掉前面空格
trimEnd| 去掉后面空格
replace| 替换字符串
leftPad| 往左补值
rightPad| 往右补值
join| 字符串多列join组合返回常用语group+逗号组合
length| 字符串长度
compareTo| 比较字符串大小
format| 格式化日期支持java格式化
plus| 增加时间
plusMonths| 增加月份
plusYears| 增加年份
avg| 平均值
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
        .select(String.class, o -> o.sqlFunc(o.fx().ifNull(Topic::getId, "1"))).toSQL();
Assert.assertEquals("SELECT IFNULL(t.`id`,?) FROM `t_topic` t WHERE t.`id` = ?", sql1);
```

## 条件函数
```java

String sql = easyQuery.queryable(Topic.class)
                .where(o -> o.eq(o.fx().ifNull(Topic::getId, "123"), o.fx().ifNull(Topic::getTitle, "456")))
                .toSQL();
Assert.assertEquals("SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE IFNULL(`id`,?) = IFNULL(`title`,?)", sql);

String sql = easyQuery.queryable(Topic.class)
            .where(o -> o.eq(Topic::getId, "1")
            )
            .orderByDesc(o -> o.column(Topic::getCreateTime))
            .select(Topic.class, o -> o.sqlFuncAs(o.fx().dateTimeFormat(Topic::getCreateTime, "yyyy-MM-dd"), Topic::getTitle)).toSQL();
Assert.assertEquals("SELECT DATE_FORMAT(t.`create_time`,'%Y-%m-%d') AS `title` FROM `t_topic` t WHERE t.`id` = ? ORDER BY t.`create_time` DESC", sql);
```