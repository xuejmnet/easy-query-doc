---
title: 筛选对象
order: 11
---

# 筛选对象
`eq`提供了丰富的表达式支持对象关系路径筛选和集合筛选,

获取姓名为包含`zhang san`的用户
```java

List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .where(m -> {
            //如果你使用like那么要自行处理参数的百分号和下划线
            m.name().contains("zhang san");
            m.age().gt(20);

            //原生sql断言
            m.expression().sql("{0} != {1}",c->{
                c.expression(m.name());
                c.value("小明");
            });

            //以下是动态条件
            if(true/false){
                m.name().contains("zhang san");
            }
            //上下两种都可以

            m.name().contains(true/false,"zhang san");
        }).toList();


//如果参数可能出现null导致npe可以使用where动态
List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .where(true/false,m -> {//整个where表达式执行或者不执行
            m.name().contains("zhang san");
            m.age().gt(20);
        }).toList();
```


如果有很多参数且常用的业务分页查询则可以使用`filterConfigure`

```java

String name="zhang san";
Integer age=null;
List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT)//可以自行实现参数为null或者空就不参与业务逻辑
        .where(m -> {
            m.name().contains(name);
            m.age().gt(age);
        }).toList();
```

::: tip 全局配置!!!
> 如果用户希望全局模式下就是使用默认的值过滤模式可以通过替换系统接口`ValueFilterFactory`来实现[默认行为替换](/easy-query-doc/framework/replace-configure) ，这边只建议重写`getQueryValueFilter`方法
:::




# 隐式筛选
`隐式筛选`或`路径筛选`,当属性是与其他实体相关联的（例如 OneToOne、OneToMany、ManyToOne、ManyToMany 关系），我们可以通过“路径”访问这些属性，并添加合法的表达式。这种属性我们称之为导航属性,导航属性主要包含两类一类是`对象`、一类是`集合`

## 隐式对象筛选
当关联属性为对象时可以直接通过属性路径进行筛选
```java
List<SysBankCard> list = easyEntityQuery.queryable(SysBankCard.class)
        .where(bank_card -> {
            bank_card.bank().name().like("ICBC");//如果条件不生效则不会join
        }).toList();



    SELECT
        t.`id`,
        t.`uid`,
        t.`code`,
        t.`type`,
        t.`bank_id`,
        t.`open_time` 
    FROM
        `t_bank_card` t 
    INNER JOIN
        `t_bank` t1 
            ON t1.`id` = t.`bank_id` 
    WHERE
        t1.`name` LIKE '%ICBC%'
```
::: tip 说明!!!
> 目前关联属性使用对象的时候默认采用`leftJoin`如果你能保证目标属性一定存在那么在关联属性上添加`required=true`系统会使用`innerJoin`来保证一致性，具体可以[参考性能篇章](/easy-query-doc/performance/implicit-join)
:::

## 隐式集合筛选
当关联属性为集合是可以通过额外对集合进行筛选来保证数据准确性
```java
//筛选银行，条件是银行拥有的银行卡包含至少一张储蓄卡 any为满足任意一条
List<SysBank> banks = easyEntityQuery.queryable(SysBank.class)
        .where(bank -> {
            //集合bankCards里面存在任意项满足type = 储蓄卡
            bank.bankCards().any(card -> {
                card.type().eq("储蓄卡");
            });
        }).toList();


//当只有一个条件时可以采用flatElement来展开集合 原理也是any
List<SysBank> banks = easyEntityQuery.queryable(SysBank.class)
        .where(bank -> {
            bank.bankCards().flatElement().type().eq("储蓄卡");
        }).toList();



    SELECT
        t.`id`,
        t.`name`,
        t.`create_time` 
    FROM
        `t_bank` t 
    WHERE
        EXISTS (SELECT
            1 FROM `t_bank_card` t1 
        WHERE
            t1.`bank_id` = t.`id` 
            AND t1.`type` = '储蓄卡' 
        LIMIT
            1)
```

::: tip 说明!!!
> 当需要筛选的集合属性过多或者多次调用集合筛选,会生成多个子查询导致性能低下 那么建议[参考性能篇章](/easy-query-doc/performance/implicit-subquery-group-join)
:::

## 条件比较

方法  | sql | 描述  
--- | --- | --- 
gt | >  | 列 大于 值
ge | >=  | 列 大于等于 值
eq | =  | 列 等于 值
ne | <>  | 列 不等于 值
le | <=  | 列 小于等于 值
lt | < | 列 小于 值
likeMatchLeft | like word%  | 列左匹配
likeMatchRight | like %word  | 列右匹配
like | like %word%  | 列包含值
notLikeMatchLeft | not like word%  | 列 不匹配左侧
notLikeMatchRight | not like %word  | 列 不匹配右侧
notLike | not like %word%  | 列不包含值
startsWith | like word%  | 列左匹配
endsWith | like %word  | 列右匹配
contains | like %word%  | 列包含值
isNull | is null  | 列 为null
isNotNull | is not null  | 列 不为null
isEmpty | -  | 列 为空
isNotEmpty | -  | 列 不为空
isBlank | -  | 列 为空包括空字符串
isNotBlank| -  | 列 不为空包括空字符串
in | in  | 列 在集合内部,集合为空返回False
notIn | not in  | 列 不在集合内部,集合为空返回True
rangeOpenClosed | < x <=  | 区间 (left..right] = {x \| left < x <= right} 一般用于范围比如时间,小的时间在前大的时间在后
rangeOpen | < x <  | 区间 (left..right) = {x \| left < x < right} 一般用于范围比如时间,小的时间在前大的时间在后
rangeClosedOpen | <= x <  | [left..right) = {x \| left <= x < right} 一般用于范围比如时间,小的时间在前大的时间在后
rangeClosed | <= x <=  | \[left..right\] = {x \| left <= x <= right} 一般用于范围比如时间,小的时间在前大的时间在后
exists | 存在  | 使用子查询queryable
notExists | 不存在  | 使用子查询queryable

## 隐式子查询集合方法


方法  | 参数  | 功能 
---  | ---  | --- 
any  | 条件表达式 | 判断集合必须至少有一条符合断言条件
none  | 条件表达式 | 判断集合符合断言条件的一条都没有
count | 无或列 | 参数无表示获取集合筛选后的数量或对应列的数量
sum | 列 | 参数无表示获取集合筛选后对应列的和
avg | 列 | 表示获取集合筛选后对应列的平均值
max | 列 | 表示获取集合筛选后对应列的最大值
min | 列 | 表示获取集合筛选后对应列的最小值
joining | 列 | 表示获取集合筛选后对应列的进行组合按逗号分割
where | 条件表达式 | 表示获取集合筛选后的集合
distinct | 无 | 表示获取集合筛选后的集合的sum count avg等进行去重
first | 无 | 表示获取集合筛选后的集合第一条
elment | 索引 | 表示获取集合筛选后的集合第n条，n就是索引参数
elments | 索引范围 | 表示获取集合筛选后的集合范围内的集合
anyValue | 无 | 表示获取集合筛选后的集合是否存在boolean值
noneValue | 无 | 表示获取集合筛选后的集合是否不存在boolean值
orderBy | 排序表达式 | 表示获取集合筛选后的集合排序



# 条件组合AND和OR
在where中使用条件and和or是非常常见的一种方法将多个条件组合起来来实现对数据结果的筛选,但是这边的api我们需要进行两部分讲解一部分为`EasyEntityQuery`另一部分是`EasyQueryClient`


# EntityQuery的OR
一句话很简单`or`内部全部用`or`链接,`and`内部用`and`链接,`where`和`join on`默认`and`
```java

List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(o -> {
                o.id().eq("2" );
                o.id().eq("3" );
                o.or(() -> {
                        o.id().eq("4" );
                        o.id().eq("5" );
                });
        })
        .toList();


SELECT
    `id`,
    `create_time`,
    `update_time`,
    `create_by`,
    `update_by`,
    `deleted`,
    `title`,.....
FROM
    `t_blog` 
WHERE
    `deleted` = false 
    AND `id` = '2' 
    AND `id` = '3' 
    AND (
        `id` = '4' 
        OR `id` = '5'
    )
```


```java





        List<Topic> list = easyEntityQuery.queryable(Topic.class)
                .where(o -> {
                    o.title().ne("title0");//==0
                    o.or(()->{
                        o.title().eq("1");
                        o.title().eq("2");
                        o.title().eq("3");
                        o.and(()->{
                            o.title().eq("4");
                            o.title().eq("5");
                            o.title().eq("6");
                            o.or(()->{
                                o.title().eq("7");
                                o.title().eq("8");
                                o.title().eq("9");
                            });
                            o.title().eq("10");
                            o.title().eq("11");
                            o.title().eq("12");
                        });

                        o.title().eq("13");
                        o.title().eq("14");
                        o.title().eq("15");
                    });
                })
                .toList();

通过表达式可以看到or内部的直接关系为条件1,2,3,一块and和13,14,15全部是or链接
SELECT
    `id`,
    `stars`,
    `title`,
    `create_time` 
FROM
    `t_topic` 
WHERE
    `title` <> 'title0' 
    AND (
        `title` = '1' 
        OR `title` = '2' 
        OR `title` = '3' 
        OR (
            `title` = '4' 
            AND `title` = '5' 
            AND `title` = '6' 
            AND (
                `title` = '7' 
                OR `title` = '8' 
                OR `title` = '9'
            ) 
            AND `title` = '10' 
            AND `title` = '11' 
            AND `title` = '12'
        ) 
        OR `title` = '13' 
        OR `title` = '14' 
        OR `title` = '15'
    )
```

# 非EntityQuery的OR条件查询
`where`默认提供了`and`和`or`关键字并且提供了泛型版本所以用户可以通过`and`和`or`来进行组合对应的条件,默认条件和条件之间用and进行链接

- `and(()->{条件})`表示`and`内部的条件是以括号包裹,并且和前一个条件之间是`AND`关系
- `or(()->{条件})`表示`or`内部的条件是以括号包裹,并且和前一个条件之间是`OR`关系

## 案例
`and`内部使用`or`链接那么可以将`and`视为括号`(....or....or....)`
```java
Topic topic = easyQueryClient.queryable(Topic.class)
                .where(o -> o.eq("id", "1").and(() -> {
                            o.like("title", "你好")
                                .or()
                                .eq("title", "我是title")
                                .or()
                                .le("createTime", LocalDateTime.now());
                        })).firstOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? AND (`title` LIKE ? OR `title` = ? OR `create_time` <= ?) LIMIT 1
==> Parameters: 1(String),%你好%(String),我是title(String),2023-07-05T06:25:17.356(LocalDateTime)
<== Time Elapsed: 4(ms)
<== Total: 1
```

没有`and`全部都是`or`以where为单位之间会以and进行组合
```java
List<Topic> topic2 = easyQueryClient.queryable(Topic.class)
                .where(o -> o.like("title", "你好")
                        .or()
                        .eq("title", "我是title")
                        .or()
                        .le("createTime", LocalDateTime.now())).toList();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE (`title` LIKE ? OR `title` = ? OR `create_time` <= ?)
==> Parameters: %你好%(String),我是title(String),2023-07-05T06:30:24.572(LocalDateTime)
<== Time Elapsed: 2(ms)
<== Total: 43
```
和逻辑删除等组合
```java
BlogEntity blog = easyQueryClient.queryable(BlogEntity.class)
                .where(o -> o.eq("id", "1").and(() ->{
                     o.like("title", "你好")
                                .or()
                                .eq("title", "我是title")
                                .or()
                                .le("createTime", LocalDateTime.now());
                })).firstOrNull();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `id` = ? AND (`title` LIKE ? OR `title` = ? OR `create_time` <= ?) LIMIT 1
==> Parameters: false(Boolean),1(String),%你好%(String),我是title(String),2023-07-05T06:33:07.090(LocalDateTime)
<== Time Elapsed: 3(ms)
<== Total: 1


BlogEntity blog1 = easyQueryClient.queryable(BlogEntity.class)
        .where(o -> o.like("title", "你好")
                .or()
                .eq("title", "我是title")
                .or()
                .le("createTime", LocalDateTime.now())).firstOrNull();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND (`title` LIKE ? OR `title` = ? OR `create_time` <= ?) LIMIT 1
==> Parameters: false(Boolean),%你好%(String),我是title(String),2023-07-05T06:34:07.310(LocalDateTime)
<== Time Elapsed: 3(ms)
<== Total: 1
```

多个`and`用`or`链接
```java
Topic topic3 = easyQueryClient.queryable(Topic.class)
                .where(o -> o.eq("id", "1").or(
                        () -> o.like("title", "你好")
                                .eq("title", "我是title")
                                .le("createTime", LocalDateTime.now())
                )).firstOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE (`id` = ? OR (`title` LIKE ? AND `title` = ? AND `create_time` <= ?)) LIMIT 1
==> Parameters: 1(String),%你好%(String),我是title(String),2023-07-05T06:35:32.079(LocalDateTime)
<== Time Elapsed: 3(ms)
<== Total: 1
```

多列`or`条件模糊搜索,传入`List<String>`的name集合,需要查询主题id和标题包含的结果

```java

List<String> searchValues = Arrays.asList("1", "小明", "小红");
List<Topic> list = easyQueryClient
        .queryable(Topic.class)
        .where(o -> o.isBank("id"))
        .where(o -> {
                for (String searchValue : searchValues) {
                o.and(() -> { //每次and就是代表一个括号,括号里面用or来链接
                        o.like("id", searchValue)
                                .or().like("title", searchValue);
                });
                }
        })
        .toList();


==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE IFNULL(`id`,?) = ? AND (`id` LIKE ? OR `title` LIKE ?) AND (`id` LIKE ? OR `title` LIKE ?) AND (`id` LIKE ? OR `title` LIKE ?)
==> Parameters: (String),(String),%1%(String),%1%(String),%小明%(String),%小明%(String),%小红%(String),%小红%(String)
<== Time Elapsed: 53(ms)
<== Total: 0
```