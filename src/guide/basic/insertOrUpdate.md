---
title: 新增或者更新
---
并不是简单的查询判断是否存在,如果不存在就更新,存在就更新或者忽略,而是实现了数据库对应的方言实现数据库自身的功能,如果要使用此功能建议升级到`1.10.41+`

## 支持的db

数据库名称  | 包名  | 是否支持
--- | --- | ---  
MySQL | sql-mysql  | ✅
PostgresSQL | sql-pgsql  | ✅
SqlServer | sql-mssql  | ✅
H2 | sql-h2  | ✅
达梦dameng | sql-dameng  | ✅
人大金仓KingbaseES | sql-kingbase-es  | ✅
Oracle | sql-oracle  | ✅
SQLite | sql-sqlite  | ❌

## onConflictThen
- 第一个参数表示要更新的列,如果传入null则表示存在就忽略
- 第二个参数表示指定存在的约束判断支持多列(mysql不支持指定所以设置了也无效)

## 存在就忽略不更新

```java
TopicAuto topicAuto = new TopicAuto();
topicAuto.setStars(999);
topicAuto.setTitle("title" + 999);
topicAuto.setCreateTime(LocalDateTime.of(2020,1,1,1,1));
Assert.assertNull(topicAuto.getId());
long l = defaultEasyEntityQuery.insertable(topicAuto)
        .onConflictThen(null)
        .executeRows();

MERGE INTO "t_topic_auto" t1 USING (SELECT ? AS "stars",? AS "title",? AS "create_time" FROM DUAL ) t2 ON (t1."id" = t2."id") WHEN NOT MATCHED THEN INSERT ("stars","title","create_time") VALUES (t2."stars",t2."title",t2."create_time")
```

### 指定存在的条件
```java
TopicAuto topicAuto = new TopicAuto();
topicAuto.setStars(999);
topicAuto.setTitle("title" + 999);
topicAuto.setCreateTime(LocalDateTime.of(2020,1,1,1,1));
Assert.assertNull(topicAuto.getId());
long l = defaultEasyEntityQuery.insertable(topicAuto)
        .onConflictThen(null,o->o.FETCHER.stars().id())
        .executeRows();

MERGE INTO "t_topic_auto" t1 USING (SELECT ? AS "title",? AS "create_time" FROM DUAL ) t2 ON (t1."stars" = t2."stars" AND t1."id" = t2."id") WHEN NOT MATCHED THEN INSERT ("title","create_time") VALUES (t2."title",t2."create_time")
```

## 存在就更新

```java
//存在就更新stars和title
TopicAuto topicAuto = new TopicAuto();
topicAuto.setStars(999);
topicAuto.setTitle("title" + 999);
topicAuto.setCreateTime(LocalDateTime.of(2020,1,1,1,1));
Assert.assertNull(topicAuto.getId());
long l = defaultEasyEntityQuery.insertable(topicAuto)
        .onConflictThen(o -> o.FETCHER.stars().title())
        .executeRows();

MERGE INTO "t_topic_auto" t1 USING (SELECT ? AS "stars",? AS "title",? AS "create_time" FROM DUAL ) t2 ON (t1."id" = t2."id") WHEN MATCHED THEN UPDATE SET t1."stars" = t2."stars",t1."title" = t2."title" WHEN NOT MATCHED THEN INSERT ("stars","title","create_time") VALUES (t2."stars",t2."title",t2."create_time")
```

## 存在就更新

```java
//存在就更新stars和title
TopicAuto topicAuto = new TopicAuto();
topicAuto.setStars(999);
topicAuto.setTitle("title" + 999);
topicAuto.setCreateTime(LocalDateTime.of(2020,1,1,1,1));
Assert.assertNull(topicAuto.getId());
long l = defaultEasyEntityQuery.insertable(topicAuto)
        .onConflictThen(o -> o.FETCHER.stars().title())
        .executeRows();

MERGE INTO "t_topic_auto" t1 USING (SELECT ? AS "stars",? AS "title",? AS "create_time" FROM DUAL ) t2 ON (t1."id" = t2."id") WHEN MATCHED THEN UPDATE SET t1."stars" = t2."stars",t1."title" = t2."title" WHEN NOT MATCHED THEN INSERT ("stars","title","create_time") VALUES (t2."stars",t2."title",t2."create_time")


//存在就更新所有列除了主键和指定约束键
TopicAuto topicAuto = new TopicAuto();
topicAuto.setStars(999);
topicAuto.setTitle("title" + 999);
topicAuto.setCreateTime(LocalDateTime.of(2020,1,1,1,1));
Assert.assertNull(topicAuto.getId());
long l = defaultEasyEntityQuery.insertable(topicAuto)
        .onConflictThen(o -> o.FETCHER.allFields())
        .executeRows();

MERGE INTO "t_topic_auto" t1 USING (SELECT ? AS "stars",? AS "title",? AS "create_time" FROM DUAL ) t2 ON (t1."id" = t2."id") WHEN MATCHED THEN UPDATE SET t1."stars" = t2."stars",t1."title" = t2."title",t1."create_time" = t2."create_time" WHEN NOT MATCHED THEN INSERT ("stars","title","create_time") VALUES (t2."stars",t2."title",t2."create_time")
```