---
title: sql查询 ✨
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
```

## 返回结果
```java
```