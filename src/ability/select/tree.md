---
title: 递归树查询
---

## cte
递归树查询使用数据库方言`cte`来实现其功能,如果您是`mysql`那么请使用`mysql 8.x^`版本

## api

`asTreeCTE`和`asTreeCTECustom`

## asTreeCTE

使用该api需要在数据库对象中添加`OneToMany`的关联关系,并且导航属性必须是`List<SelfType>`，系统会将其视为`children`属性,如果实体内部出现多个`OneToMany`的`List<SelfType>`则可以在对应实体上添加`@EastTree("属性名")`来指定具体的属性作为`children`

`asTreeCTE`支持自定义cte内部参数`asTreeCTE(op->{......})`

方法  | 描述 
--- | --- 
setLimitDeep | 限制查询的深度，-1表示不限制(默认)，0表示只查询第一级
setUp | 查询方向,默认向下，参数true向上,false向下(默认)
setUnionAll | 是否使用union all，参数true使用unionAll(默认),false使用union
setCTETableName |  设置cte表别名默认as_tree_cte  
setDeepColumnName | 默认深度列别名

```java
@Table("category")
@Data
@EntityProxy
public class MyCategory implements ProxyEntityAvailable<MyCategory , MyCategoryProxy> {
    @Column(primaryKey = true)
    private String id;
    private String parentId;
    private String name;

    @Navigate(value = RelationTypeEnum.OneToMany,targetProperty = "parentId")
    private List<MyCategory> children;
}

//平铺结构返回
List<MyCategory> treeList = entityQuery.queryable(MyCategory.class)
        .where(m -> {
            m.id().eq("1");
        })
        .asTreeCTE()
        .orderBy(m -> m.id().desc())
        .toList();

//树形结构返回
List<MyCategory> treeList = entityQuery.queryable(MyCategory.class)
        .where(m -> {
            m.id().eq("1");
        })
        .asTreeCTE()
        .orderBy(m -> m.id().desc())
        .toTreeList();

WITH RECURSIVE "as_tree_cte" AS ( 
(SELECT
    0 AS "cte_deep",
    t1."id",
    t1."parent_id",
    t1."name" 
FROM
    "category" t1 
WHERE
    t1."id" = '1')  
UNION ALL  
(SELECT
    t2."cte_deep" + 1 AS "cte_deep",
    t3."id",
    t3."parent_id",
    t3."name" 
    FROM
    "as_tree_cte" t2 
    INNER JOIN  "category" t3  ON t3."parent_id" = t2."id") ) 
SELECT
    t."id",
    t."parent_id",
    t."name" 
FROM
"as_tree_cte" t 
ORDER BY
t."id" DESC
```

如果需要join那么请在`asTreeCTE`后进行join处理

```java
List<Draft2<String, Number>> list = entityQuery.queryable(MyCategory.class)
        .where(m -> {
            m.id().eq("1");
        })
        .asTreeCTE()
        .leftJoin(BlogEntity.class, (m, b2) -> m.id().eq(b2.id()))
        //创建group by 2.3.4之前使用GroupKeys.TABLE1_10.of
        .groupBy((m1, b2) -> GroupKeys.of(m1.name()))
        .select(group -> Select.DRAFT.of(
                group.key1(),
                group.groupTable().t2.star().sum()
        )).toList();



WITH RECURSIVE "as_tree_cte" AS ( 
(SELECT
    0 AS "cte_deep",
    t1."id",
    t1."parent_id",
    t1."name" 
FROM
    "category" t1 
WHERE
    t1."id" = '1')  
UNION ALL  
(SELECT
t2."cte_deep" + 1 AS "cte_deep",
t3."id",
t3."parent_id",
t3."name" 
FROM
"as_tree_cte" t2 
INNER JOIN
"category" t3 
    ON t3."parent_id" = t2."id") )  
SELECT
    t."name" AS "value1",
    SUM(t6."star") AS "value2" 
FROM
"as_tree_cte" t 
LEFT JOIN
"t_blog" t6 ON t6."deleted" = false AND t."id" = t6."id" 
GROUP BY
t."name"
```

## asTreeCTECustom
`asTreeCTECustom`和`asTreeCTE`不同的是不需要再实体内添加`OneToMany`导航属性,使用时指定`id`和`pid`，且无法使用`toTreeList`因为无需添加`List<SelfType>`所以无法构建对应的树形结构
```java
List<MyCategory> treeList = entityQuery.queryable(MyCategory.class)
        .where(m -> {
            m.id().eq("1");
        })
        .asTreeCTECustom(o->o.id(),o->o.parentId())
        .orderBy(m -> m.id().desc())
        .toTreeList();
```