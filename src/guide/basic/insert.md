---
title: 新增
order: 10
---

# 新增
`EasyQuery`提供了单条插入和批量插入数据的方法,可以返回数据库执行插入后的受影响行数。

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

List<Topic> topics = new ArrayList<>();
for (int i = 0; i < 10; i++) {
    Topic topic = new Topic();
    topic.setId(String.valueOf(i));
    topic.setStars(i+100);
    topic.setTitle("标题"+i);
    topic.setCreateTime(LocalDateTime.now().plusDays(i));
    topics.add(topic);
}
```

## 1.单条插入
```java
long rows = easyQuery.insertable(topics.get(0)).executeRows();
//返回结果rows为1
```
```log
插入sql：INSERT INTO t_topic (`id`,`stars`,`title`,`create_time`) VALUES (?,?,?,?) 
==> Preparing: INSERT INTO t_topic (`id`,`stars`,`title`,`create_time`) VALUES (?,?,?,?) 
==> Parameters: 0(String),100(Integer),标题0(String),2023-03-16T21:34:13.287(LocalDateTime)
<== Total: 1
```
如果当前数据表为自增id那么会回填对应的数据到id主键里面(后续会支持)

## 2.多条插入
批量插入需要jdbc链接字符串开启`&allowMultiQueries=true&rewriteBatchedStatements=true`开启后性能将会大幅提升
```java
long rows = easyQuery.insertable(topics).executeRows();
//返回结果rows为10
````
```log
==> Preparing: INSERT INTO t_topic (`id`,`stars`,`title`,`create_time`) VALUES (?,?,?,?) 
==> Parameters: 0(String),100(Integer),标题0(String),2023-03-16T21:38:22.114(LocalDateTime)
==> Parameters: 1(String),101(Integer),标题1(String),2023-03-17T21:38:22.114(LocalDateTime)
==> Parameters: 2(String),102(Integer),标题2(String),2023-03-18T21:38:22.114(LocalDateTime)
==> Parameters: 3(String),103(Integer),标题3(String),2023-03-19T21:38:22.114(LocalDateTime)
==> Parameters: 4(String),104(Integer),标题4(String),2023-03-20T21:38:22.114(LocalDateTime)
==> Parameters: 5(String),105(Integer),标题5(String),2023-03-21T21:38:22.114(LocalDateTime)
==> Parameters: 6(String),106(Integer),标题6(String),2023-03-22T21:38:22.114(LocalDateTime)
==> Parameters: 7(String),107(Integer),标题7(String),2023-03-23T21:38:22.114(LocalDateTime)
==> Parameters: 8(String),108(Integer),标题8(String),2023-03-24T21:38:22.114(LocalDateTime)
==> Parameters: 9(String),109(Integer),标题9(String),2023-03-25T21:38:22.114(LocalDateTime)
<== Total: 10
```

## 3,链式添加
```java
long rows = easyQuery.insertable(topics.get(0)).insert(topics.get(1)).executeRows();
//返回结果rows为2
````
```log
==> Preparing: INSERT INTO t_topic (`id`,`stars`,`title`,`create_time`) VALUES (?,?,?,?) 
==> Parameters: 0(String),100(Integer),标题0(String),2023-03-16T21:42:12.542(LocalDateTime)
==> Parameters: 1(String),101(Integer),标题1(String),2023-03-17T21:42:12.542(LocalDateTime)
<== Total: 2
```