---
title: 默认行为配置
---

# 默认行为配置


## 默认行为
方法  | sql | 描述  
--- | --- | --- 
select | `queryLargeColumn`:`true`  | 默认查询返回`@Column(large=true)`
insert | `SQLExecuteStrategyEnum.ONLY_NOT_NULL_COLUMNS`  | 默认生成语句不包含null列
update | `SQLExecuteStrategyEnum.ALL_COLUMNS`  | 默认更新所有列包括null和非null
delete | `allowDeleteStatement`:`false`  | 默认执行物理删除会报错

## select
`queryLargeColumn`表示是否查询出对应的表示为`@Column(large=true)`的字段,默认`true`表示查询,如果设置为false则需要手动指定对应列,可以通过调用api接口`queryLargeColumn(boolean)`传入对应的值来表示是否查询

```java
@Data
@Table("query_large_column_test")
public class QueryLargeColumnTestEntity {
    private String id;

    private String name;
    @Column(large = true)
    private String content;
}

//默认会被查询
String sql = easyQuery.queryable(QueryLargeColumnTestEntity.class).toSQL();
//SELECT t.`id`,t.`name`,t.`content` FROM `query_large_column_test` t


//设置不查询
String sql = easyQuery.queryable(QueryLargeColumnTestEntity.class).queryLargeColumn(false).toSQL();
//SELECT t.`id`,t.`name` FROM `query_large_column_test` t
```


## insert
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

## update
`updateStrategy`表示sql的执行策略,`update`命令默认采用`SQLExecuteStrategyEnum.ALL_COLUMNS`就是说默认生成的sql无论对象是否是null属性都会进行更新。
```java

QueryLargeColumnTestEntity queryLargeColumnTestEntity = new QueryLargeColumnTestEntity();
queryLargeColumnTestEntity.setId("123");
long l = easyQuery.updatable(queryLargeColumnTestEntity).executeRows();

//默认更新所有列
==> Preparing: UPDATE `query_large_column_test` SET `name` = ?,`content` = ? WHERE `id` = ?
==> Parameters: null(null),null(null),123(String)



QueryLargeColumnTestEntity queryLargeColumnTestEntity = new QueryLargeColumnTestEntity();
queryLargeColumnTestEntity.setId("123");
long l = easyQuery.updatable(queryLargeColumnTestEntity).setSQLStrategy(SQLExecuteStrategyEnum.ONLY_NOT_NULL_COLUMNS).executeRows();
//将不会生成sql因为只有一个主键没有其他任何需要update的列



QueryLargeColumnTestEntity queryLargeColumnTestEntity = new QueryLargeColumnTestEntity();
queryLargeColumnTestEntity.setId("123");
queryLargeColumnTestEntity.setName("123");
long l = easyQuery.updatable(queryLargeColumnTestEntity).setSQLStrategy(SQLExecuteStrategyEnum.ONLY_NOT_NULL_COLUMNS).executeRows();

//更新not null列
==> Preparing: UPDATE `query_large_column_test` SET `name` = ? WHERE `id` = ?
==> Parameters: 123(String),123(String)



QueryLargeColumnTestEntity queryLargeColumnTestEntity = new QueryLargeColumnTestEntity();
queryLargeColumnTestEntity.setId("123");
queryLargeColumnTestEntity.setName("123");
long l = easyQuery.updatable(queryLargeColumnTestEntity).setSQLStrategy(SQLExecuteStrategyEnum.ONLY_NULL_COLUMNS).executeRows();


//更新null列
==> Preparing: UPDATE `query_large_column_test` SET `content` = ? WHERE `id` = ?
==> Parameters: null(null),123(String)



QueryLargeColumnTestEntity queryLargeColumnTestEntity = new QueryLargeColumnTestEntity();
queryLargeColumnTestEntity.setId("123");
queryLargeColumnTestEntity.setName("123");
queryLargeColumnTestEntity.setContent("123");
long l = easyQuery.updatable(queryLargeColumnTestEntity).setSQLStrategy(SQLExecuteStrategyEnum.ONLY_NULL_COLUMNS).executeRows();

//因为没有null列所以不会生成sql返回受影响行数也是0
```
## delete
`deleteThrowError`是`easy-query`防止数据被删除的默认设置,默认为true,表示不允许删除数据,可以采用逻辑删除来处理数据的删除。可以通过api接口来实现物理删除

```java

QueryLargeColumnTestEntity queryLargeColumnTestEntity = new QueryLargeColumnTestEntity();
queryLargeColumnTestEntity.setId("123");
long l = easyQuery.deletable(queryLargeColumnTestEntity).executeRows();
//抛错错误 can't execute delete statement


QueryLargeColumnTestEntity queryLargeColumnTestEntity = new QueryLargeColumnTestEntity();
queryLargeColumnTestEntity.setId("123");
long l = easyQuery.deletable(queryLargeColumnTestEntity).allowDeleteStatement(true).executeRows();

//允许删除命令
==> Preparing: DELETE FROM `query_large_column_test` WHERE `id` = ?
==> Parameters: 123(String)
```
