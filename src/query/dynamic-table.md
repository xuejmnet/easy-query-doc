---
title: 动态表名
order: 60
---

# 动态表名
`easy-query`针对分表对象目前已经支持了动态表名的处理,但是后续会将这一部分全部简化掉让用户无感。

## api

方法  | 参数 | 返回  | 描述
--- | --- | --- | --- 
asTable(String tableName) |  String | this | 设置最近表名名称
asTable(Function<String,String> tableNameAs) | Function<String,String>  | this | 设置最近表名名称

- `asTable(String tableName)`将当前表达式最近的一张表的表名修改成`tableName`,如果当前最近的表是正常的数据库表名,那么直接将表名改写,如果当前最近的表是匿名表比如嵌套queryable的表那么将alias改成对应的表名
- `asTable(Function<String,String> tableNameAs)`将当前表达式最近的一张表的表名修改成`tableNameAs`返回的表名,如果当前最近的表是正常的数据库表名,那么直接将表名改写,如果当前最近的表是匿名表比如嵌套queryable的表那么将alias改成对应的表名
- `asTable(Function<String,String> tableNameAs)`其中对应的参数是一个`lambda`表达式入参为现有表名,返回参数为最终确定的表名内部可以通过复杂计算甚至远程rpc调用都可以


## 案例
```java
List<BlogEntity> blogEntities = easyQuery.queryable(BlogEntity.class)
                .asTable(a -> "aa_bb_cc")
                .where(o -> o.eq(BlogEntity::getId, "123")).toList();


==> Preparing: SELECT t.`id`,t.`create_time`,t.`update_time`,t.`create_by`,t.`update_by`,t.`deleted`,t.`title`,t.`content`,t.`url`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM aa_bb_cc t WHERE t.`deleted` = ? AND t.`id` = ?
==> Parameters: false(Boolean),123(String)
<== Total: 0



List<BlogEntity> blogEntities = easyQuery.queryable(BlogEntity.class)
                .asTable(a->{
                    if("t_blog".equals(a)){
                        return "aa_bb_cc1";
                    }
                    return "xxx";
                })
                .where(o -> o.eq(BlogEntity::getId, "123")).toList();


==> Preparing: SELECT t.`id`,t.`create_time`,t.`update_time`,t.`create_by`,t.`update_by`,t.`deleted`,t.`title`,t.`content`,t.`url`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM aa_bb_cc1 t WHERE t.`deleted` = ? AND t.`id` = ?
==> Parameters: false(Boolean),123(String)
<== Total: 0




List<BlogEntity> x_t_blog = easyQuery
                .queryable(Topic.class)
                .asTable(o -> "t_topic_123")
                .innerJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
                .asTable("x_t_blog")
                .where((t, t1) -> t1.isNotNull(BlogEntity::getTitle).then(t).eq(Topic::getId, "3"))
                .select(BlogEntity.class, (t, t1) -> t1.columnAll()).toList();

==> Preparing: SELECT t1.`id`,t1.`create_time`,t1.`update_time`,t1.`create_by`,t1.`update_by`,t1.`deleted`,t1.`title`,t1.`content`,t1.`url`,t1.`star`,t1.`publish_time`,t1.`score`,t1.`status`,t1.`order`,t1.`is_top`,t1.`top` FROM t_topic_123 t INNER JOIN x_t_blog t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL AND t.`id` = ?
==> Parameters: false(Boolean),3(String)
<== Total: 0
```