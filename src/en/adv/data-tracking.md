---
title: Data Tracking
order: 70
---

# Data Tracking
`easy-query` provides data tracking functionality for object update methods, ensuring differential updates instead of full updates when updating objects. **Must be manually enabled by default.**
If complex objects are converted using `ValueConverter`, you need to override `hashcode` and `equals`.

## Spring-Boot
How to enable data tracking:
- Add annotation `@EasyQueryTrack`
- Use `asTracking` in queries to add query results to the tracking context, or use `easyQuery.addTracking()` to manually add to the current context

## Non-Spring-Boot Environment

```java

TrackManager trackManager = easyQuery.getRuntimeContext().getTrackManager();
try {
    trackManager.begin();
    //todo

}finally {
    trackManager.release();
}
```

The essence of the `@EasyQueryTrack` annotation is `TrackManager.begin`

## API

### TrackManager

Method Name  | Parameters | Description  
--- | --- | --- 
begin | None  | Enable tracking for current context, needs to be used in pair with `release()`
release | None  | Current context enable tracking, needs to be used in pair with `begin()`
currentThreadTracking | None  | Whether current thread has tracking enabled
getCurrentTrackContext | None  | Get current thread tracking context, returns null if none

### Queryable

Method Name  | Parameters | Description  
--- | --- | --- 
asTracking | None  | Current query condition uses tracking, requires `TrackManager.begin` to be enabled
asNoTracking | None  | Current query condition does not use tracking query, default is not using

### EasyQuery

Method Name  | Parameters | Description  
--- | --- | --- 
addTracking | entity  | Add `entity` to current tracking context. If current object is not a database object (cannot get database table name), will throw error. If object is already tracked and the tracked object is not the same object, will also throw error

Adding tracking is mainly used to record changes before and after assigning object properties to the current object, dynamically generating `update` SQL statements, achieving intelligent differential updates.

## Demo Data

::: code-tabs
@tab SysUserTrack
```java
@Data
@Table(value = "t_sys_user_track")
public class SysUserTrack{
    @Column(primaryKey = true)
    private String id;
    private String username;
    @Encryption(strategy = DefaultAesEasyEncryptionStrategy.class, supportQueryLike = true)
    private String phone;
    @Encryption(strategy = DefaultAesEasyEncryptionStrategy.class, supportQueryLike = true)
    private String idCard;
    @Encryption(strategy = DefaultAesEasyEncryptionStrategy.class, supportQueryLike = true)
    private String address;
    /**
     * Create Time
     */
    private LocalDateTime createTime;
}
```
@tab SQL
```sql
-- Database table structure statement
create table t_sys_user_track
(
    id varchar(32) not null comment 'Primary Key' primary key,
    username varchar(50) null comment 'Username',
    phone varchar(250) null comment 'Phone Encrypted',
    id_card varchar(500) null comment 'ID Card Number',
    address text null comment 'Address',
    create_time datetime not null comment 'Create Time'
)comment 'User Tracking Table';
```
:::


## Add Test Data
```java

SysUserTrack sysUserTrack = new SysUserTrack();
sysUserTrack.setId("1");
sysUserTrack.setUsername("Username1");
sysUserTrack.setPhone("13232323232");
sysUserTrack.setIdCard("123456789000");
sysUserTrack.setAddress("Zhejiang Province Shaoxing City Yuecheng District City Square");
sysUserTrack.setCreateTime(LocalDateTime.now());
long l1 = easyQuery.insertable(sysUserTrack).executeRows();


==> Preparing: INSERT INTO t_sys_user_track (`id`,`username`,`phone`,`id_card`,`address`,`create_time`) VALUES (?,?,?,?,?,?) 
==> Parameters: 1(String),Username1(String),WMHRmY6r4m7ir0KM/D4OmQ==kDIASgoxeZjK9M+Qem/HOQ==56QkLSvTa6eE9qpwjbYsRQ==kDIASgoxeZjK9M+Qem/HOQ==56QkLSvTa6eE9qpwjbYsRQ==kDIASgoxeZjK9M+Qem/HOQ==56QkLSvTa6eE9qpwjbYsRQ==kDIASgoxeZjK9M+Qem/HOQ==(String),OdaUl359SnxsbyZqMa05XA==496uK1pkxUbdvpq0A7q0uQ==PvHC30OSR7k27xKN36fp4g==+ta/N+1ivZAjSILsqeNjfA==hs33W1UJDlk1EFb0Nyhorw==biDnRYo+Cm5gy0r913fTOA==2Rp6hA8XQx2oIhTRo4ni2g==I6gg2QDr60Qx1Eq186LAGQ==9g+7mmP9u30kPOFB+Xcz+A==(String),eKgY/tc5Kw0qzXu0+uUSLg==hbIDJTImQweEbbz5EMyrHg==JI18Lhiq/kcrrVsD1fA++A==6S2NNhbFy4VM0KNPmMEXHw==A000VaxSBiODisuUDxv7Ow==d8z7fptVPIYMvhiXTVuJBA==xCHjVvd0uVW7a435+66hCQ==YQcXESYWhm+0Knr39sU2OA==SkFE84TtzzfqHWZFbfaDKw==IeaiLfgcyjbsMsCN7HvNVw==V7c/MZCC2DqXidxGrYe2RQ==n1Pxqra9C9LFh5xCY6xj6w==(String),2023-04-07T23:08:49.059(LocalDateTime)
<== Total: 1
```

## Tracking Update

```java
TrackManager trackManager = easyQuery.getRuntimeContext().getTrackManager();
try {
    trackManager.begin();
    SysUserTrack sysUserTrack1 = easyQuery.queryable(SysUserTrack.class).asTracking()
            .whereById("1").firstOrNull();
    boolean b = easyQuery.addTracking(sysUserTrack1);
    Assert.assertFalse(b);
    sysUserTrack1.setPhone("9876543210");
    long l2 = easyQuery.updatable(sysUserTrack1).executeRows();
    Assert.assertEquals(1,l2);
    SysUserTrack sysUserTrack2 = easyQuery.queryable(SysUserTrack.class)
            .whereById("1").firstOrNull();
    Assert.assertNotNull(sysUserTrack2);
    Assert.assertEquals("9876543210",sysUserTrack2.getPhone());
}finally {
    trackManager.release();
}

//Tracking update query
==> Preparing: SELECT t.`id`,t.`username`,t.`phone`,t.`id_card`,t.`address`,t.`create_time` FROM t_sys_user_track t WHERE t.`id` = ? LIMIT 1
==> Parameters: 1(String)
<== Total: 1, Query Use: 3(ms)

//Differential update - only updated phone field, not all fields
==> Preparing: UPDATE t_sys_user_track SET `phone` = ? WHERE `id` = ?
==> Parameters: seCzI8LaMkjGIkSftziv9A==1eLkqpKHc0+z7SJdQatSPQ==3v3uw7ZFJo0Tpx49WSMSMQ==LtHsv2KAcRLroXaP4dZfUA==8ea6UUe6hNYz5k+VZDQzVA==Si5J530HvuEvZzZfAqnznA==VlCQ13+oM8wbOny682WILQ==(String),1(String)
<== Total: 1
```

## Update Without Modifying Object Properties After Enabling Tracking
If tracking is enabled and object properties are not modified, then this update will not generate SQL to execute against the database, because the program considers there is no data to change and no update is needed.
```java

TrackManager trackManager = easyQuery.getRuntimeContext().getTrackManager();
try {
    trackManager.begin();
    SysUserTrack sysUserTrack1 = easyQuery.queryable(SysUserTrack.class).asTracking()
            .whereById(id).firstOrNull();
    boolean b = easyQuery.addTracking(sysUserTrack1);
    Assert.assertFalse(b);

    //Because tracking is enabled but object data has not changed, no SQL is generated and no update is used;
    long l2 = easyQuery.updatable(sysUserTrack1).executeRows();
    Assert.assertEquals(0, l2);

} finally {
    trackManager.release();
}


==> Preparing: SELECT t.`id`,t.`username`,t.`phone`,t.`id_card`,t.`address`,t.`create_time` FROM t_sys_user_track t WHERE t.`id` = ? LIMIT 1
==> Parameters: 5(String)
<== Total: 1, Query Use: 6(ms)
```


## Non-Tracking Update
```java

TrackManager trackManager = easyQuery.getRuntimeContext().getTrackManager();
try {
    trackManager.begin();
    SysUserTrack sysUserTrack1 = easyQuery.queryable(SysUserTrack.class)
            .whereById(id).firstOrNull();
    sysUserTrack1.setPhone("9876543210");
    long l2 = easyQuery.updatable(sysUserTrack1).executeRows();
    Assert.assertEquals(1, l2);
    SysUserTrack sysUserTrack2 = easyQuery.queryable(SysUserTrack.class)
            .whereById(id).firstOrNull();
    Assert.assertNotNull(sysUserTrack2);
    Assert.assertEquals("9876543210", sysUserTrack2.getPhone());

} finally {
    trackManager.release();
}



==> Preparing: SELECT t.`id`,t.`username`,t.`phone`,t.`id_card`,t.`address`,t.`create_time` FROM t_sys_user_track t WHERE t.`id` = ? LIMIT 1
==> Parameters: 6(String)
<== Total: 1, Query Use: 2(ms)

//Full field update
==> Preparing: UPDATE t_sys_user_track SET `username` = ?,`phone` = ?,`id_card` = ?,`address` = ?,`create_time` = ? WHERE `id` = ?
==> Parameters: Username1(String),seCzI8LaMkjGIkSftziv9A==1eLkqpKHc0+z7SJdQatSPQ==3v3uw7ZFJo0Tpx49WSMSMQ==LtHsv2KAcRLroXaP4dZfUA==8ea6UUe6hNYz5k+VZDQzVA==Si5J530HvuEvZzZfAqnznA==VlCQ13+oM8wbOny682WILQ==(String),OdaUl359SnxsbyZqMa05XA==496uK1pkxUbdvpq0A7q0uQ==PvHC30OSR7k27xKN36fp4g==+ta/N+1ivZAjSILsqeNjfA==hs33W1UJDlk1EFb0Nyhorw==biDnRYo+Cm5gy0r913fTOA==2Rp6hA8XQx2oIhTRo4ni2g==I6gg2QDr60Qx1Eq186LAGQ==9g+7mmP9u30kPOFB+Xcz+A==(String),eKgY/tc5Kw0qzXu0+uUSLg==hbIDJTImQweEbbz5EMyrHg==JI18Lhiq/kcrrVsD1fA++A==6S2NNhbFy4VM0KNPmMEXHw==A000VaxSBiODisuUDxv7Ow==d8z7fptVPIYMvhiXTVuJBA==xCHjVvd0uVW7a435+66hCQ==YQcXESYWhm+0Knr39sU2OA==SkFE84TtzzfqHWZFbfaDKw==IeaiLfgcyjbsMsCN7HvNVw==V7c/MZCC2DqXidxGrYe2RQ==n1Pxqra9C9LFh5xCY6xj6w==(String),2023-04-08T09:57:08(LocalDateTime),6(String)
<== Total: 1
==> Preparing: SELECT t.`id`,t.`username`,t.`phone`,t.`id_card`,t.`address`,t.`create_time` FROM t_sys_user_track t WHERE t.`id` = ? LIMIT 1
==> Parameters: 6(String)
<== Total: 1, Query Use: 2(ms)
```

::: danger
!!! If data is not being differentially updated, please confirm if `TrackManager.begin` has been enabled. In a spring-boot environment, use the `@EasyQueryTrack` annotation directly. Check if you're using `asTracking` query or if you've added the query result to the current tracking context. If data volume is large, it's recommended to use non-tracking queries and manually call `easyQuery.addTracking()` before updating, otherwise every queried object will be added to the current tracking context.

!!! If data is not being differentially updated, please confirm if `TrackManager.begin` has been enabled. In a spring-boot environment, use the `@EasyQueryTrack` annotation directly. Check if you're using `asTracking` query or if you've added the query result to the current tracking context. If data volume is large, it's recommended to use non-tracking queries and manually call `easyQuery.addTracking()` before updating, otherwise every queried object will be added to the current tracking context.

!!! If data is not being differentially updated, please confirm if `TrackManager.begin` has been enabled. In a spring-boot environment, use the `@EasyQueryTrack` annotation directly. Check if you're using `asTracking` query or if you've added the query result to the current tracking context. If data volume is large, it's recommended to use non-tracking queries and manually call `easyQuery.addTracking()` before updating, otherwise every queried object will be added to the current tracking context.
:::

