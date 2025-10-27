---
title: Transaction
order: 50
---

# Transaction Management

Easy-query provides comprehensive transaction support with various configuration options.

## Transaction Methods

| Method | Default | Description |
|--------|---------|-------------|
| `beginTransaction` | null | Parameter indicates database isolation level. Default uses datasource setting. Options: `Connection.TRANSACTION_READ_UNCOMMITTED`, `Connection.TRANSACTION_READ_COMMITTED`, `Connection.TRANSACTION_REPEATABLE_READ`, `Connection.TRANSACTION_SERIALIZABLE` |
| `Transaction.commit` | - | Commit the transaction |
| `Transaction.rollback` | - | Rollback the transaction |
| `registerListener(TransactionListener)` | - | Register transaction behavior listeners (before/after commit, etc.) |
| `close` | - | Close transaction. Auto-rollback if not committed |

## Simple Environment

In a simple environment, use programmatic transactions:

```java
@Test
public void testTransaction() {
    try (Transaction transaction = easyEntityQuery.beginTransaction()) {
        User user = new User();
        user.setName("New User");
        user.setVersion(1);
        user.setEnabled(true);
        
        easyEntityQuery.insertable(user).executeRows();
        easyEntityQuery.insertable(user).executeRows();
        
        if (true) {
            throw new RuntimeException("Simulated exception");
        }
        
        transaction.commit();
    } // Auto-rollback if exception thrown before commit
}
```

## Isolation Levels

Specify isolation level when beginning transaction:

```java
// Read uncommitted
try (Transaction transaction = easyEntityQuery.beginTransaction(
        Connection.TRANSACTION_READ_UNCOMMITTED)) {
    // Your operations
    transaction.commit();
}

// Read committed (most common)
try (Transaction transaction = easyEntityQuery.beginTransaction(
        Connection.TRANSACTION_READ_COMMITTED)) {
    // Your operations
    transaction.commit();
}

// Repeatable read (MySQL default)
try (Transaction transaction = easyEntityQuery.beginTransaction(
        Connection.TRANSACTION_REPEATABLE_READ)) {
    // Your operations
    transaction.commit();
}

// Serializable (highest isolation)
try (Transaction transaction = easyEntityQuery.beginTransaction(
        Connection.TRANSACTION_SERIALIZABLE)) {
    // Your operations
    transaction.commit();
}
```

## Transaction Listeners

Register listeners to execute code at specific transaction lifecycle points:

```java
try (Transaction transaction = easyEntityQuery.beginTransaction()) {
    // Register listener
    transaction.registerListener(new TransactionListener() {
        @Override
        public void onBeforeCommit() {
            System.out.println("Before commit");
        }
        
        @Override
        public void onAfterCommit() {
            System.out.println("After commit");
        }
        
        @Override
        public void onBeforeRollback() {
            System.out.println("Before rollback");
        }
        
        @Override
        public void onAfterRollback() {
            System.out.println("After rollback");
        }
    });
    
    // Your operations
    transaction.commit();
}
```

## Spring Boot Integration

In Spring Boot, Easy-query fully supports Spring's `@Transactional` annotation:

```java
@Service
public class UserService {
    
    @Autowired
    private EasyEntityQuery easyEntityQuery;
    
    @Transactional(rollbackFor = Exception.class)
    public void createUser() {
        User user = new User();
        user.setName("New User");
        user.setVersion(1);
        user.setEnabled(true);
        
        easyEntityQuery.insertable(user).executeRows();
        easyEntityQuery.insertable(user).executeRows();
        
        if (true) {
            throw new RuntimeException("Simulated exception");
        }
        // Auto-rollback on exception
    }
}
```

### Transaction Propagation

Spring's transaction propagation is fully supported:

```java
@Service
public class OrderService {
    
    @Autowired
    private UserService userService;
    
    @Transactional
    public void createOrder() {
        // Outer transaction
        Order order = new Order();
        easyEntityQuery.insertable(order).executeRows();
        
        // Participates in outer transaction
        userService.updateUserStats();
    }
}

@Service
public class UserService {
    
    // Participates in existing transaction
    @Transactional(propagation = Propagation.REQUIRED)
    public void updateUserStats() {
        // Updates within same transaction
    }
    
    // Always creates new transaction
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logActivity() {
        // Runs in separate transaction
    }
    
    // Runs without transaction
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void sendNotification() {
        // No transaction
    }
}
```

### Nested Transactions

```java
@Service
public class PaymentService {
    
    @Transactional
    public void processPayment() {
        // Outer transaction
        createPaymentRecord();
        
        try {
            // Nested transaction with savepoint
            processRefund();
        } catch (Exception e) {
            // Outer transaction can continue
            log.error("Refund failed", e);
        }
    }
    
    @Transactional(propagation = Propagation.NESTED)
    public void processRefund() {
        // Nested transaction
        // Can rollback independently
    }
}
```

## Manual Rollback

Manually rollback transaction when needed:

```java
@Test
public void testManualRollback() {
    try (Transaction transaction = easyEntityQuery.beginTransaction()) {
        User user = new User();
        user.setName("Test User");
        easyEntityQuery.insertable(user).executeRows();
        
        // Check some condition
        if (someCondition) {
            transaction.rollback();
            return;
        }
        
        transaction.commit();
    }
}
```

In Spring:

```java
@Transactional
public void processOrder(Order order) {
    easyEntityQuery.insertable(order).executeRows();
    
    if (!validateOrder(order)) {
        // Trigger rollback
        TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
        return;
    }
    
    // Continue processing
}
```

## Transaction Best Practices

### Keep Transactions Short

```java
// ✅ Good - short transaction
@Transactional
public void updateUser(User user) {
    easyEntityQuery.updatable(user).executeRows();
}

// ❌ Avoid - long transaction
@Transactional
public void processUsers(List<User> users) {
    for (User user : users) {
        heavyComputation(user); // Slow operation in transaction
        easyEntityQuery.updatable(user).executeRows();
    }
}

// ✅ Better - minimize transaction scope
public void processUsers(List<User> users) {
    for (User user : users) {
        heavyComputation(user); // Outside transaction
        updateUserInTransaction(user); // Short transaction
    }
}

@Transactional
private void updateUserInTransaction(User user) {
    easyEntityQuery.updatable(user).executeRows();
}
```

### Use Appropriate Isolation Level

```java
// ✅ Good - use appropriate isolation level
@Transactional(isolation = Isolation.READ_COMMITTED)
public void updateBalance(String userId, BigDecimal amount) {
    User user = easyEntityQuery.queryable(User.class)
        .whereById(userId)
        .firstOrNull();
    
    user.setBalance(user.getBalance().add(amount));
    easyEntityQuery.updatable(user).executeRows();
}

// For critical operations requiring highest consistency
@Transactional(isolation = Isolation.SERIALIZABLE)
public void transferMoney(String fromId, String toId, BigDecimal amount) {
    // Highest isolation - no concurrent access
}
```

### Handle Exceptions Properly

```java
// ✅ Good - specify which exceptions cause rollback
@Transactional(rollbackFor = Exception.class)
public void createOrder(Order order) {
    easyEntityQuery.insertable(order).executeRows();
}

// ❌ Avoid - checked exceptions don't rollback by default
@Transactional // Won't rollback on checked exceptions
public void createOrder(Order order) throws IOException {
    easyEntityQuery.insertable(order).executeRows();
    // IOException won't trigger rollback!
}

// ✅ Better - specify exception types
@Transactional(rollbackFor = {IOException.class, SQLException.class})
public void createOrder(Order order) throws IOException {
    easyEntityQuery.insertable(order).executeRows();
}
```

### Don't Catch Exceptions in Transactions

```java
// ❌ Bad - swallowing exceptions prevents rollback
@Transactional
public void updateUser(User user) {
    try {
        easyEntityQuery.updatable(user).executeRows();
    } catch (Exception e) {
        log.error("Update failed", e);
        // Transaction won't rollback!
    }
}

// ✅ Good - let exceptions propagate
@Transactional
public void updateUser(User user) {
    easyEntityQuery.updatable(user).executeRows();
    // Exception propagates, transaction rolls back
}

// ✅ Good - rethrow after logging
@Transactional
public void updateUser(User user) {
    try {
        easyEntityQuery.updatable(user).executeRows();
    } catch (Exception e) {
        log.error("Update failed", e);
        throw e; // Rethrow to trigger rollback
    }
}
```

## Common Patterns

### Read-Only Transactions

```java
// Optimize read-only queries
@Transactional(readOnly = true)
public List<User> findAllUsers() {
    return easyEntityQuery.queryable(User.class).toList();
}
```

### Batch Operations in Transaction

```java
@Transactional
public void importUsers(List<User> users) {
    // All in one transaction
    easyEntityQuery.insertable(users)
        .batch()
        .executeRows();
}
```

### Conditional Transactions

```java
@Transactional
public void processOrder(Order order) {
    easyEntityQuery.insertable(order).executeRows();
    
    if (order.getAmount().compareTo(BigDecimal.valueOf(1000)) > 0) {
        // High-value order requires additional processing
        processHighValueOrder(order);
    }
}

// Participates in existing transaction if present
@Transactional(propagation = Propagation.REQUIRED)
private void processHighValueOrder(Order order) {
    // Additional processing
}
```

## Common Issues

### Issue: Transaction Not Rolling Back

**Problem**: Exception thrown but data still committed

**Solution**: 
1. Ensure `@Transactional` has `rollbackFor = Exception.class`
2. Don't catch exceptions without rethrowing
3. Check that transaction is actually started

### Issue: Transaction Timeout

**Problem**: Long-running transaction times out

**Solution**:
```java
@Transactional(timeout = 60) // 60 seconds timeout
public void longRunningOperation() {
    // Your operations
}
```

### Issue: Nested Transaction Not Working

**Problem**: Nested transaction doesn't create savepoint

**Solution**: Use correct propagation:
```java
@Transactional(propagation = Propagation.NESTED)
public void nestedOperation() {
    // Creates savepoint
}
```

## See Also

- [Insert Operations](./insert.md)
- [Update Operations](./update.md)
- [Delete Operations](./delete.md)
- [Batch Operations](./batch.md)

---

If you encounter problems, feel free to join our QQ group: **170029046**

