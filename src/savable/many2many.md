---
title: 多对多保存
order: 40
---

# 多对多保存
非常特殊的一种保存，因为自身和目标都是聚合根且两者无法影响对方表.通过中间表进行关联，多对多有很多种模式
- 多对多带中间表，且中间表无业务属性，比如user,user_role,role
- 多对多带中间表，且中间表存在业务属性，你如company，company_user，user，企业和用户存在雇佣关系，譬如外包人员和某某公司，一家公司可以雇佣多个多个外包人员，多个外包人员也可以同时接单多家公司的任务
- 多对多无中间表，比如这种是一种强行关联，比如用户有多张银行卡，一个人也有多本书，但是银行卡和书本也可以强行通过userId进行多对多关联，这种关联是无中间表关联，当然我们也没办法保存

## 初始化


::: tip 中间表自动生成!!!
> 当且仅当导航属性为多对多且存在中间表，且级联删除配置为`DELETE`的时候(`cascade = CascadeTypeEnum.DELETE`)，中间表才会自动新增和删除,如果级联表配置是`AUTO`或者`SET_NULL`那么框架会认为中间表是参与业务逻辑的就不会自动处理中间表，只会处理中间表的关联关系列的值
:::


::: tabs

@tab 流程图
<img :src="$withBase('/images/many2manysave1.png')">

@tab entity
```java

@Table("t_user")
@Data
@EntityProxy
@FieldNameConstants
@EasyAlias("user")
public class SysUser implements ProxyEntityAvailable<SysUser, SysUserProxy> {
    @Column(primaryKey = true, primaryKeyGenerator = UUIDPrimaryKey.class)
    private String id;
    private String companyId;
    private String name;
    private Integer age;
    private LocalDateTime createTime;


    /**
     *
     **/
    @Navigate(value = RelationTypeEnum.ManyToMany,
            selfProperty = {SysUser.Fields.id},
            selfMappingProperty = {UserRole.Fields.userId},
            mappingClass = UserRole.class,
            targetProperty = {SysRole.Fields.id},
            targetMappingProperty = {UserRole.Fields.roleId}, cascade = CascadeTypeEnum.DELETE)
    private List<SysRole> sysRoleList;
}
```

@tab api接口
```java

    @PostMapping("/create")
    @EasyQueryTrack
    public Object create() {
        ArrayList<SysRole> sysRoles = new ArrayList<>();
        {
            SysRole sysRole = new SysRole();
            sysRole.setId("r1");
            sysRole.setName("管理员");
            sysRole.setCreateTime(LocalDateTime.now());
            sysRoles.add(sysRole);
        }
        {
            SysRole sysRole = new SysRole();
            sysRole.setId("r2");
            sysRole.setName("游客2");
            sysRole.setCreateTime(LocalDateTime.now());
            sysRoles.add(sysRole);
        }
        {

            SysRole sysRole = new SysRole();
            sysRole.setId("r3");
            sysRole.setName("游客3");
            sysRole.setCreateTime(LocalDateTime.now());
            sysRoles.add(sysRole);
        }
        ArrayList<SysUser> sysUsers = new ArrayList<>();

        {
            SysUser sysUser = new SysUser();
            sysUser.setId("u1");
            sysUser.setName("小明");
            sysUser.setAge(18);
            sysUser.setCreateTime(LocalDateTime.now());
            sysUser.setSysRoleList(Arrays.asList(sysRoles.get(0),sysRoles.get(1)));
            sysUsers.add(sysUser);
        }
        {
            SysUser sysUser = new SysUser();
            sysUser.setId("u2");
            sysUser.setName("小红");
            sysUser.setAge(18);
            sysUser.setCreateTime(LocalDateTime.now());
            sysUser.setSysRoleList(Arrays.asList(sysRoles.get(1),sysRoles.get(2)));
            sysUsers.add(sysUser);
        }
        transactionTemplate.execute(status->{
            easyEntityQuery.savable(sysRoles).executeCommand();
            easyEntityQuery.savable(sysUsers).executeCommand();
            return null;
        });
        return "ok";
    }
```

@tab sql
```sql

-- 第1条sql数据
INSERT INTO `t_role` (`id`, `name`, `create_time`)
VALUES ('r1', '管理员', '2025-09-21 18:44:29.196043')
-- 第2条sql数据
INSERT INTO `t_role` (`id`, `name`, `create_time`)
VALUES ('r2', '游客2', '2025-09-21 18:44:29.196095')
-- 第3条sql数据
INSERT INTO `t_role` (`id`, `name`, `create_time`)
VALUES ('r3', '游客3', '2025-09-21 18:44:29.196099')
-- 第4条sql数据
INSERT INTO `t_user` (`id`, `name`, `age`, `create_time`)
VALUES ('u1', '小明', 18, '2025-09-21 18:44:29.196131')
-- 第5条sql数据
INSERT INTO `t_user` (`id`, `name`, `age`, `create_time`)
VALUES ('u2', '小红', 18, '2025-09-21 18:44:29.196246')
-- 第6条sql数据
INSERT INTO `t_user_role` (`id`, `user_id`, `role_id`)
VALUES ('a58f4700a8804ae49d241fc7c2a941e6', 'u1', 'r1')
-- 第7条sql数据
INSERT INTO `t_user_role` (`id`, `user_id`, `role_id`)
VALUES ('6093c72e89d6484fbaa9219b485f4e5f', 'u1', 'r2')
-- 第8条sql数据
INSERT INTO `t_user_role` (`id`, `user_id`, `role_id`)
VALUES ('eadfb13ff44d471ea1e7c821dcfd233a', 'u2', 'r2')
-- 第9条sql数据
INSERT INTO `t_user_role` (`id`, `user_id`, `role_id`)
VALUES ('1d765be1efb44780826aa82715d75c55', 'u2', 'r3')
```

:::

注意我们这边没有操作任意的中间表,全部由框架自动生成(如果多对多未配置为级联删除则不会自动创建和删除关系)，多对多级联并不是级联删除`role`表，而是级联删除中间表也就是`user_role`

## 当用户需要修改角色
原本用户u1,有r1和r2两个角色,现在希望有r2和r3两个角色那么我们应该怎么处理呢

::: tabs

@tab dto
```java

@Data
public class UserRoleRequest {
    private String userId;
    private List<String> roleIds;
}

```

@tab api接口
```java

    @PostMapping("/update")
    @EasyQueryTrack
    public Object update(@RequestBody UserRoleRequest request) {
        SysUser sysUser = easyEntityQuery.queryable(SysUser.class)
                .include(user -> user.sysRoleList())
                .whereById(request.getUserId()).singleNotNull();

        List<SysRole> list = easyEntityQuery.queryable(SysRole.class).whereByIds(request.getRoleIds())
                .toList();
        sysUser.setSysRoleList(list);

        transactionTemplate.execute(status->{
            easyEntityQuery.savable(sysUser).executeCommand();
            return null;
        });

        return "ok";
    }
```
@tab json
```json
{
    "userId":"u1",
    "roleIds":["r2","r3"]
}
```

:::

```sql

-- 第1条sql数据
SELECT `id`, `company_id`, `name`, `age`, `create_time`
FROM `t_user`
WHERE `id` = 'u1'
-- 第2条sql数据
SELECT `user_id`, `role_id`
FROM `t_user_role`
WHERE `user_id` IN ('u1')
-- 第3条sql数据
SELECT t.`id`, t.`name`, t.`create_time`
FROM `t_role` t
WHERE t.`id` IN ('r1', 'r2')
-- 第4条sql数据
SELECT `id`, `name`, `create_time`
FROM `t_role`
WHERE `id` IN ('r2', 'r3')
-- 第5条sql数据
DELETE FROM `t_user_role`
WHERE `user_id` = 'u1'
	AND `role_id` = 'r1'
-- 第6条sql数据
INSERT INTO `t_user_role` (`id`, `user_id`, `role_id`)
VALUES ('81ded72bc9554e428ea2ea5089b5961b', 'u1', 'r3')
```

前三条sql用于查询u1用户目前有多少角色，第四条sql用于查询请求的roleIds是否在系统中,第五第六条sql通过差异变化删除`u1-r1`关系并且插入`u1-r3`关系

## 优化
一次简单的跟换角色但是查询了过多的语句,接下来我们将来讲一种便捷的方式来实现中间表的变更,从而实现user和role的关系变更

1.创建user和user_role的一对多关系
```java

@Table("t_user")
@Data
@EntityProxy
@FieldNameConstants
@EasyAlias("user")
public class SysUser implements ProxyEntityAvailable<SysUser, SysUserProxy> {
    @Column(primaryKey = true, primaryKeyGenerator = UUIDPrimaryKey.class)
    private String id;
    private String companyId;
    private String name;
    private Integer age;
    private LocalDateTime createTime;


    /**
     *
     **/
    @Navigate(value = RelationTypeEnum.ManyToMany,
            selfProperty = {SysUser.Fields.id},
            selfMappingProperty = {UserRole.Fields.userId},
            mappingClass = UserRole.class,
            targetProperty = {SysRole.Fields.id},
            targetMappingProperty = {UserRole.Fields.roleId}, cascade = CascadeTypeEnum.DELETE)
    private List<SysRole> sysRoleList;

    /**
     * 创建userRole的关系
     **/
    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = {SysUser.Fields.id}, targetProperty = {UserRole.Fields.userId},cascade = CascadeTypeEnum.DELETE)
    private List<UserRole> userRoleList;
}
```
这边注意实体关系级联是删除

2.添加SaveKey,因为我们无法再保存时知晓对应的关系所以可以通过savekey来实现业务逻辑上的唯一
```java
@Table("t_user_role")
@Data
@EntityProxy
@FieldNameConstants
@EasyAlias("user_role")
public class UserRole implements ProxyEntityAvailable<UserRole , UserRoleProxy> {
    @Column(primaryKey = true,primaryKeyGenerator = UUIDPrimaryKey.class)
    private String id;
    @SaveKey
    private String userId;
    @SaveKey
    private String roleId;
}
```

编写api
```java

    @PostMapping("/update2")
    @EasyQueryTrack
    public Object update2(@RequestBody UserRoleRequest request) {
        SysUser sysUser = easyEntityQuery.queryable(SysUser.class)
                .include(user -> user.userRoleList())
                .whereById(request.getUserId()).singleNotNull();

        List<SysRole> list = easyEntityQuery.queryable(SysRole.class).whereByIds(request.getRoleIds())
                .toList();
        ArrayList<UserRole> userRoles = new ArrayList<>();
        for (SysRole sysRole : list) {
            UserRole userRole = new UserRole();
            userRole.setUserId(sysUser.getId());
            userRole.setRoleId(sysRole.getId());
            userRoles.add(userRole);
        }
        sysUser.setUserRoleList(userRoles);

        transactionTemplate.execute(status->{
            easyEntityQuery.savable(sysUser).executeCommand();
            return null;
        });

        return "ok";
    }
```
可以看到逻辑依然清晰
```json
{
    "userId":"u1",
    "roleIds":["r2","r3"]
}
```

```sql


-- 第1条sql数据
SELECT `id`, `company_id`, `name`, `age`, `create_time`
FROM `t_user`
WHERE `id` = 'u1'
-- 第2条sql数据
SELECT t.`id`, t.`user_id`, t.`role_id`
FROM `t_user_role` t
WHERE t.`user_id` IN ('u1')
-- 第3条sql数据
SELECT `id`, `name`, `create_time`
FROM `t_role`
WHERE `id` IN ('r2', 'r3')
-- 第4条sql数据
DELETE FROM `t_user_role`
WHERE `id` = '3c9def3553d643739fa5236b3b11186f'
-- 第5条sql数据
INSERT INTO `t_user_role` (`id`, `user_id`, `role_id`)
VALUES ('b37b6e75f0854a809d8c8753296307b3', 'u1', 'r3')
```

最终通过将中间变变成一对多可以让本次sql减少一条,并且这几条sql是缺一不可，首先我们必须要知晓用户是否存在，并且需要知道用户现在的user_role有几条，第二我们需要知道用户请求的roleId是否存在于数据库所以sql3也是必不可少的，那么接下来就是差异diff的sql,至此我们的多对多保存也全部完成了