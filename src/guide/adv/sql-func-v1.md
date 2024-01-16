---
title: 数据库函数(新)
---

# 数据库函数
框架默认提供了部分数据库函数,并且支持适配所有的数据库.包括常见的字符串函数和时间格式化函数,包括数学函数等

### 通用函数
方法  |    描述  
--- |  --- 
nullOrDefault| 如果列为null则返回参数值
count| 统计数量返回long
intCount| 统计数量返回int
min| 最小值
max| 最大值

### 字符串函数
方法  |    描述  
--- |  --- 
nullOrEmpty| 如果列为null则返回空值
subString| 切割字符串,默认其实0
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


### 时间函数
方法  |    描述  
--- |  --- 
format| 格式化日期支持java格式化
plus| 增加时间
plusMonths| 增加月份
plusYears| 增加年份
dayOfYear| 当前天数在一年中代表第几天
dayOfWeek| 当前天数在一年中代表第几天 0-6星期日为0
year| 返回年份
month| 返回月份1-12
day| 返回月份中的天数1-31
hour| 返回小时0-23
minute| 返回分钟0-59
second| 返回秒数0-59
duration| 返回间隔天/小时/....  a.duration(b,DateTimeDurationEnum.Days) a比b大多少天,如果a小于b则返回负数 两个日期a,b之间相隔多少天
plusYears| 增加年份
plusYears| 增加年份
plusYears| 增加年份
plusYears| 增加年份
_now|  当前时间
_utcNow|  当前UTC时间

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