---
title: Comment Related Queries
order: 50
---

# Comment Related Queries
This chapter mainly lets users know about comment-related pagination returns and recursive subqueries and related functions

## Return Comment Recursive List
```java

@Data
@Table("t_comment")
@EntityProxy
@EasyAlias("t_comment")
@EasyAssertMessage("未找到对应的评论信息")
public class Comment implements ProxyEntityAvailable<Comment, CommentProxy> {
    @Column(primaryKey = true, comment = "评论id")
    private String id;
    @Column(comment = "父id")
    private String parentId;
    @Column(comment = "帖子内容")
    private String content;
    @Column(comment = "用户id", nullable = false)
    private String userId;
    @Column(comment = "帖子id", nullable = false)
    private String postId;
    @Column(comment = "回复时间")
    private LocalDateTime createAt;


    /**
     * Child comments
     **/
    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = {CommentProxy.Fields.id}, targetProperty = {CommentProxy.Fields.parentId})
    private List<Comment> children;
    /**
     * Commenter
     **/
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {CommentProxy.Fields.userId}, targetProperty = {UserProxy.Fields.id})
    private User user;
}
```


::: tip Note!!!
> If an object table wants to support recursive queries, it must meet the following conditions:
- Has a OneToMany relationship navigation property
- This navigation property must be itself
:::

Return recursive query list

## asTreeCte

To use this api, you need to add a `OneToMany` association relationship in the database object, and the navigation property must be `List<SelfType>`. The system will treat it as the `children` property. If there are multiple `OneToMany` `List<SelfType>` inside the entity, you can add `@EastTree("property name")` to the corresponding entity to specify the specific property as `children`

`asTreeCTE` supports custom cte internal parameters `asTreeCTE(op->{......})`

Method  | Description 
--- | --- 
setLimitDeep | Limit query depth, -1 means no limit (default), 0 means only query first level
setUp | Query direction, default downward, parameter true upward, false downward (default)
setUnionAll | Whether to use union all, parameter true use unionAll (default), false use union
setCTETableName |  Set cte table alias default as_tree_cte  
setDeepColumnName | Default depth column alias
setChildFilter | Set child filter condition

[More about `asTreeCte` click the link to view](/easy-query-doc/en/ability/select/tree)

```java

    @PostMapping("/commentList")
    public List<Comment> commentList() {
     return easyEntityQuery.queryable(Comment.class)
              .where(t_comment -> t_comment.parentId().eq("0"))
              .asTreeCTE()
              .toList();
    }
```
First, before asTreeCTE, we need to determine which records are set as roots for this query. The expression is to use records where parentId is 0 as root nodes. Of course, you can also use null or empty.
Based on the return result, we see that the data is returned but children is not filled
```json
[
    {
        "id": "01225d2f-e1a5-46d8-8ef9-535b7b1b7754",
        "parentId": "03abe9c8-adf1-4934-ae53-3b52c7c3eb2d",
        "content": "@用户E 具体是指哪方面？",
        "userId": "3b63ddd9-b038-4c24-969e-8b478fe862a5",
        "postId": "73f5d341-c6df-43a1-afcd-e246c4d1fcc9",
        "createAt": "2025-08-07T14:42:43.526",
        "children": null,
        "user": null
    },
    {
        "id": "01e23a31-0bd5-4100-9aa6-e87241437b43",
        "parentId": "5886785c-22fa-484f-967f-9e81e01ac7ad",
        "content": "@用户E 你是指...",
        "userId": "2e509ef4-0282-448f-ace0-43501d46ccf4",
        "postId": "5f72b5bf-3ae6-4bd6-9df9-cf0c43abc37c",
        "createAt": "2025-08-07T02:42:43.527",
        "children": null,
        "user": null
    },
    ...
]
```
View generated sql
```sql


-- 1st SQL data
WITH RECURSIVE `as_tree_cte` AS (
		SELECT 0 AS `cte_deep`, t1.`id`, t1.`parent_id`, t1.`content`, t1.`user_id`
			, t1.`post_id`, t1.`create_at`
		FROM `t_comment` t1
		WHERE t1.`parent_id` = '0'
		UNION ALL
		SELECT t2.`cte_deep` + 1 AS `cte_deep`, t3.`id`, t3.`parent_id`, t3.`content`
			, t3.`user_id`, t3.`post_id`, t3.`create_at`
		FROM `as_tree_cte` t2
			INNER JOIN `t_comment` t3 ON t3.`parent_id` = t2.`id`
	)
SELECT t.`id`, t.`parent_id`, t.`content`, t.`user_id`, t.`post_id`
	, t.`create_at`
FROM `as_tree_cte` t
```

Indeed, the framework generated the corresponding sql and also returned data by recursion. So how should we convert the corresponding result into a tree?

## toTreeList
Convert the original flattened structure into a tree (this operation is implemented in memory)
```java
    @PostMapping("/commentList2")
    public List<Comment> commentList2() {
     return easyEntityQuery.queryable(Comment.class)
              .where(t_comment -> t_comment.parentId().eq("0"))
              .asTreeCTE()
              .toTreeList();
    }
```

```json
[
    {
        "id": "03abe9c8-adf1-4934-ae53-3b52c7c3eb2d",
        "parentId": "0",
        "content": "写得真详细",
        "userId": "3b63ddd9-b038-4c24-969e-8b478fe862a5",
        "postId": "73f5d341-c6df-43a1-afcd-e246c4d1fcc9",
        "createAt": "2025-08-07T06:42:43.526",
        "children": [
            {
                "id": "01225d2f-e1a5-46d8-8ef9-535b7b1b7754",
                "parentId": "03abe9c8-adf1-4934-ae53-3b52c7c3eb2d",
                "content": "@用户E 具体是指哪方面？",
                "userId": "3b63ddd9-b038-4c24-969e-8b478fe862a5",
                "postId": "73f5d341-c6df-43a1-afcd-e246c4d1fcc9",
                "createAt": "2025-08-07T14:42:43.526",
                "children": [
                    {
                        "id": "1bccba2c-7cff-43af-b117-2e518be4422a",
                        "parentId": "01225d2f-e1a5-46d8-8ef9-535b7b1b7754",
                        "content": "@用户E 你是指...",
                        "userId": "3b63ddd9-b038-4c24-969e-8b478fe862a5",
                        "postId": "73f5d341-c6df-43a1-afcd-e246c4d1fcc9",
                        "createAt": "2025-08-07T19:42:43.526",
                        "children": [],
                        "user": null
                    }
                ],
                "user": null
            }
        ],
        "user": null
    }
    ......
]
```

## Tree DTO VO

Sometimes we want the returned result to be converted to our custom structure instead of database table objects

Build dto
```java

/**
 * this file automatically generated by easy-query struct dto mapping
 * 当前文件是easy-query自动生成的 结构化dto 映射
 * {@link com.eq.doc.domain.Comment }
 * @easy-query-dto schema: normal
 *
 * @author xuejiaming
 */
@Data
public class MyCommentDTO {


    private String id;
    private String parentId;//Because assembled in memory, parentId must exist
    private String content;
    @NavigateFlat(pathAlias = "user.name")
    private String userName;
    private LocalDateTime createAt;
    /**
     * Child comments
     **/
    @Navigate(value = RelationTypeEnum.OneToMany)
    private List<MyCommentDTO> children;

}
```

In this dto, we built a comment DTO return structure, and we added the user name field in the comment

```java

    @PostMapping("/commentList3")
    public List<MyCommentDTO> commentList3() {
        return easyEntityQuery.queryable(Comment.class)
                .where(t_comment -> t_comment.parentId().eq("0"))
                .asTreeCTE()
                .selectAutoInclude(MyCommentDTO.class)
                .toTreeList();
    }
```

Directly return the user's name
```json
[
    {
        "id": "03abe9c8-adf1-4934-ae53-3b52c7c3eb2d",
        "parentId": "0",
        "content": "写得真详细",
        "userName": "用户E",
        "createAt": "2025-08-07T06:42:43.526",
        "children": [
            {
                "id": "01225d2f-e1a5-46d8-8ef9-535b7b1b7754",
                "parentId": "03abe9c8-adf1-4934-ae53-3b52c7c3eb2d",
                "content": "@用户E 具体是指哪方面？",
                "userName": "用户E",
                "createAt": "2025-08-07T14:42:43.526",
                "children": [
                    {
                        "id": "1bccba2c-7cff-43af-b117-2e518be4422a",
                        "parentId": "01225d2f-e1a5-46d8-8ef9-535b7b1b7754",
                        "content": "@用户E 你是指...",
                        "userName": "用户E",
                        "createAt": "2025-08-07T19:42:43.526",
                        "children": []
                    }
                ]
            }
        ]
    },
    ....
]
```

View sql
```sql

-- 1st SQL data
WITH RECURSIVE `as_tree_cte` AS (
		SELECT 0 AS `cte_deep`, t1.`id`, t1.`parent_id`, t1.`content`, t1.`user_id`
			, t1.`post_id`, t1.`create_at`
		FROM `t_comment` t1
		WHERE t1.`parent_id` = '0'
		UNION ALL
		SELECT t2.`cte_deep` + 1 AS `cte_deep`, t3.`id`, t3.`parent_id`, t3.`content`
			, t3.`user_id`, t3.`post_id`, t3.`create_at`
		FROM `as_tree_cte` t2
			INNER JOIN `t_comment` t3 ON t3.`parent_id` = t2.`id`
	)
SELECT t.`id`, t.`parent_id`, t.`content`, t.`create_at`, t.`user_id` AS `__relation__userId`
FROM `as_tree_cte` t

-- 2nd SQL data
SELECT `name`, `id` AS `__relation__id`
FROM `t_user`
WHERE `id` IN ('3b63ddd9-b038-4c24-969e-8b478fe862a5', '2e509ef4-0282-448f-ace0-43501d46ccf4', 'f2bf383e-ee8d-44c5-968d-263191ab058e', '70ec5f9f-7e9b-4f57-b2a4-9a35a163bd3e', 'eda79345-6fbf-4ca6-b9bf-4743a3f991e4')
```

The first part of sql queries the tree of all child nodes under the root node where parentId='0', and queries the user name through a second query

- First, we defined a dto object and set itself as children, `@Navigate(value = RelationTypeEnum.OneToMany)`. selectAutoInclude will ignore the `asTreeCTE` of the `Comment` table as child nodes. If `asTreeCTE` is not added, this children will be treated as a normal one-to-many query, which means each record will be queried once.
- Before `asTreeCTE`, we need to first determine the root nodes for this query. If no conditions are added, all records in the database will be treated as root nodes, resulting in incorrect results.
- `toTreeList` assembles the tree in memory. If not needed, users can toList and then assemble it themselves.

::: tip asTreeCTE!!!
> `asTreeCTE` also supports filtering depth and direction and also supports additional filtering of children. This chapter will not introduce too much. [For details, please go to the `asTreeCTE` chapter](/easy-query-doc/en/ability/select/tree)
:::
