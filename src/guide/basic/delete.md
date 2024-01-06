---
title: 删除
order: 40
---

# 删除
`EasyQuery`提供了内置物理删除和逻辑删除,默认`EasyQuery`不支持`delete`命令 需要开启允许或者使用delete语句的时候允许。


::: code-tabs
@tab SpringBoot
```yml
easy-query:
  enable: true
  delete-throw: true
```
@tab 控制台
```java

easyQuery = EasyQueryBootstrapper.defaultBuilderConfiguration()
        .setDefaultDataSource(dataSource)
        .optionConfigure(op->{
            op.setDeleteThrowError(true);
        })
        .useDatabaseConfigure(new MySQLDatabaseConfiguration())
        .build();
```
:::

创建`EasyQuery`配置项的时候可以通过构造函数开启允许删除，默认不允许调用删除功能


数据库建表脚本
```sql
create table t_topic
(
    id varchar(32) not null comment '主键ID'primary key,
    stars int not null comment '点赞数',
    title varchar(50)  null comment '标题',
    create_time datetime not null comment '创建时间'
)comment '主题表';
```
java实体对象
```java
@Data
@Table("t_topic")
public class Topic {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;
}

```

## 1.表达式删除

- 表达式主键删除
```java
long l = easyQuery.deletable(Topic.class)
                    .whereById("999")
                    .executeRows();
```
```log
==> Preparing: DELETE FROM t_topic WHERE `id` = ?
==> Parameters: 999(String)
<== Total: 1
```
- 表达式删除

::: code-tabs
@tab 对象模式
```java
long l = easyEntityQuery.deletable(Topic.class)
                    .where(o->o.title().eq("title998"))
                    .executeRows();
```

@tab lambda模式
```java
long l = easyQuery.deletable(Topic.class)
                    .where(o->o.eq(Topic::getTitle,"title998"))
                    .executeRows();
```


::: 
```log
==> Preparing: DELETE FROM t_topic WHERE `title` = ?
==> Parameters: title998(String)
<== Total: 1
```

## 2.实体删除
```java
Topic topic = easyQuery.queryable(Topic.class).whereId("997").firstNotNull("未找到当前主题数据");
//Topic topic=new Topic();
//topic.setId("997");
long l = easyQuery.deletable(topic).executeRows();
```
```log
==> Preparing: DELETE FROM t_topic WHERE `id` = ?
==> Parameters: 997(String)
<== Total: 1
```

当当前方法或者配置不允许删除命令的时候程序将会抛出对应的异常`EasyQueryInvalidOperationException`

```java

long l = easyQuery.deletable(Topic.class).whereById("999").allowDeleteStatement(false).executeRows();

```

当前对象如果支持软删除那么在生成对应命令的时候会生成UPDATE语句来实现软删除，对于是否允许删除命令将不会生效，因为允许删除命令仅对当前sql生成为`DELETE`语句才会生效判断

## 3.强制物理删除
逻辑删除

::: code-tabs
@tab 对象模式
```java
long l = easyQuery.deletable(BlogEntity.class)
                    .where(o->o.id().eq("id123456"))
                    .executeRows();

==> Preparing: UPDATE `t_blog` SET `deleted` = ? WHERE `deleted` = ? AND `id` = ?
==> Parameters: true(Boolean),false(Boolean),id123456(String)
<== Total: 0
```
@tab lambda模式
```java
long l = easyQuery.deletable(BlogEntity.class)
                    .where(o->o.eq(BlogEntity::getId,"id123456"))
                    .executeRows();

==> Preparing: UPDATE `t_blog` SET `deleted` = ? WHERE `deleted` = ? AND `id` = ?
==> Parameters: true(Boolean),false(Boolean),id123456(String)
<== Total: 0
```
::: 


物理删除

::: code-tabs
@tab 对象模式
```java
long l = easyQuery.deletable(BlogEntity.class)
                    .where(o->o.id().eq("id123456"))
                    .disableLogicDelete()//禁用逻辑删除,使用物理删除 生成delete语句
                    .allowDeleteStatement(true)//如果不允许物理删除那么设置允许 配置项delete-throw
                    .executeRows();

==> Preparing: DELETE FROM `t_blog` WHERE `id` = ?
==> Parameters: id123456(String)
<== Total: 0
```
@tab lambda模式
```java
long l = easyQuery.deletable(BlogEntity.class)
                    .where(o->o.eq(BlogEntity::getId,"id123456"))
                    .disableLogicDelete()//禁用逻辑删除,使用物理删除 生成delete语句
                    .allowDeleteStatement(true)//如果不允许物理删除那么设置允许 配置项delete-throw
                    .executeRows();

==> Preparing: DELETE FROM `t_blog` WHERE `id` = ?
==> Parameters: id123456(String)
<== Total: 0
```
::: 