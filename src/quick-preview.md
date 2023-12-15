---
title: 快速了解 🔥
---

## 预览
```java
List<SysUser> users = entityQuery.queryable(SysUser.class)
                            .where(o->{
                                o.id().eq("1");
                                o.id().eq(false,"1");//true/false表示是否使用该条件默认true
                                o.id().like("123");
                                o.id().like(false,"123");
                            })
                            .groupBy(o->o.id())
                            .select(o->o.id().concat(o.id().count().as(o.phone())))
                            .toList();

==> Preparing: SELECT t.`id`,COUNT(t.`id`) AS `phone` FROM `t_sys_user` t WHERE t.`id` = ? AND t.`id` LIKE ? GROUP BY t.`id`
==> Parameters: 1(String),%123%(String)

List<SysUser> users = entityQuery.queryable(SysUser.class)
                            .where(o->{
                                o.id().eq("1");// t.`id` = 1
                                o.id().eq(o.createTime().dateTimeFormat("yyyy-MM-dd"));// t.`id` = DATE_FORMAT(t.`create_time`,'%Y-%m-%d')
                                o.createTime().dateTimeFormat("yyyy-MM-dd").eq("2023-01-02");//DATE_FORMAT(t.`create_time`,'%Y-%m-%d') = '2023-01-02'
                                o.name().nullDefault("unknown").like("123");
                                o.phone().isNotBank();
                            })
                            .select(o->o.FETCHER.id().name().phone().departName())
                            .toList();

==> Preparing: SELECT t.`id`,t.`name`,t.`phone`,t.`depart_name` FROM `a222` t WHERE t.`id` = ? AND  t.`id` = DATE_FORMAT(t.`create_time`,'%Y-%m-%d') AND DATE_FORMAT(t.`create_time`,'%Y-%m-%d') = ? AND IFNULL(t.`name`,?) LIKE ? AND (t.`phone` IS NOT NULL AND t.`phone` <> '' AND LTRIM(t.`phone`) <> '')
==> Parameters: 1(String),2023-01-02(String),unknown(String),%123%(String)
```
## 快速实现表单查询
业务场景
<img src="/admin-form-query.png" >

### 数据库对象
```java
@Table("t_sys_user")
@EntityFileProxy
@Data
public class SysUser implements ProxyEntityAvailable<SysUser , SysUserProxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;
    private String account;
    private String departName;
    private String phone;
    private LocalDateTime createTime;

    @Override
    public Class<SysUserProxy> proxyTableClass() {
        return SysUserProxy.class;
    }
}
```
其中`ProxyEntityAvailable<SysUser , SysUserProxy>`接口和`SysUserProxy`全部由插件自动生成,如果你不想用插件那么可以将注解`@EntityFileProxy`换成`@EntityProxy`
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


//快速实现分页查询 条件过滤默认非null不加入条件如果是字符串还需满足非空
List<SysUser> pageResult = entityQuery.queryable(SysUser.class)
                .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT)//非null并且字符串非空即加入条件
                .where(o -> {
                        o.name().like(sysUserQueryRequest.getName());
                        o.account().like(sysUserQueryRequest.getAccount());
                        o.phone().like(sysUserQueryRequest.getPhone());
                        o.departName().like(sysUserQueryRequest.getDepartName());
                        o.createTime().rangeClosed(sysUserQueryRequest.getCreateTimeBegin(), sysUserQueryRequest.getCreateTimeEnd());
                })
                .toList();
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


//快速实现分页查询 动态对象条件
EasyPageResult<SysUser> pageResult = entityQuery.queryable(SysUser.class)
                        .whereObject(sysUserQueryRequest)
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


//快速实现分页查询 手动处理是否需要添加到查询条件中
List<SysUser> pageResult = entityQuery.queryable(SysUser.class)
        .where(o -> {//条件里面判断是否要继续
                o.name().like(EasyStringUtil.isNotBlank(sysUserQueryRequest.getName()),sysUserQueryRequest.getName());
                o.account().like(EasyStringUtil.isNotBlank(sysUserQueryRequest.getAccount()),sysUserQueryRequest.getAccount());
                o.phone().like(EasyStringUtil.isNotBlank(sysUserQueryRequest.getPhone()),sysUserQueryRequest.getPhone());
                o.departName().like(EasyStringUtil.isNotBlank(sysUserQueryRequest.getDepartName()),sysUserQueryRequest.getDepartName());
                o.createTime().rangeClosed(sysUserQueryRequest.getCreateTimeBegin() != null,sysUserQueryRequest.getCreateTimeBegin(),sysUserQueryRequest.getCreateTimeEnd() != null, sysUserQueryRequest.getCreateTimeEnd());
        })
        .toList();


List<SysUser> pageResult = entityQuery.queryable(SysUser.class)//where第一个参数表示后面的条件是否需要追加上去
        .where(EasyStringUtil.isNotBlank(sysUserQueryRequest.getName()),o->o.name().like(sysUserQueryRequest.getName()))
        .where(EasyStringUtil.isNotBlank(sysUserQueryRequest.getAccount()),o->o.account().like(sysUserQueryRequest.getAccount()))
        .where(EasyStringUtil.isNotBlank(sysUserQueryRequest.getPhone()),o->o.phone().like(sysUserQueryRequest.getPhone()))
        .where(sysUserQueryRequest.getCreateTimeBegin() != null,o->o.createTime().gt(sysUserQueryRequest.getCreateTimeBegin()))
        .where(sysUserQueryRequest.getCreateTimeEnd() != null,o->o.createTime().lt(sysUserQueryRequest.getCreateTimeEnd()))
        .toList();
```