---
title: Insert
order: 10
---

# Insert Operations

`EasyQuery` provides methods for inserting single and batch records, returning the number of affected rows.

## Database Table Script

```sql
create table t_topic
(
    id varchar(32) not null comment 'Primary Key' primary key,
    stars int not null comment 'Star Count',
    title varchar(50) not null comment 'Title',
    create_time datetime not null comment 'Create Time'
) comment 'Topic Table';
```

## Java Entity

```java
@Data
@Table("t_topic")
@EntityProxy
public class Topic implements ProxyEntityAvailable<Topic, TopicProxy> {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;
}

// Prepare test data
List<Topic> topics = new ArrayList<>();
for (int i = 0; i < 10; i++) {
    Topic topic = new Topic();
    topic.setId(String.valueOf(i));
    topic.setStars(i + 100);
    topic.setTitle("Title" + i);
    topic.setCreateTime(LocalDateTime.now().plusDays(i));
    topics.add(topic);
}
```

## 1. Single Insert

```java
long rows = easyEntityQuery.insertable(topics.get(0)).executeRows();
// Returns rows = 1
```

```log
==> Preparing: INSERT INTO t_topic (`id`,`stars`,`title`,`create_time`) VALUES (?,?,?,?) 
==> Parameters: 0(String),100(Integer),Title0(String),2023-03-16T21:34:13.287(LocalDateTime)
<== Total: 1
```

If the table has an auto-increment ID, it will be filled back to the entity using `executeRows(true)`.

## 2. Batch Insert

When the collection size exceeds the default `insertBatchThreshold`, batch mode is automatically used for better performance. You can also manually call `batch()` method.

::: warning Note
For MySQL, add `rewriteBatchedStatements=true` to your JDBC connection string for significantly improved performance.
:::

```java
long rows = easyEntityQuery.insertable(topics).executeRows();
// Returns rows = 10
```

```log
==> Preparing: INSERT INTO t_topic (`id`,`stars`,`title`,`create_time`) VALUES (?,?,?,?) 
==> Parameters: 0(String),100(Integer),Title0(String),2023-03-16T21:38:22.114(LocalDateTime)
==> Parameters: 1(String),101(Integer),Title1(String),2023-03-17T21:38:22.114(LocalDateTime)
==> Parameters: 2(String),102(Integer),Title2(String),2023-03-18T21:38:22.114(LocalDateTime)
...
<== Total: 10
```

## 3. Chained Insert

```java
long rows = easyEntityQuery.insertable(topics.get(0))
    .insert(topics.get(1))
    .executeRows();
// Returns rows = 2
```

```log
==> Preparing: INSERT INTO t_topic (`id`,`stars`,`title`,`create_time`) VALUES (?,?,?,?) 
==> Parameters: 0(String),100(Integer),Title0(String),2023-03-16T21:42:12.542(LocalDateTime)
==> Parameters: 1(String),101(Integer),Title1(String),2023-03-17T21:42:12.542(LocalDateTime)
<== Total: 2
```

## 4. Auto-Increment Key Fill

When using auto-increment IDs, easy-query can fill back the generated primary key:

```java
@Data
@Table("t_topic_auto")
@EntityProxy
public class TopicAuto implements ProxyEntityAvailable<TopicAuto, TopicAutoProxy> {

    @Column(primaryKey = true, generatedKey = true) // Mark as auto-increment
    private Integer id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;
}

TopicAuto topicAuto = new TopicAuto();
topicAuto.setStars(999);
topicAuto.setTitle("title999");
topicAuto.setCreateTime(LocalDateTime.now().plusDays(99));
Assert.assertNull(topicAuto.getId());

// true indicates to fill back the primary key
long l = easyEntityQuery.insertable(topicAuto).executeRows(true);

Assert.assertEquals(1, l);
Assert.assertNotNull(topicAuto.getId()); // ID is now filled
```

```sql
==> Preparing: INSERT INTO `t_topic_auto` (`stars`,`title`,`create_time`) VALUES (?,?,?)
==> Parameters: 999(Integer),title999(String),2023-08-31T16:36:06.552(LocalDateTime)
<== Total: 1
```

## 5. Insert Strategy

`insertStrategy` controls which columns to insert. The default strategy is `SQLExecuteStrategyEnum.ONLY_NOT_NULL_COLUMNS` (only non-null columns).

```java
// Only inserts non-null columns (default)
QueryLargeColumnTestEntity entity = new QueryLargeColumnTestEntity();
entity.setId("123");
long l = easyEntityQuery.insertable(entity).executeRows();

==> Preparing: INSERT INTO `query_large_column_test` (`id`) VALUES (?) 
==> Parameters: 123(String)


// Insert all columns
entity.setId("123");
l = easyEntityQuery.insertable(entity)
    .setSQLStrategy(SQLExecuteStrategyEnum.ALL_COLUMNS)
    .executeRows();

==> Preparing: INSERT INTO `query_large_column_test` (`id`,`name`,`content`) VALUES (?,?,?) 
==> Parameters: 123(String),null(null),null(null)


// Insert only null columns
entity.setId("123");
l = easyEntityQuery.insertable(entity)
    .setSQLStrategy(SQLExecuteStrategyEnum.ONLY_NULL_COLUMNS)
    .executeRows();

==> Preparing: INSERT INTO `query_large_column_test` (`name`,`content`) VALUES (?,?) 
==> Parameters: null(null),null(null)
```

## 6. Map Insert

Easy-query supports inserting Map structures where keys represent database column names:

```java
Map<String, Object> data = new LinkedHashMap<>();
data.put("id", 123);
data.put("name", "John");
data.put("name1", "Doe");
data.put("name2", null);

easyEntityQuery.mapInsertable(data)
    .asTable("sys_table")
    .setSQLStrategy(SQLExecuteStrategyEnum.ONLY_NOT_NULL_COLUMNS)
    .executeRows();

// Generated SQL:
INSERT INTO `sys_table` (`id`,`name`,`name1`) VALUES (?,?,?)
```

## 7. Conflict Handling

Easy-query provides the `conflictThen` method for handling duplicate key conflicts. See [Insert Or Update](./insertOrUpdate.md) chapter for details.

## Best Practices

### Use Batch Insert for Large Data

```java
// ✅ Good - batch insert
List<Topic> topics = createLargeTopicList();
easyEntityQuery.insertable(topics)
    .batch(true)
    .executeRows();

// ❌ Avoid - individual inserts
for (Topic topic : topics) {
    easyEntityQuery.insertable(topic).executeRows(); // Slow!
}
```

### Selective Insert

```java
// ✅ Good - only insert non-null fields
Topic topic = new Topic();
topic.setTitle("My Title");
// id and createTime are null, won't be inserted
easyEntityQuery.insertable(topic)
    .setSQLStrategy(SQLExecuteStrategyEnum.ONLY_NOT_NULL_COLUMNS)
    .executeRows();
```

### Get Generated Keys

```java
// ✅ Good - get auto-increment ID
Topic topic = new Topic();
topic.setTitle("New Topic");
easyEntityQuery.insertable(topic).executeRows(true);
System.out.println("Generated ID: " + topic.getId());
```

## Common Issues

### Issue: Batch Insert is Slow

**Problem**: Batch insert is as slow as individual inserts

**Solution**: Add `rewriteBatchedStatements=true` to your MySQL JDBC URL:
```
jdbc:mysql://localhost:3306/db?rewriteBatchedStatements=true
```

### Issue: Primary Key Not Filled

**Problem**: Auto-increment ID is still null after insert

**Solution**: 
1. Add `generatedKey = true` to the `@Column` annotation
2. Call `executeRows(true)` instead of `executeRows()`

## See Also

- [Update Operations](./update.md)
- [Delete Operations](./delete.md)
- [Insert Or Update](./insertOrUpdate.md)
- [Batch Operations](./batch.md)

---

If you encounter problems, feel free to join our QQ group: **170029046**

