---
title: 原生sql
order: 50
---

# select
`easy-query`的不但支持表达式的强类型sql,也支持手写sql来实现crud

## 查询sqlQuery
强类型结果返回
### 无参数强类型返回
```java
List<BlogEntity> blogEntities = easyQuery.sqlQuery("SELECT * FROM t_blog t", BlogEntity.class);

==> Preparing: SELECT * FROM t_blog t
<== Total: 100

```
### 有参数强类型返回
```java
List<BlogEntity> blogEntities = easyQuery.sqlQuery("SELECT * FROM t_blog t where t.id=?", BlogEntity.class, Collections.singletonList("1"));

==> Preparing: SELECT * FROM t_blog t where t.id=?
==> Parameters: 1(String)
<== Total: 1
```

## 查询sqlQueryMap
`Map`返回默认`key`忽略大小写
### 无参数Map返回
```java
 List<Map<String, Object>> blogs = easyQuery.sqlQueryMap("SELECT * FROM t_blog t");
 
 ==> Preparing: SELECT * FROM t_blog t
<== Total: 100
```

### 有参数Map返回
```java
List<Map<String, Object>> blogs = easyQuery.sqlQueryMap("SELECT * FROM t_blog t  where t.id=?", Collections.singletonList("1"));

==> Preparing: SELECT * FROM t_blog t  where t.id=?
==> Parameters: 1(String)
<== Total: 1
```

## 执行

### 无参数
```java
String newContent= UUID.randomUUID().toString();
long l = easyQuery.sqlExecute("update t_blog set content='"+newContent +"' where id='1'")


==> Preparing: update t_blog set content='3af23d78-86f1-48b1-bc51-ce0e0f63113d' where id='1'
<== Total: 1
```

### 有参数
```java
String newContent= UUID.randomUUID().toString();
long l = easyQuery.sqlExecute("update t_blog set content=? where id=?", Arrays.asList(newContent,"1"));

==> Preparing: update t_blog set content=? where id=?
==> Parameters: 0d93119a-9e57-4d71-a67b-58d24823a88b(String),1(String)
<== Total: 1
```