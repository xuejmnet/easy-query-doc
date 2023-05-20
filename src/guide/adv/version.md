---
title: 版本号
order: 50
---
# 版本号
`easy-query`提供了自动版本号功能，可以保证在高并发下数据一致性更新的问题。

## demo数据

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
     * 创建时间;创建时间
     */
    private LocalDateTime createTime;
    @Version(strategy = VersionLongStrategy.class)
    private Long version;
}
```
@tab SQL
```sql
-- 数据库表结构语句
create table t_sys_user_version
(
    id varchar(32) not null comment '主键ID'primary key,
    username varchar(50) null comment '姓名',
    phone varchar(250) null comment '手机号加密',
    id_card varchar(500) null comment '身份证编号',
    address text null comment '地址',
    version bigint not null comment '行版本',
    create_time datetime not null comment '创建时间'
)comment '用户版本表';
```
:::

## Api

### EasyVersionStrategy

方法名  | 参数 | 描述  
--- | --- | --- 
nextVersion | 当前版本信息和对应的属性和对象信息  | 返回更新后的版本信息

默认实现系统提供
- `VersionIntStrategy`列对象为`int`,next version为当前version+1
- `VersionLongStrategy`列对象为`long`,next version为当前version+1
- `VersionUUIDStrategy`列对象为`string`,next version为当`UUID.randomUUID().toString().replaceAll("-","")`
- `VersionTimestampStrategy`列对象为`long`,next version为当`System.currentTimeMillis()`

## 测试数据

添加测试数据
```java

//插入
SysUserVersionLong sysUserVersionLong = new SysUserVersionLong();
sysUserVersionLong.setId(id);
sysUserVersionLong.setCreateTime(LocalDateTime.now());
sysUserVersionLong.setVersion(1L);
sysUserVersionLong.setUsername("username"+id);
sysUserVersionLong.setPhone("13232323232");
sysUserVersionLong.setIdCard("0000000000");
sysUserVersionLong.setAddress("浙江省绍兴市越城区城市广场");
long l = easyQuery.insertable(sysUserVersionLong).executeRows();
Assert.assertEquals(1,l);


==> Preparing: INSERT INTO t_sys_user_version (`id`,`username`,`phone`,`id_card`,`address`,`create_time`,`version`) VALUES (?,?,?,?,?,?,?) 
==> Parameters: 1(String),username1(String),13232323232(String),0000000000(String),浙江省绍兴市越城区城市广场(String),2023-04-08T13:49:10.037(LocalDateTime),1(Long)
<== Total: 1


//查询
SysUserVersionLong sysUserVersionLong1 = easyQuery.queryable(SysUserVersionLong.class)
        .whereById(id).firstOrNull();
Assert.assertNotNull(sysUserVersionLong1);


==> Preparing: SELECT t.`id`,t.`username`,t.`phone`,t.`id_card`,t.`address`,t.`create_time`,t.`version` FROM t_sys_user_version t WHERE t.`id` = ? LIMIT 1
==> Parameters: 1(String)
<== Total: 1, Query Use: 3(ms)
```
### 实体更新

```java
long l2 = easyQuery.updatable(sysUserVersionLong1).executeRows();
Assert.assertEquals(1,l2);


==> Preparing: UPDATE t_sys_user_version SET `username` = ?,`phone` = ?,`id_card` = ?,`address` = ?,`create_time` = ?,`version` = ? WHERE `version` = ? AND `id` = ?
==> Parameters: username1(String),13232323232(String),0000000000(String),浙江省绍兴市越城区城市广场(String),2023-04-08T13:49:10(LocalDateTime),2(Long),1(Long),1(String)
<== Total: 1
```

### 表达式更新

表达式删除必须要添加`withVersion`否则将不会使用行版本更新
```java
//whereById主键更新
long l2 = easyQuery.updatable(SysUserVersionLong.class)
        .set(SysUserVersionLong::getPhone, "123")
        .whereById(id)
        .executeRows();
Assert.assertEquals(1,l2);


==> Preparing: UPDATE t_sys_user_version SET `phone` = ? WHERE `id` = ?
==> Parameters: 123(String),2(String)
<== Total: 1

//where表达式更新
long l3 = easyQuery.updatable(SysUserVersionLong.class)
        .set(SysUserVersionLong::getPhone, "123")
        .where(o->o.eq(SysUserVersionLong::getId,id))
        .executeRows();
Assert.assertEquals(1,l3);

==> Preparing: UPDATE t_sys_user_version SET `phone` = ? WHERE `id` = ?
==> Parameters: 123(String),2(String)
<== Total: 1

//表达式更新只需要添加withVersion那么就可以针对当前version进行版本控制
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


## 逻辑删除加版本号
逻辑删除情况下删除数据将会对数据列进行行版本追加,并且where条件也会追加版本号，如果禁用逻辑删,那么行版本的追加只会纯在与where条件的追加
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
     * 创建时间;创建时间
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
-- 数据库表结构语句
create table t_sys_user_version_del
(
    id varchar(32) not null comment '主键ID'primary key,
    username varchar(50) null comment '姓名',
    phone varchar(250) null comment '手机号加密',
    id_card varchar(500) null comment '身份证编号',
    address text null comment '地址',
    version bigint not null comment '行版本',
    create_time datetime not null comment '创建时间',
    deleted tinyint(1) not null comment '是否删除'
)comment '用户版本逻辑删除表';
```
:::

### 实体对象删除
```java
//插入
SysUserVersionLongLogicDel sysUserVersionLongLogicDel = new SysUserVersionLongLogicDel();
sysUserVersionLongLogicDel.setId(id);
sysUserVersionLongLogicDel.setCreateTime(LocalDateTime.now());
sysUserVersionLongLogicDel.setVersion(1L);
sysUserVersionLongLogicDel.setUsername("username"+id);
sysUserVersionLongLogicDel.setPhone("13232323232");
sysUserVersionLongLogicDel.setIdCard("0000000000");
sysUserVersionLongLogicDel.setAddress("浙江省绍兴市越城区城市广场");
sysUserVersionLongLogicDel.setDeleted(false);
long l = easyQuery.insertable(sysUserVersionLongLogicDel).executeRows();
Assert.assertEquals(1,l);


==> Preparing: INSERT INTO t_sys_user_version_del (`id`,`username`,`phone`,`id_card`,`address`,`create_time`,`version`,`deleted`) VALUES (?,?,?,?,?,?,?,?) 
==> Parameters: 4(String),username4(String),13232323232(String),0000000000(String),浙江省绍兴市越城区城市广场(String),2023-04-08T14:01:58.315(LocalDateTime),1(Long),false(Boolean)
<== Total: 1

//逻辑删除
long l2 = easyQuery.deletable(sysUserVersionLongLogicDel).executeRows();
Assert.assertEquals(1,l2);


==> Preparing: UPDATE t_sys_user_version_del SET `deleted` = ?,`version` = ? WHERE `deleted` = ? AND `version` = ? AND `id` = ?
==> Parameters: true(Boolean),2(Long),false(Boolean),1(Long),4(String)
<== Total: 1
```

### 表达式删除
表达式删除必须要添加`withVersion`否则将不会使用行版本删除
```java
SysUserVersionLongLogicDel sysUserVersionLongLogicDel = new SysUserVersionLongLogicDel();
sysUserVersionLongLogicDel.setId(id);
sysUserVersionLongLogicDel.setCreateTime(LocalDateTime.now());
sysUserVersionLongLogicDel.setVersion(1L);
sysUserVersionLongLogicDel.setUsername("username"+id);
sysUserVersionLongLogicDel.setPhone("13232323232");
sysUserVersionLongLogicDel.setIdCard("0000000000");
sysUserVersionLongLogicDel.setAddress("浙江省绍兴市越城区城市广场");
sysUserVersionLongLogicDel.setDeleted(false);
long l = easyQuery.insertable(sysUserVersionLongLogicDel).executeRows();
Assert.assertEquals(1,l);


==> Preparing: INSERT INTO t_sys_user_version_del (`id`,`username`,`phone`,`id_card`,`address`,`create_time`,`version`,`deleted`) VALUES (?,?,?,?,?,?,?,?) 
==> Parameters: 5(String),username5(String),13232323232(String),0000000000(String),浙江省绍兴市越城区城市广场(String),2023-04-08T14:04:11.275(LocalDateTime),1(Long),false(Boolean)
<== Total: 1


long l2 = easyQuery.deletable(SysUserVersionLongLogicDel.class)
        .withVersion(1L)
        .whereById(id).executeRows();
Assert.assertEquals(1,l2);


==> Preparing: UPDATE t_sys_user_version_del SET `deleted` = ?,`version` = ? WHERE `deleted` = ? AND `version` = ? AND `id` = ?
==> Parameters: true(Boolean),2(Long),false(Boolean),1(Long),5(String)
<== Total: 1
```