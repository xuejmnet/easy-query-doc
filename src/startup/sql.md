---
title: SQL查询 ✨
---
前面一个篇章我们将讲解了对象查询,让我们通过对象关系可以非常优雅的实现数据筛选和复杂的数据筛选逻辑,但是对象查询并不是万能的,所以`sql`查询也是不可或缺的一个完整的orm应该是`sql+对象查询`


## 查询

### 单个查询
按id查询
```java
//结果不能为null按单主键查询
BlogEntity blog = easyEntityQuery.queryable(BlogEntity.class)
                .findNotNull("1");
//结果可为null按单主键查询
BlogEntity blog = easyEntityQuery.queryable(BlogEntity.class)
                .findOrNull("1");
//添加主键条件结果不能为null
BlogEntity blog = easyEntityQuery.queryable(BlogEntity.class)
        .whereById("1")
        .firstNotNull();

//添加主键条件结果可为null
BlogEntity blog = easyEntityQuery.queryable(BlogEntity.class)
        .whereById("1")
        .firstOrNull();


//添加主键条件结果不能为null且至多一条
BlogEntity blog = easyEntityQuery.queryable(BlogEntity.class)
        .whereById("1")
        .singleNotNull();

//添加主键条件结果可为null且至多一条
BlogEntity blog = easyEntityQuery.queryable(BlogEntity.class)
        .whereById("1")
        .singleOrNull();
```

## 集合查询
```java
//返回集合不会为null,类型为ArrayList
List<BlogEntity> blogs = easyEntityQuery.queryable(BlogEntity.class).toList();

//添加自定义筛选条件返回集合不会为null,类型为ArrayList
List<BlogEntity> blogs = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.title().like("123");
            b.star().gt(1);
        }).toList();
```
## 判断结果是否存在
```java
boolean any = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.title().like("123");
            b.star().gt(1);
        }).any();
```

## 聚合结果
```java
long count = easyEntityQuery.queryable(BlogEntity.class).count();

int count = easyEntityQuery.queryable(BlogEntity.class).intCount();

//添加筛选条件对star列进行求和返回结果或者null
BigDecimal bigDecimal = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.title().like("123");
            b.star().gt(1);
        }).sumBigDecimalOrNull(o -> o.star());

//区别 BigDecimal版本防止溢出
Integer integer = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.title().like("123");
            b.star().gt(1);
        }).sumOrNull(o -> o.star());

//添加筛选条件对star列进行求和返回结果或者默认值(BigDecimal.ZERO)
BigDecimal bigDecimal = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.title().like("123");
            b.star().gt(1);
                }).sumBigDecimalOrDefault(o -> o.star(),BigDecimal.ZERO);


Integer integer = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.title().like("123");
            b.star().gt(1);
        }).sumOrDefault(o -> o.star(),0);

//avg max min 等函数同理
```

## 排序
```java
//按创建时间asc排序
List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.title().like("123");
            b.star().gt(1);
        }).orderBy(b -> b.createTime().asc()).toList();


//按创建时间asc,star desc排序
List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.title().like("123");
            b.star().gt(1);
        }).orderBy(b -> {
            b.createTime().asc();
            b.star().desc();
        }).toList();     


//支持null last或者first支持所有数据库自动实现对应方言
List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.title().like("123");
            b.star().gt(1);
        }).orderBy(b -> {
            b.createTime().asc(OrderByModeEnum.NULLS_LAST);
            b.star().desc(OrderByModeEnum.NULLS_FIRST);
        }).toList();   
```

## 分组筛选
```java
//按title聚合返回title和count结果
List<Draft2<String, Long>> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.title().like("123");
            b.star().gt(1);
        })
        .groupBy(b -> GroupKeys.TABLE1.of(b.title()))
        .select(group -> Select.DRAFT.of(
                group.key1(),
                group.count()
        )).toList();

List<Draft2<String, Long>> list = easyEntityQuery.queryable(BlogEntity.class)
            .where(b -> {
                b.title().like("123");
                b.star().gt(1);
            })
            .groupBy(b -> GroupKeys.TABLE1.of(b.title()))
            .having(group -> group.count().gt(1L))//having count(*) > 1
            .select(group -> Select.DRAFT.of(
                    group.key1(),
                    group.count()
            )).toList();



List<Draft2<String, Long>> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.title().like("123");
            b.star().gt(1);
        })
        .groupBy(b -> GroupKeys.TABLE1.of(b.title()))
        .having(group -> group.groupTable().createTime().max().eq(LocalDateTime.now())) //having max(time) = now()
        .select(group -> Select.DRAFT.of(
                group.key1(),
                group.count()
        )).toList();


//返回max或者min

List<Draft2<String, String>> list = easyEntityQuery.queryable(BlogEntity.class)
            .where(b -> {
                b.title().like("123");
                b.star().gt(1);
            })
            .groupBy(b -> GroupKeys.TABLE1.of(b.title()))
            .having(group -> group.count().gt(1L))//having count(*) > 1
            .select(group -> Select.DRAFT.of(
                    group.key1(),
                    group.groupTable().id().max()
                    //group.max(group.groupTable().id())//上下都行
            )).toList();

```

## 自定义返回结果

临时结果,支持后续链式结果存储到value1-value10强类型
```java
SELECT
    t.`id` AS `value1`,
    t.`phone` AS `value2`,
    t1.`title` AS `value3` 
FROM
    `t_sys_user` t 
LEFT JOIN
    `t_blog` t1 
        ON t1.`deleted` = false 
        AND t.`phone` = t1.`title` 
WHERE
    t.`depart_name` LIKE '%123%' 
    AND t1.`star` > 1


List<Draft3<String, String, String>> list = easyEntityQuery.queryable(SysUser.class)
        .leftJoin(BlogEntity.class, (s, b2) -> s.phone().eq(b2.title()))
        .where((s1, b2) -> {
            s1.departName().like("123");
            b2.star().gt(1);
        })
        .select((s1, b2) -> Select.DRAFT.of(
                s1.id(), s1.phone(), b2.title()
        )).toList();
```

map链式结果
```java

-- 第1条sql数据
SELECT
    t.`id` AS `id`,
    t.`phone` AS `phone`,
    t1.`star` AS `star` 
FROM
    `t_sys_user` t 
LEFT JOIN
    `t_blog` t1 
        ON t1.`deleted` = false 
        AND t.`phone` = t1.`title` 
WHERE
    t.`depart_name` LIKE '%123%' 
    AND t1.`star` > 1

MapKey<String> id = MapKeys.stringKey("id");
MapKey<String> phone = MapKeys.stringKey("phone");
MapKey<Integer> star = MapKeys.integerKey("star");
List<Map<String, Object>> list = easyEntityQuery.queryable(SysUser.class)
        .leftJoin(BlogEntity.class, (s, b2) -> s.phone().eq(b2.title()))
        .where((s1, b2) -> {
            s1.departName().like("123");
            b2.star().gt(1);
        })
        .select((s1, b2) -> {
            MapTypeProxy map = new MapTypeProxy();
            map.put(id, s1.id());
            map.put(phone, s1.phone());
            map.put(star, b2.star());
            return map;
        }).toList();
```
```java

SELECT
    t2.`phone` AS `value1`,
    t2.`star` AS `value2`,
    t3.`create_time` AS `value3` 
FROM
    (SELECT
        t.`id` AS `id`,
        t.`phone` AS `phone`,
        t1.`star` AS `star` 
    FROM
        `t_sys_user` t 
    LEFT JOIN
        `t_blog` t1 
            ON t1.`deleted` = false 
            AND t.`phone` = t1.`title` 
    WHERE
        t.`depart_name` LIKE '%123%' 
        AND t1.`star` > 1) t2 
LEFT JOIN
    `t_topic` t3 
        ON t2.`id` = t3.`id`

MapKey<String> id = MapKeys.stringKey("id");
MapKey<String> phone = MapKeys.stringKey("phone");
MapKey<Integer> star = MapKeys.integerKey("star");
List<Draft3<String, Integer, LocalDateTime>> list = easyEntityQuery.queryable(SysUser.class)
        .leftJoin(BlogEntity.class, (s, b2) -> s.phone().eq(b2.title()))
        .where((s1, b2) -> {
            s1.departName().like("123");
            b2.star().gt(1);
        })
        .select((s1, b2) -> {
            MapTypeProxy map = new MapTypeProxy();
            map.put(id, s1.id());
            map.put(phone, s1.phone());
            map.put(star, b2.star());
            return map;
        })
        .leftJoin(Topic.class, (m, t) -> m.get(id).eq(t.id()))
        .select((m, t) -> Select.DRAFT.of(
                m.get(phone),
                m.get(star),
                t.createTime()
        )).toList();
```

自定义返回结果不支持后续链式只支持最终结果
```java
//返回当前对象只查询id，content，createTime
List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
                .select(b -> b.FETCHER.id().content().createTime().fetchProxy())
                .toList();

//映射到VO
List<BlogEntityVO1> list1 = easyEntityQuery.queryable(BlogEntity.class)
                .select(BlogEntityVO1.class).toList();

//映射到VO返回设置为查询id，content，createTime
List<BlogEntityVO1> list1 = easyEntityQuery.queryable(BlogEntity.class)
                .select(BlogEntityVO1.class, b -> Select.of(
                        b.FETCHER.id().content().createTime()
                )).toList();
//映射到VO返回设置为查询id，content AS content1，createTime AS createTime1
//其中content1和createTime1为BlogEntityVO1的属性字段
List<BlogEntityVO1> list1 = easyEntityQuery.queryable(BlogEntity.class)
            .select(BlogEntityVO1.class, b -> Select.of(
                    b.FETCHER.id().content().as("content1").createTime().as("createTime1")
            )).toList();


//映射到VO 主表查询全字段忽略title和createTime,并且createTime查询映射到别名createTime1,表2查询stars as stars1,title as title1
List<BlogEntityVO1> list1 = easyEntityQuery.queryable(BlogEntity.class)
        .innerJoin(Topic.class, (b, t2) -> b.id().eq(t2.id()))
        .select(BlogEntityVO1.class, (b1, t2) -> Select.of(
                b1.FETCHER.allFieldsExclude(b1.title(), b1.createTime()).createTime().as("createTime1"),
                t2.stars().as("stars1"),
                t2.title().as("title1")
        )).toList();
```
自定义返回结果支持后续链式将前面的结果作为匿名表

每次select就是将当前查询结果作为匿名临时表,所谓匿名临时表就是`select * from ( select * from xxx where xx order by xxx) t`被括号包裹的就是匿名表
```java
SELECT
    t.`id` AS `id`,
    CAST(COUNT(*) AS CHAR) AS `phone` 
FROM
    `t_sys_user` t 
WHERE
    t.`id` = '1' 
    AND t.`id` LIKE '%123%' 
GROUP BY
    t.`id`


List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
                            .where(user -> {
                                user.id().eq("1");
                                user.id().eq(false, "1");//true/false表示是否使用该条件默认true
                                user.id().like("123");
                                user.id().like(false, "123");
                            })
                            .groupBy(user->GroupKeys.TABLE1.of(user.id()))//创建group by
                            .select(group -> new SysUserProxy().adapter(r->{//创建user代理
                                r.id().set(group.key1());//对当前id进行赋值
                                r.phone().set(group.count().toStr());//对当前phone进行赋值因为phone是string类型所以goup后的count需要强转成string也就是cast
                            }))
                            //下面是平替写法其实是一样的
                            // .select(o -> {
                            //     SysUserProxy sysUserProxy = new SysUserProxy();
                            //     sysUserProxy.id().set(o.key1());
                            //     sysUserProxy.phone().set(o.count().toStr());
                            //     return sysUserProxy;
                            // })
                            //如果映射属性对应的column name是一样的【！！！不是属性名是属性对应的列名是一样的】
                            //也可以用以下写法
                            // .select(o -> new SysUserProxy().selectExpression(o.id(),o.name(),o.title()))
                            //.select(SysUserVO.class)//全自动属性匹配映射 SysUserVO可以是SysUser拷贝的属性
                            .toList();

```
```java
SELECT
    t1.`id` AS `value1`,
    t1.`phone` AS `value2`,
    t2.`star` AS `value3`,
    t2.`create_time` AS `value4` 
FROM
    (SELECT
        t.`id` AS `id`,
        CAST(COUNT(*) AS CHAR) AS `phone` 
    FROM
        `t_sys_user` t 
    WHERE
        t.`id` = '1' 
        AND t.`id` LIKE '%123%' 
    GROUP BY
        t.`id`) t1 
LEFT JOIN
    `t_blog` t2 
        ON t2.`deleted` = false 
        AND t1.`phone` = t2.`title` 
WHERE
    t1.`phone` LIKE '188%' 
ORDER BY
    t2.`create_time` DESC


List<Draft4<String, String, Integer, LocalDateTime>> list = easyEntityQuery.queryable(SysUser.class)
                .where(user -> {
                    user.id().eq("1");
                    user.id().eq(false, "1");//true/false表示是否使用该条件默认true
                    user.id().like("123");
                    user.id().like(false, "123");
                })
                .groupBy(user -> GroupKeys.TABLE1.of(user.id()))//创建group by
                .select(group -> new SysUserProxy().adapter(r -> {//创建user代理
                    r.id().set(group.key1());//对当前id进行赋值
                    r.phone().set(group.count().toStr());//对当前phone进行赋值因为phone是string类型所以goup后的count需要强转成string也就是cast
                }))
                .leftJoin(BlogEntity.class, (s, b2) -> s.phone().eq(b2.title()))
                .where((s1, b2) -> s1.phone().likeMatchLeft("188"))
                .orderBy((s1, b2) -> b2.createTime().desc())
                .select((s1, b2) -> Select.DRAFT.of(
                        s1.id(), s1.phone(),
                        b2.star(), b2.createTime()
                )).toList();
```
```java
//拆分后就是
SELECT
        t.`id` AS `id`,
        CAST(COUNT(*) AS CHAR) AS `phone` 
    FROM
        `t_sys_user` t 
    WHERE
        t.`id` = '1' 
        AND t.`id` LIKE '%123%' 
    GROUP BY
        t.`id`
EntityQueryable<SysUserProxy, SysUser> selectGroup = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            user.id().eq("1");
            user.id().eq(false, "1");//true/false表示是否使用该条件默认true
            user.id().like("123");
            user.id().like(false, "123");
        })
        .groupBy(user -> GroupKeys.TABLE1.of(user.id()))//创建group by
        .select(group -> new SysUserProxy().adapter(r -> {//创建user代理
            r.id().set(group.key1());//对当前id进行赋值
            r.phone().set(group.count().toStr());//对当前phone进行赋值因为phone是string类型所以goup后的count需要强转成string也就是cast
        }));


  

SELECT
    t1.`id` AS `value1`,
    t1.`phone` AS `value2`,
    t2.`star` AS `value3`,
    t2.`create_time` AS `value4` 
FROM
    (SELECT
        t.`id` AS `id`,
        CAST(COUNT(*) AS CHAR) AS `phone` 
    FROM
        `t_sys_user` t 
    WHERE
        t.`id` = '1' 
        AND t.`id` LIKE '%123%' 
    GROUP BY
        t.`id`) t1 
LEFT JOIN
    `t_blog` t2 
        ON t2.`deleted` = false 
        AND t1.`phone` = t2.`title` 
WHERE
    t1.`phone` LIKE '188%' 
ORDER BY
    t2.`create_time` DESC      
List<Draft4<String, String, Integer, LocalDateTime>> list = selectGroup
        .leftJoin(BlogEntity.class, (s, b2) -> s.phone().eq(b2.title()))
        .where((s1, b2) -> s1.phone().likeMatchLeft("188"))
        .orderBy((s1, b2) -> b2.createTime().desc())
        .select((s1, b2) -> Select.DRAFT.of(
                s1.id(), s1.phone(),
                b2.star(), b2.createTime()
        )).toList();
```

## 多表查询
```java

SELECT
    t.`id`,
    t.`name`,
    t.`account`,
    t.`depart_name`,
    t.`phone`,
    t.`create_time` 
FROM
    `t_sys_user` t 
LEFT JOIN
    `t_blog` t1 
        ON t1.`deleted` = false 
        AND t.`phone` = t1.`title` 
WHERE
    t.`depart_name` LIKE '%123%' 
    AND t1.`star` > 1
List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
                .leftJoin(BlogEntity.class, (s, b2) -> s.phone().eq(b2.title()))
                .where((s1, b2) -> {
                    s1.departName().like("123");
                    b2.star().gt(1);
                }).toList();
```
```java
SELECT
    t.`id`,
    t.`name`,
    t.`account`,
    t.`depart_name`,
    t.`phone`,
    t.`create_time` 
FROM
    `t_sys_user` t 
LEFT JOIN
    `t_blog` t1 
        ON t1.`deleted` = false 
        AND t.`phone` = t1.`title` 
LEFT JOIN
    `t_topic` t2 
        ON t.`id` = t2.`stars` 
WHERE
    t.`depart_name` LIKE '%123%' 
    AND t1.`star` > 1

List<SysUser> list1 = easyEntityQuery.queryable(SysUser.class)
                .leftJoin(BlogEntity.class, (s, b2) -> s.phone().eq(b2.title()))
                .leftJoin(Topic.class, (s1, b2, t3) -> s1.id().eq(t3.stars()))
                .where((s1, b2, t3) -> {

                    s1.departName().like("123");
                    b2.star().gt(1);
                }).toList();
```