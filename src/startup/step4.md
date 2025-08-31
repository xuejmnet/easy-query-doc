---
title: 评论相关查询
order: 50
---

# 评论相关查询
本章节主要让用户知道评论相关的分页返回和递归子查询等相关功能

## 返回评论递归列表
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
     * 子评论
     **/
    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = {CommentProxy.Fields.id}, targetProperty = {CommentProxy.Fields.parentId})
    private List<Comment> children;
    /**
     * 评论人
     **/
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {CommentProxy.Fields.userId}, targetProperty = {UserProxy.Fields.id})
    private User user;
}
```


::: tip 说明!!!
> 一个对象表如果希望支持递归查询那么必须要满足如下条件
- 存在一个OneToMany关系的导航属性
- 该导航属性必须是自己
:::

返回递归查询列表

## asTreeCte

使用该api需要在数据库对象中添加`OneToMany`的关联关系,并且导航属性必须是`List<SelfType>`，系统会将其视为`children`属性,如果实体内部出现多个`OneToMany`的`List<SelfType>`则可以在对应实体上添加`@EastTree("属性名")`来指定具体的属性作为`children`

`asTreeCTE`支持自定义cte内部参数`asTreeCTE(op->{......})`

方法  | 描述 
--- | --- 
setLimitDeep | 限制查询的深度，-1表示不限制(默认)，0表示只查询第一级
setUp | 查询方向,默认向下，参数true向上,false向下(默认)
setUnionAll | 是否使用union all，参数true使用unionAll(默认),false使用union
setCTETableName |  设置cte表别名默认as_tree_cte  
setDeepColumnName | 默认深度列别名
setChildFilter | 设置child的过滤条件

[更多`asTreeCte`请点击链接查看](/easy-query-doc/ability/select/tree)

```java

    @PostMapping("/commentList")
    public List<Comment> commentList() {
     return easyEntityQuery.queryable(Comment.class)
              .where(t_comment -> t_comment.parentId().eq("0"))
              .asTreeCTE()
              .toList();
    }
```
首先我们asTreeCTE前需要先要确定本次查询要设定哪些记录作为根,表达式为parentId为0的那部分记录作为根节点当然如果你是null或者空也可以
根据返回结果我们看到数据返回了但是children并没有被填充
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
查看生成的sql
```sql


-- 第1条sql数据
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

确实框架生成了对应的sql，也按递归进行了数据的返回那么我们应该如何将对应的结果转成树形呢

## toTreeList
将原先平铺的结构转成树形(这个操作是在内存中实现的)
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

## 树形DTO VO

有时候我们希望返回的结果转成我们自定义的结构而不是数据库表对象

构建dto
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
    private String parentId;//因为在内存中聚合所以parentId必须要有
    private String content;
    @NavigateFlat(pathAlias = "user.name")
    private String userName;
    private LocalDateTime createAt;
    /**
     * 子评论
     **/
    @Navigate(value = RelationTypeEnum.OneToMany)
    private List<MyCommentDTO> children;

}
```

这个dto中我们构建了一个评论的DTO返回结构,并且我们在评论中添加了用户名称这个字段

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

直接返回用户的姓名
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

查看sql
```sql

-- 第1条sql数据
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

-- 第2条sql数据
SELECT `name`, `id` AS `__relation__id`
FROM `t_user`
WHERE `id` IN ('3b63ddd9-b038-4c24-969e-8b478fe862a5', '2e509ef4-0282-448f-ace0-43501d46ccf4', 'f2bf383e-ee8d-44c5-968d-263191ab058e', '70ec5f9f-7e9b-4f57-b2a4-9a35a163bd3e', 'eda79345-6fbf-4ca6-b9bf-4743a3f991e4')
```

sql第一部分查询parentId='0'也就是根节点下面所有子节点的树形,并且通过二次查询查询处用户姓名

- 首先我们定义了一个dto的对象并且设置自己为children,`@Navigate(value = RelationTypeEnum.OneToMany)`，selectAutoInclude会将`Comment`表的`asTreeCTE`作为子节点的`children`忽略掉如果不添加`asTreeCTE`那么本次的children会被当做普通的一对多进行查询,也就是每条记录查询一次
- 我们在`asTreeCTE`前需要先确定本次要查询的根节点，如果不添加任何条件那么会把数据库所有的记录都视为根节点从而导致结果不正确
- `toTreeList`为内存组装树如果不需要用户可以自行toList然后自行组装

::: tip asTreeCTE!!!
> `asTreeCTE`还支持筛选深度和方向也支持children的额外筛选,本章节不再过多介绍,[具体请到`asTreeCTE`章节查看](/easy-query-doc/ability/select/tree)
:::

