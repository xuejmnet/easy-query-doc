---
title: Batch Operations
order: 60
---

# Batch Operations

To use batch functionality in easy-query, you need to add `rewriteBatchedStatements=true` to your JDBC connection string (for MySQL). The framework will automatically merge SQL and call `executeBatch` when the configured threshold is reached. You can manually control this with the `batch()` method.

::: warning Database-Specific Configuration
The connection string settings provided may not apply to all database versions. Test with 100k+ inserts to verify batch mode is working.

- **MySQL**: Add `rewriteBatchedStatements=true` to connection string
- **SQL Server**: Add `useBulkCopyForBatchInsert=true` to connection string
  - See: [Bulk Copy API for Batch Insert](https://learn.microsoft.com/sql/connect/jdbc/use-bulk-copy-api-batch-insert-operation)
- **Other databases**: Check documentation for batch operation requirements
:::

## Example Connection String

```
jdbc:mysql://127.0.0.1:3306/easy-query-test?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&rewriteBatchedStatements=true
```

<!-- ## Configuration

| Config Name | Default | Description |
|-------------|---------|-------------|
| `insertBatchThreshold` | 1024 | If insertable adds a collection with ≥1024 objects, automatically uses batch mode to merge same SQL for better performance. Requires `rewriteBatchedStatements=true` (MySQL). Can manually enable/disable with `batch()` method |
| `updateBatchThreshold` | 1024 | If updatable adds a collection with ≥1024 objects, automatically uses batch mode to merge same SQL for better performance. Requires `rewriteBatchedStatements=true` (MySQL). Can manually enable/disable with `batch()` method | -->

## Important Notes

::: danger Return Value Accuracy
Using `batch()` can significantly improve insert/update performance, but may cause inaccurate return values. Handle return results appropriately when using batch mode.
:::

## Batch Insert Example

```java
List<Topic> topics = createLargeTopicList();

// Manual batch insert
easyEntityQuery.insertable(topics).batch().executeRows();
```

```log
==> Preparing: INSERT INTO `t_blog` (`id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`score`,`status`,`order`,`is_top`,`top`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
==> Parameters: 500(String),2000-01-02T01:01:01(LocalDateTime),2000-01-02T01:01:01(LocalDateTime),500(String),500(String),false(Boolean),title500(String),content500(String),http://blog.easy-query.com/500(String),500(Integer),1.2(BigDecimal),1(Integer),1.2(BigDecimal),false(Boolean),false(Boolean)
==> Parameters: 300(String),2000-01-02T01:01:01(LocalDateTime),2000-01-02T01:01:01(LocalDateTime),300(String),300(String),false(Boolean),title300(String),content300(String),http://blog.easy-query.com/300(String),300(Integer),1.2(BigDecimal),1(Integer),1.2(BigDecimal),false(Boolean),false(Boolean)
==> Parameters: 400(String),2000-01-02T01:01:01(LocalDateTime),2000-01-02T01:01:01(LocalDateTime),400(String),400(String),false(Boolean),title400(String),content400(String),http://blog.easy-query.com/400(String),400(Integer),1.2(BigDecimal),1(Integer),1.2(BigDecimal),false(Boolean),false(Boolean)
<== Total: -6
```

Note the return value is `-6`, not the actual row count.

## Batch Update Example

```java
List<User> users = getUsers();

// Manual batch update
easyEntityQuery.updatable(users).batch().executeRows();
```

## Automatic Batch Grouping

When your insert or update collection contains entities with some null columns, and the strategy is not `ALL_COLUMNS`, easy-query intelligently groups and batches operations by column sets.

```java
@Data
@Table("t_test_insert")
@EntityProxy
public class TestInsert implements ProxyEntityAvailable<TestInsert, TestInsertProxy> {
    @Column(primaryKey = true)
    private String id;
    private String column1;
    private String column2;
}

// Create table
DatabaseCodeFirst databaseCodeFirst = easyEntityQuery.getDatabaseCodeFirst();
CodeFirstCommand codeFirstCommand = databaseCodeFirst.syncTableCommand(
    Arrays.asList(TestInsert.class));
codeFirstCommand.executeWithTransaction(arg -> {
    System.out.println(arg.sql);
    arg.commit();
});

// Prepare data with varying null columns
ArrayList<TestInsert> testInserts = new ArrayList<>();
for (int i = 0; i < 9; i++) {
    TestInsert testInsert = new TestInsert();
    testInsert.setId(String.valueOf(i));
    testInsert.setColumn1(i % 2 == 0 ? i + ":column1" : null);
    testInsert.setColumn2(i % 3 == 0 ? i + ":column2" : null);
    testInserts.add(testInsert);
}

// Batch insert with automatic grouping
easyEntityQuery.insertable(testInserts).batch().executeRows();
```

Easy-query automatically groups by column sets:

```log
// Group 1: id, column1, column2
==> Preparing: INSERT INTO `t_test_insert` (`id`,`column1`,`column2`) VALUES (?,?,?)
==> Parameters: 0(String),0:column1(String),0:column2(String)
==> Parameters: 6(String),6:column1(String),6:column2(String)
<== Total: -4

// Group 2: id only
==> Preparing: INSERT INTO `t_test_insert` (`id`) VALUES (?)
==> Parameters: 1(String)
==> Parameters: 5(String)
==> Parameters: 7(String)
<== Total: -6

// Group 3: id, column1
==> Preparing: INSERT INTO `t_test_insert` (`id`,`column1`) VALUES (?,?)
==> Parameters: 2(String),2:column1(String)
==> Parameters: 4(String),4:column1(String)
==> Parameters: 8(String),8:column1(String)
<== Total: -6

// Group 4: id, column2
==> Preparing: INSERT INTO `t_test_insert` (`id`,`column2`) VALUES (?,?)
==> Parameters: 3(String),3:column2(String)
<== Total: 1
```

## Understanding Return Values

### Why -6 or Negative Values?

From JDBC documentation:

The `executeBatch()` method returns an `int[]` array where each value can be:

- **≥ 0**: Command processed successfully, value indicates affected rows
- **-2 (SUCCESS_NO_INFO)**: Command processed successfully, but affected rows unknown
- **-3 (EXECUTE_FAILED)**: Command failed to execute properly

If batch update fails, `BatchUpdateException` is thrown. The JDBC driver may or may not continue processing remaining commands depending on the database.

*Reference: [JDBC Batch Updates](https://blog.csdn.net/u011624157/article/details/110734184)*

## Best Practices

### Use Batch for Large Data Sets

```java
// ✅ Good - use batch for large collections
List<User> users = createLargeUserList();
easyEntityQuery.insertable(users)
    .batch()
    .executeRows();

// ❌ Avoid - individual inserts
for (User user : users) {
    easyEntityQuery.insertable(user).executeRows();
}
```

### Configure Batch Threshold

```yaml
easy-query:
  insert-batch-threshold: 500   # Adjust based on your needs
  update-batch-threshold: 500
```

### Handle Return Values Appropriately

```java
// ✅ Good - don't rely on exact row count with batch
long result = easyEntityQuery.insertable(users).batch().executeRows();
// result might be -2, -3, or actual count

// ✅ Better - check if operation succeeded
try {
    easyEntityQuery.insertable(users).batch().executeRows();
    // Success if no exception
} catch (Exception e) {
    // Handle failure
}
```

### Use Transactions with Batch

```java
// ✅ Good - batch in transaction
@Transactional
public void importData(List<User> users) {
    easyEntityQuery.insertable(users)
        .batch()
        .executeRows();
}
```

## Performance Comparison

### Without Batch

```java
// Individual inserts - very slow for large data
for (int i = 0; i < 10000; i++) {
    Topic topic = new Topic();
    topic.setId(String.valueOf(i));
    topic.setTitle("Title" + i);
    easyEntityQuery.insertable(topic).executeRows();
}
// Time: ~30 seconds for 10k records
```

### With Batch

```java
// Batch insert - much faster
List<Topic> topics = new ArrayList<>();
for (int i = 0; i < 10000; i++) {
    Topic topic = new Topic();
    topic.setId(String.valueOf(i));
    topic.setTitle("Title" + i);
    topics.add(topic);
}
easyEntityQuery.insertable(topics).batch().executeRows();
// Time: ~2 seconds for 10k records (15x faster!)
```

## Common Issues

### Issue: Batch Not Faster

**Problem**: Batch operation is as slow as individual inserts

**Solution**: Add `rewriteBatchedStatements=true` to MySQL JDBC URL:
```
jdbc:mysql://localhost:3306/db?rewriteBatchedStatements=true
```

### Issue: Inaccurate Row Counts

**Problem**: `executeRows()` returns unexpected values like -2 or -3

**Solution**: This is normal with batch mode. Don't rely on exact row counts. Check for exceptions instead.

### Issue: Out of Memory

**Problem**: Out of memory when inserting large datasets

**Solution**: Process in smaller chunks:
```java
List<Topic> allTopics = createVeryLargeList(); // 1 million records

// Process in chunks of 10k
int chunkSize = 10000;
for (int i = 0; i < allTopics.size(); i += chunkSize) {
    List<Topic> chunk = allTopics.subList(i, 
        Math.min(i + chunkSize, allTopics.size()));
    easyEntityQuery.insertable(chunk).batch().executeRows();
}
```

## Related Topics

- **Batch Submit**
- **Batch Insert**
- **Batch Operation**
- **Batch Processing**

## See Also

- [Insert Operations](./insert.md)
- [Update Operations](./update.md)
- [Transaction Management](./transaction.md)
- [Performance Guide](../../performance/batch.md)

---

If you encounter problems, feel free to join our QQ group: **170029046**

