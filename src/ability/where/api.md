---
title: api说明
---


## API

::: tip 动态控制where生效!!!
> 如果第一个参数为true则表示需要执行当前where,否则就是不需要比如`where(false,o->o.id().eq("123"))`因为第一个参数为`false`那么整个`where`将不会生效,不填写第一个参数则视为当前`where`生效
:::


| 方法 | 描述|
| ------------------------------ | ---------------------------- |
| `where(expression)`            | 传入表达式方法筛选数据集结果|
| `whereObject(Object)`          | 传入一个对象来实现对当前对象解析后的where生成 筛选数据集结果|
| `whereById(Object)`            | 传入一个id来实现对数据库集合的筛选,当前表必须是有且仅有一个主键的时候才可以否则将会抛错 |
| `whereByIds(array)`            | 传入一个id集合来实现对数据库集合的筛选,当前表必须是有且仅有一个主键的时候才可以否则将会抛错   |


```java

@Data
@Table("t_topic")
@EntityProxy
@EasyAssertMessage("未找到主题信息")
@EasyAlias("t_topic")//添加这个注解那么plugin可以快速帮助你生成别名
@FieldNameConstants
public class Topic implements ProxyEntityAvailable<Topic, TopicProxy> {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;
}
```

## `where(expression)`
在表达式链式中您可以用单个`where`来描述当前表达式的筛选,当然您也可以用多个`where`来组合,多个where之间不存在`select`或者`groupBy`那么多个`where`之间会互相`append`,
其中`where`的入参表示当前表的一个别名变量如果您熟悉`java`的`stream api`或者`dotnet`的`linq`那么当前表达式您可以易如反掌的写出来

### 单表where
单表的where入参我们只会有一个当前表的别名用来描述当前表,因为有上下文的约束所以用户无法使用非当前表达式的其他表可以减少用户在编写dsl时候的很多心智问题

```java

easyEntityQuery.queryable(Topic.class)
        .where(t_topic -> {
            t_topic.title().like("123");
            t_topic.stars().gt(1);
        }).toList();
//上下两个写法一样
easyEntityQuery.queryable(Topic.class)
        .where(t_topic -> {
            t_topic.title().like("123");
        })
        .where(t_topic -> {
            t_topic.stars().gt(1);
        }).toList();

//当然如果您的`where`里面只有一个条件那么大括号也可以省略(这是lambda的基本常识不做过多解释)

easyEntityQuery.queryable(Topic.class)
        .where(t_topic -> t_topic.title().like("123"))
        .where(t_topic -> t_topic.stars().gt(1)).toList();
```

### 多表where
多表的`where`入参个数有两个选择一个是1个入参表示主表,一个是n个入参顺序上分别表示主表+join表*n,join后的on也是一样的处理
```java
easyEntityQuery.queryable(Topic.class)
        .leftJoin(BlogEntity.class,(t_topic, t_blog) -> {
            t_topic.id().eq(t_blog.id());
        })
        .where((t_topic, t_blog) -> {
            t_topic.title().like("123");
            t_blog.status().eq(1);
        }).toList();
```
