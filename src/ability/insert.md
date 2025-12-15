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
@EntityProxy
public class Topic implements ProxyEntityAvailable<Topic , TopicProxy>{

    @Column(primaryKey = true)
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
::: code-tabs
@tab 对象模式
```java
long rows = easyEntityQuery.insertable(topics.get(0)).executeRows();
//返回结果rows为1
```

::: 

```log
插入sql：INSERT INTO t_topic (`id`,`stars`,`title`,`create_time`) VALUES (?,?,?,?) 
==> Preparing: INSERT INTO t_topic (`id`,`stars`,`title`,`create_time`) VALUES (?,?,?,?) 
==> Parameters: 0(String),100(Integer),标题0(String),2023-03-16T21:34:13.287(LocalDateTime)
<== Total: 1
```
如果当前数据表为自增id那么会回填对应的数据到id主键里面使用`executeRows(true)`

## 2.多条插入

<!-- 当对象集合数量大于默认设置的阈值`insertBatchThreshold`则会自动使用`batch`来插入数据,性能会大大提高,当然如果数量不足`insertBatchThreshold`阈值可以手动调用`batch`方法 -->

<!-- 批量插入需要jdbc链接字符串开启`&allowMultiQueries=true&rewriteBatchedStatements=true`开启后性能将会大幅提升,当然可以使用batch或者到了插入批处理阈值也是可以的 -->


::: warning 说明!!!
> 如果你是mysql数据库则需要添加`rewriteBatchedStatements=true`不然性能和循环插入一样
:::

::: code-tabs
@tab 对象模式
```java
long rows = easyEntityQuery.insertable(topics).executeRows();
//返回结果rows为10
```
:::

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

## 3.链式添加
::: code-tabs
@tab 对象模式
```java
long rows = easyEntityQuery.insertable(topics.get(0)).insert(topics.get(1)).executeRows();
//返回结果rows为2
```
:::

```log
==> Preparing: INSERT INTO t_topic (`id`,`stars`,`title`,`create_time`) VALUES (?,?,?,?) 
==> Parameters: 0(String),100(Integer),标题0(String),2023-03-16T21:42:12.542(LocalDateTime)
==> Parameters: 1(String),101(Integer),标题1(String),2023-03-17T21:42:12.542(LocalDateTime)
<== Total: 2
```

## 4.自增主键回填
很多时候我们设置id自增那么需要在插入的时候回填对应的主键自增信息所以`easy-query`也提供了该功能,并且很方便的使用

- `executeRows(true)` true表示需要回填主键
```java
@Data
@Table("t_topic_auto")
@EntityProxy
public class TopicAuto implements ProxyEntityAvailable<TopicAuto , TopicAutoProxy>{

    @Column(primaryKey = true,generatedKey = true)//设置主键为自增
    private Integer id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;

}


TopicAuto topicAuto = new TopicAuto();
topicAuto.setStars(999);
topicAuto.setTitle("title" + 999);
topicAuto.setCreateTime(LocalDateTime.now().plusDays(99));
Assert.assertNull(topicAuto.getId());
//true表示需要回填主键
long l = easyQuery.insertable(topicAuto).executeRows(true);
Assert.assertEquals(1,l);
Assert.assertNotNull(topicAuto.getId());
```
```sql
==> Preparing: INSERT INTO `t_topic_auto` (`stars`,`title`,`create_time`) VALUES (?,?,?)
==> Parameters: 999(Integer),title999(String),2023-08-31T16:36:06.552(LocalDateTime)
<== Total: 1
```

## 5.策略新增

`insertStrategy`表示sql的执行策略,`insert`命令默认采用`SQLExecuteStrategyEnum.ONLY_NOT_NULL_COLUMNS`就是说默认生成的sql如果对象属性为null就不生成insert列。
```java
QueryLargeColumnTestEntity queryLargeColumnTestEntity = new QueryLargeColumnTestEntity();
queryLargeColumnTestEntity.setId("123");
long l = easyQuery.insertable(queryLargeColumnTestEntity).executeRows();
//默认not null列插入所以只会生成一列
==> Preparing: INSERT INTO `query_large_column_test` (`id`) VALUES (?) 
==> Parameters: 123(String)


QueryLargeColumnTestEntity queryLargeColumnTestEntity = new QueryLargeColumnTestEntity();
queryLargeColumnTestEntity.setId("123");
long l = easyQuery.insertable(queryLargeColumnTestEntity).setSQLStrategy(SQLExecuteStrategyEnum.ALL_COLUMNS).executeRows();
//所有列都插入
==> Preparing: INSERT INTO `query_large_column_test` (`id`,`name`,`content`) VALUES (?,?,?) 
==> Parameters: 123(String),null(null),null(null)



QueryLargeColumnTestEntity queryLargeColumnTestEntity = new QueryLargeColumnTestEntity();
queryLargeColumnTestEntity.setId("123");
long l = easyQuery.insertable(queryLargeColumnTestEntity).setSQLStrategy(SQLExecuteStrategyEnum.ONLY_NULL_COLUMNS).executeRows();

//只插入null列
==> Preparing: INSERT INTO `query_large_column_test` (`name`,`content`) VALUES (?,?) 
==> Parameters: null(null),null(null)
```

## Map插入
`easy-query`还支持`Map`结构的数据插入支持,其中`map`的`key`表示数据库对应的列名,并且不需要添加asTable来指定操作的数据库表名
```java
Map<String, Object> stringObjectHashMap = new LinkedHashMap<>();
stringObjectHashMap.put("id",123);
stringObjectHashMap.put("name","小明");
stringObjectHashMap.put("name1","小明");
stringObjectHashMap.put("name2",null);
easyQuery.mapInsertable(stringObjectHashMap)
        .asTable("sys_table")
        .setSQLStrategy(SQLExecuteStrategyEnum.ONLY_NOT_NULL_COLUMNS)
        .executeRows();


INSERT INTO `sys_table` (`id`,`name`,`name1`) VALUES (?,?,?)
```

## 重复插入策略

Easy Query提供了`conflictThen`方法,请参考[插入或更新](./insertOrUpdate.md)章节。

如果在使用方法时遇到了问题，欢迎进群提问。
::: center
<img :src="$withBase('/images/qrcode.jpg')" alt="群号: 170029046" class="no-zoom" style="width:200px;">

#### EasyQuery官方QQ群: 170029046
:::