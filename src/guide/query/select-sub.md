---
title: select子查询
order: 90
---

# select子查询
`easy-query`可以轻松的实现`select 子查询`,并且有手动和自动两种方式具体sql如下

实现sql
```sql
select a,b,c,(select count(t1.id) from a t1) as xx from b
```

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

## 自动模式
查询企业id和企业下有多少个用户
```java

List<Draft2<String, Long>> list = easyEntityQuery.queryable(Company.class)
        .where(com -> com.name().like("xx公司"))
        .select(com -> Select.DRAFT.of(
                com.id(),
                com.users().count()
        )).toList();

SELECT
    t.`id` AS `value1`,
    (SELECT
        COUNT(*) 
    FROM
        `t_user` t2 
    WHERE
        t2.`company_id` = t.`id`) AS `value2` 
FROM
    `t_company` t 
WHERE
    t.`name` LIKE '%xx公司%'
```


查询企业id和企业下有多少个姓李的用户数

```java

List<Draft2<String, Long>> list = easyEntityQuery.queryable(Company.class)
        .where(com -> com.name().like("xx公司"))
        .select(com -> Select.DRAFT.of(
                com.id(),
                com.users().where(user->user.name().likeMatchLeft("李")).count()
        )).toList();
        

SELECT
    t.`id` AS `value1`,
    (SELECT
        COUNT(*) 
    FROM
        `t_user` t2 
    WHERE
        t2.`company_id` = t.`id` 
        AND t2.`name` LIKE '李%') AS `value2` 
FROM
    `t_company` t 
WHERE
    t.`name` LIKE '%xx公司%'
```

查询企业id和企业下有多少个姓李的用户年龄总和
```java

List<Draft2<String, Integer>> list = easyEntityQuery.queryable(Company.class)
        .where(com -> com.name().like("xx公司"))
        .select(com -> Select.DRAFT.of(
                com.id(),
                com.users().where(user->user.name().likeMatchLeft("李")).sum(x->x.age())
        )).toList();


SELECT
    t.`id` AS `value1`,
    IFNULL((SELECT
        SUM(t2.`age`) 
    FROM
        `t_user` t2 
    WHERE
        t2.`company_id` = t.`id` 
        AND t2.`name` LIKE '李%'),
    0) AS `value2` 
FROM
    `t_company` t 
WHERE
    t.`name` LIKE '%xx公司%'
```
## 手动模式
::: code-tabs
@tab 对象模式
```java
@Data
@EntityFileProxy
public class TopicSubQueryBlog implements ProxyEntityAvailable<TopicSubQueryBlog , TopicSubQueryBlogProxy> {
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;
    private Long blogCount;

}

@tab lambda模式

```java

@Data
public class TopicSubQueryBlog {
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;
    private Long blogCount;
}

```

:::


::: code-tabs
@tab 对象模式
```java
        List<TopicSubQueryBlog> list = easyEntityQuery.queryable(Topic.class)
                .where(o -> o.title().isNotNull())
                .select(o->{
                    TopicSubQueryBlogProxy r =new TopicSubQueryBlogProxy();
                    r.selectAll(o);
                    Query<Long> subQuery = easyEntityQuery.queryable(BlogEntity.class).where(x -> x.id().eq(o.id())).selectCount();//count(*)
                    r.blogCount().setSubQuery(subQuery);
                    return r;
                }).toList();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time`,(SELECT COUNT(*) FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = t.`id`) AS `blog_count` FROM `t_topic` t WHERE t.`title` IS NOT NULL
==> Parameters: false(Boolean)
<== Time Elapsed: 6(ms)
<== Total: 99
        
```
@tab lambda模式

```java

Queryable<BlogEntity> queryable = easyQuery.queryable(BlogEntity.class);
List<TopicSubQueryBlog> list = easyQuery
        .queryable(Topic.class)
        .where(t -> t.isNotNull(Topic::getTitle))
        .select(TopicSubQueryBlog.class, o -> o.columnAll().columnSubQueryAs(()->{
            return queryable.where(x -> x.eq(o, BlogEntity::getId, Topic::getId)).select(Long.class, x->x.columnCount(BlogEntity::getId));
        }, TopicSubQueryBlog::getBlogCount)).toList();


==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time`,(SELECT COUNT(t1.`id`) AS `id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = t.`id`) AS `blog_count` FROM `t_topic` t WHERE t.`title` IS NOT NULL
==> Parameters: false(Boolean)
<== Time Elapsed: 4(ms)
<== Total: 99
```
:::


## sum连表统计

::: code-tabs
@tab 对象模式
```java

        List<TopicSubQueryBlog> list = easyEntityQuery.queryable(Topic.class)
                .where(o -> o.title().isNotNull())
                .select(o->new TopicSubQueryBlogProxy()
                    .selectAll(o)
                    .blogCount().setSubQuery(//SUM(t1.`star`)
                            easyEntityQuery.queryable(BlogEntity.class).where(x -> x.id().eq(o.id())).select(x -> new LongProxy(x.star().sum()))
                        )
                ).toList();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time`,(SELECT SUM(t1.`star`) FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = t.`id`) AS `blog_count` FROM `t_topic` t WHERE t.`title` IS NOT NULL
==> Parameters: false(Boolean)
<== Time Elapsed: 6(ms)
<== Total: 99
        
```
@tab lambda模式

```java

Queryable<BlogEntity> queryable = easyQuery.queryable(BlogEntity.class);
List<TopicSubQueryBlog> list = easyQuery
        .queryable(Topic.class)
        .where(t -> t.isNotNull(Topic::getTitle))
        .select(TopicSubQueryBlog.class, o -> o.columnAll().columnSubQueryAs(()->{
            return queryable.where(x -> x.eq(o, BlogEntity::getId, Topic::getId)).select(Long.class, x->x.columnSum(BlogEntity::getStar));
        }, TopicSubQueryBlog::getBlogCount)).toList();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time`,(SELECT SUM(t1.`star`) AS `star` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = t.`id`) AS `blog_count` FROM `t_topic` t WHERE t.`title` IS NOT NULL
==> Parameters: false(Boolean)
<== Time Elapsed: 14(ms)
<== Total: 99

```
:::

`max`、`min` 同理