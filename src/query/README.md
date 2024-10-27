---
title: 简介
order: 20
---

# 查询

`easy-query`在java的静态语言特性下，参考众多C# ORM(efcore,freesql,sqlsugar...),和java ORM(mybatis-plus,beetlsql...)实现了支持单表多表，复杂，嵌套的sql表达式，并且拥有强类型语法提示，可以帮助不想写sql的用户，有洁癖的用户多一个选择.
 

# select
`eq`的`select`是用来终结当前表达式生成新的表达式的方式,简单理解为表示告诉框架当前表达式需要返回的结果是`select`的结果,如果您了解`stream api`那么可以简单的理解为其`map`操作

::: tip 概念补充 说明!!!
> `eq`这个orm与之前您认识的java其他orm不相同,这个orm实现了近乎95%的sql功能,其中一个就是子查询嵌套,所谓的子查询嵌套就是将之前查询结果视作`派生表`或叫做`内嵌视图`,后续我们将其统一称其为`内嵌视图`,比如`select .... from (select id,name from table where name like ?) t where t.id = ?`这个sql的括号内的那一部分(`select id,name from table where name like ?`)我们称之为`内嵌视图`
:::

所以我们可以很轻易的实现其他orm无法实现的
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

## select后置风格
和原生SQL不同，在`eq`提供的DSL中，使用的是`select`后置风格，这个风格多见于`c#`语言的`orm`中和`stream api`有一种异曲同工之处，那么为什么`eq`选择`select`后置?

- 强类型的java语言类型`select`后置有助于推导表达式后续可操作的类,比如`stream api`
- `select后置`其实本质和书写sql是一样的,虽然你在编写sql的时候是select先写但是你在不写`from group by`等操作后是无法编写select的内容只能用`*`来代替,所以其实sql的书写本质也是`select后置`

<img src="/sql-executor.png" width="500">



::: tip 说明!!!
> 这张图充分的说明了sql的执行过程和解析过程也是eq的书写过程,该执行流程中唯一能调换的就是`select`和`order by`的顺序
- 每次select会对之前的表达式进行汇总生成`内嵌视图`,对后续的select继续操作那么将对`内嵌视图`进行操作
:::


`select`语句出现在`where`，`orderBy`，`groupBy`，`having`等之后,如果表达式调用了`select`那么这个sql就是确定了的如果再次调用`where`那么前面的表达式将被视为`派生表`或`内嵌视图`，比如`select .... from (select id,name from table ) t where t.id = ?`每次`select`会对当前表达式进行一次结果集包装(`派生表`或`内嵌视图`)

## API

::: tabs

@tab entity

方法  | 支持后续链式| 描述
--- | --- | --- 
`select proxy` | ✅  | 用户可以自定义实现返回结果<br> (返回结果必须是Proxy类, 简单说就是DTO需要添加注解`@EntityProxy`)
`selectColumn` | ❌  | 用于用户返回单个字段, 当然也可以直接用`select(o->o.id())`需要`eq 2.0.0^`
`select(Class<TR>)` | ❌ | 自动映射表和DTO对应关系, (对应关系是DTO映射的columnName和实体的columnName一致则映射), 比如两个属性都是`name`, 但是实体添加了`@Column(value="my_name")`那么DTO的`name`属性如果没有添加对应的注解, 将无法自动映射需要手动`as`来进行查询
`select(Class<TR>,expression)`| ❌| 用户可以对任意`DTO`对象的class进行自动或者手动映射比如 <br> `select(DTO.class,o->Select.of(o.FETCHER.allFields(),o.name().as("myName")))`
`selectAutoInclude` | ❌  | 支持用户返回任意列的数据库对象关系关联的数据, 比如嵌套结构: <br> {name:.. , age:... ,list:[{...}, {...}]}
`selectAutoInclude expression` | ❌  | 支持用户返回任意列的数据库对象关系关联的数据,<br>并且还可以`额外自定义join`返回其他数据, 比如嵌套结构: <br> {name:.. , age:... ,list:[{...}, {...}]}

@tab lambda
编写中...
@tab client
编写中...

:::

## API


方法  | 参数 | 返回  | 描述
--- | --- | --- | --- 
streamBy | `Function<Stream<T>,TR> fetcher`  | 任意stream的终结方法 | 使用java方式只需要迭代一次返回符合stream的结果
toSql |   | string | 返回当前表达式即将执行的sql语句
any |   | boolean | 返回当前表达式是在数据库中是否存在匹配项,存在至少一条返回true,无法匹配任意一条在返回false
required |   | void | 返回当前表达式是在数据库中是否存在匹配项,存在至少一条,无法匹配任意一条抛错
all | lambda  | boolean | 返回当前表达式是在数据库中是否所有的都匹配,参数为符合条件的表达式
count | | long | 返回当前表达式在数据库中命中的条数有多少,没有匹配数返回0
firstOrNull |  | TEntity | 返回当前表达式在数据库中命中的第一条,如果没命中就返回null
toList | | List\<TEntity\> | 返回当前表达式在数据库中命中的所有结果,如果没有结果则返回空集合
where | lambda | this | 对当前表达式进行条件追加
limit | 1.offset,2.rows | this | 对当前表达式进行查询结果返回和偏移进行限制，offset表示跳过多少条，limit表示获取多少条
orderBy | lambda | this | 对当前表达式进行查询结果进行排序
sumBigDecimalOrDefault | lambda,默认值 | BigDecimal |  用于对lambda列进行求和,返回结果BigDecimal防止结果溢出
sumOrDefault | lambda,默认值 | 列类型 |   用于对lambda列进行求和
maxOrDefault | lambda,默认值  | 列类型 |  用于对lambda列进行最大值查询
minOrDefault | lambda,默认值  | 列类型 |  用于对lambda列进行最小值查询
avgOrDefault | lambda,默认值 | 列类型 |  用于对lambda列进行平均值值查询
lenOrDefault | lambda,默认值 | 列类型 |  用于对lambda列进行长度查询
whereById | object 主键 | this |  添加单主键条件
whereObject | object 查询对象 | this |  添加对象查询条件
groupBy | lambda | this |  查询分组
having | lambda | this |  查询对分组结果进行筛选
orderByDynamic | `EasyDynamicOrderByConfiguration` | this | 添加查询动态排序
distinct |  | this |  对查询结果进行去重
toPageResult | long,long | `PageResult` | 对结果进行先count，然后limit+toList查询结果并且封装成`PageResult`返回
toShardingPageResult | long,long,sequenceCountLine | `PageResult` | 支持高性能分片下的分页查询,如果第三个参数为null那么和toPageResult行为一致
leftJoin | lambda | this |  左链接
rightJoin | lambda | this |  右链接
innerJoin | lambda | this |  内链接
disableLogicDelete |  | this |  本次查询不启用逻辑删除
enableLogicDelete |  | this |  本次查询启用逻辑删除
noInterceptor |  | this |   本次查询不使用拦截器
noInterceptor | name | this |   不使用指定name的拦截器
useInterceptor |  | this |  本次查询使用拦截器
useInterceptor | name | this |  使用指定name的拦截器
asTracking |  | this |   本次查询使用追踪，需要开启追踪后才有效
asNoTracking |  | this |   本次查询不使用追踪,默认就是不使用追踪
asTable | tableName | this |  指定本次查询最近的表的表名,如果最近的表是匿名表则设置表别名alias
asTable | lambda | this |    指定本次查询最近的表的表名,如果最近的表是匿名表则设置表别名alias,表达式入参为现有表名返回设置的表名
union | queryable | this |    union 查询
unionAll | queryable | this |    union all查询