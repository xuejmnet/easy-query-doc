---
title: 事务
---

## 手动事务
`easy-query`默认提供手动开启事务的功能,并且在springboot下可以跨非代理方法生效,唯一限制就是当前线程内的

## api

方法  | 默认值 | 描述  
--- | --- | --- 
beginTransaction | null  | 参数表示数据库隔离级别,默认采用`datasource`的可以自定义 Connection.TRANSACTION_READ_UNCOMMITTED,Connection.TRANSACTION_READ_COMMITTED,Connection.TRANSACTION_REPEATABLE_READ,* Connection.TRANSACTION_SERIALIZABLE.
Transaction.commit |   | 提交事务
Transaction.rollback |   | 回滚事务
registerListener(TransactionListener transactionBehavior)| | 设置当前事务的执行行为,包括提交前提交后等处理
close |   | 关闭事务,如果事务未提交则自动调用回滚

## 如何开启

支持`spring`的`@Transactional`包括嵌套事务,也支持eq手动开事务管理,不可以在`@Transactional`内开启`easy-query`的事务

总结如果用了spring的事务不要手动开启eq的事务两者2选一
```java
//手动事务
public void test(){
        try(Transaction transaction = easyQuery.beginTransaction()){

            TestUserMysql0 testUserMysql1 = new TestUserMysql0();
            testUserMysql1.setId("123321123321xxx");
            testUserMysql1.setAge(1);
            testUserMysql1.setName("xxx");
            easyQuery.insertable(testUserMysql1).executeRows();
            if(true){
                throw new RuntimeException("错误了");
            }
            transaction.commit();
        }

}
```