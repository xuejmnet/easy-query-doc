---
title: 删除
order: 20
---

# 删除
`EasyQuery`提供了内置物理删除和逻辑删除,默认`EasyQuery`不支持`delete`命令 需要开启允许或者使用delete语句的时候允许。
```java
    public EasyQueryConfiguration() {
       this(true);
    }
    public EasyQueryConfiguration(boolean deleteThrowError) {
        this.deleteThrowError=deleteThrowError;
    }
```
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

    @PrimaryKey
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
```java
long l = easyQuery.deletable(Topic.class)
                    .where(o->o.eq(Topic::getTitle,"title998"))
                    .executeRows();
```
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
long l = easyQuery.insertable(topic).executeRows();
```
```log
==> Preparing: DELETE FROM t_topic WHERE `id` = ?
==> Parameters: 997(String)
<== Total: 1
```

当当前方法或者配置不允许删除命令的时候程序将会抛出对应的异常`EasyQueryInvalidOperationException`

```java

long l = easyQuery.deletable(Topic.class).whereById("999").allowDeleteCommand(false).executeRows();

```

当前对象如果支持软删除那么在生成对应命令的时候会生成UPDATE语句来实现软删除，对于是否允许删除命令将不会生效，因为允许删除命令仅对当前sql生成为`DELETE`语句才会生效判断