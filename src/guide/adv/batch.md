---
title: Batch批处理
---
# Batch批处理
`easy-query`如果需要使用batch功能首先需要再链接字符串添加`rewriteBatchedStatements=true`启用参数,默认框架会在配置参数阈值到达后自动合并sql调用`executeBatch`合并,如果需要手动调用或者手动限制不调用可以通过调用`batch`方法

链接字符串启用批处理参数`rewriteBatchedStatements=true`

## 例如
`jdbc:mysql://127.0.0.1:3306/easy-query-test?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&rewriteBatchedStatements=true`

配置名称  | 默认值 | 描述  
--- | --- | --- 
insertBatchThreshold | 1024  | 如果insertable一次性添加对象集合大于等于1024个那么会对其进行相同sql进行合并提高执行效率,链接字符串需要添加`rewriteBatchedStatements=true`,可以通过调用insert或者update的batch方法来手动使用或者禁用
updateBatchThreshold | 1024  | 如果updatable一次性添加对象集合大于等于1024个那么会对其进行相同sql进行合并提高执行效率,链接字符串需要添加`rewriteBatchedStatements=true`,可以通过调用insert或者update的batch方法来手动使用或者禁用


## 代码注意点
::: danger 说明!!!
> 使用`batch`可以有效的提高插入或者更新的性能,但是会导致返回结果不正确,如果使用batch那么自行处理返回结果
:::

```java
easyQuery.insertable(r).batch().executeRows();


==> Preparing: INSERT INTO `t_blog` (`id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`score`,`status`,`order`,`is_top`,`top`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
==> Parameters: 500(String),2000-01-02T01:01:01(LocalDateTime),2000-01-02T01:01:01(LocalDateTime),500(String),500(String),false(Boolean),title500(String),content500(String),http://blog.easy-query.com/500(String),500(Integer),1.2(BigDecimal),1(Integer),1.2(BigDecimal),false(Boolean),false(Boolean)
==> Parameters: 300(String),2000-01-02T01:01:01(LocalDateTime),2000-01-02T01:01:01(LocalDateTime),300(String),300(String),false(Boolean),title300(String),content300(String),http://blog.easy-query.com/300(String),300(Integer),1.2(BigDecimal),1(Integer),1.2(BigDecimal),false(Boolean),false(Boolean)
==> Parameters: 400(String),2000-01-02T01:01:01(LocalDateTime),2000-01-02T01:01:01(LocalDateTime),400(String),400(String),false(Boolean),title400(String),content400(String),http://blog.easy-query.com/400(String),400(Integer),1.2(BigDecimal),1(Integer),1.2(BigDecimal),false(Boolean),false(Boolean)
<== Total: -6
```