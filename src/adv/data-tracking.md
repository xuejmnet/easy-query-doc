---
title: 数据追踪
order: 70
---

# 数据追踪
`easy-query`提供了数据追踪功能,对于对象更新方法提供了数据追踪,保证对象更新时的差异更新而不是全量更新。**默认需要自行开启**
如果存在复杂对象通过`ValueConverter`转换的需要实现重写`hashcode`和`equals`

## spring-boot
如何开启数据追踪
- 添加注解`@EasyQueryTrack`
- 查询使用`asTracking`使当前查询结果添加到追踪上下文，或者使用`easyQuery.addTracking()`手动添加到当前上下文

## 非spring-boot环境

```java

TrackManager trackManager = easyQuery.getRuntimeContext().getTrackManager();
try {
    trackManager.begin();
    //todo

}finally {
    trackManager.release();
}
```

`@EasyQueryTrack`注解的本质就是`TrackManager.begin`

## api

### TrackManager

方法名  | 参数 | 描述  
--- | --- | --- 
begin | 无  | 当前上下文开启追踪 需要和`release()`成对使用
release | 无  | 当前上下文开启追踪 需要和`begin()`成对使用
currentThreadTracking | 无  | 当前线程是否开启了追踪
getCurrentTrackContext | 无  | 获取当前线程追踪上下文没有这返回null

### Queryable

方法名  | 参数 | 描述  
--- | --- | --- 
asTracking | 无  | 当前查询条件使用追踪需开启`TrackManager.begin`
asNoTracking | 无  | 当前查询条件不使用追踪查询,默认就是不使用

### EasyQuery

方法名  | 参数 | 描述  
--- | --- | --- 
addTracking | entity  | 添加`entity`到当前追踪上下文,如果当前对象不是数据库对象(无法获取数据库表名),将抛出错误,如果对象已被追踪且追踪对象并不是同一个对象也将抛错

添加追踪主要用于对当前对象进行对象属性赋值前后的变更进行记录,可以动态生成`update`sql语句,实现智能差异更新


## demo数据

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
     * 创建时间;创建时间
     */
    private LocalDateTime createTime;
}
```
@tab SQL
```sql
-- 数据库表结构语句
create table t_sys_user_track
(
    id varchar(32) not null comment '主键ID'primary key,
    username varchar(50) null comment '姓名',
    phone varchar(250) null comment '手机号加密',
    id_card varchar(500) null comment '身份证编号',
    address text null comment '地址',
    create_time datetime not null comment '创建时间'
)comment '用户追踪表';
```
:::


## 新增测试数据
```java

SysUserTrack sysUserTrack = new SysUserTrack();
sysUserTrack.setId("1");
sysUserTrack.setUsername("Username1");
sysUserTrack.setPhone("13232323232");
sysUserTrack.setIdCard("123456789000");
sysUserTrack.setAddress("浙江省绍兴市越城区城市广场");
sysUserTrack.setCreateTime(LocalDateTime.now());
long l1 = easyQuery.insertable(sysUserTrack).executeRows();


==> Preparing: INSERT INTO t_sys_user_track (`id`,`username`,`phone`,`id_card`,`address`,`create_time`) VALUES (?,?,?,?,?,?) 
==> Parameters: 1(String),Username1(String),WMHRmY6r4m7ir0KM/D4OmQ==kDIASgoxeZjK9M+Qem/HOQ==56QkLSvTa6eE9qpwjbYsRQ==kDIASgoxeZjK9M+Qem/HOQ==56QkLSvTa6eE9qpwjbYsRQ==kDIASgoxeZjK9M+Qem/HOQ==56QkLSvTa6eE9qpwjbYsRQ==kDIASgoxeZjK9M+Qem/HOQ==(String),OdaUl359SnxsbyZqMa05XA==496uK1pkxUbdvpq0A7q0uQ==PvHC30OSR7k27xKN36fp4g==+ta/N+1ivZAjSILsqeNjfA==hs33W1UJDlk1EFb0Nyhorw==biDnRYo+Cm5gy0r913fTOA==2Rp6hA8XQx2oIhTRo4ni2g==I6gg2QDr60Qx1Eq186LAGQ==9g+7mmP9u30kPOFB+Xcz+A==(String),eKgY/tc5Kw0qzXu0+uUSLg==hbIDJTImQweEbbz5EMyrHg==JI18Lhiq/kcrrVsD1fA++A==6S2NNhbFy4VM0KNPmMEXHw==A000VaxSBiODisuUDxv7Ow==d8z7fptVPIYMvhiXTVuJBA==xCHjVvd0uVW7a435+66hCQ==YQcXESYWhm+0Knr39sU2OA==SkFE84TtzzfqHWZFbfaDKw==IeaiLfgcyjbsMsCN7HvNVw==V7c/MZCC2DqXidxGrYe2RQ==n1Pxqra9C9LFh5xCY6xj6w==(String),2023-04-07T23:08:49.059(LocalDateTime)
<== Total: 1
```

## 追踪更新

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

//追踪更新查询
==> Preparing: SELECT t.`id`,t.`username`,t.`phone`,t.`id_card`,t.`address`,t.`create_time` FROM t_sys_user_track t WHERE t.`id` = ? LIMIT 1
==> Parameters: 1(String)
<== Total: 1, Query Use: 3(ms)

//差异更新 只更新了phone字段并未对所有的字段进行更新
==> Preparing: UPDATE t_sys_user_track SET `phone` = ? WHERE `id` = ?
==> Parameters: seCzI8LaMkjGIkSftziv9A==1eLkqpKHc0+z7SJdQatSPQ==3v3uw7ZFJo0Tpx49WSMSMQ==LtHsv2KAcRLroXaP4dZfUA==8ea6UUe6hNYz5k+VZDQzVA==Si5J530HvuEvZzZfAqnznA==VlCQ13+oM8wbOny682WILQ==(String),1(String)
<== Total: 1
```

## 开启追踪后对象属性不修改更新
如果开启了追踪并且对象属性没有进行修改那么本次更新将不会生成sql执行数据库，因为程序认为本次没有任何需要变更的数据也就不需要更新
```java

TrackManager trackManager = easyQuery.getRuntimeContext().getTrackManager();
try {
    trackManager.begin();
    SysUserTrack sysUserTrack1 = easyQuery.queryable(SysUserTrack.class).asTracking()
            .whereById(id).firstOrNull();
    boolean b = easyQuery.addTracking(sysUserTrack1);
    Assert.assertFalse(b);

    //因为开启了追踪但是对象数据没有发生变化,所以不生成sql不使用更新;
    long l2 = easyQuery.updatable(sysUserTrack1).executeRows();
    Assert.assertEquals(0, l2);

} finally {
    trackManager.release();
}


==> Preparing: SELECT t.`id`,t.`username`,t.`phone`,t.`id_card`,t.`address`,t.`create_time` FROM t_sys_user_track t WHERE t.`id` = ? LIMIT 1
==> Parameters: 5(String)
<== Total: 1, Query Use: 6(ms)
```


## 不追踪更新
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

//全字段更新
==> Preparing: UPDATE t_sys_user_track SET `username` = ?,`phone` = ?,`id_card` = ?,`address` = ?,`create_time` = ? WHERE `id` = ?
==> Parameters: Username1(String),seCzI8LaMkjGIkSftziv9A==1eLkqpKHc0+z7SJdQatSPQ==3v3uw7ZFJo0Tpx49WSMSMQ==LtHsv2KAcRLroXaP4dZfUA==8ea6UUe6hNYz5k+VZDQzVA==Si5J530HvuEvZzZfAqnznA==VlCQ13+oM8wbOny682WILQ==(String),OdaUl359SnxsbyZqMa05XA==496uK1pkxUbdvpq0A7q0uQ==PvHC30OSR7k27xKN36fp4g==+ta/N+1ivZAjSILsqeNjfA==hs33W1UJDlk1EFb0Nyhorw==biDnRYo+Cm5gy0r913fTOA==2Rp6hA8XQx2oIhTRo4ni2g==I6gg2QDr60Qx1Eq186LAGQ==9g+7mmP9u30kPOFB+Xcz+A==(String),eKgY/tc5Kw0qzXu0+uUSLg==hbIDJTImQweEbbz5EMyrHg==JI18Lhiq/kcrrVsD1fA++A==6S2NNhbFy4VM0KNPmMEXHw==A000VaxSBiODisuUDxv7Ow==d8z7fptVPIYMvhiXTVuJBA==xCHjVvd0uVW7a435+66hCQ==YQcXESYWhm+0Knr39sU2OA==SkFE84TtzzfqHWZFbfaDKw==IeaiLfgcyjbsMsCN7HvNVw==V7c/MZCC2DqXidxGrYe2RQ==n1Pxqra9C9LFh5xCY6xj6w==(String),2023-04-08T09:57:08(LocalDateTime),6(String)
<== Total: 1
==> Preparing: SELECT t.`id`,t.`username`,t.`phone`,t.`id_card`,t.`address`,t.`create_time` FROM t_sys_user_track t WHERE t.`id` = ? LIMIT 1
==> Parameters: 6(String)
<== Total: 1, Query Use: 2(ms)
```

::: danger
！！！如果数据未被差异更新,请确认是否已经开启`TrackManager.begin`,spring-boot环境下直接使用`@EasyQueryTrack`注解,且是否使用`asTracking`查询或者查询后是否已经添加到当前追踪上下,如果数据量过多建议采用非tracking查询，需要更新前手动调用`easyQuery.addTracking()`来实现,否则每个查询对象都会添加到当前追踪上下文中

！！！如果数据未被差异更新,请确认是否已经开启`TrackManager.begin`,spring-boot环境下直接使用`@EasyQueryTrack`注解,且是否使用`asTracking`查询或者查询后是否已经添加到当前追踪上下,如果数据量过多建议采用非tracking查询，需要更新前手动调用`easyQuery.addTracking()`来实现,否则每个查询对象都会添加到当前追踪上下文中

！！！如果数据未被差异更新,请确认是否已经开启`TrackManager.begin`,spring-boot环境下直接使用`@EasyQueryTrack`注解,且是否使用`asTracking`查询或者查询后是否已经添加到当前追踪上下,如果数据量过多建议采用非tracking查询，需要更新前手动调用`easyQuery.addTracking()`来实现,否则每个查询对象都会添加到当前追踪上下文中
:::