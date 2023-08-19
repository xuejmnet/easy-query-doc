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
close |   | 关闭事务,如果事务为提交则自动调用回滚

## 如何开启
`springboot`如果当前方法没有添加`@Transactional`注解,内部调用`this.method()`的非代理对象方法调用事务,哪怕`this.method()`有注解`@Transactional`也会让事务失效,有时候你可能需要这个方法那么可以在`springboot`中通过beginTransaction来开启事务,默认不支持和springboot的嵌套事务,不可以在`@Transactional`内开启`easy-query`的事务
```java

public void test(){
        try(Transaction transaction = easyQuery.beginTransaction()){

            TestUserMysql0 testUserMysql1 = new TestUserMysql0();
            testUserMysql1.setId("123321123321xxx");
            testUserMysql1.setAge(1);
            testUserMysql1.setName("xxx");
            easyQuery.insertable(testUserMysql1).executeRows();
            test1();
            if(true){
                throw new RuntimeException("错误了");
            }
            transaction.commit();
        }

}
    public void test1(){

        TestUserMysql0 testUserMysql1 = new TestUserMysql0();
        testUserMysql1.setId("123321123321xxx1");
        testUserMysql1.setAge(1);
        testUserMysql1.setName("xxx");
        easyQuery.insertable(testUserMysql1).executeRows();
    }
```