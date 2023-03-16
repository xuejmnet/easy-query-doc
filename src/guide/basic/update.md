---
title: 修改
---

## 修改
`EasyQuery`提供了单条修改、批量修改和表达式修改数据的方法,可以返回数据库执行修改后的受影响行数。

数据库建表脚本
```sql
create table t_topic
(
    id varchar(32) not null comment '主键ID'primary key,
    stars int not null comment '点赞数',
    title varchar(50) not null comment '标题',
    create_time datetime not null comment '创建时间'
)comment '主题表';
```
java实体对象
```java
@Data
@Table("t_topic")
public class Topic {

    @PrimaryKey
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;
}

```

## 1.更新指定列
```java
long rows = easyQuery.updatable(Topic.class)
                    .set(Topic::getStars, 12)
                    .where(o -> o.eq(Topic::getId, "94d16a2883a045cbbe8906d916ef234d")).executeRows();
//rows为1
easyQuery.updatable(Topic.class)
                    .set(Topic::getStars, 12)
                    .where(o -> o.eq(Topic::getId, "94d16a2883a045cbbe8906d916ef234d")).executeRows(1,"更新失败");
//判断受影响行数并且进行报错,如果当前操作不在事务内执行那么会自动开启事务!!!会自动开启事务!!!会自动开启事务!!!来实现并发更新控制,异常为:EasyQueryConcurrentException 
//抛错后数据将不会被更新
```
```log
==> Preparing: UPDATE t_topic SET `stars` = ? WHERE `id` = ?
==> Parameters: 12(Integer),94d16a2883a045cbbe8906d916ef234d(String)
<== Total: 1
```
支持多次`set`,多次set表示`set`拼接

## 2.表列自更新
```java
long rows = easyQuery.updatable(Topic.class)
                    .set(Topic::getTitle, Topic::getStars)
                    .where(o -> o.eq(Topic::getId, "94d16a2883a045cbbe8906d916ef234d")).executeRows();
//rows为1
```
```log
==> Preparing: UPDATE t_topic SET `title` = `stars` WHERE `id` = ?
==> Parameters: 94d16a2883a045cbbe8906d916ef234d(String)
<== Total: 1
```

## 2.表列原子更新
```java
long rows1 = easyQuery.updatable(Topic.class)
        .setIncrement(Topic::getStars)
        .where(o -> o.eq(Topic::getId, "94d16a2883a045cbbe8906d916ef234d")).executeRows();

long rows2 = easyQuery.updatable(Topic.class)
        .setIncrement(Topic::getStars,2)
        .where(o -> o.eq(Topic::getId, "94d16a2883a045cbbe8906d916ef234d")).executeRows();

long rows3 = easyQuery.updatable(Topic.class)
        .setDecrement(Topic::getStars)
        .where(o -> o.eq(Topic::getId, "94d16a2883a045cbbe8906d916ef234d")).executeRows();

long rows4 = easyQuery.updatable(Topic.class)
        .setDecrement(Topic::getStars,2)
        .where(o -> o.eq(Topic::getId, "94d16a2883a045cbbe8906d916ef234d")).executeRows();

```
```log
==> Preparing: UPDATE t_topic SET `stars` = `stars`+? WHERE `id` = ?
==> Parameters: 1(Integer),94d16a2883a045cbbe8906d916ef234d(String)
<== Total: 1
==> Preparing: UPDATE t_topic SET `stars` = `stars`+? WHERE `id` = ?
==> Parameters: 2(Integer),94d16a2883a045cbbe8906d916ef234d(String)
<== Total: 1
==> Preparing: UPDATE t_topic SET `stars` = `stars`-? WHERE `id` = ?
==> Parameters: 1(Integer),94d16a2883a045cbbe8906d916ef234d(String)
<== Total: 1
==> Preparing: UPDATE t_topic SET `stars` = `stars`-? WHERE `id` = ?
==> Parameters: 2(Integer),94d16a2883a045cbbe8906d916ef234d(String)
<== Total: 1
```