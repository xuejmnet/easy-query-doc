---
title: Recursive Tree Query
order: 120
---

## CTE
Recursive tree query uses database dialect `CTE` to implement its functionality. If you are using `MySQL`, please use `mysql 8.x^` version.

::: tip Summary!!!
> `query().asTreeCTE()` is a standard structure. Functionally, it recursively goes up or down on the `query()` part. For example, if `query()` part queries 10 records, it will recursively process these 10 records. You can specify upward or downward recursion, and it supports `selectAutoInclude`.
:::

## API

`asTreeCTE` and `asTreeCTECustom`

## asTreeCTE

Using this API requires adding `OneToMany` association relationship in the database object, and the navigation property must be `List<SelfType>`. The system will treat it as `children` property. If multiple `OneToMany` `List<SelfType>` appear within the entity, you can add `@EasyTree("propertyName")` on the corresponding entity to specify the specific property as `children`.

`asTreeCTE` supports custom CTE internal parameters `asTreeCTE(op->{......})`

Method  | Description 
--- | --- 
setLimitDeep | Limit query depth, -1 means no limit (default), 0 means only query first level
setUp | Query direction, default downward, parameter true upward, false downward (default)
setUnionAll | Whether to use union all, parameter true use unionAll (default), false use union
setCTETableName | Set CTE table alias, default as_tree_cte  
setDeepColumnName | Default depth column alias
setChildFilter | Set child filter condition

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

//Flat structure return
List<MyCategory> treeList = entityQuery.queryable(MyCategory.class)
        .where(m -> {
            m.id().eq("1");
        })
        .asTreeCTE()
        .orderBy(m -> m.id().desc())
        .toList();

//Tree structure return
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

If you need to join, please perform join processing after `asTreeCTE`:

```java
List<Draft2<String, Number>> list = entityQuery.queryable(MyCategory.class)
        .where(m -> {
            m.id().eq("1");
        })
        .asTreeCTE()
        .leftJoin(BlogEntity.class, (m, b2) -> m.id().eq(b2.id()))
        //Create group by, use GroupKeys.TABLE1_10.of before 2.3.4
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

If you need to add extra filter for child:
```java
List<MyCategory> treeList = entityQuery.queryable(MyCategory.class)
            .where(m -> {
                m.id().eq("1");
            }).asTreeCTE(op->{
                op.setChildFilter(child->{
                    child.name().like("123");
                });
            })
            .toTreeList();


-- 1st SQL data
WITH RECURSIVE "as_tree_cte" AS ( (SELECT
    0 AS "cte_deep",
    t1."id",
    t1."parent_id",
    t1."name" 
FROM
    "category" t1 
WHERE
    t1."id" = '1')  
UNION
ALL  (SELECT
t2."cte_deep" + 1 AS "cte_deep",
t3."id",
t3."parent_id",
t3."name" 
FROM
"as_tree_cte" t2 
INNER JOIN
"category" t3 
    ON t3."parent_id" = t2."id" 
WHERE
t2."name" LIKE '%123%') )  SELECT
t."id",
t."parent_id",
t."name" 
FROM
"as_tree_cte" t
```

## asTreeCTECustom
`asTreeCTECustom` is different from `asTreeCTE` in that it doesn't require adding `OneToMany` navigation property in the entity. Specify `id` and `pid` when using, and cannot use `toTreeList` because without adding `List<SelfType>`, it's impossible to build the corresponding tree structure.
```java
List<MyCategory> treeList = entityQuery.queryable(MyCategory.class)
        .where(m -> {
            m.id().eq("1");
        })
        .asTreeCTECustom(o->o.id(),o->o.parentId())
        .orderBy(m -> m.id().desc())
        .toTreeList();
```

