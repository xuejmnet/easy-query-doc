---
title: 事务
---

## 事务

Easy Query提供了支持事务的方法。事务的相关方法如下：

| 方法                                                      | 默认值 | 描述                                                         |
| --------------------------------------------------------- | ------ | ------------------------------------------------------------ |
| beginTransaction                                          | null   | 参数表示数据库隔离级别,默认采用`datasource`的可以自定义 Connection.TRANSACTION_READ_UNCOMMITTED,Connection.TRANSACTION_READ_COMMITTED,Connection.TRANSACTION_REPEATABLE_READ,* Connection.TRANSACTION_SERIALIZABLE. |
| Transaction.commit                                        |        | 提交事务                                                     |
| Transaction.rollback                                      |        | 回滚事务                                                     |
| registerListener(TransactionListener transactionBehavior) |        | 设置当前事务的执行行为,包括提交前提交后等处理                |
| close                                                     |        | 关闭事务,如果事务未提交则自动调用回滚                        |

### 简单环境

在简单环境下使用编程式开启事务。

```java

    @Test
    public void testTransaction() {
        try (Transaction transaction = easyEntityQuery.beginTransaction()) {
            User user = new User();
            user.setName("新用户");
            user.setVersion(1);
            user.setEnabled(true);
            easyEntityQuery.insertable(user).executeRows();
            easyEntityQuery.insertable(user).executeRows();
            if (true) {
                throw new RuntimeException("模拟异常");
            }
            transaction.commit();
        }
    }
```

### SpringBoot环境

每次都需要调用`beginTransaction`方法开启事务和`commit`方法是很麻烦的，
因此在Spring Boot环境下，Easy Query也支持注解式开启事务，即Easy Query支持Spring的`@Transactional`来开启事务了，同时支持嵌套事务。

```java
    @Transaction
    public void testTransaction() {
        User user = new User();
        user.setName("新用户");
        user.setVersion(1);
        user.setEnabled(true);
        easyEntityQuery.insertable(user).executeRows();
        easyEntityQuery.insertable(user).executeRows();
        if (true) {
            throw new RuntimeException("模拟异常");
        }
    }
```