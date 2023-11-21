---
title: 快速了解 🔥
---

## 快速实现表单查询
业务场景
<img src="/admin-form-query.png" >

### 数据库对象
```java
@Table("t_sys_user")
@EntityProxy
@Data
public class SysUser {
    @Column(primaryKey = true)
    private String id;
    private String name;
    private String account;
    private String departName;
    private String phone;
    private LocalDateTime createTime;
}
```
### 查询对象
```java

@Data
public class SysUserQueryRequest {
    @EasyWhereCondition
    private String name;
    @EasyWhereCondition
    private String account;
    @EasyWhereCondition
    private String departName;
    @EasyWhereCondition
    private String phone;
    @EasyWhereCondition(type = EasyWhereCondition.Condition.RANGE_LEFT_CLOSED,propName = "createTime" )
    private LocalDateTime createTimeBegin;
    @EasyWhereCondition(type = EasyWhereCondition.Condition.RANGE_RIGHT_CLOSED,propName = "createTime" )
    private LocalDateTime createTimeEnd;
}
```
### 表单查询1
```java
//由前端上传json
SysUserQueryRequest sysUserQueryRequest = new SysUserQueryRequest();
sysUserQueryRequest.setName("小明");
sysUserQueryRequest.setCreateTimeBegin(LocalDateTime.now().plusDays(-10));
sysUserQueryRequest.setCreateTimeEnd(LocalDateTime.now());
sysUserQueryRequest.setPhone("180");

//需要查询的表代理由apt自动生成entity添加注解@EntityProxy即可
SysUserProxy sysUserTable = SysUserProxy.createTable();

//快速实现分页查询 动态对象条件
SysUserProxy sysUserTable = SysUserProxy.createTable();
EasyPageResult<SysUser> pageResult = easyProxyQuery.queryable(sysUserTable)
        .whereObject(sysUserQueryRequest)
        .toPageResult(1, 10);
```
```log
==> Preparing: SELECT COUNT(*) FROM `t_sys_user` WHERE `name` LIKE ? AND `phone` LIKE ? AND `create_time` >= ? AND `create_time` <= ?
==> Parameters: %小明%(String),%180%(String),2023-11-11T21:50:19.835(LocalDateTime),2023-11-21T21:50:19.836(LocalDateTime)

==> Preparing: SELECT `id`,`name`,`account`,`depart_name`,`phone`,`create_time` FROM `t_sys_user` WHERE `name` LIKE ? AND `phone` LIKE ? AND `create_time` >= ? AND `create_time` <= ? LIMIT 10
==> Parameters: %小明%(String),%180%(String),2023-11-11T21:51:34.740(LocalDateTime),2023-11-21T21:51:34.740(LocalDateTime)
```

### 表单查询2
```java
//由前端上传json
SysUserQueryRequest sysUserQueryRequest = new SysUserQueryRequest();
sysUserQueryRequest.setName("小明");
sysUserQueryRequest.setCreateTimeBegin(LocalDateTime.now().plusDays(-10));
sysUserQueryRequest.setCreateTimeEnd(LocalDateTime.now());
sysUserQueryRequest.setPhone("180");

//需要查询的表代理由apt自动生成entity添加注解@EntityProxy即可
SysUserProxy sysUserTable = SysUserProxy.createTable();

//快速实现分页查询 条件过滤默认非null不加入条件如果是字符串还需满足非空
EasyPageResult<SysUser> pageResult = easyProxyQuery.queryable(sysUserTable)
        .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT)
        .where(o -> o
                .like(sysUserTable.name(), sysUserQueryRequest.getName())
                .like(sysUserTable.account(), sysUserQueryRequest.getAccount())
                .like(sysUserTable.phone(), sysUserQueryRequest.getPhone())
                .like(sysUserTable.departName(), sysUserQueryRequest.getDepartName())
                .rangeClosed(sysUserTable.createTime(), sysUserQueryRequest.getCreateTimeBegin(), sysUserQueryRequest.getCreateTimeEnd())
        )
        .toPageResult(1, 10);
```

### 表单查询3
```java
//由前端上传json
SysUserQueryRequest sysUserQueryRequest = new SysUserQueryRequest();
sysUserQueryRequest.setName("小明");
sysUserQueryRequest.setCreateTimeBegin(LocalDateTime.now().plusDays(-10));
sysUserQueryRequest.setCreateTimeEnd(LocalDateTime.now());
sysUserQueryRequest.setPhone("180");

//需要查询的表代理由apt自动生成entity添加注解@EntityProxy即可
SysUserProxy sysUserTable = SysUserProxy.createTable();

//快速实现分页查询 手动处理是否需要添加到查询条件中
EasyPageResult<SysUser> pageResult = easyProxyQuery.queryable(sysUserTable)
        .where(o -> o
                .like(EasyStringUtil.isNotBlank(sysUserQueryRequest.getName()),sysUserTable.name(), sysUserQueryRequest.getName())
                .like(EasyStringUtil.isNotBlank(sysUserQueryRequest.getAccount()),sysUserTable.account(), sysUserQueryRequest.getAccount())
                .like(EasyStringUtil.isNotBlank(sysUserQueryRequest.getPhone()),sysUserTable.phone(), sysUserQueryRequest.getPhone())
                .like(EasyStringUtil.isNotBlank(sysUserQueryRequest.getDepartName()),sysUserTable.departName(), sysUserQueryRequest.getDepartName())
                .rangeClosed(sysUserTable.createTime(),sysUserQueryRequest.getCreateTimeBegin()!=null, sysUserQueryRequest.getCreateTimeBegin(),sysUserQueryRequest.getCreateTimeEnd()!=null, sysUserQueryRequest.getCreateTimeEnd())
        )
        .toPageResult(1, 10);
```