---
title: Delete
order: 40
---

# Delete Operations

## Logical Deletion

Easy-query supports both physical and logical deletion. By default, it uses logical deletion.

To use logical deletion, declare a field with the `@LogicDelete` annotation:

```java
@LogicDelete(strategy = LogicDeleteStrategyEnum.BOOLEAN)
private Boolean deleted;
```

Calling `deletable` will set `deleted` to `true`. If you don't declare this field, an exception will be thrown.

```java
@Test
public void testLogicDelete1() {
    // By default, EasyQuery uses logical deletion
    Company company = new Company();
    company.setName("New Company");
    company.setDeleted(false);
    easyEntityQuery.insertable(company).executeRows(true); // Fill auto-increment ID
    
    // Delete by condition
    long rows = easyEntityQuery.deletable(Company.class)
        .where(c -> c.name().eq("New Company"))
        .executeRows();
    
    Assertions.assertTrue(rows > 0);
}

@Test
public void testLogicDelete2() {
    Company company = new Company();
    company.setName("New Company");
    company.setDeleted(false);
    easyEntityQuery.insertable(company).executeRows(true);
    
    // Delete by entity ID
    long rows = easyEntityQuery.deletable(company).executeRows();
    Assertions.assertTrue(rows > 0);
}
```

If `deleted` has a default value in the database, you don't need to set it. Then `insertable` won't include the `deleted` field in SQL, and the database will use the default value.

## Physical Deletion

Easy-query also supports physical deletion. You need to configure global or local settings to allow executing DELETE statements, otherwise it will throw an exception.

Call `disableLogicDelete` to disable logical deletion:

```java
@Test
public void testDelete() {
    Company company = new Company();
    company.setName("New Company");
    easyEntityQuery.insertable(company).executeRows(true);
    
    long rows = easyEntityQuery.deletable(company)
        .disableLogicDelete()        // Disable logical delete, use physical delete
        .allowDeleteStatement(true)   // Allow physical delete
        .executeRows();
    
    Assertions.assertTrue(rows > 0);
    
    // This will throw an exception
    Assertions.assertThrows(EasyQueryInvalidOperationException.class, () -> {
        easyEntityQuery.deletable(company)
            .disableLogicDelete()
            .allowDeleteStatement(false)
            .executeRows();
    });
}
```

## Disable Logical Deletion for Specific Tables

Easy-query supports removing logical deletion conditions for specific tables during queries:

```java
@Test
public void testQueryDisableLogicDelete() {
    // Delete all companies (logical delete)
    easyEntityQuery.deletable(Company.class)
        .where(c -> c.id().isNotNull())
        .executeRows();
    
    // Query users with non-deleted companies
    List<UserVo> userVos = easyEntityQuery.queryable(User.class)
        .leftJoin(Company.class, (u, c) -> u.companyId().eq(c.id()))
        .select(UserVo.class, (u, c) -> Select.of(
            c.name().as(UserVo::getCompanyName)
        ))
        .toList();
    
    for (UserVo userVo : userVos) {
        Assertions.assertNull(userVo.getCompanyName());
    }
    
    // Partially disable logical deletion to query all companies
    userVos = easyEntityQuery.queryable(User.class)
        .leftJoin(Company.class, (u, c) -> u.companyId().eq(c.id()))
        .tableLogicDelete(() -> false) // Disable logic delete for joined table
        .select(UserVo.class, (u, c) -> Select.of(
            c.name().as(UserVo::getCompanyName)
        ))
        .toList();
    
    for (UserVo userVo : userVos) {
        Assertions.assertNotNull(userVo.getCompanyName());
    }
    
    // Query all data including deleted
    List<Company> companyList = easyEntityQuery.queryable(Company.class)
        .disableLogicDelete()
        .toList();
    
    for (Company company : companyList) {
        company.setDeleted(false);
    }
    
    // Restore all data including deleted
    long size = easyEntityQuery.updatable(companyList)
        .disableLogicDelete()
        .executeRows();
    
    Assertions.assertEquals(companyList.size(), size);
}
```

## Custom Logical Deletion Strategy

Easy-query supports custom logical deletion strategies beyond simple boolean fields.

Define a custom strategy:

```java
public class CustomLogicDelStrategy extends AbstractLogicDeleteStrategy {
    
    @Override
    protected SQLActionExpression1<WherePredicate<Object>> getPredicateFilterExpression(
            LogicDeleteBuilder builder, String propertyName) {
        return o -> o.isNull(propertyName);
    }
    
    @Override
    protected SQLActionExpression1<ColumnSetter<Object>> getDeletedSQLExpression(
            LogicDeleteBuilder builder, String propertyName) {
        return o -> o.set(propertyName, LocalDateTime.now())
            .set("deletedUserId", 1);
    }
    
    @Override
    public String getStrategy() {
        return "CustomLogicDelStrategy";
    }
}
```

::: danger Warning
Easy-query only calls the strategy instance methods once when using `CustomLogicDelStrategy` multiple times. Incorrect example:

```java
@Override
protected SQLActionExpression1<ColumnSetter<Object>> getDeletedSQLExpression(
        LogicDeleteBuilder builder, String propertyName) {
    // getDeletedSQLExpression is called once, returned method is called multiple times
    // 'now' will be a fixed value, not dynamic!
    LocalDateTime now = LocalDateTime.now(); // ❌ Wrong!
    return o -> o.set(propertyName, now)
        .set("deletedUserId", 1);
}
```

Correct approach:

```java
@Override
protected SQLActionExpression1<ColumnSetter<Object>> getDeletedSQLExpression(
        LogicDeleteBuilder builder, String propertyName) {
    // ✅ Correct - LocalDateTime.now() called each time
    return o -> o.set(propertyName, LocalDateTime.now())
        .set("deletedUserId", 1);
}
```
:::

Register the custom strategy:

```java
QueryRuntimeContext runtimeContext = easyEntityQuery.getRuntimeContext();
QueryConfiguration queryConfiguration = runtimeContext.getQueryConfiguration();
queryConfiguration.applyLogicDeleteStrategy(new CustomLogicDelStrategy());
```

Database table:

```sql
-- Drop product table
DROP TABLE IF EXISTS product CASCADE;

-- Create product table
CREATE TABLE product (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    deleted_time DATETIME,
    deleted_user_id INTEGER
);
```

Use in entity class:

```java
@EntityProxy
@Table
@Data
public class Product implements ProxyEntityAvailable<Product, ProductProxy> {
    
    @Column(primaryKey = true, generatedKey = true)
    private Integer id;
    
    private String name;
    
    // strategyName must match getStrategy() return value
    // strategy must be CUSTOM
    @LogicDelete(strategy = LogicDeleteStrategyEnum.CUSTOM, 
                 strategyName = "CustomLogicDelStrategy")
    private LocalDateTime deletedTime;
    
    private Integer deletedUserId;
}
```

Example usage:

```java
@Test
public void testCustomLogicDelete() {
    Product product = new Product();
    product.setName("Banana");
    easyEntityQuery.insertable(product).executeRows(true);
    
    // Logical delete - sets deletedTime to now() and deletedUserId to 1
    easyEntityQuery.deletable(product).executeRows();
    
    // Query won't find deleted products
    Product found = easyEntityQuery.queryable(Product.class)
        .whereById(product.getId())
        .firstOrNull();
    
    Assertions.assertNull(found);
    
    // Query with disabled logic delete
    found = easyEntityQuery.queryable(Product.class)
        .disableLogicDelete()
        .whereById(product.getId())
        .firstOrNull();
    
    Assertions.assertNotNull(found);
    Assertions.assertNotNull(found.getDeletedTime());
    Assertions.assertEquals(1, found.getDeletedUserId());
}
```

## Best Practices

### Choose the Right Deletion Type

```java
// ✅ Good - use logical deletion for audit trails
@LogicDelete(strategy = LogicDeleteStrategyEnum.BOOLEAN)
private Boolean deleted;

// ✅ Good - track who deleted and when
@LogicDelete(strategy = LogicDeleteStrategyEnum.CUSTOM, 
             strategyName = "CustomLogicDelStrategy")
private LocalDateTime deletedTime;
private String deletedBy;
```

### Be Careful with Physical Deletion

```java
// ⚠️ Use with caution - data will be permanently lost
easyEntityQuery.deletable(OldData.class)
    .where(o -> o.createTime().lt(oneYearAgo))
    .disableLogicDelete()
    .allowDeleteStatement(true)
    .executeRows();
```

### Query Deleted Records

```java
// ✅ Good - query all including deleted
List<Company> allCompanies = easyEntityQuery.queryable(Company.class)
    .disableLogicDelete()
    .toList();
```

## Common Issues

### Issue: Can't Delete Records

**Problem**: Calling delete but records still appear in queries

**Solution**: Check if you have a `@LogicDelete` field. Deletion is logical by default.

### Issue: Physical Delete Throws Exception

**Problem**: Exception thrown when trying physical delete

**Solution**: 
1. Call `.disableLogicDelete()`
2. Call `.allowDeleteStatement(true)`
3. Or configure global setting to allow delete statements

### Issue: Deleted Records Still Show in Joins

**Problem**: Deleted records appear in JOIN queries

**Solution**: Use `.tableLogicDelete(() -> true)` to ensure logic delete is applied to joined tables

## See Also

- [Insert Operations](./insert.md)
- [Update Operations](./update.md)
- [Logical Deletion](../../adv/logic-delete.md)
- [Audit Log](../../adv/audit-log.md)

---

If you encounter problems, feel free to join our QQ group: **170029046**

