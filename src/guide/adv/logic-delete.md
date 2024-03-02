---
title: 逻辑删除
order: 10
---

# 介绍
`easy-query`的逻辑删除可以帮助用户在`select`的时候过滤逻辑删除字段，`update`的时候也可以，`delete`的时候也可以转换对应的`update`,并且系统提供了大量的默认逻辑删除策略,并且用户也可以自定义实现更多的逻辑删除

方法 | 默认 | 描述  
--- | --- | --- 
disableLogicDelete | 禁用逻辑删除  | 不具有跨表达式的传递性也就是子查询逻辑删除独立计算
enableLogicDelete | 启用逻辑删除  | 不具有跨表达式的传递性也就是子查询逻辑删除独立计算
useLogicDelete | 传入是否启用值  | 不具有跨表达式的传递性也就是子查询逻辑删除独立计算
tableLogicDelete | 禁用最近的一张表  | 不具有跨表达式的传递性也就是子查询逻辑删除独立计算,会和全局`disableLogicDelete`、`enableLogicDelete`、`useLogicDelete`互相作用`and`
relationLogicDelete | 禁用启用关联关系表  | 不具有传递性也会和全局作用


::: warning 说明!!!
> 判断顺序:都启用的情况下才会去判断是否禁用,如果全局设置禁用那么不会去判断是否启用
:::

## demo数据
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
-- 数据库表结构语句
create table t_logic_del_topic
(
    id varchar(32) not null comment '主键ID'primary key,
    stars int not null comment '点赞数',
    title varchar(50) null comment '标题',
    deleted tinyint(1)  not null comment '是否删除',
    create_time datetime not null comment '创建时间'
)comment '逻辑删除主题表';
```
:::

## LogicDelete
在对应的数据库实体上面添加注解,`LogicDelete`可以让整个实体以该字段作为逻辑删除字段,其中`strategy`表示为逻辑删除字段的枚举,除了框架默认提供的框架也支持用户自定义逻辑删除


## 例子
查询
```java
List<LogicDelTopic> logicDelTopics = easyQuery.queryable(LogicDelTopic.class).toList();
==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`deleted`,t.`create_time` FROM t_logic_del_topic t WHERE t.`deleted` = ?
==> Parameters: false(Boolean)
<== Total: 100
```
按条件删除
```java
long l = easyQuery.deletable(LogicDelTopic.class)
                .whereById("11")
                .executeRows();
==> Preparing: UPDATE t_logic_del_topic SET `deleted` = ? WHERE `deleted` = ? AND `id` = ?
==> Parameters: true(Boolean),false(Boolean),11(String)
<== Total: 1
```
实体对象删除
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


枚举  | 默认 | 描述  
--- | --- | --- 
CUSTOM | ❌  | 用户自定义实现`LogicDeleteStrategy`或者 `AbstractLogicDeleteStrategy`
BOOLEAN | ✅ | Boolean,boolean类型的属性true表示删除,false表示未被删除 
DELETE_LONG_TIMESTAMP | ❌ | Long,long类型的属性,0表示未被删除,大于0表示被删除 
LOCAL_DATE_TIME | ❌ | LocalDateTime.class null表示未被删除, not null表示被删除 
LOCAL_DATE | ❌ | LocalDate.class null表示未被删除, not null表示被删除

## 禁用逻辑删除
通过添加链式方法`disableLogicDelete()`可以禁用当前表达式的逻辑删除
```java
//查询
List<LogicDelTopic> logicDelTopics = easyQuery.queryable(LogicDelTopic.class).disableLogicDelete().toList();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`deleted`,t.`create_time` FROM t_logic_del_topic t
<== Total: 100

//删除
long l = easyQuery.deletable(LogicDelTopic.class)
                .disableLogicDelete()
                .whereById("111xx")
                .executeRows();

==> Preparing: DELETE FROM t_logic_del_topic WHERE `id` = ?
==> Parameters: 111xx(String)
<== Total: 0

//修改
long l = easyQuery.updatable(LogicDelTopic.class)
                .disableLogicDelete()
                .set(LogicDelTopic::getTitle, logicDelTopic.getTitle())
                .whereId(logicDelTopic.getId())
                .executeRows();

==> Preparing: UPDATE t_logic_del_topic SET `title` = ? WHERE `id` = ?
==> Parameters: 标题0(String),0(String)
<== Total: 1
```

## 自定义逻辑删除
很多用户可能对现有的很多系统拥有的逻辑删除都表示非常弱鸡,甚至只支持单字段的逻辑删除,`easy-query`提供了高级抽象可以让用户自行实现逻辑删除


### 自定义逻辑删除数据
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
-- 数据库表结构语句
create table t_logic_del_topic_custom
(
    id varchar(32) not null comment '主键ID'primary key,
    stars int not null comment '点赞数',
    title varchar(50) null comment '标题',
    deleted_at datetime   null comment '删除时间',
    deleted_user varchar(50)   null comment '删除人',
    create_time datetime not null comment '创建时间'
)comment '自定义逻辑删除主题表';
```
:::

### 实现自定义逻辑删除策略
`easy-query`默认提供了一个接口和一个抽象来实现逻辑删除,默认用户可以选择抽象(简单)`AbstractLogicDeleteStrategy`,或者接口`LogicDeleteStrategy`
这次我们采用抽象来实现

新建一个静态帮助类来模拟当前用户因为我们这次自定义需要实现两个甚至多个字段逻辑删除处理
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

//@Component //如果是spring
//非spring或者spring且自行构建build的Qu二有RuntimeContext那么就需要调用
//configuration.applyLogicDeleteStrategy(new MyLogicDelStrategy());
//其中configuration通过以下代码来获取
QueryRuntimeContext runtimeContext = easyQuery.getRuntimeContext();
QueryConfiguration configuration = runtimeContext.getQueryConfiguration();
configuration.applyLogicDeleteStrategy(new MyLogicDelStrategy());

public class MyLogicDelStrategy extends AbstractLogicDeleteStrategy {
    /**
     * 允许datetime类型的属性
     */
    private final Set<Class<?>> allowTypes=new HashSet<>(Arrays.asList(LocalDateTime.class));
    @Override
    protected SQLExpression1<WherePredicate<Object>> getPredicateFilterExpression(LogicDeleteBuilder builder,String propertyName) {
        return o->o.isNull(propertyName);
    }

    @Override
    protected SQLExpression1<ColumnSetter<Object>> getDeletedSQLExpression(LogicDeleteBuilder builder, String propertyName) {
//        LocalDateTime now = LocalDateTime.now();
//        return o->o.set(propertyName,now);
        //上面的是错误用法,将now值获取后那么这个now就是个固定值而不是动态值
        return o->o.set(propertyName,LocalDateTime.now())
                .set("deletedUser",CurrentUserHelper.getUserId());
    }

    @Override
    public String getStrategy() {
        return "MyLogicDelStrategy";
    }

    @Override
    public Set<Class<?>> allowedPropertyTypes() {
        return allowTypes;
    }
}

```

修改我们的实体对象
```java
@Data
@Table("t_logic_del_topic_custom")
public class LogicDelTopicCustom {
    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    //如果是自定义strategy必须是LogicDeleteStrategyEnum.CUSTOM,并且strategyName不可以为空
    @LogicDelete(strategy = LogicDeleteStrategyEnum.CUSTOM,strategyName = "MyLogicDelStrategy")
    private LocalDateTime deletedAt;
    private String deletedUser;
    private LocalDateTime createTime;
}
```

### 测试

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
==> Parameters: 101(Integer),标题1(String),null(null),2023-04-02T23:09:03(LocalDateTime),1(String)
<== Total: 1

//为了测试防止数据被删掉,这边采用不存在的id
logicDelTopic.setId("11xx");
//测试当前人员
CurrentUserHelper.setUserId("easy-query");
long l = easyQuery.deletable(logicDelTopic).executeRows();

==> Preparing: UPDATE t_logic_del_topic_custom SET `deleted_at` = ?,`deleted_user` = ? WHERE `deleted_at` IS NULL AND `id` = ?
==> Parameters: 2023-04-01T23:15:13.944(LocalDateTime),easy-query(String),11xx(String)
<== Total: 0
```

到这里为止我们就完全实现了逻辑删除自定义并且支持更新多字段



## 相关搜索
`逻辑删除` `软删除` `soft delete` `logic delete`