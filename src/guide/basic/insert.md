---
title: 新增
---

## 新增
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
    topic.setId(UUID.randomUUID().toString().replaceAll("-",""));
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
==> Parameters: 9b26a56690084d7f8675033052f55a1c(String),100(Integer),标题0(String),2023-03-16T21:34:13.287(LocalDateTime)
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
==> Parameters: 47ad3bfa24c54c99b529cc91e974eb0b(String),100(Integer),标题0(String),2023-03-16T21:38:22.114(LocalDateTime)
==> Parameters: dd0ca150be2448369abf5226688dd505(String),101(Integer),标题1(String),2023-03-17T21:38:22.114(LocalDateTime)
==> Parameters: 282e64e543ce4f70a940395c63c73979(String),102(Integer),标题2(String),2023-03-18T21:38:22.114(LocalDateTime)
==> Parameters: ecc0f23bd0e042e68e4ee230b94f4175(String),103(Integer),标题3(String),2023-03-19T21:38:22.114(LocalDateTime)
==> Parameters: 40c4aeeee2894a97b610de27111a03a8(String),104(Integer),标题4(String),2023-03-20T21:38:22.114(LocalDateTime)
==> Parameters: aa036ec0c5654f58805fc1e9a298b1f3(String),105(Integer),标题5(String),2023-03-21T21:38:22.114(LocalDateTime)
==> Parameters: df8b853e091a409da8921cd1ac958b39(String),106(Integer),标题6(String),2023-03-22T21:38:22.114(LocalDateTime)
==> Parameters: 2f92b58cc85b4be48f7d25c5706afd50(String),107(Integer),标题7(String),2023-03-23T21:38:22.114(LocalDateTime)
==> Parameters: 0535eec936484fbd852868dfc4d55331(String),108(Integer),标题8(String),2023-03-24T21:38:22.114(LocalDateTime)
==> Parameters: f5be034aaf2e45b19e09ed5b59973732(String),109(Integer),标题9(String),2023-03-25T21:38:22.114(LocalDateTime)
<== Total: 10
```

## 3,链式添加
```java
long rows = easyQuery.insertable(topics.get(0)).insert(topics.get(1)).executeRows();
//返回结果rows为2
````
```log
==> Preparing: INSERT INTO t_topic (`id`,`stars`,`title`,`create_time`) VALUES (?,?,?,?) 
==> Parameters: a3cf809587e7490e99c1a5ed01192b9a(String),100(Integer),标题0(String),2023-03-16T21:42:12.542(LocalDateTime)
==> Parameters: a799abb1b4ea4134b065a7c52e3172ef(String),101(Integer),标题1(String),2023-03-17T21:42:12.542(LocalDateTime)
<== Total: 2
```