---
title: Logical Delete
order: 10
---

# Introduction
`easy-query`'s logical delete feature helps filter logical delete fields during `select`, `update`, and converts `delete` to corresponding `update`. The system provides numerous default logical delete strategies, and users can also customize their own logical delete implementations.

::: danger Important!!!
> Logical delete inherently conflicts with ManyToOne, OneToOne, and OneToMany. If disabling logical delete, consider these properties carefully.
> Logical delete inherently conflicts with ManyToOne, OneToOne, and OneToMany. If disabling logical delete, consider these properties carefully.
> Logical delete inherently conflicts with ManyToOne, OneToOne, and OneToMany. If disabling logical delete, consider these properties carefully.
:::

Method | Default | Description  
--- | --- | --- 
disableLogicDelete | Disable logical delete  | Does not have cross-expression transitivity, meaning subquery logical delete is calculated independently
enableLogicDelete | Enable logical delete  | Does not have cross-expression transitivity, meaning subquery logical delete is calculated independently
useLogicDelete | Pass enable value  | Does not have cross-expression transitivity, meaning subquery logical delete is calculated independently
tableLogicDelete | Disable the most recent table  | Does not have cross-expression transitivity, and interacts with global `disableLogicDelete`, `enableLogicDelete`, `useLogicDelete` using `and` logic
relationLogicDelete | Enable/disable relationship tables  | Does not have transitivity and interacts with global settings

::: warning Note!!!
> Judgment order: Only when both are enabled will it check if disabled. If globally disabled, it will not check if enabled.
:::

## Demo Data
::: code-tabs
@tab LogicDelTopic
```java
@Data
@Table("t_logic_del_topic")
public class LogicDelTopic {
    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    @LogicDelete(strategy = LogicDeleteStrategyEnum.BOOLEAN)
    private Boolean deleted;
    private LocalDateTime createTime;
}
```
@tab SQL
```sql
-- Database table structure statement
create table t_logic_del_topic
(
    id varchar(32) not null comment 'Primary Key' primary key,
    stars int not null comment 'Stars',
    title varchar(50) null comment 'Title',
    deleted tinyint(1)  not null comment 'Is Deleted',
    create_time datetime not null comment 'Create Time'
)comment 'Logical Delete Topic Table';
```
:::

## LogicDelete
Add the `LogicDelete` annotation to the database entity. This makes the field the logical delete field for the entire entity. The `strategy` represents the logical delete field enum. Besides the default strategies provided by the framework, users can also customize logical delete strategies.

## Examples
Query
```java
List<LogicDelTopic> logicDelTopics = easyQuery.queryable(LogicDelTopic.class).toList();
==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`deleted`,t.`create_time` FROM t_logic_del_topic t WHERE t.`deleted` = ?
==> Parameters: false(Boolean)
<== Total: 100
```
Delete by condition
```java
long l = easyQuery.deletable(LogicDelTopic.class)
                .whereById("11")
                .executeRows();
==> Preparing: UPDATE t_logic_del_topic SET `deleted` = ? WHERE `deleted` = ? AND `id` = ?
==> Parameters: true(Boolean),false(Boolean),11(String)
<== Total: 1
```
Delete entity object
```java
 LogicDelTopic logicDelTopic = easyQuery.queryable(LogicDelTopic.class)
                .whereId("11").firstOrNull();
==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`deleted`,t.`create_time` FROM t_logic_del_topic t WHERE t.`deleted` = ? AND t.`id` = ? LIMIT 1
==> Parameters: false(Boolean),11(String)
<== Total: 1

long l = easyQuery.deletable(logicDelTopic)
        .executeRows();

==> Preparing: UPDATE t_logic_del_topic SET `deleted` = ? WHERE `deleted` = ? AND `id` = ?
==> Parameters: true(Boolean),false(Boolean),11(String)
<== Total: 1
```

### strategy

Enum  | Default | Description  
--- | --- | --- 
CUSTOM | ❌  | User-defined implementation of `LogicDeleteStrategy` or `AbstractLogicDeleteStrategy`
BOOLEAN | ✅ | Boolean type property, true indicates deleted, false indicates not deleted 
DELETE_LONG_TIMESTAMP | ❌ | Long type property, 0 indicates not deleted, greater than 0 indicates deleted 
LOCAL_DATE_TIME | ❌ | LocalDateTime.class, null indicates not deleted, not null indicates deleted 
LOCAL_DATE | ❌ | LocalDate.class, null indicates not deleted, not null indicates deleted

## Disable Logical Delete
By adding the chainable method `disableLogicDelete()`, you can disable logical delete for the current expression.
```java
//Query
List<LogicDelTopic> logicDelTopics = easyQuery.queryable(LogicDelTopic.class).disableLogicDelete().toList();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`deleted`,t.`create_time` FROM t_logic_del_topic t
<== Total: 100

//Delete
long l = easyQuery.deletable(LogicDelTopic.class)
                .disableLogicDelete()
                .whereById("111xx")
                .executeRows();

==> Preparing: DELETE FROM t_logic_del_topic WHERE `id` = ?
==> Parameters: 111xx(String)
<== Total: 0

//Update
long l = easyQuery.updatable(LogicDelTopic.class)
                .disableLogicDelete()
                .set(LogicDelTopic::getTitle, logicDelTopic.getTitle())
                .whereId(logicDelTopic.getId())
                .executeRows();

==> Preparing: UPDATE t_logic_del_topic SET `title` = ? WHERE `id` = ?
==> Parameters: Title0(String),0(String)
<== Total: 1
```

## Disable Partial Logical Delete
```java
//Within the same expression, the most recent table is the joined table
//Normal SQL without partial disabling
List<BlogEntity> list2 = easyEntityQuery.queryable(BlogEntity.class)
        .leftJoin(BlogEntity.class, (b, b2) -> b.id().eq(b2.id()))
        .where((b1, b2) -> b1.title().like("123"))
        .toList();

==> Preparing: SELECT t.`id`,t.`create_time`,t.`update_time`,t.`create_by`,t.`update_by`,t.`deleted`,t.`title`,t.`content`,t.`url`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM `t_blog` t LEFT JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` WHERE t.`deleted` = ? AND t.`title` LIKE ?
==> Parameters: false(Boolean),false(Boolean),%123%(String)



//Disable partial logical delete: disable joined table, don't disable from table
List<BlogEntity> list1 = easyEntityQuery.queryable(BlogEntity.class)
        .leftJoin(BlogEntity.class, (b, b2) -> b.id().eq(b2.id()))
        .tableLogicDelete(() -> false)
        .where((b1, b2) -> b1.title().like("123"))
        .toList();


==> Preparing: SELECT t.`id`,t.`create_time`,t.`update_time`,t.`create_by`,t.`update_by`,t.`deleted`,t.`title`,t.`content`,t.`url`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM `t_blog` t LEFT JOIN `t_blog` t1 ON t.`id` = t1.`id` WHERE t.`deleted` = ? AND t.`title` LIKE ?
==> Parameters: false(Boolean),%123%(String)
```

## Custom Logical Delete
Many users may find existing logical delete implementations weak, especially those supporting only single-field logical delete. `easy-query` provides advanced abstraction allowing users to implement their own logical delete strategies.

### Custom Logical Delete Data
::: code-tabs
@tab LogicDelTopic
```java
@Data
@Table("t_logic_del_topic_custom")
public class LogicDelTopicCustom {
    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime deletedAt;
    private String deletedUser;
    private LocalDateTime createTime;
}
```
@tab SQL
```sql
-- Database table structure statement
create table t_logic_del_topic_custom
(
    id varchar(32) not null comment 'Primary Key' primary key,
    stars int not null comment 'Stars',
    title varchar(50) null comment 'Title',
    deleted_at datetime   null comment 'Delete Time',
    deleted_user varchar(50)   null comment 'Deleted By',
    create_time datetime not null comment 'Create Time'
)comment 'Custom Logical Delete Topic Table';
```
:::

### Implement Custom Logical Delete Strategy
`easy-query` provides an interface and an abstract class to implement logical delete. Users can choose the abstract class (simpler) `AbstractLogicDeleteStrategy` or the interface `LogicDeleteStrategy`.
Here we'll use the abstract class for implementation.

Create a static helper class to simulate the current user since we need to implement logical delete with two or more fields:
```java
public class CurrentUserHelper {
    private static String userId;
    public static void setUserId(String userId){
        CurrentUserHelper.userId=userId;
    }
    public static String getUserId(){
        return userId;
    }
}
```


```java

//@Component //If using Spring
//For non-Spring or Spring with self-built RuntimeContext, you need to call:
//configuration.applyLogicDeleteStrategy(new MyLogicDelStrategy());
//where configuration is obtained through:
QueryRuntimeContext runtimeContext = easyQuery.getRuntimeContext();
QueryConfiguration configuration = runtimeContext.getQueryConfiguration();
configuration.applyLogicDeleteStrategy(new MyLogicDelStrategy());

public class MyLogicDelStrategy extends AbstractLogicDeleteStrategy {
    @Override
    protected SQLActionExpression1<WherePredicate<Object>> getPredicateFilterExpression(LogicDeleteBuilder builder,String propertyName) {
        //If you need unique indexes, choose whether your database supports null unique indexes
        //If not supported, choose a date before 1900 or a fixed year as deleted
        return o->o.isNull(propertyName);
    }

    @Override
    protected SQLActionExpression1<ColumnSetter<Object>> getDeletedSQLExpression(LogicDeleteBuilder builder, String propertyName) {
//        LocalDateTime now = LocalDateTime.now();
//        return o->o.set(propertyName,now);
        //The above is incorrect usage. Getting now value makes it a fixed value rather than dynamic
        return o->o.set(propertyName,LocalDateTime.now())
                .set("deletedUser",CurrentUserHelper.getUserId());
    }

    @Override
    public String getStrategy() {
        return "MyLogicDelStrategy";
    }
}

```

Modify the entity object:
```java
@Data
@Table("t_logic_del_topic_custom")
public class LogicDelTopicCustom {
    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    //For custom strategy, must use LogicDeleteStrategyEnum.CUSTOM, and strategyName cannot be empty
    @LogicDelete(strategy = LogicDeleteStrategyEnum.CUSTOM,strategyName = "MyLogicDelStrategy")
    private LocalDateTime deletedAt;
    private String deletedUser;
    private LocalDateTime createTime;
}
```

### Test

```java
List<LogicDelTopicCustom> logicDelTopics = easyQuery.queryable(LogicDelTopicCustom.class).toList();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`deleted_at`,t.`deleted_user`,t.`create_time` FROM t_logic_del_topic_custom t WHERE t.`deleted_at` IS NULL
<== Total: 100


LogicDelTopicCustom logicDelTopic = easyQuery.queryable(LogicDelTopicCustom.class)
                .where(o->o.eq(LogicDelTopicCustom::getId,"1")).firstOrNull();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`deleted_at`,t.`deleted_user`,t.`create_time` FROM `t_logic_del_topic_custom` t WHERE t.`deleted_at` IS NULL AND t.`id` = ? LIMIT 1
==> Parameters: 1(String)
<== Time Elapsed: 2(ms)
<== Total: 1


long l = easyQuery.updatable(logicDelTopic).executeRows();
==> Preparing: UPDATE t_logic_del_topic_custom SET `stars` = ?,`title` = ?,`deleted_user` = ?,`create_time` = ? WHERE `deleted_at` IS NULL AND `id` = ?
==> Parameters: 101(Integer),Title1(String),null(null),2023-04-02T23:09:03(LocalDateTime),1(String)
<== Total: 1

//To prevent data deletion during testing, use a non-existent id
logicDelTopic.setId("11xx");
//Test current user
CurrentUserHelper.setUserId("easy-query");
long l = easyQuery.deletable(logicDelTopic).executeRows();

==> Preparing: UPDATE t_logic_del_topic_custom SET `deleted_at` = ?,`deleted_user` = ? WHERE `deleted_at` IS NULL AND `id` = ?
==> Parameters: 2023-04-01T23:15:13.944(LocalDateTime),easy-query(String),11xx(String)
<== Total: 0
```

We have now fully implemented custom logical delete with multi-field update support.

### Related Object Logical Delete
`ToOne`
```java
        List<SysUser> userInHz = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    s.address().relationLogicDelete(()->false);//false means don't use logical delete
                    //Implicit subquery will auto-join user and address tables
                    s.or(() -> {
                        s.address().city().eq("Hangzhou");
                        s.address().city().eq("Shaoxing");
                    });
                }).toList();
```

`ToMany`
```java
List<SysMenu> menus = easyEntityQuery.queryable(SysMenu.class)
        .where(s -> {
            //Check if menu's role has users named "XiaoMing"
            s.roles().configure(x->x.disableLogicDelete()).any(role -> {
                role.users().any(user -> {
                    user.name().eq("XiaoMing");
                });
            });
        }).toList();
```

## Related Search
`Logical Delete` `Soft Delete` `soft delete` `logic delete`

