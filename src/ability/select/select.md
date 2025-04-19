---
title: 介绍
order: 10
---

# 说明

`easy-query`在 java 的静态语言特性下，参考众多 C# ORM(efcore,freesql,sqlsugar...),和 java ORM(mybatis-plus,beetlsql...)实现了支持单表多表，复杂，嵌套的 sql 表达式，并且拥有强类型语法提示，可以帮助不想写 sql 的用户，有洁癖的用户多一个选择.

## select

`eq`的`select`是用来终结当前表达式生成新的表达式的方式,简单理解为表示告诉框架当前表达式需要返回的结果是`select`的结果,如果您了解`stream api`那么可以简单的理解为其`map`操作

::: tip 概念补充 说明!!!

> `eq`这个 orm 与之前您认识的 java 其他 orm 不相同,这个 orm 实现了近乎 95%的 sql 功能,其中一个就是子查询嵌套,所谓的子查询嵌套就是将之前查询结果视作`派生表`或叫做`内嵌视图`,后续我们将其统一称其为`内嵌视图`,比如`select .... from (select id,name from table where name like ?) t where t.id = ?`这个 sql 的括号内的那一部分(`select id,name from table where name like ?`)我们称之为`内嵌视图`
:::

所以我们可以很轻易的实现其他 orm 无法实现的

```sql
select ... from
    (
        select
            key1,
            key2,
            count() as c,
            avg() as a,
            sum() as s
        from
            table
        where
            name like ?
        group by
            key1,
            key2
    ) t1
    left join table2 t2 on t.key1 = t2.key1
where.....
```

## select 后置风格

和原生 SQL 不同，在`eq`提供的 DSL 中，使用的是`select`后置风格，这个风格多见于`c#`语言的`orm`中和`stream api`有一种异曲同工之处，那么为什么`eq`选择`select`后置?

- 强类型的 java 语言类型`select`后置有助于推导表达式后续可操作的类,比如`stream api`
- `select后置`其实本质和书写 sql 是一样的,虽然你在编写 sql 的时候是 select 先写但是你在不写`from group by`等操作后是无法编写 select 的内容只能用`*`来代替,所以其实 sql 的书写本质也是`select后置`

<img :src="$withBase('/images/sql-executor.png')" width="500">

::: tip 说明!!!

> 这张图充分的说明了 sql 的执行过程和解析过程也是 eq 的书写过程,该执行流程中唯一能调换的就是`select`和`order by`的顺序

> 每次 select 会对之前的表达式进行汇总生成`内嵌视图`,对后续的 select 继续操作那么将对`内嵌视图`进行操作

> 其中6和7可以互相调换,如果先`select`后`order`那么将会对匿名表进行排序,如果先`order`后`select`那么会先排序后生成匿名表但是因为匿名表后续没有操作所以会展开
  :::

`select`语句出现在`where`，`orderBy`，`groupBy`，`having`等之后,如果表达式调用了`select`那么这个 sql 就是确定了的如果再次调用`where`那么前面的表达式将被视为`派生表`或`内嵌视图`，比如`select .... from (select id,name from table ) t where t.id = ?`每次`select`会对当前表达式进行一次结果集包装(`派生表`或`内嵌视图`)



<img :src="$withBase('/images/simple-query.jpg')">

我们以这个简单的例子为例可以看到我们应该编写的顺序是select在最后
```java
easyEntityQuery.queryable(HelpProvince.class)
        .where(o -> o.id().eq("1"))
        .orderBy(o -> o.id().asc())
        .select(o -> new HelpProvinceProxy()
                .id().set(o.id())
                .name().set(o.name())
        )
        //本质就是如下写法 不建议使用双括号的初始化可能会造成内存泄露
        // .select(o->{
        //        HelpProvinceProxy province= new HelpProvinceProxy();
        //         province.id().set(o.id());
        //         province.name().set(o.name());
        //         return province;
        // })
        //.select(o->o.FETCHER.id().name().fetchProxy())//如果返回结果一样可以用fetcher
        .toList();
```

复杂的查询顺序
<img :src="$withBase('/images/simple-nest-query.jpg')">

```java
easyEntityQuery.queryable(HelpProvince.class) //1
        .where(o->o.id().eq("1")) //2
        .orderBy(o->o.id().asc()) //3
        .select(o->new HelpProvinceProxy()//4 
                .id().set(o.id())
                .name().set(o.name())
        )
        //.select(o->o.FETCHER.id().name().fetchProxy())//如果返回结果一样可以用fetcher
        .where(o->o.id().eq("1")) // 5
        .select(o->new HelpProvinceProxy()
                .id().set(o.id())//6
        )
        .toList();
```

::: warning 注意点及说明!!!
> select一般都是最后写的,在你没有写表的时候只能用 * 来代替,先写表确定,然后写条件写排序写分组等确定了之后写选择的select的列不写就是主表的*如果在写where就对前面的表进行括号进行匿名表处理以此类推
:::

## 分解表达式

### 1
```java
表达式:easyEntityQuery.queryable(HelpProvince.class)

sql:select * from help_province
```
### 2
```java
表达式:easyEntityQuery.queryable(HelpProvince.class).where(o->o.id().eq("1")) 

sql:select * from help_province where id='1'
```

### 3
```java
表达式:easyEntityQuery.queryable(HelpProvince.class).where(o->o.id().eq("1")).orderBy(o->o.id().asc())

sql:select * from help_province where id='1' order by id asc
```
### 4
```java
表达式:          easyEntityQuery.queryable(HelpProvince.class)
                        .where(o -> o.id().eq("1"))
                        .orderBy(o -> o.id().asc())
                        .select(o -> new HelpProvinceProxy()
                                .id().set(o.id())
                                .name().set(o.name())
                        )

sql:select id,name from help_province where id='1' order by id asc
```
以`select`方法作为终结方法结束本次`sql`链式,后续的操作就是将`select`和之前的表达式转成`匿名sql`类似`select * from (select * from help_province) t`，其中`fetcher`是`select`的简化操作不支持返回VO，当且仅当返回结果为自身时用于快速选择列

### 5
```java
表达式:easyEntityQuery.queryable(HelpProvince.class)
                .where(o->o.id().eq("1"))
                .orderBy(o->o.id().asc())
                .select(o->new HelpProvinceProxy()
                        .id().set(o.id())
                        .name().set(o.name())
                )//转成匿名表sql
                .where(o->o.id().eq("1")) 

sql:select * from (select id,name from help_province where id='1' order by id asc) t where t.id='1'
```

### 6
```java
表达式:easyEntityQuery.queryable(HelpProvince.class)
                .where(o->o.id().eq("1"))
                .orderBy(o->o.id().asc())
                .select(o->new HelpProvinceProxy()
                        .id().set(o.id())
                        .name().set(o.name())
                )//转成匿名表sql
                .where(o->o.id().eq("1"))
                .select(o->new HelpProvinceProxy()
                        .id().set(o.id())
                ) 

sql:select id from (select id,name from help_province where id='1' order by id asc) t where t.id='1'
```

::: tip 链式说明!!!
> select之前的所有操作比如多个where,多个orderby都是对之前的追加,limit是替换前面的操作多次limit获取最后一次
> 在entityQuery下groupBy不支持连续调用两个groupBy之间必须存在一个select指定要查询的结果才可以,其他api下多次调用行为也是追加
:::

