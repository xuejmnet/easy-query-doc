---
title: Batch Processing
order: 50
---

# Batch Processing
If `easy-query` needs to use batch functionality, first you need to add `rewriteBatchedStatements=true` to the connection string to enable parameters (MySQL). By default, the framework will automatically merge SQL calls to `executeBatch` after the configured parameter threshold is reached. If you need to manually call or manually restrict calls, you can do so by calling the `batch` method.

The connection string settings provided in the documentation may not be suitable for all versions. Please refer to the actual situation and test with local database insertions at the 100,000 level to determine if it is effective.

`MySQL` requires enabling batch processing parameters in the connection string `rewriteBatchedStatements=true`, other databases should check their own documentation and may not need `addBatch`, `executeBatch`

`SQL Server` add `useBulkCopyForBatchInsert=true;` to the connection string to enable this feature. Batch related link https://learn.microsoft.com/en-us/sql/connect/jdbc/use-bulk-copy-api-batch-insert-operation?view=sql-server-ver16 

## Example
`jdbc:mysql://127.0.0.1:3306/easy-query-test?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&rewriteBatchedStatements=true`

Configuration Name  | Default Value | Description  
--- | --- | --- 
insertBatchThreshold | 1024  | If insertable adds an object collection at once with 1024 or more, it will merge the same SQL to improve execution efficiency. The connection string needs to add `rewriteBatchedStatements=true` (MySQL). You can manually use or disable it by calling the batch method of insert or update
updateBatchThreshold | 1024  | If updatable adds an object collection at once with 1024 or more, it will merge the same SQL to improve execution efficiency. The connection string needs to add `rewriteBatchedStatements=true` (MySQL). You can manually use or disable it by calling the batch method of insert or update


## Code Considerations
::: danger Notice!!!
> Using `batch` can effectively improve insert or update performance, but it will cause incorrect return results. If you use batch, please handle the return results yourself
:::


```java
easyQuery.insertable(r).batch().executeRows();


==> Preparing: INSERT INTO `t_blog` (`id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`score`,`status`,`order`,`is_top`,`top`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
==> Parameters: 500(String),2000-01-02T01:01:01(LocalDateTime),2000-01-02T01:01:01(LocalDateTime),500(String),500(String),false(Boolean),title500(String),content500(String),http://blog.easy-query.com/500(String),500(Integer),1.2(BigDecimal),1(Integer),1.2(BigDecimal),false(Boolean),false(Boolean)
==> Parameters: 300(String),2000-01-02T01:01:01(LocalDateTime),2000-01-02T01:01:01(LocalDateTime),300(String),300(String),false(Boolean),title300(String),content300(String),http://blog.easy-query.com/300(String),300(Integer),1.2(BigDecimal),1(Integer),1.2(BigDecimal),false(Boolean),false(Boolean)
==> Parameters: 400(String),2000-01-02T01:01:01(LocalDateTime),2000-01-02T01:01:01(LocalDateTime),400(String),400(String),false(Boolean),title400(String),content400(String),http://blog.easy-query.com/400(String),400(Integer),1.2(BigDecimal),1(Integer),1.2(BigDecimal),false(Boolean),false(Boolean)
<== Total: -6
```


### Possible Reasons

From online information

The executeBatch method returns an int array

int[] executeBatch() throws SQLException;

The values in the array can be one of the following:

A number greater than or equal to zero, indicating the command was processed successfully, and is an update count, giving the number of rows in the database affected by the command execution
A value of SUCCESS_NO_INFO (-2), indicating the command was processed successfully, but the number of affected rows is unknown
If one of the commands in the batch update fails to execute properly, this method throws BatchUpdateException. The JDBC driver may or may not continue to process the remaining commands. But the driver's behavior is bound to the specific DBMS, either always continuing to process commands or never continuing to process commands. If the driver continues to process, the method will return EXECUTE_FAILED (-3).
————————————————
Copyright statement: This article is an original article by CSDN blogger "左林右李02", following CC 4.0 BY-SA copyright agreement, please attach the original source link and this statement for reprint.
Original link: https://blog.csdn.net/u011624157/article/details/110734184


## Related Search
`Batch Submission` `Batch Insert` `Batch Operations` `Batch Processing`

