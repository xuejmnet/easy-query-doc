---
title: Optimistic Lock Version Number
order: 80
---
# Version Number
`easy-query` provides automatic version number functionality, ensuring data consistency during concurrent updates.

## Related Configuration

`noVersionError` defaults to `true`. When an object has a Version field and the update does not include the version field, an error will be thrown. This can be configured via `noVersionError` or `noVersionIgnore`.

## Demo Data

::: code-tabs
@tab SysUserVersionLong
```java

@Data
@Table(value = "t_sys_user_version")
public class SysUserVersionLong {
    @Column(primaryKey = true)
    private String id;
    private String username;
    private String phone;
    private String idCard;
    private String address;
    /**
     * Create Time
     */
    private LocalDateTime createTime;
    @Version(strategy = VersionLongStrategy.class)
    private Long version;
}
```
@tab SQL
```sql
-- Database table structure statement
create table t_sys_user_version
(
    id varchar(32) not null comment 'Primary Key' primary key,
    username varchar(50) null comment 'Username',
    phone varchar(250) null comment 'Phone Encrypted',
    id_card varchar(500) null comment 'ID Card Number',
    address text null comment 'Address',
    version bigint not null comment 'Row Version',
    create_time datetime not null comment 'Create Time'
)comment 'User Version Table';
```
:::

## API

### EasyVersionStrategy

Method Name  | Parameters | Description  
--- | --- | --- 
nextVersion | Current version info and corresponding property and object info  | Returns updated version info

Default implementations provided by the system:
- `VersionIntStrategy` Column object is `int`, next version is current version+1
- `VersionLongStrategy` Column object is `long`, next version is current version+1
- `VersionUUIDStrategy` Column object is `string`, next version is `UUID.randomUUID().toString().replaceAll("-","")`
- `VersionTimestampStrategy` Column object is `long`, next version is `System.currentTimeMillis()` (not recommended)

## Test Data

Add test data:
```java

//Insert
SysUserVersionLong sysUserVersionLong = new SysUserVersionLong();
sysUserVersionLong.setId(id);
sysUserVersionLong.setCreateTime(LocalDateTime.now());
sysUserVersionLong.setVersion(1L);
sysUserVersionLong.setUsername("username"+id);
sysUserVersionLong.setPhone("13232323232");
sysUserVersionLong.setIdCard("0000000000");
sysUserVersionLong.setAddress("Zhejiang Province Shaoxing City Yuecheng District City Square");
long l = easyQuery.insertable(sysUserVersionLong).executeRows();
Assert.assertEquals(1,l);


==> Preparing: INSERT INTO t_sys_user_version (`id`,`username`,`phone`,`id_card`,`address`,`create_time`,`version`) VALUES (?,?,?,?,?,?,?) 
==> Parameters: 1(String),username1(String),13232323232(String),0000000000(String),Zhejiang Province Shaoxing City Yuecheng District City Square(String),2023-04-08T13:49:10.037(LocalDateTime),1(Long)
<== Total: 1


//Query
SysUserVersionLong sysUserVersionLong1 = easyQuery.queryable(SysUserVersionLong.class)
        .whereById(id).firstOrNull();
Assert.assertNotNull(sysUserVersionLong1);


==> Preparing: SELECT t.`id`,t.`username`,t.`phone`,t.`id_card`,t.`address`,t.`create_time`,t.`version` FROM t_sys_user_version t WHERE t.`id` = ? LIMIT 1
==> Parameters: 1(String)
<== Total: 1, Query Use: 3(ms)
```
### Entity Update

```java
long l2 = easyQuery.updatable(sysUserVersionLong1).executeRows();
Assert.assertEquals(1,l2);


==> Preparing: UPDATE t_sys_user_version SET `username` = ?,`phone` = ?,`id_card` = ?,`address` = ?,`create_time` = ?,`version` = ? WHERE `version` = ? AND `id` = ?
==> Parameters: username1(String),13232323232(String),0000000000(String),Zhejiang Province Shaoxing City Yuecheng District City Square(String),2023-04-08T13:49:10(LocalDateTime),2(Long),1(Long),1(String)
<== Total: 1
```

### Expression Update

Expression deletion must add `withVersion`, otherwise row version update will not be used. If `noVersionError` is configured or not configured (default true), an error will be thrown. You can ignore with `noVersionIgnore`.
```java
//whereById primary key update
long l2 = easyQuery.updatable(SysUserVersionLong.class)
        .set(SysUserVersionLong::getPhone, "123")
        .whereById(id)
        .noVersionIgnore()
        .executeRows();
Assert.assertEquals(1,l2);


==> Preparing: UPDATE t_sys_user_version SET `phone` = ? WHERE `id` = ?
==> Parameters: 123(String),2(String)
<== Total: 1

//where expression update
long l3 = easyQuery.updatable(SysUserVersionLong.class)
        .noVersionIgnore()
        .set(SysUserVersionLong::getPhone, "123")
        .where(o->o.eq(SysUserVersionLong::getId,id))
        .executeRows();
Assert.assertEquals(1,l3);

==> Preparing: UPDATE t_sys_user_version SET `phone` = ? WHERE `id` = ?
==> Parameters: 123(String),2(String)
<== Total: 1

//Expression update only needs to add withVersion for version control on the current version
long l4 = easyQuery.updatable(SysUserVersionLong.class)
        .set(SysUserVersionLong::getPhone, "123")
        .withVersion(1L)
        .where(o->o.eq(SysUserVersionLong::getId,id))
        .executeRows();
Assert.assertEquals(1,l4);


==> Preparing: UPDATE t_sys_user_version SET `phone` = ?,`version` = ? WHERE `version` = ? AND `id` = ?
==> Parameters: 123(String),2(Long),1(Long),2(String)
<== Total: 1
```


## Logical Delete with Version Number
When logical delete is enabled, deleting data will append the row version to the data column, and the where condition will also append the version number. If logical delete is disabled, row version appending only exists in the where condition appending. If `noVersionError` is configured or not configured (default true), an error will be thrown. You can ignore with `noVersionIgnore`.
::: code-tabs
@tab SysUserVersionLongLogicDel
```java
@Data
@Table(value = "t_sys_user_version_del")
public class SysUserVersionLongLogicDel {
    @Column(primaryKey = true)
    private String id;
    private String username;
    private String phone;
    private String idCard;
    private String address;
    /**
     * Create Time
     */
    private LocalDateTime createTime;
    @Version(strategy = VersionLongStrategy.class)
    private Long version;

    @LogicDelete(strategy = LogicDeleteStrategyEnum.BOOLEAN)
    private Boolean deleted;
}
```
@tab SQL
```sql
-- Database table structure statement
create table t_sys_user_version_del
(
    id varchar(32) not null comment 'Primary Key' primary key,
    username varchar(50) null comment 'Username',
    phone varchar(250) null comment 'Phone Encrypted',
    id_card varchar(500) null comment 'ID Card Number',
    address text null comment 'Address',
    version bigint not null comment 'Row Version',
    create_time datetime not null comment 'Create Time',
    deleted tinyint(1) not null comment 'Is Deleted'
)comment 'User Version Logical Delete Table';
```
:::

### Entity Object Delete
```java
//Insert
SysUserVersionLongLogicDel sysUserVersionLongLogicDel = new SysUserVersionLongLogicDel();
sysUserVersionLongLogicDel.setId(id);
sysUserVersionLongLogicDel.setCreateTime(LocalDateTime.now());
sysUserVersionLongLogicDel.setVersion(1L);
sysUserVersionLongLogicDel.setUsername("username"+id);
sysUserVersionLongLogicDel.setPhone("13232323232");
sysUserVersionLongLogicDel.setIdCard("0000000000");
sysUserVersionLongLogicDel.setAddress("Zhejiang Province Shaoxing City Yuecheng District City Square");
sysUserVersionLongLogicDel.setDeleted(false);
long l = easyQuery.insertable(sysUserVersionLongLogicDel).executeRows();
Assert.assertEquals(1,l);


==> Preparing: INSERT INTO t_sys_user_version_del (`id`,`username`,`phone`,`id_card`,`address`,`create_time`,`version`,`deleted`) VALUES (?,?,?,?,?,?,?,?) 
==> Parameters: 4(String),username4(String),13232323232(String),0000000000(String),Zhejiang Province Shaoxing City Yuecheng District City Square(String),2023-04-08T14:01:58.315(LocalDateTime),1(Long),false(Boolean)
<== Total: 1

//Logical delete
long l2 = easyQuery.deletable(sysUserVersionLongLogicDel).executeRows();
Assert.assertEquals(1,l2);


==> Preparing: UPDATE t_sys_user_version_del SET `deleted` = ?,`version` = ? WHERE `deleted` = ? AND `version` = ? AND `id` = ?
==> Parameters: true(Boolean),2(Long),false(Boolean),1(Long),4(String)
<== Total: 1
```

### Expression Delete
Expression delete must add `withVersion`, otherwise row version delete will not be used.
```java
SysUserVersionLongLogicDel sysUserVersionLongLogicDel = new SysUserVersionLongLogicDel();
sysUserVersionLongLogicDel.setId(id);
sysUserVersionLongLogicDel.setCreateTime(LocalDateTime.now());
sysUserVersionLongLogicDel.setVersion(1L);
sysUserVersionLongLogicDel.setUsername("username"+id);
sysUserVersionLongLogicDel.setPhone("13232323232");
sysUserVersionLongLogicDel.setIdCard("0000000000");
sysUserVersionLongLogicDel.setAddress("Zhejiang Province Shaoxing City Yuecheng District City Square");
sysUserVersionLongLogicDel.setDeleted(false);
long l = easyQuery.insertable(sysUserVersionLongLogicDel).executeRows();
Assert.assertEquals(1,l);


==> Preparing: INSERT INTO t_sys_user_version_del (`id`,`username`,`phone`,`id_card`,`address`,`create_time`,`version`,`deleted`) VALUES (?,?,?,?,?,?,?,?) 
==> Parameters: 5(String),username5(String),13232323232(String),0000000000(String),Zhejiang Province Shaoxing City Yuecheng District City Square(String),2023-04-08T14:04:11.275(LocalDateTime),1(Long),false(Boolean)
<== Total: 1


long l2 = easyQuery.deletable(SysUserVersionLongLogicDel.class)
        .withVersion(1L)
        .whereById(id).executeRows();
Assert.assertEquals(1,l2);


==> Preparing: UPDATE t_sys_user_version_del SET `deleted` = ?,`version` = ? WHERE `deleted` = ? AND `version` = ? AND `id` = ?
==> Parameters: true(Boolean),2(Long),false(Boolean),1(Long),5(String)
<== Total: 1



long l2 = easyQuery.deletable(SysUserVersionLongLogicDel.class)
        .noVersionIgnore()
        .whereById(id).executeRows();
Assert.assertEquals(1,l2);


==> Preparing: UPDATE t_sys_user_version_del SET `deleted` = ? WHERE `deleted` = ? AND `id` = ?
==> Parameters: true(Boolean),2(Long),false(Boolean),1(Long),5(String)
<== Total: 1
```

