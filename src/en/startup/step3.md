---
title: User Related Queries
order: 40
---

# User Related Queries
User queries focus on user-themed queries. In the current model, they are mainly OLAP-based. This chapter will perfectly demonstrate how eq crushes complex queries in OLAP scenarios.

Query user information with filtering requirements for users who published posts today, and require returning the number of user posts, today's post count, comment count, and like count, and require returning the just-published post title and id.
Sort users by like count.

## Modeling
Create relationship models between user and posts, user and comments, user and likes

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
     * User's published posts collection
     **/
    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = {UserProxy.Fields.id}, targetProperty = {PostProxy.Fields.userId})
    private List<Post> posts;

    /**
     * User's comments collection
     **/
    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = {UserProxy.Fields.id}, targetProperty = {CommentProxy.Fields.userId})
    private List<Comment> comments;

    /**
     * User's like count
     **/
    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = {UserProxy.Fields.id}, targetProperty = {LikeProxy.Fields.userId})
    private List<Like> likes;
}
```
Because we previously created the navigation property User under Post, if we want to create the reverse navigation property Post under User, we just need to place the cursor on the existing navigation property and use the shortcut key `alt+insert(windows)` or `command+n(mac)` to bring up the shortcut menu and select `MappedBy`


<img :src="$withBase('/images/mapped-by-menu.png')">

## Request Response Parameters
Create user request parameters and response

```java
//Request parameters
@Data
public class UserPageRequest extends PageRequest {

    private LocalDateTime postPublishTimeBegin;

    private LocalDateTime postPublishTimeEnd;
}
//Response parameters

@Data
@EntityProxy
public class UserPageResponse {
    /**
     * id
     */
    private String id;
    /**
     * Name
     */
    private String name;
    /**
     * Post count
     */
    private Long postCount;
    /**
     * Today's post count
     */
    private Long todayPostCount;
    /**
     * Comment count
     */
    private Long commentCount;
    /**
     * Like count
     */
    private Long likeCount;
    /**
     * Recently published post id
     */
    private String recentlyPostId;
    /**
     * Recently published post title
     */
    private String recentlyPostTitle;
}

```

## Write Interface
```java

    @PostMapping("/page")
    public EasyPageResult<UserPageResponse> page(@RequestBody UserPageRequest request) {
        LocalDateTime today = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime nextDay = today.plusDays(1);
        return easyEntityQuery.queryable(User.class)
                .where(t_user -> {
                    //Require user must have a post published in this time period
                    t_user.posts().any(t_post -> {
                        t_post.publishAt().rangeClosed(request.getPostPublishTimeBegin(), request.getPostPublishTimeEnd());
                    });
                })
                .select(t_user -> {
                    return new UserPageResponseProxy()
                            .id().set(t_user.id())
                            .name().set(t_user.name())
                            .postCount().set(t_user.posts().count()) // Post count
                            .todayPostCount().set(t_user.posts().where(p -> p.publishAt().rangeClosedOpen(today, nextDay)).count()) // Today's post count
                            .commentCount().set(t_user.comments().count()) // Comment count
                            .likeCount().set(t_user.likes().count()) // Like count
                            .recentlyPostId().set(t_user.posts().orderBy(p->p.publishAt().desc()).first().id()) // Recently published post id
                            .recentlyPostTitle().set(t_user.posts().orderBy(p->p.publishAt().desc()).first().title()); // Recently published post title

                })
                .orderBy(t_user -> t_user.likeCount().desc())
                .toPageResult(request.getPageIndex(), request.getPageSize());
    }
```

## View Return Results
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

## View Generated SQL
This sql uses subquery mode by default. In terms of performance, if there are multiple subqueries, the performance will be very poor. If needed, you can [convert subquery to groupJoin](/easy-query-doc/en/performance/implicit-subquery-group-join)
```sql

-- 1st SQL data

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
-- 2nd SQL data
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

By analyzing the sql, we find that this sql uses 4 subqueries plus one implicit partition

By analyzing the sql, we find that eq intelligently returns the two partition by results, which are the recently posted id and recently posted title

But the overall performance is not ideal because there are too many subqueries. We can improve performance by converting subqueries to groupJoin using eq's subQueryToGroupJoin
### groupJoin
So how do we enable this feature?

`.configure(s->s.getBehavior().add(EasyBehaviorEnum.ALL_SUB_QUERY_GROUP_JOIN))` By adding this line of code, let the expression subquery convert to groupJoin
```java

    @PostMapping("/page")
    public EasyPageResult<UserPageResponse> page(@RequestBody UserPageRequest request) {
        LocalDateTime today = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime nextDay = today.plusDays(1);
        return easyEntityQuery.queryable(User.class)
                //Add this line to use subQueryToGroupJoin
                .configure(s->s.getBehavior().add(EasyBehaviorEnum.ALL_SUB_QUERY_GROUP_JOIN))
                .where(t_user -> {
                    //Require user must have a post published in this time period
                    t_user.posts().any(t_post -> {
                        t_post.publishAt().rangeClosed(request.getPostPublishTimeBegin(), request.getPostPublishTimeEnd());
                    });
                })
                .select(t_user -> {
                    return new UserPageResponseProxy()
                            .id().set(t_user.id())
                            .name().set(t_user.name())
                            .postCount().set(t_user.posts().count()) // Post count
                            .todayPostCount().set(t_user.posts().where(p -> p.publishAt().rangeClosedOpen(today, nextDay)).count()) // Today's post count
                            .commentCount().set(t_user.comments().count()) // Comment count
                            .likeCount().set(t_user.likes().count()) // Like count
                            .recentlyPostId().set(t_user.posts().orderBy(p->p.publishAt().desc()).first().id()) // Recently published post id
                            .recentlyPostTitle().set(t_user.posts().orderBy(p->p.publishAt().desc()).first().title()); // Recently published post title

                })
                .orderBy(t_user -> t_user.likeCount().desc())
                .toPageResult(request.getPageIndex(), request.getPageSize());
    }
```

Then let's look at our sql
```sql

-- 1st SQL data

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
-- 2nd SQL data
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
## Batch Query Return
In the previous section, we explained how to implement OLAP queries including the main table through a single sql

Query users requiring returning user id, user name, and requiring returning the first three posts related to java published today, each requiring returning the first three comments and returning who commented (the first three comments are main floor comments)
## Build Comment and User Model
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
     * Commenter
     **/
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {CommentProxy.Fields.userId}, targetProperty = {UserProxy.Fields.id})
    private User user;
}
```

Here we built comment and user table modeling

### Build Response Result
Use the plugin to check the properties to return

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
     * User's published posts collection
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
         * Comment information
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
         * Commenter
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

### Query Interface
```java

    @PostMapping("/list")
    public List<UserWithPostResponse> list() {
        return easyEntityQuery.queryable(User.class)
                .selectAutoInclude(UserWithPostResponse.class)
                .toList();
    }
```
When we build a return structure, we can very simply query the dto result through `selectAutoInclude`
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

We very simply achieved this function

A total of multiple sql statements were generated
```sql

-- 1st SQL data

    SELECT
        t.`id`,
        t.`name` 
    FROM
        `t_user` t
-- 2nd SQL data

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
-- 3rd SQL data

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
-- 4th SQL data

    SELECT
        t.`name`,
        t.`id` AS `__relation__id` 
    FROM
        `t_user` t 
    WHERE
        t.`id` IN (?, ?, ?, ?, ?)
```



::: tip Note!!!
> eq provides efficient and fast assembly without n+1 worries. You can very flexibly pull the required data and can very conveniently filter and fill additional fields for the data
:::

### Additional Filtering
Although we returned the first three posts for each user, we need to sort the posts in descending order and return recent posts. Comments are also the same, needing to be the first three in ascending order and first-level comments. Because our previous query returned any first 3 comments, we transform the return result as follows
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
     * User's published posts collection
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
                    //Returned posts are today's
                    t_post.publishAt().rangeClosedOpen(nowYear,nextYear); ②
                });

        private String id;
        private String title;
        private LocalDateTime publishAt;
        /**
         * Comment information
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
                    //Only return first level directory
                    t_comment.parentId().eq("0"); ④
                });
        private String id;
        private String content;
        private LocalDateTime createAt;
        /**
         * Commenter
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

- ① First point, we added restrictions to the `posts` property that user needs to associate and return, requiring it to be returned in descending order by `publishAt`
- ②`t_post.publishAt().rangeClosedOpen(today,nextDay);` We restricted the returned posts to only this year
- ③ We restricted the returned `commentList` for each post, requiring it to be returned in ascending order by comment time
- ④`t_comment.parentId().eq("0");` We set the first level directory must be "0", so we restrict here that returned comments can only be first comments

Next, we query this structure
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

Let's view the sql
```sql

-- 1st SQL data
SELECT t.`id`, t.`name`
FROM `t_user` t

-- 2nd SQL data
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
-- 3rd SQL data
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
-- 4th SQL data
SELECT t.`name`, t.`id` AS `__relation__id`
FROM `t_user` t
WHERE t.`id` IN ('f2bf383e-ee8d-44c5-968d-263191ab058e', '2e509ef4-0282-448f-ace0-43501d46ccf4', 'eda79345-6fbf-4ca6-b9bf-4743a3f991e4', '70ec5f9f-7e9b-4f57-b2a4-9a35a163bd3e', '3b63ddd9-b038-4c24-969e-8b478fe862a5')
```

A total of 4 sql statements were generated
- The first sql has nothing to explain, it returns user information
- The second sql groups and partitions posts by user and sorts by publish time in descending order, only filters this year's, and returns the first three
- The third sql groups and partitions comment information by post and sorts by comment time in ascending order and returns the first three
- The fourth sql gets the user information corresponding to comments

### Flatten User
If we want the user in the comment not to be an object but to be data flattened to the comment table, how should we handle it?

Expand user id and user name

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
     * User's published posts collection
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
         * Comment information
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

- ① Here we added the `NavigateFlat` annotation to userId to query and return the id of the user related to the comment. Actually, the comment table itself has `userId`, so this can be omitted. This is just for demonstration.
- ② Get the user name of the user associated with the comment

```sql
-- ......skip previous 3 sql statements
-- 4th SQL data
SELECT `id`, `name`
FROM `t_user`
WHERE `id` IN ('2e509ef4-0282-448f-ace0-43501d46ccf4', 'eda79345-6fbf-4ca6-b9bf-4743a3f991e4', 'f2bf383e-ee8d-44c5-968d-263191ab058e', '3b63ddd9-b038-4c24-969e-8b478fe862a5', '70ec5f9f-7e9b-4f57-b2a4-9a35a163bd3e')
```

We can clearly see from the sql that although we define `@NavigateFlat` separately for two properties, `eq` will intelligently merge these two parts


So far, I feel that user-related queries should be over. Next is comment-related recursive tree query cases
