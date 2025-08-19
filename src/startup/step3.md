---
title: 用户相关查询
order: 40
---

# 用户相关查询
用户查询以用户为主题的查询在当前模型下主要以OLAP为主，本章节会完美的暂时eq在OLAP下如何秒杀复杂查询

查询用户信息筛选要求今日发布过帖子的并且要求返回用户帖子数量,今日发帖数，评论数量和点赞数，并且要求返回刚刚发布的帖子标题和id
按点赞数对用户进行排序

## 建模
创建用户和帖子，用户和评论，用户和点赞的关系模型

```java

@Data
@Table("t_user")
@EntityProxy
@EasyAlias("t_user")
@EasyAssertMessage("未找到对应的用户信息")
public class User implements ProxyEntityAvailable<User, UserProxy> {
    @Column(primaryKey = true, comment = "用户id")
    private String id;
    @Column(comment = "用户姓名")
    private String name;
    @Column(comment = "用户手机")
    private String phone;
    @Column(comment = "创建时间")
    private LocalDateTime createAt;

    /**
     * 用户发布的帖子集合
     **/
    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = {UserProxy.Fields.id}, targetProperty = {PostProxy.Fields.userId})
    private List<Post> posts;

    /**
     * 用户评论集合
     **/
    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = {UserProxy.Fields.id}, targetProperty = {CommentProxy.Fields.userId})
    private List<Comment> comments;

    /**
     * 用户点赞数
     **/
    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = {UserProxy.Fields.id}, targetProperty = {LikeProxy.Fields.userId})
    private List<Like> likes;
}
```
## 请求响应参数
创建用户请求参数和响应

```java
//请求参数
@Data
public class UserPageRequest extends PageRequest {

    private LocalDateTime postPublishTimeBegin;

    private LocalDateTime postPublishTimeEnd;
}
//响应参数

@Data
@EntityProxy
public class UserPageResponse {
    /**
     * id
     */
    private String id;
    /**
     * 姓名
     */
    private String name;
    /**
     * 发帖数
     */
    private Long postCount;
    /**
     * 今日发帖数
     */
    private Long todayPostCount;
    /**
     * 评论数
     */
    private Long commentCount;
    /**
     * 点赞数
     */
    private Long likeCount;
    /**
     * 最近发布的帖子id
     */
    private String recentlyPostId;
    /**
     * 最近发布的帖子标题
     */
    private String recentlyPostTitle;
}

```

## 编写接口
```java

    @PostMapping("/page")
    public EasyPageResult<UserPageResponse> page(@RequestBody UserPageRequest request) {
        LocalDateTime today = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime nextDay = today.plusDays(1);
        return easyEntityQuery.queryable(User.class)
                .where(t_user -> {
                    //要求用户必须存在一个帖子是这个时间段发布的
                    t_user.posts().any(t_post -> {
                        t_post.publishAt().rangeClosed(request.getPostPublishTimeBegin(), request.getPostPublishTimeEnd());
                    });
                })
                .select(t_user -> {
                    return new UserPageResponseProxy()
                            .id().set(t_user.id())
                            .name().set(t_user.name())
                            .postCount().set(t_user.posts().count()) // 发帖数
                            .todayPostCount().set(t_user.posts().where(p -> p.publishAt().rangeClosedOpen(today, nextDay)).count()) // 今日发帖数
                            .commentCount().set(t_user.comments().count()) // 评论数
                            .likeCount().set(t_user.likes().count()) // 点赞数
                            .recentlyPostId().set(t_user.posts().orderBy(p->p.publishAt().desc()).first().id()) // 最近发布的帖子id
                            .recentlyPostTitle().set(t_user.posts().orderBy(p->p.publishAt().desc()).first().title()); // 最近发布的帖子标题

                })
                .orderBy(t_user -> t_user.likeCount().desc())
                .toPageResult(request.getPageIndex(), request.getPageSize());
    }
```

## 查看返回结果
```json :collapsed-lines
{
    "total": 5,
    "data": [
        {
            "id": "2e509ef4-0282-448f-ace0-43501d46ccf4",
            "name": "用户C",
            "postCount": 2,
            "todayPostCount": 0,
            "commentCount": 23,
            "likeCount": 7,
            "recentlyPostId": "0c6ab3ab-29a4-4320-a08e-195bdac27095",
            "recentlyPostTitle": "JVM调优实战"
        },
        {
            "id": "70ec5f9f-7e9b-4f57-b2a4-9a35a163bd3e",
            "name": "用户B",
            "postCount": 3,
            "todayPostCount": 0,
            "commentCount": 17,
            "likeCount": 7,
            "recentlyPostId": "73f5d341-c6df-43a1-afcd-e246c4d1fcc9",
            "recentlyPostTitle": "夏日旅行攻略"
        },
        {
            "id": "eda79345-6fbf-4ca6-b9bf-4743a3f991e4",
            "name": "用户D",
            "postCount": 2,
            "todayPostCount": 0,
            "commentCount": 18,
            "likeCount": 7,
            "recentlyPostId": "8dbcfcfe-44a7-45c2-9db9-d0302c5a9a94",
            "recentlyPostTitle": "初探人工智能"
        },
        {
            "id": "3b63ddd9-b038-4c24-969e-8b478fe862a5",
            "name": "用户E",
            "postCount": 2,
            "todayPostCount": 0,
            "commentCount": 21,
            "likeCount": 5,
            "recentlyPostId": "5f72b5bf-3ae6-4bd6-9df9-cf0c43abc37c",
            "recentlyPostTitle": "初探人工智能"
        },
        {
            "id": "f2bf383e-ee8d-44c5-968d-263191ab058e",
            "name": "用户A",
            "postCount": 3,
            "todayPostCount": 0,
            "commentCount": 31,
            "likeCount": 4,
            "recentlyPostId": "31a955ba-04ec-4d07-a6d4-fac6c408ab7d",
            "recentlyPostTitle": "电影推荐合集"
        }
    ]
}
```

## 查看生成的sql
该sql默认使用子查询模式返回，性能而言如果存在多个子查询那么性能将是非常低下的,如果您需要可以将[子查询转成groupJoin](/easy-query-doc/performance/implicit-subquery-group-join)
```sql

-- 第1条sql数据

    SELECT
        COUNT(*) 
    FROM
        `t_user` t 
    WHERE
        EXISTS (SELECT
            1 FROM `t_post` t1 
        WHERE
            t1.`user_id` = t.`id` 
            AND (t1.`publish_at` >= '2020-01-01 00:00' 
            AND t1.`publish_at` <= '2026-01-01 00:00') 
        LIMIT
            1)
-- 第2条sql数据
    SELECT
        t9.`id` AS `id`,
        t9.`name` AS `name`,
        t9.`post_count` AS `post_count`,
        t9.`today_post_count` AS `today_post_count`,
        t9.`comment_count` AS `comment_count`,
        t9.`like_count` AS `like_count`,
        t9.`recently_post_id` AS `recently_post_id`,
        t9.`recently_post_title` AS `recently_post_title` 
    FROM
        (SELECT
            t.`id` AS `id`,
            t.`name` AS `name`,
            (SELECT
                COUNT(*) 
            FROM
                `t_post` t5 
            WHERE
                t5.`user_id` = t.`id`) AS `post_count`,
            (SELECT
                COUNT(*) 
            FROM
                `t_post` t6 
            WHERE
                t6.`user_id` = t.`id` 
                AND (
                    t6.`publish_at` >= '2025-08-17 00:00' 
                    AND t6.`publish_at` < '2025-08-18 00:00'
                )) AS `today_post_count`,
            (SELECT
                COUNT(*) 
            FROM
                `t_comment` t7 
            WHERE
                t7.`user_id` = t.`id`) AS `comment_count`,
            (SELECT
                COUNT(*) 
            FROM
                `t_like` t8 
            WHERE
                t8.`user_id` = t.`id`) AS `like_count`,
            t4.`id` AS `recently_post_id`,
            t4.`title` AS `recently_post_title` 
        FROM
            `t_user` t 
        LEFT JOIN
            (SELECT
                t2.`id`, t2.`title`, t2.`content`, t2.`user_id`, t2.`publish_at`, (ROW_NUMBER() OVER (PARTITION 
            BY
                t2.`user_id` 
            ORDER BY
                t2.`publish_at` DESC)) AS `__row__` FROM `t_post` t2) t4 
                ON (t4.`user_id` = t.`id` 
                AND t4.`__row__` = 1) 
        WHERE
            EXISTS (SELECT
                1 FROM `t_post` t1 
            WHERE
                t1.`user_id` = t.`id` 
                AND (t1.`publish_at` >= '2020-01-01 00:00' 
                AND t1.`publish_at` <= '2026-01-01 00:00') 
            LIMIT
                1)) t9 
    ORDER BY
        t9.`like_count` DESC 
    LIMIT
        5
```

通过sql我们发现这个sql使用4个子查询加一个隐式partition

分析sql我们发现eq智能的将两个partition by的也就是最近发帖的id和最近发帖的title返回了出来

但是整体性能因为子查询过多导致性能不理想我们可以通过eq的subQueryToGroupJoin将子查询转成groupJoin来提高性能
### groupJoin
那么我们该如何开启这个功能呢

`.configure(s->s.getBehavior().add(EasyBehaviorEnum.ALL_SUB_QUERY_GROUP_JOIN))`通过添加这一行代码让表达式子查询转成groupJoin
```java

    @PostMapping("/page")
    public EasyPageResult<UserPageResponse> page(@RequestBody UserPageRequest request) {
        LocalDateTime today = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime nextDay = today.plusDays(1);
        return easyEntityQuery.queryable(User.class)
                //添加这一行使用subQueryToGroupJoin
                .configure(s->s.getBehavior().add(EasyBehaviorEnum.ALL_SUB_QUERY_GROUP_JOIN))
                .where(t_user -> {
                    //要求用户必须存在一个帖子是这个时间段发布的
                    t_user.posts().any(t_post -> {
                        t_post.publishAt().rangeClosed(request.getPostPublishTimeBegin(), request.getPostPublishTimeEnd());
                    });
                })
                .select(t_user -> {
                    return new UserPageResponseProxy()
                            .id().set(t_user.id())
                            .name().set(t_user.name())
                            .postCount().set(t_user.posts().count()) // 发帖数
                            .todayPostCount().set(t_user.posts().where(p -> p.publishAt().rangeClosedOpen(today, nextDay)).count()) // 今日发帖数
                            .commentCount().set(t_user.comments().count()) // 评论数
                            .likeCount().set(t_user.likes().count()) // 点赞数
                            .recentlyPostId().set(t_user.posts().orderBy(p->p.publishAt().desc()).first().id()) // 最近发布的帖子id
                            .recentlyPostTitle().set(t_user.posts().orderBy(p->p.publishAt().desc()).first().title()); // 最近发布的帖子标题

                })
                .orderBy(t_user -> t_user.likeCount().desc())
                .toPageResult(request.getPageIndex(), request.getPageSize());
    }
```

之后我们再来看我们的sql
```sql

-- 第1条sql数据

    SELECT
        COUNT(*) 
    FROM
        `t_user` t 
    LEFT JOIN
        (SELECT
            t1.`user_id` AS `userId`, (COUNT((CASE 
                WHEN (t1.`publish_at` >= '2020-01-01 00:00' 
                AND t1.`publish_at` <= '2026-01-01 00:00') 
                    THEN 1 
                ELSE NULL 
        END)) > 0) AS `__any2__`, COUNT(*) AS `__count3__`, COUNT((CASE 
            WHEN (t1.`publish_at` >= '2025-08-17 00:00' 
            AND t1.`publish_at` < '2025-08-18 00:00') 
                THEN 1 
            ELSE NULL 
    END)) AS `__count4__` FROM `t_post` t1 
GROUP BY
    t1.`user_id`) t2 
    ON t2.`userId` = t.`id` 
WHERE
    IFNULL(t2.`__any2__`, false) = true
-- 第2条sql数据
SELECT t10.`id` AS `id`, t10.`name` AS `name`, t10.`post_count` AS `post_count`, t10.`today_post_count` AS `today_post_count`, t10.`comment_count` AS `comment_count`
	, t10.`like_count` AS `like_count`, t10.`recently_post_id` AS `recently_post_id`, t10.`recently_post_title` AS `recently_post_title`
FROM (
	SELECT t.`id` AS `id`, t.`name` AS `name`, IFNULL(t2.`__count3__`, 0) AS `post_count`
		, IFNULL(t2.`__count4__`, 0) AS `today_post_count`
		, IFNULL(t4.`__count2__`, 0) AS `comment_count`
		, IFNULL(t6.`__count2__`, 0) AS `like_count`, t9.`id` AS `recently_post_id`
		, t9.`title` AS `recently_post_title`
	FROM `t_user` t
		LEFT JOIN (
			SELECT t1.`user_id` AS `userId`, COUNT(CASE 
					WHEN t1.`publish_at` >= '2020-01-01 00:00'
					AND t1.`publish_at` <= '2026-01-01 00:00' THEN 1
					ELSE NULL
				END) > 0 AS `__any2__`
				, COUNT(*) AS `__count3__`, COUNT(CASE 
					WHEN t1.`publish_at` >= '2025-08-17 00:00'
					AND t1.`publish_at` < '2025-08-18 00:00' THEN 1
					ELSE NULL
				END) AS `__count4__`
			FROM `t_post` t1
			GROUP BY t1.`user_id`
		) t2
		ON t2.`userId` = t.`id`
		LEFT JOIN (
			SELECT t3.`user_id` AS `userId`, COUNT(*) AS `__count2__`
			FROM `t_comment` t3
			GROUP BY t3.`user_id`
		) t4
		ON t4.`userId` = t.`id`
		LEFT JOIN (
			SELECT t5.`user_id` AS `userId`, COUNT(*) AS `__count2__`
			FROM `t_like` t5
			GROUP BY t5.`user_id`
		) t6
		ON t6.`userId` = t.`id`
		LEFT JOIN (
			SELECT t7.`id`, t7.`title`, t7.`content`, t7.`user_id`, t7.`publish_at`
				, ROW_NUMBER() OVER (PARTITION BY t7.`user_id` ORDER BY t7.`publish_at` DESC) AS `__row__`
			FROM `t_post` t7
		) t9
		ON t9.`user_id` = t.`id`
			AND t9.`__row__` = 1
	WHERE IFNULL(t2.`__any2__`, false) = true
) t10
ORDER BY t10.`like_count` DESC
LIMIT 5
```
## 分批查询返回
上一部分内容我们讲解了如果通过一条sql来实现包括主表在内的OLAP查询

查询用户要求返回用户包含用户id，用户姓名，并且要求返回今天发布的前三篇和java相关的帖子，每篇要求返回前三个评论并且返回是由谁评论的(前三个评论是住楼层评论)
## 构建评论和用户模型
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
     * 评论人
     **/
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {CommentProxy.Fields.userId}, targetProperty = {UserProxy.Fields.id})
    private User user;
}
```

这边构建了评论和用户表建模

### 构建响应结果
通过插件勾选要返回的属性

<img :src="$withBase('/images/step3-user.png')">

```java

/**
 * this file automatically generated by easy-query struct dto mapping
 * 当前文件是easy-query自动生成的 结构化dto 映射
 * {@link com.eq.doc.domain.User }
 *
 * @author xuejiaming
 * @easy-query-dto schema: normal
 */
@Data
public class UserWithPostResponse {


    private String id;
    private String name;
    /**
     * 用户发布的帖子集合
     **/
    @Navigate(value = RelationTypeEnum.OneToMany,limit = 3)
    private List<InternalPosts> posts;


    /**
     * {@link com.eq.doc.domain.Post }
     */
    @Data
    public static class InternalPosts {
        private String id;
        private String title;
        private LocalDateTime publishAt;
        /**
         * 评论信息
         **/
        @Navigate(value = RelationTypeEnum.OneToMany,limit = 3)
        private List<InternalComment> commentList;


    }

    /**
     * {@link com.eq.doc.domain.Comment }
     */
    @Data
    public static class InternalComment {
        private String id;
        private String content;
        private LocalDateTime createAt;
        /**
         * 评论人
         **/
        @Navigate(value = RelationTypeEnum.ManyToOne)
        private InternalUser user;

    }

    /**
     * {@link User}
     **/
    @Data
    public static class InternalUser {
        private String name;
    }

}
```

### 查询接口
```java

    @PostMapping("/list")
    public List<UserWithPostResponse> list() {
        return easyEntityQuery.queryable(User.class)
                .selectAutoInclude(UserWithPostResponse.class)
                .toList();
    }
```
当我们构建好一个返回结构和可以非常简单的通过`selectAutoInclude`将dto结果查询出来
```json

[

    {
        "id": "2e509ef4-0282-448f-ace0-43501d46ccf4",
        "name": "用户C",
        "posts": [
            {
                "id": "0c6ab3ab-29a4-4320-a08e-195bdac27095",
                "title": "JVM调优实战",
                "publishAt": "2025-08-04T23:42:43.525",
                "commentList": [
                    {
                        "id": "0b1d0cbd-62a7-4922-b5fe-0ef4780e4c24",
                        "content": "内容很实用",
                        "userId": "f2bf383e-ee8d-44c5-968d-263191ab058e",
                        "createAt": "2025-08-07T15:42:43.526",
                        "user": {
                            "name": "用户A"
                        }
                    },
                    {
                        "id": "0f2859b5-31d9-4c9a-8fd7-acb9e2b2cf4a",
                        "content": "@用户D 👍",
                        "userId": "f2bf383e-ee8d-44c5-968d-263191ab058e",
                        "createAt": "2025-08-07T00:42:43.526",
                        "user": {
                            "name": "用户A"
                        }
                    },
                    {
                        "id": "2d3643e6-8fb5-4a2b-a0bc-1c92030bfa34",
                        "content": "完全同意你的观点",
                        "userId": "eda79345-6fbf-4ca6-b9bf-4743a3f991e4",
                        "createAt": "2025-08-07T00:42:43.526",
                        "user": {
                            "name": "用户D"
                        }
                    }
                ]
            },
            {
                "id": "669ce2a5-abaf-49e8-bb7e-e498f7377b15",
                "title": "健身计划分享",
                "publishAt": "2025-08-03T10:42:43.525",
                "commentList": [
                    {
                        "id": "1a1be377-a5f6-4d22-a1f8-8f025060a5c2",
                        "content": "完全同意你的观点",
                        "userId": "3b63ddd9-b038-4c24-969e-8b478fe862a5",
                        "createAt": "2025-08-07T02:42:43.526",
                        "user": {
                            "name": "用户E"
                        }
                    },
                    {
                        "id": "1c2e57f7-58d3-4803-8500-ddf715b0ead3",
                        "content": "@用户D 👍",
                        "userId": "f2bf383e-ee8d-44c5-968d-263191ab058e",
                        "createAt": "2025-08-07T10:42:43.526",
                        "user": {
                            "name": "用户A"
                        }
                    },
                    {
                        "id": "914080ef-9385-467d-9b64-d3bb9347fa52",
                        "content": "写得真详细",
                        "userId": "3b63ddd9-b038-4c24-969e-8b478fe862a5",
                        "createAt": "2025-08-07T12:42:43.526",
                        "user": {
                            "name": "用户E"
                        }
                    }
                ]
            }
        ]
    }
    //......
]
```

我们非常简单的实现了这一功能

一共生成了多条sql
```sql

-- 第1条sql数据

    SELECT
        t.`id`,
        t.`name` 
    FROM
        `t_user` t
-- 第2条sql数据

    SELECT
        t2.`id` AS `id`,
        t2.`title` AS `title`,
        t2.`publish_at` AS `publish_at`,
        t2.`user_id` AS `__relation__userId` 
    FROM
        (SELECT
            t1.`id` AS `id`,
            t1.`title` AS `title`,
            t1.`content` AS `content`,
            t1.`user_id` AS `user_id`,
            t1.`publish_at` AS `publish_at` 
        FROM
            (SELECT
                t.`id`,
                t.`title`,
                t.`content`,
                t.`user_id`,
                t.`publish_at`,
                (ROW_NUMBER() OVER (PARTITION 
            BY
                t.`user_id`)) AS `__row__` 
            FROM
                `t_post` t 
            WHERE
                t.`user_id` IN ('0c6ab3ab-29a4-4320-a08e-195bdac27095', '669ce2a5-abaf-49e8-bb7e-e498f7377b15', '015c8538-0eaa-4afb-a1c7-4cca00dd6638', '5f72b5bf-3ae6-4bd6-9df9-cf0c43abc37c', '1a0e5854-c748-4c6b-a11d-d5bbb58326a1')) t1 
        WHERE
            t1.`__row__` >= '573ca56a-4575-458e-8258-7b76c2cfe959' 
            AND t1.`__row__` <= '73f5d341-c6df-43a1-afcd-e246c4d1fcc9') t2
-- 第3条sql数据

    SELECT
        t2.`id` AS `id`,
        t2.`content` AS `content`,
        t2.`create_at` AS `create_at`,
        t2.`user_id` AS `__relation__userId`,
        t2.`post_id` AS `__relation__postId` 
    FROM
        (SELECT
            t1.`id` AS `id`,
            t1.`parent_id` AS `parent_id`,
            t1.`content` AS `content`,
            t1.`user_id` AS `user_id`,
            t1.`post_id` AS `post_id`,
            t1.`create_at` AS `create_at` 
        FROM
            (SELECT
                t.`id`,
                t.`parent_id`,
                t.`content`,
                t.`user_id`,
                t.`post_id`,
                t.`create_at`,
                (ROW_NUMBER() OVER (PARTITION 
            BY
                t.`post_id`)) AS `__row__` 
            FROM
                `t_comment` t 
            WHERE
                t.`post_id` IN ('2e509ef4-0282-448f-ace0-43501d46ccf4', 'eda79345-6fbf-4ca6-b9bf-4743a3f991e4', 'f2bf383e-ee8d-44c5-968d-263191ab058e', '3b63ddd9-b038-4c24-969e-8b478fe862a5', '70ec5f9f-7e9b-4f57-b2a4-9a35a163bd3e', ?, ?, ?, ?, ?, ?, ?)) t1 
        WHERE
            t1.`__row__` >= ? 
            AND t1.`__row__` <= ?) t2
-- 第4条sql数据

    SELECT
        t.`name`,
        t.`id` AS `__relation__id` 
    FROM
        `t_user` t 
    WHERE
        t.`id` IN (?, ?, ?, ?, ?)
```



::: tip 说明!!!
> eq提供高效的快速组装没有n+1烦恼,可以非常灵活方便的拉取需要的数据并且可以对数据进行非常方便的筛选和额外字段填充
:::

### 额外筛选
虽然我们对每个用户的帖子进行了前三个的返回,但是我们需要对帖子进行倒序排序并且是进入的帖子返回，评论也是如此需要是正序前三个并且是一级评论，因为之前的查询我们返回的评论是任意前3个所以我们对返回结果进行如下改造
```java

/**
 * this file automatically generated by easy-query struct dto mapping
 * 当前文件是easy-query自动生成的 结构化dto 映射
 * {@link User }
 *
 * @author xuejiaming
 * @easy-query-dto schema: normal
 */
@Data
public class UserWithPost2Response {


    private String id;
    private String name;
    /**
     * 用户发布的帖子集合
     **/
    @Navigate(value = RelationTypeEnum.OneToMany, limit = 3,orderByProps = { ①
            @OrderByProperty(property = PostProxy.Fields.publishAt,asc = false)
    })
    private List<InternalPosts> posts;


    /**
     * {@link com.eq.doc.domain.Post }
     */
    @Data
    public static class InternalPosts {


        private static final ExtraAutoIncludeConfigure EXTRA_AUTO_INCLUDE_CONFIGURE = PostProxy.TABLE.EXTRA_AUTO_INCLUDE_CONFIGURE()
                .where(t_post -> {
                    LocalDateTime nowYear = LocalDateTime.of(2025,1,1,0,0);
                    LocalDateTime nextYear = nowYear.plusYears(1);
                    //返回的帖子是今天的
                    t_post.publishAt().rangeClosedOpen(nowYear,nextYear); ②
                });

        private String id;
        private String title;
        private LocalDateTime publishAt;
        /**
         * 评论信息
         **/
        @Navigate(value = RelationTypeEnum.OneToMany, limit = 3,orderByProps = { ③
                @OrderByProperty(property = CommentProxy.Fields.createAt,asc = true)
        })
        private List<InternalComment> commentList;


    }

    /**
     * {@link com.eq.doc.domain.Comment }
     */
    @Data
    public static class InternalComment {

        private static final ExtraAutoIncludeConfigure EXTRA_AUTO_INCLUDE_CONFIGURE = CommentProxy.TABLE.EXTRA_AUTO_INCLUDE_CONFIGURE()
                .where(t_comment -> {
                    //只返回一级目录
                    t_comment.parentId().eq("0"); ④
                });
        private String id;
        private String content;
        private LocalDateTime createAt;
        /**
         * 评论人
         **/
        @Navigate(value = RelationTypeEnum.ManyToOne)
        private InternalUser user;

    }

    /**
     * {@link User}
     **/
    @Data
    public static class InternalUser {
        private String name;
    }

}
```

- ① 第一点我们对用户需要关联返回的`posts`属性增加限制,要求他是按`publishAt`倒序返回
- ②`t_post.publishAt().rangeClosedOpen(today,nextDay);`我们对返回的帖子进行限制只能是今年的
- ③ 我们对每个帖子返回的`commentList`进行了限制要求按评论时间正序返回
- ④`t_comment.parentId().eq("0");`我们设置了第一级目录必须是"0"所以这边进行限制返回的评论只能是第一评论

接下来我们对这个结构进行查询
```java

    @PostMapping("/list2")
    public List<UserWithPost2Response> list2() {
        return easyEntityQuery.queryable(User.class)
                .selectAutoInclude(UserWithPost2Response.class)
                .toList();
    }
```

```json

    {
        "id": "2e509ef4-0282-448f-ace0-43501d46ccf4",
        "name": "用户C",
        "posts": [
            {
                "id": "669ce2a5-abaf-49e8-bb7e-e498f7377b15",
                "title": "健身计划分享",
                "publishAt": "2025-08-03T10:42:43.525",
                "commentList": [
                    {
                        "id": "1a1be377-a5f6-4d22-a1f8-8f025060a5c2",
                        "content": "完全同意你的观点",
                        "createAt": "2025-08-07T02:42:43.526",
                        "user": {
                            "name": "用户E"
                        }
                    },
                    //.....
                ]
            }
        ]
    },
    //.....
```

我们来查看sql
```sql

-- 第1条sql数据
SELECT t.`id`, t.`name`
FROM `t_user` t

-- 第2条sql数据
SELECT t2.`id` AS `id`, t2.`title` AS `title`, t2.`publish_at` AS `publish_at`, t2.`user_id` AS `__relation__userId`
FROM (
	SELECT t1.`id` AS `id`, t1.`title` AS `title`, t1.`content` AS `content`, t1.`user_id` AS `user_id`, t1.`publish_at` AS `publish_at`
	FROM (
		SELECT t.`id`, t.`title`, t.`content`, t.`user_id`, t.`publish_at`
			, ROW_NUMBER() OVER (PARTITION BY t.`user_id` ORDER BY t.`publish_at` DESC) AS `__row__`
		FROM `t_post` t
		WHERE t.`publish_at` >= '2025-01-01 00:00'
			AND t.`publish_at` < '2026-01-01 00:00'
			AND t.`user_id` IN ('2e509ef4-0282-448f-ace0-43501d46ccf4', '3b63ddd9-b038-4c24-969e-8b478fe862a5', '70ec5f9f-7e9b-4f57-b2a4-9a35a163bd3e', 'eda79345-6fbf-4ca6-b9bf-4743a3f991e4', 'f2bf383e-ee8d-44c5-968d-263191ab058e')
	) t1
	WHERE t1.`__row__` >= 1
		AND t1.`__row__` <= 3
) t2
-- 第3条sql数据
SELECT t2.`id` AS `id`, t2.`content` AS `content`, t2.`create_at` AS `create_at`, t2.`user_id` AS `__relation__userId`, t2.`post_id` AS `__relation__postId`
FROM (
	SELECT t1.`id` AS `id`, t1.`parent_id` AS `parent_id`, t1.`content` AS `content`, t1.`user_id` AS `user_id`, t1.`post_id` AS `post_id`
		, t1.`create_at` AS `create_at`
	FROM (
		SELECT t.`id`, t.`parent_id`, t.`content`, t.`user_id`, t.`post_id`
			, t.`create_at`, ROW_NUMBER() OVER (PARTITION BY t.`post_id` ORDER BY t.`create_at` ASC) AS `__row__`
		FROM `t_comment` t
		WHERE t.`parent_id` = '0'
			AND t.`post_id` IN (
				'0c6ab3ab-29a4-4320-a08e-195bdac27095', 
				'669ce2a5-abaf-49e8-bb7e-e498f7377b15', 
				'5f72b5bf-3ae6-4bd6-9df9-cf0c43abc37c', 
				'015c8538-0eaa-4afb-a1c7-4cca00dd6638', 
				'73f5d341-c6df-43a1-afcd-e246c4d1fcc9', 
				'1a0e5854-c748-4c6b-a11d-d5bbb58326a1', 
				'573ca56a-4575-458e-8258-7b76c2cfe959', 
				'8dbcfcfe-44a7-45c2-9db9-d0302c5a9a94', 
				'89bf6652-0ae0-451a-8a16-d9b543898f81', 
				'31a955ba-04ec-4d07-a6d4-fac6c408ab7d', 
				'36eba6b0-5dd4-41b3-a4af-d9c522a86b3a', 
				'63d5b82f-64e6-4985-ad4b-acf71d8368fc'
			)
	) t1
	WHERE t1.`__row__` >= 1
		AND t1.`__row__` <= 3
) t2
-- 第4条sql数据
SELECT t.`name`, t.`id` AS `__relation__id`
FROM `t_user` t
WHERE t.`id` IN ('f2bf383e-ee8d-44c5-968d-263191ab058e', '2e509ef4-0282-448f-ace0-43501d46ccf4', 'eda79345-6fbf-4ca6-b9bf-4743a3f991e4', '70ec5f9f-7e9b-4f57-b2a4-9a35a163bd3e', '3b63ddd9-b038-4c24-969e-8b478fe862a5')
```

一共生成了4条sql
- 第一条sql没什么好讲就是返回用户信息
- 第二条sql是将帖子按用户分组分区并且按发布时间倒序并且只筛选今年的然后返回前三个
- 第三条sql是将评论信息按帖子分组分区并且按评论时间正序返回前三个
- 第四条sql是获取评论对应的用户信息

### 平铺用户
我们如果希望评论的user并不是一个对象而是一个平铺到评论表上的数据那应该怎么处理

展开用户id和用户姓名

```java

/**
 * this file automatically generated by easy-query struct dto mapping
 * 当前文件是easy-query自动生成的 结构化dto 映射
 * {@link User }
 *
 * @author xuejiaming
 * @easy-query-dto schema: normal
 */
@Data
public class UserWithPost3Response {


    private String id;
    private String name;
    /**
     * 用户发布的帖子集合
     **/
    @Navigate(value = RelationTypeEnum.OneToMany, limit = 3)
    private List<InternalPosts> posts;


    /**
     * {@link com.eq.doc.domain.Post }
     */
    @Data
    public static class InternalPosts {

        private String id;
        private String title;
        private LocalDateTime publishAt;
        /**
         * 评论信息
         **/
        @Navigate(value = RelationTypeEnum.OneToMany, limit = 3)
        private List<InternalComment> commentList;


    }

    /**
     * {@link com.eq.doc.domain.Comment }
     */
    @Data
    public static class InternalComment {
        private String id;
        private String content;
        private LocalDateTime createAt;
        
        @NavigateFlat(pathAlias = "user.id")①
        private String userId;

        @NavigateFlat(pathAlias = "user.name")②
        private String userName;

    }

}

```

- ①我们这边对userId添加了`NavigateFlat`注解查询返回评论相关的用户的id，其实我们评论表里面本身就自带`userId`所以可以不用这么写这边只是做一下演示
- ②获取评论关联的用户表的用户姓名

```sql
-- ......略过前面3条sql
-- 第4条sql数据
SELECT `id`, `name`
FROM `t_user`
WHERE `id` IN ('2e509ef4-0282-448f-ace0-43501d46ccf4', 'eda79345-6fbf-4ca6-b9bf-4743a3f991e4', 'f2bf383e-ee8d-44c5-968d-263191ab058e', '3b63ddd9-b038-4c24-969e-8b478fe862a5', '70ec5f9f-7e9b-4f57-b2a4-9a35a163bd3e')
```

我们可以通过sql清晰地看到虽然我们是针对两个属性进行分别的`@NavigateFlat`的定义但是`eq`会很智能的将这两部分进行合并


到此为止我感觉用户相关查询应该已经结束了接下来就是评论相关的递归树形查询案例