---
title: 逻辑删除
order: 10
---

# 介绍
`easy-query`的逻辑删除可以帮助用户在`select`的时候过滤逻辑删除字段，`update`的时候也可以，`delete`的时候也可以转换对应的`update`,并且系统提供了大量的默认逻辑删除策略,并且用户也可以自定义实现更多的逻辑删除


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
CUSTOM | ❌  | 用户自定义实现`EasyLogicDeleteStrategy`或者 `AbstractEasyLogicDeleteStrategy`
BOOLEAN | ✅ | Boolean,boolean类型的属性true表示删除,false表示未被删除 
DELETE_LONG_TIMESTAMP | ❌ | Long,long类型的属性,0表示未被删除,大于0表示被删除 
LOCAL_DATE_TIME | ❌ | LocalDateTime.class null表示未被删除, not null表示被删除 
LOCAL_DATE | ❌ | LocalDate.class null表示未被删除, not null表示被删除