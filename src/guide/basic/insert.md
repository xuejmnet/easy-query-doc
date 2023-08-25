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
批量插入需要jdbc链接字符串开启`&allowMultiQueries=true&rewriteBatchedStatements=true`开启后性能将会大幅提升,并且默认需要使`InsertStrategy`用`ALL_COULMNS`策略,不然还是单条执行,当然可以使用batch或者到了插入批处理阈值也是可以的
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

## 3.链式添加
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

## 4.自增主键回填
很多时候我们设置id自增那么需要在插入的时候回填对应的主键自增信息所以`easy-query`也提供了该功能,并且很方便的使用
```java
@Data
@Table("t_topic_auto")
public class TopicAuto {

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


## 6.MySQL方言
## onDuplicateKeyIgnore
插入时如果主键或者唯一索引存在就忽略插入
```java
String indexStr = "200";
BlogEntity blog = new BlogEntity();
blog.setId(indexStr);
blog.setCreateBy(indexStr);
blog.setCreateTime(begin.plusDays(1));
blog.setUpdateBy(indexStr);
blog.setUpdateTime(begin.plusDays(1));
blog.setTitle("title" + indexStr);
blog.setContent("content" + indexStr);
blog.setUrl("http://blog.easy-query.com/" + indexStr);
blog.setStar(1);
blog.setScore(new BigDecimal("1.2"));
blog.setStatus(1);
blog.setOrder(new BigDecimal("1.2").multiply(BigDecimal.valueOf(1)));
blog.setIsTop(false);
blog.setTop(false);
blog.setDeleted(false);
easyQuery.insertable(blog)
                .onDuplicateKeyIgnore()
                .executeRows();

==> Preparing: INSERT IGNORE INTO `t_blog` (`id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`score`,`status`,`order`,`is_top`,`top`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
==> Parameters: 200(String),2000-01-02T01:01:01(LocalDateTime),2000-01-02T01:01:01(LocalDateTime),200(String),200(String),false(Boolean),title200(String),content200(String),http://blog.easy-query.com/200(String),1(Integer),1.2(BigDecimal),1(Integer),1.2(BigDecimal),false(Boolean),false(Boolean)
<== Total: 0
```

## onDuplicateKeyUpdate
支持指定set列
```java
String indexStr = "200";
BlogEntity blog = new BlogEntity();
blog.setId(indexStr);
blog.setCreateBy(indexStr);
blog.setCreateTime(begin.plusDays(1));
blog.setUpdateBy(indexStr);
blog.setUpdateTime(begin.plusDays(1));
blog.setTitle("title" + indexStr);
blog.setContent("content" + indexStr);
blog.setUrl("http://blog.easy-query.com/" + indexStr);
blog.setStar(1);
blog.setScore(new BigDecimal("1.2"));
blog.setStatus(1);
blog.setOrder(new BigDecimal("1.2").multiply(BigDecimal.valueOf(1)));
blog.setIsTop(false);
blog.setTop(false);
blog.setDeleted(false);

easyQuery.insertable(blog)
                .onDuplicateKeyUpdate()
                .executeRows();//插入成功返回1


==> Preparing: INSERT INTO `t_blog` (`id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`score`,`status`,`order`,`is_top`,`top`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE `create_time` = VALUES(`create_time`), `update_time` = VALUES(`update_time`), `create_by` = VALUES(`create_by`), `update_by` = VALUES(`update_by`), `deleted` = VALUES(`deleted`), `title` = VALUES(`title`), `content` = VALUES(`content`), `url` = VALUES(`url`), `star` = VALUES(`star`), `score` = VALUES(`score`), `status` = VALUES(`status`), `order` = VALUES(`order`), `is_top` = VALUES(`is_top`), `top` = VALUES(`top`)
==> Parameters: 200(String),2000-01-02T01:01:01(LocalDateTime),2000-01-02T01:01:01(LocalDateTime),200(String),200(String),false(Boolean),title200(String),content200(String),http://blog.easy-query.com/200(String),1(Integer),1.2(BigDecimal),1(Integer),1.2(BigDecimal),false(Boolean),false(Boolean)
<== Total: 1


//如果存在一样的key或者唯一约束那么insert就变成update,并且update只更新star和content两个字段
easyQuery.insertable(blog)
                .onDuplicateKeyUpdate(t->t.column(BlogEntity::getStar).column(BlogEntity::getContent))
                .executeRows();//没有需要修改的所以返回1


==> Preparing: INSERT INTO `t_blog` (`id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`score`,`status`,`order`,`is_top`,`top`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE `star` = VALUES(`star`), `content` = VALUES(`content`)
==> Parameters: 200(String),2000-01-02T01:01:01(LocalDateTime),2000-01-02T01:01:01(LocalDateTime),200(String),200(String),false(Boolean),title200(String),content200(String),http://blog.easy-query.com/200(String),1(Integer),1.2(BigDecimal),1(Integer),1.2(BigDecimal),false(Boolean),false(Boolean)
<== Total: 1



blog.setContent("xxx");
easyQuery.insertable(blog)
            .onDuplicateKeyUpdate(t->t.column(BlogEntity::getStar).column(BlogEntity::getContent))
            .executeRows();//因为content不一样所以返回行数2

==> Preparing: INSERT INTO `t_blog` (`id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`score`,`status`,`order`,`is_top`,`top`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE `star` = VALUES(`star`), `content` = VALUES(`content`)
==> Parameters: 200(String),2000-01-02T01:01:01(LocalDateTime),2000-01-02T01:01:01(LocalDateTime),200(String),200(String),false(Boolean),title200(String),xxx(String),http://blog.easy-query.com/200(String),1(Integer),1.2(BigDecimal),1(Integer),1.2(BigDecimal),false(Boolean),false(Boolean)
<== Total: 2
```

## 7.PgSQL方言

## onConflictDoNothing

```java
TopicAuto topicAuto = new TopicAuto();
topicAuto.setStars(999);
topicAuto.setTitle("title" + 999);
topicAuto.setCreateTime(LocalDateTime.now().plusDays(99));

easyQuery.insertable(topicAuto).onConflictDoNothing().executeRows();
//INSERT INTO "t_topic_auto" ("stars","title","create_time") VALUES (?,?,?) ON CONFLICT DO NOTHING
```

## onConflictDoUpdate
支持指定约束列,和set列
```java
TopicAuto topicAuto = new TopicAuto();
topicAuto.setStars(999);
topicAuto.setTitle("title" + 999);
topicAuto.setCreateTime(LocalDateTime.now().plusDays(99));
Assert.assertNull(topicAuto.getId());
easyQuery.insertable(topicAuto)
    .onConflictDoUpdate(TopicAuto::getTitle,t->t.column(TopicAuto::getStars).column(TopicAuto::getCreateTime))
    .executeRows();

//INSERT INTO "t_topic_auto" ("stars","title","create_time") VALUES (?,?,?) ON CONFLICT ("title") DO UPDATE SET "stars" = EXCLUDED."stars", "create_time" = EXCLUDED."create_time"
```