---
title: Dynamic Table Names
order: 60
---

# Dynamic Table Names

Easy-query currently supports dynamic table name handling for sharded tables. Future versions will simplify this further to make it completely transparent to users.

## API

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `asTable(String tableName)` | String | this | Set the table name for the most recent table |
| `asTable(Function<String,String> tableNameAs)` | Function<String,String> | this | Set the table name for the most recent table using a function |

- **`asTable(String tableName)`**: Changes the name of the most recent table in the expression to `tableName`. If the table is a regular database table, the name is directly rewritten. If it's an anonymous table (e.g., from a nested queryable), the alias is changed.

- **`asTable(Function<String,String> tableNameAs)`**: Changes the name of the most recent table using a lambda function. The parameter is the current table name, and the return value is the final table name. This allows complex logic, including remote RPC calls.

## Basic Examples

### Simple Table Name Replacement

```java
// Replace with static table name
List<BlogEntity> blogEntities = easyQuery.queryable(BlogEntity.class)
    .asTable(a -> "aa_bb_cc")
    .where(o -> o.eq(BlogEntity::getId, "123"))
    .toList();

// SQL generated:
// SELECT t.`id`, t.`create_time`, t.`update_time`, ...
// FROM aa_bb_cc t 
// WHERE t.`deleted` = ? AND t.`id` = ?
```

### Conditional Table Name

```java
// Determine table name based on current name
List<BlogEntity> blogEntities = easyQuery.queryable(BlogEntity.class)
    .asTable(tableName -> {
        if ("t_blog".equals(tableName)) {
            return "aa_bb_cc1";
        }
        return "xxx";
    })
    .where(o -> o.eq(BlogEntity::getId, "123"))
    .toList();

// SQL generated:
// SELECT t.`id`, t.`create_time`, t.`update_time`, ...
// FROM aa_bb_cc1 t 
// WHERE t.`deleted` = ? AND t.`id` = ?
```

## Join Scenarios

```java
// Apply to multiple tables in JOIN
List<BlogEntity> x_t_blog = easyQuery
    .queryable(Topic.class)
    .asTable(o -> "t_topic_123")  // First table
    .innerJoin(BlogEntity.class, (t, t1) -> 
        t.eq(t1, Topic::getId, BlogEntity::getId))
    .asTable("x_t_blog")  // Second table
    .where((t, t1) -> 
        t1.isNotNull(BlogEntity::getTitle)
          .then(t)
          .eq(Topic::getId, "3"))
    .select(BlogEntity.class, (t, t1) -> t1.columnAll())
    .toList();

// SQL generated:
// SELECT t1.`id`, t1.`create_time`, ...
// FROM t_topic_123 t 
// INNER JOIN x_t_blog t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` 
// WHERE t1.`title` IS NOT NULL AND t.`id` = ?
```

## Sharding Examples

### Date-Based Sharding

```java
// Shard by month
public List<Order> getOrdersByMonth(LocalDateTime date) {
    String tableSuffix = date.format(DateTimeFormatter.ofPattern("yyyyMM"));
    
    return easyQuery.queryable(Order.class)
        .asTable(oldName -> "t_order_" + tableSuffix)
        .where(o -> o.eq(Order::getUserId, userId))
        .toList();
}

// SQL generated for January 2024:
// SELECT * FROM t_order_202401 WHERE user_id = ?
```

### Hash-Based Sharding

```java
// Shard by user ID
public List<Order> getOrdersByUserId(String userId) {
    int hash = Math.abs(userId.hashCode());
    int tableIndex = hash % 10;  // 10 shard tables
    
    return easyQuery.queryable(Order.class)
        .asTable(oldName -> "t_order_" + tableIndex)
        .where(o -> o.eq(Order::getUserId, userId))
        .toList();
}

// SQL generated if userId hashes to 3:
// SELECT * FROM t_order_3 WHERE user_id = ?
```

## Advanced Usage

### Multiple Table Sharding

```java
// Shard both main and joined tables
public List<OrderDetail> getOrderDetails(String userId, LocalDateTime date) {
    String suffix = calculateSuffix(userId, date);
    
    return easyQuery.queryable(Order.class)
        .asTable(name -> "t_order_" + suffix)
        .leftJoin(OrderDetail.class, (o, od) -> 
            o.eq(od, Order::getId, OrderDetail::getOrderId))
        .asTable(name -> "t_order_detail_" + suffix)
        .where((o, od) -> o.eq(Order::getUserId, userId))
        .select(OrderDetail.class, (o, od) -> od.columnAll())
        .toList();
}

// SQL generated:
// SELECT t1.* 
// FROM t_order_202401 t
// LEFT JOIN t_order_detail_202401 t1 ON t.id = t1.order_id
// WHERE t.user_id = ?
```

### Dynamic Sharding Strategy

```java
public class ShardingStrategy {
    // Strategy interface
    public interface TableNameStrategy {
        String getTableName(String originalName, Object... params);
    }
    
    // Date-based strategy
    public static class DateStrategy implements TableNameStrategy {
        @Override
        public String getTableName(String originalName, Object... params) {
            LocalDateTime date = (LocalDateTime) params[0];
            String suffix = date.format(DateTimeFormatter.ofPattern("yyyyMM"));
            return originalName + "_" + suffix;
        }
    }
    
    // Usage
    public <T> List<T> queryWithStrategy(
        Class<T> entityClass, 
        TableNameStrategy strategy,
        Object... strategyParams
    ) {
        return easyQuery.queryable(entityClass)
            .asTable(name -> strategy.getTableName(name, strategyParams))
            .toList();
    }
}

// Use the strategy
List<Order> orders = shardingStrategy.queryWithStrategy(
    Order.class,
    new DateStrategy(),
    LocalDateTime.now()
);
```

## Subquery Table Names

```java
// Change table name in subquery
List<BlogEntity> result = easyQuery.queryable(
    easyQuery.queryable(BlogEntity.class)
        .asTable("t_blog_2024")
        .where(o -> o.eq(BlogEntity::getStatus, 1))
)
.where(o -> o.gt(BlogEntity::getScore, 100))
.toList();

// SQL generated:
// SELECT * FROM (
//     SELECT * FROM t_blog_2024 WHERE status = ?
// ) t 
// WHERE t.score > ?
```

## Best Practices

### Centralize Sharding Logic

```java
// ✅ Good - Centralized sharding
public class ShardingUtil {
    public static String getOrderTable(String userId) {
        int hash = Math.abs(userId.hashCode()) % 10;
        return "t_order_" + hash;
    }
    
    public static String getLogTable(LocalDateTime date) {
        return "t_log_" + date.format(DateTimeFormatter.ofPattern("yyyyMM"));
    }
}

// Usage
List<Order> orders = easyQuery.queryable(Order.class)
    .asTable(name -> ShardingUtil.getOrderTable(userId))
    .toList();

// ❌ Avoid - Scattered sharding logic
List<Order> orders = easyQuery.queryable(Order.class)
    .asTable(name -> "t_order_" + (Math.abs(userId.hashCode()) % 10))
    .toList();
```

### Type-Safe Table Names

```java
// ✅ Good - Type-safe constants
public class TableNames {
    public static final String ORDER_PREFIX = "t_order_";
    public static final String LOG_PREFIX = "t_log_";
    
    public static String order(int index) {
        return ORDER_PREFIX + index;
    }
}

// ❌ Avoid - Magic strings
easyQuery.queryable(Order.class)
    .asTable(name -> "t_order_" + index)  // What if you typo?
    .toList();
```

### Test Sharding Logic

```java
@Test
public void testShardingLogic() {
    // Test that sharding distributes evenly
    Map<String, Integer> distribution = new HashMap<>();
    
    for (int i = 0; i < 10000; i++) {
        String userId = "user_" + i;
        String tableName = ShardingUtil.getOrderTable(userId);
        distribution.merge(tableName, 1, Integer::sum);
    }
    
    // Verify distribution is relatively even
    distribution.values().forEach(count -> {
        assertTrue(count > 900 && count < 1100);  // 10% tolerance
    });
}
```

## Common Issues

### Issue: Table Name Not Changing

**Problem**: `asTable()` doesn't seem to work

**Solution**: Make sure `asTable()` is called immediately after the queryable:

```java
// ✅ Correct
easyQuery.queryable(Order.class)
    .asTable("t_order_new")  // Immediately after queryable
    .where(...)
    .toList();

// ❌ Wrong
easyQuery.queryable(Order.class)
    .where(...)
    .asTable("t_order_new")  // Too late!
    .toList();
```

### Issue: Multiple Tables Not Sharded

**Problem**: In JOIN, only the first table is sharded

**Solution**: Call `asTable()` for each table:

```java
easyQuery.queryable(Order.class)
    .asTable("t_order_1")  // First table
    .leftJoin(OrderDetail.class, ...)
    .asTable("t_order_detail_1")  // Second table
    .toList();
```

## Entity Query Mode

```java
// Works the same in entity query mode
List<Order> orders = easyEntityQuery.queryable(Order.class)
    .asTable(name -> "t_order_" + suffix)
    .where(o -> o.id().eq(orderId))
    .toList();
```

## See Also

- [Sharding Configuration](../super/README.md)
- [Advanced Sharding](../super/sharding-table.md)
- [Query Basics](./select/README.md)

---

If you encounter problems, feel free to join our QQ group: **170029046**

