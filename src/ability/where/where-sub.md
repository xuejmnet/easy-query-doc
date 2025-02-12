---
title: where 子查询
---
# 子查询
`easy-qeury`提供支持子查询包括`exists`、`not exists`、`in`、`not in`,并且有手动和自动两种方式


## 自动子查询

## 数据库对象模型
::: code-tabs
@tab 企业表
```java
@Table("t_company")
@Data
@EntityProxy
@FieldNameConstants
@EasyAlias("com")
public class Company implements ProxyEntityAvailable<Company , CompanyProxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;
    private LocalDateTime createTime;

    @Navigate(value = RelationTypeEnum.OneToMany,targetProperty = SysUser.Fields.companyId)
    private List<SysUser> users;
}
```

@tab 用户表
```java
@Table("t_user")
@Data
@EntityProxy
@FieldNameConstants
@EasyAlias("user")
public class SysUser implements ProxyEntityAvailable<SysUser , SysUserProxy> {
    @Column(primaryKey = true)
    private String id;
    private String companyId;
    private String name;
    private Integer age;
    private LocalDateTime createTime;


    @Navigate(value = RelationTypeEnum.ManyToOne,selfProperty = Fields.companyId)
    private Company company;
}
```
::: 

### 查询企业存在用户成年的
```java
List<Company> list = easyEntityQuery.queryable(Company.class)
        .where(com -> {
                com.users().where(u -> {
                        u.age().gt(18);
                }).any();
        }).toList();
//当上述子查询有且只有一个条件比如age>18有且只有一个条件时,并且是用来断言当前条件的,那么可以使用flatElement来展开如下写法和上述写法一样

List<Company> list = easyEntityQuery.queryable(Company.class)
        .where(com -> {
                com.users().flatElement().age().gt(18);
        }).toList();

SELECT
    t.`id`,
    t.`name`,
    t.`create_time` 
FROM
    `t_company` t 
WHERE
    EXISTS (
        SELECT
            1 
        FROM
            `t_user` t1 
        WHERE
            t1.`company_id` = t.`id` 
            AND t1.`age` > 18 LIMIT 1
    )
```


### 查询企业存条件是企业所有用户平均年龄大于18
```java
List<Company> list = easyEntityQuery.queryable(Company.class)
        .where(com -> {
                com.users().avg(u->u.age()).gt(BigDecimal.valueOf(18));
        }).toList();



SELECT
    t.`id`,
    t.`name`,
    t.`create_time` 
FROM
    `t_company` t 
WHERE
    IFNULL((SELECT
        AVG(t1.`age`) 
    FROM
        `t_user` t1 
    WHERE
        t1.`company_id` = t.`id`),0) > '18'
```





## EXISTS

::: code-tabs
@tab 对象模式
```java
//SELECT * FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?
EntityQueryable<BlogEntityProxy, BlogEntity> subQueryable = easyEntityQuery.queryable(BlogEntity.class)
        .where(o -> o.id().eq("1" ));

List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .where(o -> o.expression().exists(() -> {
                return subQueryable.where(q -> q.id().eq(o.id()));
        })).toList();


==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE EXISTS (SELECT 1 FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ? AND t1.`id` = t.`id`)
==> Parameters: false(Boolean),1(String)
<== Time Elapsed: 4(ms)
<== Total: 1
```


::: 


## NOT EXISTS

::: code-tabs
@tab 对象模式
```java
//SELECT * FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?
        EntityQueryable<BlogEntityProxy, BlogEntity> subQueryable = easyEntityQuery.queryable(BlogEntity.class)
                .where(o -> o.id().eq("1" ));

        List<Topic> list = easyEntityQuery.queryable(Topic.class)
                .where(o -> o.notExists(() -> {
                    return subQueryable.where(q -> q.id().eq(o.id()));
                })).toList();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE NOT EXISTS (SELECT 1 FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ? AND t1.`id` = t.`id`)
==> Parameters: false(Boolean),1(String)
<== Time Elapsed: 3(ms)
<== Total: 100
```


::: 


## IN

::: code-tabs
@tab 对象模式

```java
//SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?
        EntityQueryable<StringProxy, String> idQueryable = easyEntityQuery.queryable(BlogEntity.class)
                .where(o -> o.id().eq("123" ))
                .select(o -> new StringProxy(o.id()));//如果子查询in string那么就需要select string，如果integer那么select要integer 两边需要一致

        List<Topic> list = easyEntityQuery.queryable(Topic.class)
                .where(o -> o.id().in(idQueryable)).toList();


==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`id` IN (SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?)
==> Parameters: false(Boolean),123(String)
<== Time Elapsed: 4(ms)
<== Total: 0
```


::: 

## NOT IN

::: code-tabs
@tab 对象模式

```java
//SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?
        EntityQueryable<StringProxy, String> idQueryable = easyEntityQuery.queryable(BlogEntity.class)
                .where(o -> o.id().eq("123" ))
                .select(o -> new StringProxy(o.id()));//如果子查询in string那么就需要select string，如果integer那么select要integer 两边需要一致

        List<Topic> list = easyEntityQuery.queryable(Topic.class)
                .where(o -> o.id().notIn(idQueryable)).toList();


==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`id` NOT IN (SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?)
==> Parameters: false(Boolean),1(String)
<== Time Elapsed: 4(ms)
<== Total: 100
```

@tab lambda模式

```java
//SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?
Queryable<String> idQueryable = easyQuery.queryable(BlogEntity.class)
            .where(o -> o.eq(BlogEntity::getId, "1"))
            .select(String.class, o -> o.column(BlogEntity::getId));

List<Topic> list = easyQuery
        .queryable(Topic.class).where(o -> o.notIn(Topic::getId, idQueryable)).toList();


==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`id` NOT IN (SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?)
==> Parameters: false(Boolean),1(String)
<== Time Elapsed: 4(ms)
<== Total: 100
```
::: 