---
title: 数据库函数(新)
---

# 数据库函数
框架默认提供了部分数据库函数,并且支持适配所有的数据库.包括常见的字符串函数和时间格式化函数,包括数学函数等

### 通用函数
方法  |    描述  |    entity  |    lambda  |    property  
--- |  --- |  --- |  --- |  --- 
nullOrDefault| 如果列为null则返回参数值 |  `b.id().nullOrDefault("123")` |  `b.fx().nullOrDefault(BlogEntity::getId, "123")` |  `b.fx().nullOrDefault("id", "123")` 
count| 统计数量返回long |  `b.id().count()` |  `b.fx().count(BlogEntity::getId)` |  `b.fx().count("id")` 
intCount| 统计数量返回int |  `b.id().intCount()` |  `b.fx().intCount(BlogEntity::getId)` |  `b.fx().intCount("id")` 
min| 最小值 |  `b.id().min()` |  `b.fx().min(BlogEntity::getId)` |  `b.fx().min("id")` 
max| 最大值 |  `b.id().max()` |  `b.fx().max(BlogEntity::getId)` |  `b.fx().max("id")` 

### 字符串函数
方法  |    描述   |    entity  |    lambda  |    property  
--- |  --- |  --- |  --- |  --- 
subString| 切割字符串,默认起始0 |  `b.id().subString(1,12)` |  `b.fx().subString(BlogEntity::getId,1,12)` |  `b.fx().subString("id",1,12)` 
concat| 链接多个列或者值 |  `b.expression().concat(x->x.expression(b.content()).value("123").expression(b.id()))` |  `fx.concat(x -> x.column(BlogEntity::getContent).value("123").column(BlogEntity::getId))` |  `fx.concat(x -> x.column("content").value("123").column("id"))` 
toLower| 转成小写 |  `b.content().toLower()` |  `b.fx().toLower(BlogEntity::getContent)` |  `b.fx().toLower("content")` 
toUpper| 转成大写 |  `b.content().toUpper()` |  `b.fx().toUpper(BlogEntity::getContent)` |  `b.fx().toUpper("content")` 
trim| 去掉前后空格 |  `b.content().trim()` |  `b.fx().trim(BlogEntity::getContent)` |  `b.fx().trim("content")` 
trimStart| 去掉前面空格 |  `b.content().trimStart()` |  `b.fx().trimStart(BlogEntity::getContent)` |  `b.fx().trimStart("content")` 
trimEnd| 去掉后面空格 |  `b.content().trimEnd()` |  `b.fx().trimEnd(BlogEntity::getContent)` |  `b.fx().trimEnd("content")` 
replace| 替换字符串 |  `b.content().replace("123","456")` |  `b.fx().replace(BlogEntity::getContent,"123","456")` |  `b.fx().replace("content","123","456")` 
leftPad| 往左补值 |  `b.content().leftPad(2,'a')` |  `b.fx().leftPad(BlogEntity::getContent,2,'a')` |  `b.fx().leftPad("content",2,'a')` 
rightPad| 往右补值 |  `b.content().rightPad(2,'a')` |  `b.fx().rightPad(BlogEntity::getContent,2,'a')` |  `b.fx().rightPad("content",2,'a')` 
join| 字符串多列join组合返回常用语group+逗号组合 |  `b.content().join(',')` |  `b.fx().join(BlogEntity::getContent,',')` |  `b.fx().join("content",',')` 
length| 字符串长度 |  `b.id().length()` |  `b.fx().length(BlogEntity::getId)` |  `b.fx().length("id")` 
compareTo| 比较字符串大小 |  `b.content().compareTo("aaaa")` |  `b.fx().stringCompareTo(BlogEntity::getContent, "aaaa")` |  `b.fx().stringCompareTo("content", "aaaa")` 


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
now|  当前时间
utcNow|  当前UTC时间

## 案例

::: code-tabs
@tab 对象模式
```java


List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
                b.id().nullOrDefault("123").eq("123");
                b.id().subString(1, 20).eq("456");
                b.expression().concat(x->x.expression(b.content()).value("123").expression(b.id())).eq("789");
                b.content().toUpper().eq("abc");
                b.content().toLower().eq("def");
                b.content().trim().eq("a");
                b.content().trimStart().eq("b");
                b.content().trimEnd().eq("c");
                b.content().replace("123", "456").eq("aaa");
                b.content().leftPad(2, 'a').eq("aa");
                b.content().rightPad(2, 'a').eq("aa");
                b.content().length().eq(1);
                b.content().compareTo("aaaa").ge(0);
        }).toList();


==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND IFNULL(`id`,?) = ? AND SUBSTR(`id`,2,20) = ? AND CONCAT(`content`,?,`id`) = ? AND UPPER(`content`) = ? AND LOWER(`content`) = ? AND TRIM(`content`) = ? AND LTRIM(`content`) = ? AND RTRIM(`content`) = ? AND REPLACE(`content`,?,?) = ? AND LPAD(`content`, 2, ?) = ? AND RPAD(`content`, 2, ?) = ? AND CHAR_LENGTH(`content`) = ? AND STRCMP(`content`,?) >= ?
==> Parameters: false(Boolean),123(String),123(String),456(String),123(String),789(String),abc(String),def(String),a(String),b(String),c(String),123(String),456(String),aaa(String),a(String),aa(String),a(String),aa(String),1(Integer),aaaa(String),0(Integer)
<== Time Elapsed: 6(ms)
<== Total: 0

```

@tab lambda模式
```java

List<BlogEntity> list = easyQuery.queryable(BlogEntity.class)
        .where(b -> {
                LambdaSQLFunc<BlogEntity> fx = b.fx();
                SQLFunction nullOrDefault = fx.nullOrDefault(BlogEntity::getId, "123");
                b.eq(nullOrDefault,"123");

                SQLFunction subString = fx.subString(BlogEntity::getId, 1, 20);
                b.eq(subString,"456");

                SQLFunction concat = fx.concat(x -> x.column(BlogEntity::getContent).value("123").column(BlogEntity::getId));
                b.eq(concat,"789");

                SQLFunction upper = fx.toUpper(BlogEntity::getContent);
                b.eq(upper,"abc");
                SQLFunction lower = fx.toLower(BlogEntity::getContent);
                b.eq(lower,"def");

                SQLFunction trim = fx.trim(BlogEntity::getContent);
                b.eq(trim,"a");

                SQLFunction trimStart = fx.trimStart(BlogEntity::getContent);
                b.eq(trimStart,"b");
                SQLFunction trimEnd = fx.trimEnd(BlogEntity::getContent);
                b.eq(trimEnd,"c");

                SQLFunction replace = fx.replace(BlogEntity::getContent, "123", "456");
                b.eq(replace,"aaa");

                SQLFunction leftPad = fx.leftPad(BlogEntity::getContent, 2, 'a');
                b.eq(leftPad,"aa");

                SQLFunction rightPad = fx.rightPad(BlogEntity::getContent, 2, 'a');
                b.eq(rightPad,"aa");

                SQLFunction length = fx.length(BlogEntity::getContent);
                b.eq(length,1);

                SQLFunction stringCompareTo = fx.stringCompareTo(BlogEntity::getContent, "aaaa");
                b.ge(stringCompareTo,0);
        }).toList();






==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND IFNULL(`id`,?) = ? AND SUBSTR(`id`,2,20) = ? AND CONCAT(`content`,?,`id`) = ? AND UPPER(`content`) = ? AND LOWER(`content`) = ? AND TRIM(`content`) = ? AND LTRIM(`content`) = ? AND RTRIM(`content`) = ? AND REPLACE(`content`,?,?) = ? AND LPAD(`content`, 2, ?) = ? AND RPAD(`content`, 2, ?) = ? AND CHAR_LENGTH(`content`) = ? AND STRCMP(`content`,?) >= ?
==> Parameters: false(Boolean),123(String),123(String),456(String),123(String),789(String),abc(String),def(String),a(String),b(String),c(String),123(String),456(String),aaa(String),a(String),aa(String),a(String),aa(String),1(Integer),aaaa(String),0(Integer)
<== Time Elapsed: 6(ms)
<== Total: 0
```
@tab 属性模式
```java

List<BlogEntity> list = easyQueryClient.queryable(BlogEntity.class)
        .where(b -> {
                SQLFunc fx = b.fx();
                SQLFunction nullOrDefault = fx.nullOrDefault("id", "123");
                b.eq(nullOrDefault, "123");

                SQLFunction subString = fx.subString("id", 1, 20);
                b.eq(subString, "456");

                SQLFunction concat = fx.concat(x -> x.column("content").value("123").column("id"));
                b.eq(concat, "789");

                SQLFunction upper = fx.toUpper("content");
                b.eq(upper, "abc");
                SQLFunction lower = fx.toLower("content");
                b.eq(lower, "def");

                SQLFunction trim = fx.trim("content");
                b.eq(trim, "a");

                SQLFunction trimStart = fx.trimStart("content");
                b.eq(trimStart, "b");
                SQLFunction trimEnd = fx.trimEnd("content");
                b.eq(trimEnd, "c");

                SQLFunction replace = fx.replace("content", "123", "456");
                b.eq(replace, "aaa");

                SQLFunction leftPad = fx.leftPad("content", 2, 'a');
                b.eq(leftPad, "aa");

                SQLFunction rightPad = fx.rightPad("content", 2, 'a');
                b.eq(rightPad, "aa");

                SQLFunction length = fx.length("content");
                b.eq(length, 1);

                SQLFunction stringCompareTo = fx.stringCompareTo("content", "aaaa");
                b.ge(stringCompareTo, 0);
        }).toList();




==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND IFNULL(`id`,?) = ? AND SUBSTR(`id`,2,20) = ? AND CONCAT(`content`,?,`id`) = ? AND UPPER(`content`) = ? AND LOWER(`content`) = ? AND TRIM(`content`) = ? AND LTRIM(`content`) = ? AND RTRIM(`content`) = ? AND REPLACE(`content`,?,?) = ? AND LPAD(`content`, 2, ?) = ? AND RPAD(`content`, 2, ?) = ? AND CHAR_LENGTH(`content`) = ? AND STRCMP(`content`,?) >= ?
==> Parameters: false(Boolean),123(String),123(String),456(String),123(String),789(String),abc(String),def(String),a(String),b(String),c(String),123(String),456(String),aaa(String),a(String),aa(String),a(String),aa(String),1(Integer),aaaa(String),0(Integer)
<== Time Elapsed: 6(ms)
<== Total: 0
```


:::


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