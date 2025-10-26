---
title: Post Related Queries
order: 30
---

# Post Related Queries
This chapter mainly uses posts as a topic to teach users how to use eq for related business development


## Chapter Focus
- Single table query operations
- Multi-table join queries
- Subqueries `subQuery` and implicit Group `subQueryToGroupJoin`
- Structured object structured collection return structured object `selectAutoInclude`
- Structured object flattening `selectAutoInclude`+`NavigateFlat`
- Structured collection `order`+`limit` return


## Query Posts

Query post with id 123
```java
Post post = easyEntityQuery.queryable(Post.class)
        .whereById("123")
        .singleOrNull();//Return null if not exists


Post post1 = easyEntityQuery.queryable(Post.class)
        .where(t_post -> {
            t_post.id().eq("123");
        })
        .singleOrNull();
```
Query the first post with title containing [故事]
```java
List<Post> postList = easyEntityQuery.queryable(Post.class)
        .where(t_post -> {
            t_post.title().contains("故事");
        }).toList();
```

We can see that we use `contains` instead of `like`. Of course we can also use `like`, but there is a difference between `like` and `contains`

::: warning Difference!!!
> When the queried value contains wildcards [%] or [_], `like` will treat them as wildcards for querying, but `contains` will treat these wildcards as part of the queried content and will not execute as wildcards
> When the queried value is `10%`, `like("10%")` will query content containing 10, even 100, but `contains("10%")` will query content containing `10%`. The `contains` function will specially handle wildcards
:::


## Post Pagination
Paginate the Post table, sort in descending order by `publishAt`, and search by `title`

First, let's define a common class
```java

@Data
public class PageRequest {
    private Integer pageIndex=1;
    private Integer pageSize=5;
}
```
Define request parameters
```java
@Data
public class PostPageRequest extends PageRequest {
    private String title;
}
```

### Pagination Dynamic Conditions
```java
    @PostMapping("/page")
    public EasyPageResult<Post> page(@RequestBody PostPageRequest request) {
        return easyEntityQuery.queryable(Post.class)
                .where(t_post -> {
//                    if(EasyStringUtil.isNotBlank(request.getTitle())){
//                        t_post.title().contains(request.getTitle());
//                    }
                    t_post.title().contains(EasyStringUtil.isNotBlank(request.getTitle()),request.getTitle());
                })
                .orderBy(t_post -> t_post.publishAt().desc())
                .toPageResult(request.getPageIndex(),request.getPageSize());
    }
```
Here are two ways to implement dynamic queries: when title is not empty, add expression filtering. Let's look at the actual situation

- Use if function to wrap expression assertions, supports any java expression
- Use assertion function's first parameter overload, the first parameter defaults to true to execute assertion operation
- Use where overload's first parameter to execute current where when true

Request parameters
```json
{"pageIndex":1,"pageSize":5,"title":"电影"}
```

```java
==> Preparing: SELECT COUNT(*) FROM `t_post` WHERE `title` LIKE CONCAT('%',?,'%')
==> Parameters: 电影(String)


==> Preparing: SELECT `id`,`title`,`content`,`user_id`,`publish_at` FROM `t_post` WHERE `title` LIKE CONCAT('%',?,'%') ORDER BY `publish_at` DESC LIMIT 3
==> Parameters: 电影(String)
```


::: danger contains or like!!!
> Careful friends will notice that we use the contains function instead of the like function, because when the passed query condition itself contains %, like will make % a wildcard, while contains will treat % as part of the queried content. This is something users need to pay attention to. Whether to use contains or like should be decided by users themselves
:::

Recommended approach🔥: Some users may ask if I have many conditions to add, do I have to write it like this every time? eq thoughtfully provides multiple ways to implement dynamic queries such as `filterConfigure`
```java

    easyEntityQuery.queryable(Post.class)
          .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS)
          .where(t_post -> {
              t_post.title().contains(request.getTitle());
          })
          .orderBy(t_post -> t_post.publishAt().desc())
          .toPageResult(pageIndex,pageSize);
```
By adding `filterConfigure` support, parameters that are not null or empty are supported to join conditions, thus achieving dynamic query characteristics. Of course, users can also implement their own custom filters

[See documentation for more dynamic condition settings](/easy-query-doc/en/ability/adv/where)


::: tip Dynamic parameters!!!
> Normally we recommend using `filterConfigure` or using `if` function to wrap conditions instead of using the first `boolean` type parameter of the method to control, because the parameter boolean type overload will make the expression less intuitive and difficult to read, so we strongly recommend `filterConfigure` or using `if` function to wrap conditions
:::

We learned how to use dynamic parameters to control sql in single table query pagination. Next, we will learn how to use parameters to externally control dynamic sorting

### Pagination Dynamic Sorting
First, we modify the request conditions
```java
@Data
public class PostPage3Request extends PageRequest {
    private String title;

    private List<InternalOrder> orders;

    @Data
     public static class InternalOrder{
         private String property;//This is the property field in the Post query
         private boolean asc;//Indicates whether ascending sort is required
     }
}

@PostMapping("/page3")
public EasyPageResult<Post> page3(@RequestBody PostPage3Request request) {
    return easyEntityQuery.queryable(Post.class)
            .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS)
            .where(t_post -> {
                t_post.title().contains(request.getTitle());
            })
            //This request.getOrders()!=null will execute subsequent methods only when true, can also use if wrapping
            //Of course, if you can ensure request.getOrders() is definitely not null, you don't need this check
            .orderBy(request.getOrders()!=null,t_post -> {
                for (PostPage3Request.InternalOrder order : request.getOrders()) {
                    //anyColumn indicates the field to sort, orderBy indicates using ascending or descending order
                    t_post.anyColumn(order.getProperty()).orderBy(order.isAsc());
                }
            })
            .toPageResult(request.getPageIndex(),request.getPageSize());
}
```
Request parameters
```json
{"pageIndex":1,"pageSize":5,"title":"","orders":[{"property":"publishAt","asc":false},{"property":"title","asc":true}]}
```
The sql generated after executing the request is
```sql
==> Preparing: SELECT COUNT(*) FROM `t_post`
<== Time Elapsed: 13(ms)

==> Preparing: SELECT `id`,`title`,`content`,`user_id`,`publish_at` FROM `t_post` ORDER BY `publish_at` DESC,`title` ASC LIMIT 5
<== Time Elapsed: 17(ms)
```

Now we have supported dynamic sorting for pagination. Of course, dynamic sorting is far more than this, [click the link for more dynamic sorting](/easy-query-doc/en/ability/adv/order)

### Pagination Join Filtering
Of course, for most businesses, entity objects are not solitary objects. The current `Post` object is also the same. We often have operations like join tables or subqueries. So how does `eq` quickly and conveniently implement `join`?

This operation of implementing join through association relationships is called `implicit join`

- Query posts where the condition is a certain user's

First, because join is involved, eq provides association relationships to establish a many-to-one association between the original `Post` single table and the user table

#### Generate Association Relationship Through Plugin
- First step: Bring up the UI interface
Enter `nav` inside the `Post` class and prompts like `nav2....` will appear

<img :src="$withBase('/images/navigate2.jpg')">

- Second step: Set association relationship
Because a user will publish multiple posts, the relationship between user and posts is one-to-many, conversely the relationship between post and user is many-to-one

<img :src="$withBase('/images/navigate-ui.jpg')">
After selecting the corresponding association keys, click OK and the plugin will automatically generate strongly-typed properties, lombok properties, or strings

Of course, you can also manually write the association relationship

```java
@Data
@Table("t_post")
@EntityProxy
@EasyAlias("t_post")
@EasyAssertMessage("未找到对应的帖子信息")
public class Post implements ProxyEntityAvailable<Post, PostProxy> {
    @Column(primaryKey = true, comment = "帖子id")
    private String id;
    @Column(comment = "帖子标题")
    private String title;
    @Column(comment = "帖子内容")
    private String content;
    @Column(comment = "用户id")
    private String userId;
    @Column(comment = "发布时间")
    private LocalDateTime publishAt;

    /**
     * Post author
     **/
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {PostProxy.Fields.userId}, targetProperty = {UserProxy.Fields.id})
    private User user;
}
```

After modifying the entity object, we made a `post.userId=user.id` relationship. Next, we create the query object

```java

@Data
public class PostPage4Request extends PageRequest {
    private String title;

    private String userName; ①

    private List<InternalOrder> orders;

    @Data
     public static class InternalOrder{
         private String property;
         private boolean asc;
     }
}

    @PostMapping("/page4")
    public EasyPageResult<Post> page4(@RequestBody PostPage4Request request) {
        return easyEntityQuery.queryable(Post.class)
                .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS)
                .where(t_post -> {
                    t_post.title().contains(request.getTitle());
                    t_post.user().name().contains(request.getUserName());
                })
                .orderBy(request.getOrders()!=null,t_post -> {
                    for (PostPage4Request.InternalOrder order : request.getOrders()) {
                        t_post.anyColumn(order.getProperty()).orderBy(order.isAsc());
                    }
                })
                .toPageResult(request.getPageIndex(),request.getPageSize());
    }

```
- ① is the new query property `userName` we added

Next, we send the request
```json
{
	"pageIndex": 1,
	"pageSize": 5,
	"title": "",
	"userName": "用户A",①
	"orders": [{
		"property": "user.createAt",②
		"asc": false
	}, {
		"property": "title",
		"asc": true
	}]
}
```
```sql
==> Preparing: SELECT COUNT(*) FROM `t_post` t LEFT JOIN `t_user` t1 ON t1.`id` = t.`user_id` WHERE t1.`name` LIKE CONCAT('%',?,'%')
==> Parameters: 用户A(String)

==> Preparing: SELECT t.`id`,t.`title`,t.`content`,t.`user_id`,t.`publish_at` FROM `t_post` t LEFT JOIN `t_user` t1 ON t1.`id` = t.`user_id` WHERE t1.`name` LIKE CONCAT('%',?,'%') ORDER BY t1.`create_at` DESC,t.`title` ASC LIMIT 3
==> Parameters: 用户A(String)

```

- ① We use the user name as a filter condition
- ② We use the creation time under user as the sort time, `user.createAt` where `user` is the associated navigation property we defined earlier as many-to-one, `createAt` is the field name of this navigation property

When we pass `userName`, let's see what the sql will be like
```sql
==> Preparing: SELECT COUNT(*) FROM `t_post` t

==> Preparing: SELECT t.`id`,t.`title`,t.`content`,t.`user_id`,t.`publish_at` FROM `t_post` t LEFT JOIN `t_user` t1 ON t1.`id` = t.`user_id` ORDER BY t1.`create_at` DESC,t.`title` ASC LIMIT 5

```
We are surprised to find that eq intelligently removed all `join` from the pagination `total` query, and the sql returning the collection is still retained. If we also remove `orderBy`, we will find that eq will not add the `join` option to the entire sql at all
```sql
==> Preparing: SELECT COUNT(*) FROM `t_post` t
<== Time Elapsed: 21(ms)
<== Total: 1
==> Preparing: SELECT t.`id`,t.`title`,t.`content`,t.`user_id`,t.`publish_at` FROM `t_post` t ORDER BY t.`title` ASC LIMIT 5
<== Time Elapsed: 18(ms)
<== Total: 5
```
You read that right, dynamic join is this simple. This is a truly intelligent ORM framework

### Review
- First, we added a dynamic query filter configuration `filterConfigure(NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS)` to let all condition parameters that are non-null and non-empty join the conditions, thus achieving the dynamic query feature
- Second, because we passed the userName parameter, the expression `t_post.user().name().contains(request.getUserName());` will take effect and will automatically use `leftJoin` to associate post and user based on the corresponding relationship and query the name under the user under post
- Third, because we did not pass the userName parameter, the expression `t_post.user().name().contains(request.getUserName());` will not take effect, but the `orderBy` `user.createAt` will still take effect, so when paging, the `total` query will not `join` because it does not use the `user` table, but the toList query will still perform `leftJoin` because `orderBy` uses it


## Extended Section
### Why Use leftJoin
Because the relationship between any two tables, without clearly specifying that it must exist, the leftJoin operation will not affect the result set of the main table. Assuming that not every Post has a user, if I use user.createAt for sorting, then inner join will reduce the result set of the main table, but this is completely unacceptable as it greatly increases the mental burden on users

So if I want to use `innerJoin` instead of `leftJoin`, we can tell the framework that Post must have a user by adding `required=true` when configuring `@Navigate`
```java
//.....omit other code
public class Post{

    /**
     * Post author
     **/
    @Navigate(value = RelationTypeEnum.ManyToOne,
            selfProperty = {PostProxy.Fields.userId},
            targetProperty = {UserProxy.Fields.id},
            required = true) ①
    private User user;
}
```
By adding ① attribute `required = true`, we can find that the framework will intelligently use `innerJoin` instead of `leftJoin`
```sql
==> Preparing: SELECT COUNT(*) FROM `t_post` t INNER JOIN `t_user` t1 ON t1.`id` = t.`user_id` WHERE t1.`name` LIKE CONCAT('%',?,'%')
==> Parameters: 用户A(String)


==> Preparing: SELECT t.`id`,t.`title`,t.`content`,t.`user_id`,t.`publish_at` FROM `t_post` t INNER JOIN `t_user` t1 ON t1.`id` = t.`user_id` WHERE t1.`name` LIKE CONCAT('%',?,'%') ORDER BY t1.`create_at` DESC,t.`title` ASC LIMIT 3
==> Parameters: 用户A(String)

```

### How to Add ON Conditions to Implicit Join

Many careful friends may want to add additional query conditions when associating users, so how should this be implemented?

Request json as follows, do not query userName, do not sort by user property
```json
{
    "pageIndex":1,
    "pageSize":5,
    "title":"",
    "userName":"",
    "orders":[
        {
            "property":"title",
            "asc":true
        }
    ]
}
```
```java

    @PostMapping("/page4")
    public EasyPageResult<Post> page4(@RequestBody PostPage4Request request) {
        return easyEntityQuery.queryable(Post.class)
                .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS)
                .where(t_post -> {
                    t_post.user().filter(u -> { ①
                        u.phone().ne("123");
                    });
                    t_post.title().contains(request.getTitle());
                    t_post.user().name().contains(request.getUserName());
                })
                .orderBy(request.getOrders() != null, t_post -> {
                    for (PostPage4Request.InternalOrder order : request.getOrders()) {
                        t_post.anyColumn(order.getProperty()).orderBy(order.isAsc());
                    }
                })
                .toPageResult(request.getPageIndex(), request.getPageSize());
    }
```
```sql
==> Preparing: SELECT COUNT(*) FROM `t_post` t INNER JOIN `t_user` t1 ON t1.`id` = t.`user_id` AND t1.`phone` <> ?
==> Parameters: 123(String)

==> Preparing: SELECT t.`id`,t.`title`,t.`content`,t.`user_id`,t.`publish_at` FROM `t_post` t INNER JOIN `t_user` t1 ON t1.`id` = t.`user_id` AND t1.`phone` <> ? ORDER BY t.`title` ASC LIMIT 5
==> Parameters: 123(String)

```
- ① will add conditions to the join's on to implement definition filtering for association relationships

A strange thing happened: why did we add `inner join` even though we didn't pass user-related data? Actually, the essence is that the `on` condition of `inner join` affects the main table quantity, which is essentially the same as writing it in `where`. So although you don't have `where` conditions, the `on` condition of `inner join` still prevents the entire expression's `join` from being dynamically optimized.



::: tip filter!!!
> The `filter` of association relationships will appear in the sql in the form of `join on`, which is equivalent to additional filtering for association relationships, narrowing the relationship table. And because the relationship between post and user is that post must have user: `required=true`, `inner join` will be used instead of `left join`
:::

## Post Content Returns Username
We previously used associations to support post filtering by user name. So if we need to return the post and the corresponding poster's name, how should we handle it?
### Create Response DTO
```java
/**
 * create time 2025/8/6 22:45
 * {@link com.eq.doc.domain.Post} ①
 *
 * @author xuejiaming
 */
@Data
@EntityProxy ②
@SuppressWarnings("EasyQueryFieldMissMatch") ③
public class PostPage4Response {
    private String id;
    private String title;
    private String content;
    private String userId;
    private LocalDateTime publishAt;
    
    private String userName; ④
}

```
- ① Mark which table the current DTO comes from on the dto, so the plugin can prompt related errors
- ② Custom dto object proxy to implement assignment within expressions
- ③ Because of ①, ④ will have a plugin warning that this field does not exist. Add ③ to let the plugin not prompt
- ④ Add an extra field to receive the user name

```java

    @PostMapping("/page5")
    public EasyPageResult<PostPage4Response> page5(@RequestBody PostPage4Request request) {
        return easyEntityQuery.queryable(Post.class)
                .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS)
                .where(t_post -> {
                    t_post.title().contains(request.getTitle());
                    t_post.user().name().contains(request.getUserName());
                })
                .orderBy(request.getOrders() != null, t_post -> {
                    for (PostPage4Request.InternalOrder order : request.getOrders()) {
                        t_post.anyColumn(order.getProperty()).orderBy(order.isAsc());
                    }
                })
                .select(t_post -> new PostPage4ResponseProxy() ①
                        .id().set(t_post.id())
                        .title().set(t_post.title())
                        .content().set(t_post.content())
                        .userId().set(t_post.userId())
                        .publishAt().set(t_post.publishAt())
                        .userName().set(t_post.user().name()) ②
                )
                .toPageResult(request.getPageIndex(), request.getPageSize());
    }
```
- ① With the @EntityProxy annotation, the eq framework will generate a proxy object that supports dsl expression assignment
- ② Assign to dto using implicit join

```sql
==> Preparing: SELECT COUNT(*) FROM `t_post` t

==> Preparing: SELECT t.`id` AS `id`,t.`title` AS `title`,t.`content` AS `content`,t.`user_id` AS `user_id`,t.`publish_at` AS `publish_at`,t1.`name` AS `user_name` FROM `t_post` t INNER JOIN `t_user` t1 ON t1.`id` = t.`user_id` ORDER BY t.`title` ASC LIMIT 5
```
We can see that the generated sql assigns the `name` of the joined `user` table to the `userName` property of the dto

So if there are many properties and they are the same, do we have a simpler and more convenient approach?
```java
.select(t_post -> new PostPage4ResponseProxy()
        .selectAll(t_post) ①
        .userName().set(t_post.user().name())
)
```
- ① Copy properties using `selectAll` instead of the original property assignment. If there are unwanted fields, they can be excluded through `selectIgnores` as follows:
```java

        return easyEntityQuery.queryable(Post.class)
                .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS)
                .where(t_post -> {
                    t_post.title().contains(request.getTitle());
                    t_post.user().name().contains(request.getUserName());
                })
                .orderBy(request.getOrders() != null, t_post -> {
                    for (PostPage4Request.InternalOrder order : request.getOrders()) {
                        t_post.anyColumn(order.getProperty()).orderBy(order.isAsc());
                    }
                })
                .select(t_post -> new PostPage4ResponseProxy()
                        .selectAll(t_post)//Query all fields of post
                        .selectIgnores(t_post.title())//Exclude title
                        .userName().set(t_post.user().name())
                )
                .toPageResult(request.getPageIndex(), request.getPageSize());
```
```sql
==> Preparing: SELECT COUNT(*) FROM `t_post` t

==> Preparing: SELECT t.`id`,t.`content`,t.`user_id`,t.`publish_at`,t1.`name` AS `user_name` FROM `t_post` t INNER JOIN `t_user` t1 ON t1.`id` = t.`user_id` ORDER BY t.`title` ASC LIMIT 5

```

So is there a way to return without using @EntityProxy?

### include Query


Sometimes we want the returned data content to include user-related information. So how should we operate to include user information in the returned post information?

```java

    @PostMapping("/page7")
    public EasyPageResult<Post> page7(@RequestBody PostPage7Request request) {
        return easyEntityQuery.queryable(Post.class)
                .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS)
                .include(t_post -> t_post.user())
                .where(t_post -> {
                    t_post.title().contains(request.getTitle());
                    t_post.user().name().contains(request.getUserName());
                })
                .toPageResult(request.getPageIndex(), request.getPageSize());
    }
```
This time we choose to return the post entity object, and do not define a dto structure return

```sql
==> Preparing: SELECT COUNT(*) FROM `t_post` t


==> Preparing: SELECT t.`id`,t.`title`,t.`content`,t.`user_id`,t.`publish_at` FROM `t_post` t LIMIT 5


==> Preparing: SELECT t.`id`,t.`name`,t.`phone`,t.`create_at` FROM `t_user` t WHERE t.`id` IN (?,?,?,?)
==> Parameters: c529b9ba-a90d-490e-9bad-15ef7c4f33cc(String),8510a91a-274e-494f-9325-f55c004706e5(String),1b59fa07-1824-4e01-a491-c780d167cf44(String),23376c96-a315-4a3f-aeb8-2e29c02f330b(String)
```

The framework returns the entire data through multiple batch returns (note that the second data query has no N+1 problem, feel free to use it), and the returned data is in the form of structured objects returned to the frontend

Returned response data
```json

        {
            "id": "0c7fd05f-f999-4fcc-8c98-c0509b22b7f1",
            "title": "健身计划分享",
            "content": "# 这是用户用户D的帖子内容\n包含丰富的文本内容...",
            "userId": "c529b9ba-a90d-490e-9bad-15ef7c4f33cc",
            "publishAt": "2025-08-03T21:24:00.577",
            "user": {
                "id": "c529b9ba-a90d-490e-9bad-15ef7c4f33cc",
                "name": "用户D",
                "phone": "18806982998",
                "createAt": "2025-07-10T13:24:00.576"
            }
        }
```

So if we only want to return user's id and name when returning, how should we implement it?

- First method: return database object but only query id and name
- Second method: define dto using `selectAutoInclude`

### include Partial Columns
```java
easyEntityQuery.queryable(Post.class)
                .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS)
                .include(t_post -> t_post.user(),uq->{
                    uq.select(u->u.FETCHER.id().name());
                })
                .where(t_post -> {
                    t_post.title().contains(request.getTitle());
                    t_post.user().name().contains(request.getUserName());
                })
                .toList()
```
```sql
==> Preparing: SELECT COUNT(*) FROM `t_post` t


==> Preparing: SELECT t.`id`,t.`title`,t.`content`,t.`user_id`,t.`publish_at` FROM `t_post` t LIMIT 5


==> Preparing: SELECT t.`id`,t.`name` FROM `t_user` t WHERE t.`id` IN (?,?,?,?)
==> Parameters: c529b9ba-a90d-490e-9bad-15ef7c4f33cc(String),8510a91a-274e-494f-9325-f55c004706e5(String),1b59fa07-1824-4e01-a491-c780d167cf44(String),23376c96-a315-4a3f-aeb8-2e29c02f330b(String)

```
Returned response data
```json

        {
            "id": "0c7fd05f-f999-4fcc-8c98-c0509b22b7f1",
            "title": "健身计划分享",
            "content": "# 这是用户用户D的帖子内容\n包含丰富的文本内容...",
            "userId": "c529b9ba-a90d-490e-9bad-15ef7c4f33cc",
            "publishAt": "2025-08-03T21:24:00.577",
            "user": {
                "id": "c529b9ba-a90d-490e-9bad-15ef7c4f33cc",
                "name": "用户D",
                "phone": null,
                "createAt": null
            }
        }
```
The include function has multiple overloads where the second parameter is used to describe additional operations for the previous include, here it's set to return only id and name

We see that only id and name are queried when querying

This query still returns the database object, so it's not possible to remove `phone` and `createAt` from the returned shape. So is there a way to determine the shape?

The answer is to use dto to replace the database object and use the `selectAutoInclude` api


### Convert Structured Object to DTO
Structured dto is used to return dto with a determined shape, suitable for generating documentation and downstream data interaction. You can perform the following operations after installing the plugin

First step: use plugin to create structured dto

Right-click on the dto package and select `CreateStructDTO`

<img :src="$withBase('/images/csdto1.jpg')">

Second step: select the object to return

<img :src="$withBase('/images/csdto2.jpg')">

Third step: check the fields to return

<img :src="$withBase('/images/csdto3.jpg')">

After confirming the dto name, the framework will directly generate the dto object for us
```java

/**
 * this file automatically generated by easy-query struct dto mapping
 * 当前文件是easy-query自动生成的 结构化dto 映射
 * {@link com.eq.doc.domain.Post }
 *
 * @author xuejiaming
 * @easy-query-dto schema: normal
 */
@Data
public class PostDTO {


    @Column(comment = "帖子id")
    private String id;
    @Column(comment = "帖子标题")
    private String title;
    @Column(comment = "帖子内容")
    private String content;
    @Column(comment = "发布时间")
    private LocalDateTime publishAt;
    /**
     * 发帖人
     **/
    @Navigate(value = RelationTypeEnum.ManyToOne)
    private InternalUser user;


    /**
     * {@link com.eq.doc.domain.User }
     */
    @Data
    public static class InternalUser {
        @Column(comment = "用户id")
        private String id;
        @Column(comment = "用户姓名")
        private String name;


    }

}


@PostMapping("/selectAutoInclude")
public List<PostDTO> selectAutoInclude(@RequestBody PostPage7Request request) {
    return easyEntityQuery.queryable(Post.class)
            .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS)
            .include(t_post -> t_post.user(),uq->{
                uq.select(u->u.FETCHER.id().name());
            })
            .where(t_post -> {
                t_post.title().contains(request.getTitle());
                t_post.user().name().contains(request.getUserName());
            })
            .selectAutoInclude(PostDTO.class) ①
            .toList();
}
```

```sql
==> Preparing: SELECT t.`id`,t.`title`,t.`content`,t.`publish_at`,t.`user_id` AS `__relation__userId` FROM `t_post` t


==> Preparing: SELECT t.`id`,t.`name` FROM `t_user` t WHERE t.`id` IN (?,?,?,?,?)
==> Parameters: c529b9ba-a90d-490e-9bad-15ef7c4f33cc(String),8510a91a-274e-494f-9325-f55c004706e5(String),1b59fa07-1824-4e01-a491-c780d167cf44(String),23376c96-a315-4a3f-aeb8-2e29c02f330b(String),947ee5fd-5fd0-4889-94e3-03c5efff2c3a(String)
```

```json

    {
        "id": "0c7fd05f-f999-4fcc-8c98-c0509b22b7f1",
        "title": "健身计划分享",
        "content": "# 这是用户用户D的帖子内容\n包含丰富的文本内容...",
        "publishAt": "2025-08-03T21:24:00.577",
        "user": {
            "id": "c529b9ba-a90d-490e-9bad-15ef7c4f33cc",
            "name": "用户D"
        }
    }
```

The framework still uses in to solve the n+1 problem to implement structured object return. The framework supports returning any structured object including structured object flattening

- ① `selectAutoInclude` is a combination of `select` api and `include`, which will automatically assemble the data structure according to the dto requirements and return it

::: danger Note!!!
> Note never pass database objects into `selectAutoInclude`, because passing database objects will cause `selectAutoInclude` to query the entire relationship tree by the root
> Note never pass database objects into `selectAutoInclude`, because passing database objects will cause `selectAutoInclude` to query the entire relationship tree by the root
> Note never pass database objects into `selectAutoInclude`, because passing database objects will cause `selectAutoInclude` to query the entire relationship tree by the root
:::



::: tip selectAutoInclude!!!
> `selectAutoInclude` is one of eq's core data query APIs. Users must fully master it to improve efficiency by 1000%, and there is no n+1 problem. It supports subsequent one-to-one and one-to-many arbitrary data penetration queries
:::

### NavigateFlat 🔥

When returning data, if we don't want to return it in the form of structured objects, and want to flatten the user object into the entire post, but don't want to manually copy using set, then we can obtain additional properties through `@NavigateFlat`
```java

/**
 * create time 2025/8/6 22:45
 * {@link com.eq.doc.domain.Post} ①
 *
 * @author xuejiaming
 */
@Data
public class PostPage6Response {
    private String id;
    private String title;
    private String content;
    private String userId;
    private LocalDateTime publishAt;

    @NavigateFlat(pathAlias = "user.id") ②
    private String userName;
}

```

Note that we must add the link ① so that when we write ② pathAlias, the plugin will automatically give corresponding prompts. In querying, we will use `selectAutoInclude` to implement universal queries

```java

    @PostMapping("/page6")
    public EasyPageResult<PostPage6Response> page6(@RequestBody PostPage4Request request) {
        return easyEntityQuery.queryable(Post.class)
                .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS)
                .where(t_post -> {
                    t_post.title().contains(request.getTitle());
                    t_post.user().name().contains(request.getUserName());
                })
                .orderBy(request.getOrders() != null, t_post -> {
                    for (PostPage4Request.InternalOrder order : request.getOrders()) {
                        t_post.anyColumn(order.getProperty()).orderBy(order.isAsc());
                    }
                })
                .selectAutoInclude(PostPage6Response.class)
                .toPageResult(request.getPageIndex(), request.getPageSize());
    }
```

```sql
==> Preparing: SELECT COUNT(*) FROM `t_post` t


==> Preparing: SELECT t.`id`,t.`title`,t.`content`,t.`user_id`,t.`publish_at` FROM `t_post` t ORDER BY t.`title` ASC LIMIT 5


==> Preparing: SELECT `id` FROM `t_user` WHERE `id` IN (?,?,?)
==> Parameters: 8510a91a-274e-494f-9325-f55c004706e5(String),23376c96-a315-4a3f-aeb8-2e29c02f330b(String),c529b9ba-a90d-490e-9bad-15ef7c4f33cc(String)
```

::: danger Note!!!
> Note never pass database objects into `selectAutoInclude`, because passing database objects will cause `selectAutoInclude` to query the entire relationship tree by the root
> Note never pass database objects into `selectAutoInclude`, because passing database objects will cause `selectAutoInclude` to query the entire relationship tree by the root
> Note never pass database objects into `selectAutoInclude`, because passing database objects will cause `selectAutoInclude` to query the entire relationship tree by the root
:::


`@NavigateFlat` supports obtaining arbitrary levels of object relationships. If there is `toMany` in the middle of object relationship acquisition, whether it's OneToMany or `ManyToMany`, it will eventually become a `List<?>` collection

## Post Content With Comments
After simple additional object acquisition, we want to implement returning post content to the frontend with the first three related comments. So what methods does eq have?

- `NavigateFlat`+`limit`+`union`
- `NavigateFlat`+`limit`+`partition by`
- `subquery`+`limit`+`joining`
### Add Comment Relationship
```java

@Data
@Table("t_post")
@EntityProxy
@EasyAlias("t_post")
@EasyAssertMessage("未找到对应的帖子信息")
public class Post implements ProxyEntityAvailable<Post, PostProxy> {
    //....business fields

    /**
     * Post author
     **/
    @Navigate(value = RelationTypeEnum.ManyToOne,
            selfProperty = {PostProxy.Fields.userId},
            targetProperty = {UserProxy.Fields.id},
            required = true)
    private User user;


    /**
     * Comment information
     **/
    @Navigate(value = RelationTypeEnum.OneToMany,
            selfProperty = {PostProxy.Fields.id},
            targetProperty = {CommentProxy.Fields.postId})
    private List<Comment> commentList;
}

```

Because the relationship between post and comment is one-to-many, we add the association relationship in the post through the plugin or manually
### limit+union
First, we define the object to return

```java

/**
 * create time 2025/8/6 22:45
 * {@link com.eq.doc.domain.Post}
 *
 * @author xuejiaming
 */
@Data
public class PostPage8Response {
    private String id;
    private String title;
    private String content;
    private String userId;
    private LocalDateTime publishAt;

    @NavigateFlat(pathAlias = "user.id")
    private String userName;

    /**
     * Comment information
     **/
    @Navigate(value = RelationTypeEnum.OneToMany,orderByProps = {
            @OrderByProperty(property = "createAt",asc = true)
    },limit = 3)
    private List<InternalComment> commentList;

    /**
     * {@link Comment}
     **/
    @Data
    public static class InternalComment {
        private String id;
        private String parentId;
        private String content;
        private LocalDateTime createAt;
    }

}
```

This way we set up the data to return and support returning 3 additional comments
```java

    @PostMapping("/postWithCommentPage")
    public List<PostPage8Response> postWithCommentPage(@RequestBody PostPage7Request request) {
        return easyEntityQuery.queryable(Post.class)
                .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS)
                .where(t_post -> {
                    t_post.title().contains(request.getTitle());
                    t_post.user().name().contains(request.getUserName());
                })
                .selectAutoInclude(PostPage8Response.class).toList();
    }
```

```json

    {
        "id": "0c7fd05f-f999-4fcc-8c98-c0509b22b7f1",
        "title": "健身计划分享",
        "content": "# 这是用户用户D的帖子内容\n包含丰富的文本内容...",
        "userId": "c529b9ba-a90d-490e-9bad-15ef7c4f33cc",
        "publishAt": "2025-08-03T21:24:00.577",
        "userName": "c529b9ba-a90d-490e-9bad-15ef7c4f33cc",
        "commentList": [
            {
                "id": "67c9ceb0-3eef-44ba-8bbc-c0d1f15f00ad",
                "parentId": "0",
                "content": "期待更多这样的内容",
                "createAt": "2025-08-05T17:24:00.579"
            },
            {
                "id": "d7753586-4bb9-448b-bedb-b178df897bca",
                "parentId": "fa80aaa0-9742-4a02-9209-a08d1bd979df",
                "content": "@用户B 我也这么认为",
                "createAt": "2025-08-06T00:24:00.579"
            },
            {
                "id": "2b40e873-5c0d-41c4-bf10-a38461017300",
                "parentId": "67c9ceb0-3eef-44ba-8bbc-c0d1f15f00ad",
                "content": "@用户C 具体是指哪方面？",
                "createAt": "2025-08-06T03:24:00.579"
            }
        ]
    }
```
We see that it truly returns the query results exactly as written in the dto
```sql
-- 1st SQL data
 SELECT
        t.`id`,
        t.`title`,
        t.`content`,
        t.`user_id`,
        t.`publish_at` 
    FROM
        `t_post` t

-- 2nd SQL data
SELECT t1.`id`, t1.`parent_id`, t1.`content`, t1.`create_at`, t1.`post_id` AS `__relation__postId`
FROM (
	(SELECT t.`id`, t.`parent_id`, t.`content`, t.`user_id`, t.`post_id`
		, t.`create_at`
	FROM `t_comment` t
	WHERE t.`post_id` = 'c529b9ba-a90d-490e-9bad-15ef7c4f33cc'
	ORDER BY t.`create_at` ASC
	LIMIT 3)
	UNION ALL
	(SELECT t.`id`, t.`parent_id`, t.`content`, t.`user_id`, t.`post_id`
		, t.`create_at`
	FROM `t_comment` t
	WHERE t.`post_id` = '8510a91a-274e-494f-9325-f55c004706e5'
	ORDER BY t.`create_at` ASC
	LIMIT 3)
	UNION ALL
	(SELECT t.`id`, t.`parent_id`, t.`content`, t.`user_id`, t.`post_id`
		, t.`create_at`
	FROM `t_comment` t
	WHERE t.`post_id` = '1b59fa07-1824-4e01-a491-c780d167cf44'
	ORDER BY t.`create_at` ASC
	LIMIT 3)
	UNION ALL
	(SELECT t.`id`, t.`parent_id`, t.`content`, t.`user_id`, t.`post_id`
		, t.`create_at`
	FROM `t_comment` t
	WHERE t.`post_id` = '23376c96-a315-4a3f-aeb8-2e29c02f330b'
	ORDER BY t.`create_at` ASC
	LIMIT 3)
	UNION ALL
	(SELECT t.`id`, t.`parent_id`, t.`content`, t.`user_id`, t.`post_id`
		, t.`create_at`
	FROM `t_comment` t
	WHERE t.`post_id` = '947ee5fd-5fd0-4889-94e3-03c5efff2c3a'
	ORDER BY t.`create_at` ASC
	LIMIT 3)
	UNION ALL
	(SELECT t.`id`, t.`parent_id`, t.`content`, t.`user_id`, t.`post_id`
		, t.`create_at`
	FROM `t_comment` t
	WHERE t.`post_id` = ?
	ORDER BY t.`create_at` ASC
	LIMIT 3)
	UNION ALL
	(SELECT t.`id`, t.`parent_id`, t.`content`, t.`user_id`, t.`post_id`
		, t.`create_at`
	FROM `t_comment` t
	WHERE t.`post_id` = ?
	ORDER BY t.`create_at` ASC
	LIMIT 3)
	UNION ALL
	(SELECT t.`id`, t.`parent_id`, t.`content`, t.`user_id`, t.`post_id`
		, t.`create_at`
	FROM `t_comment` t
	WHERE t.`post_id` = ?
	ORDER BY t.`create_at` ASC
	LIMIT 3)
	UNION ALL
	(SELECT t.`id`, t.`parent_id`, t.`content`, t.`user_id`, t.`post_id`
		, t.`create_at`
	FROM `t_comment` t
	WHERE t.`post_id` = ?
	ORDER BY t.`create_at` ASC
	LIMIT 3)
	UNION ALL
	(SELECT t.`id`, t.`parent_id`, t.`content`, t.`user_id`, t.`post_id`
		, t.`create_at`
	FROM `t_comment` t
	WHERE t.`post_id` = ?
	ORDER BY t.`create_at` ASC
	LIMIT 3)
	UNION ALL
	(SELECT t.`id`, t.`parent_id`, t.`content`, t.`user_id`, t.`post_id`
		, t.`create_at`
	FROM `t_comment` t
	WHERE t.`post_id` = ?
	ORDER BY t.`create_at` ASC
	LIMIT 3)
	UNION ALL
	(SELECT t.`id`, t.`parent_id`, t.`content`, t.`user_id`, t.`post_id`
		, t.`create_at`
	FROM `t_comment` t
	WHERE t.`post_id` = ?
	ORDER BY t.`create_at` ASC
	LIMIT 3)
) t1
-- 3rd SQL data
   SELECT
        `id` 
    FROM
        `t_user` 
    WHERE
        `id` IN (?, ?, ?, ?, ?)
```

This generated three SQL statements, with limit+union as the second SQL, but union makes the SQL relatively complex and redundant, so we try the second method provided by eq

### limit+partition by
Add configuration item to SpringBoot's `application.yml`
```yml
easy-query:
  #Supported databases
  database: mysql
  #Converter for object properties and database column names
  name-conversion: underlined
  default-track: true
  include-limit-mode: partition
```
- `include-limit-mode: partition` changes the original `union all` to `partition` (partition may become the default in the future)

Next, we continue the request
```sql

-- 1st SQL data

    SELECT
        t.`id`,
        t.`title`,
        t.`content`,
        t.`user_id`,
        t.`publish_at` 
    FROM
        `t_post` t


-- 2nd SQL data

    SELECT
        t2.`id` AS `id`,
        t2.`parent_id` AS `parent_id`,
        t2.`content` AS `content`,
        t2.`create_at` AS `create_at`,
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
                t.`post_id` 
            ORDER BY
                t.`create_at` ASC)) AS `__row__` 
            FROM
                `t_comment` t 
            WHERE
                t.`post_id` IN ('09e8395e-b7f7-48b4-8227-fcbf96c35d1e', '5d40f560-af15-4566-93cd-9359e0a27501', '76cdba56-b1f8-4432-bc0e-764d491c6cd5', '81eb5fb7-ec57-45d3-b9b9-5e6217ec4d31', '8a6f16a6-b51e-4a39-9ea9-fda57502bb29', 'a6982186-afc5-4f49-977d-97ff8c25cd9f', 'b1eb997d-9cb0-40ca-9495-a9d41da21125', 'b4f74aeb-3868-4810-9845-cab9e882229b', 'bf7e62ee-d833-4f5a-9a0a-07b9634ba26a', 'c6d0631f-160a-4a8c-8401-62db614f87c8', 'd9629994-d9fa-46a3-bd7c-5982f0900a3d', 'ed01ea8a-4162-42ba-a632-dd6d67bf9d45', 'f27edcf7-0fd8-44e3-b3cc-cbba41427dfe')) t1 
        WHERE
            t1.`__row__` >= 1 
            AND t1.`__row__` <= 3) t2



-- 3rd SQL data

    SELECT
        `id` 
    FROM
        `t_user` 
    WHERE
        `id` IN ('15b6a7c1-3f27-4d21-b67c-9c05cd9bf4b6', '2ae21dfa-9330-4d8c-bbfa-6b4618c56c45', '6e50464d-17a7-4f12-8458-c896d55dd276', '1d2a9d56-63df-4413-bd83-ff9a0c0a2166', '2ede4599-8f1a-4d0c-a0af-0dd50d903b87')
```
```json
{
        "id": "5d40f560-af15-4566-93cd-9359e0a27501",
        "title": "健身计划分享",
        "content": "# 这是用户用户E的帖子内容\n包含丰富的文本内容...",
        "userId": "2ae21dfa-9330-4d8c-bbfa-6b4618c56c45",
        "publishAt": "2025-08-04T08:09:30.301",
        "userName": "2ae21dfa-9330-4d8c-bbfa-6b4618c56c45",
        "commentList": [
            {
                "id": "de5337b2-e13c-49f3-9b15-ac393784fc6f",
                "parentId": "46da0914-b046-45ad-8847-1c65c82ac71c",
                "content": "@用户C 有不同看法：",
                "createAt": "2025-08-07T06:09:30.304"
            },
            {
                "id": "daf5102c-b4dd-4f65-bee6-9b3df4f1b5d9",
                "parentId": "0",
                "content": "写得真详细",
                "createAt": "2025-08-07T09:09:30.304"
            },
            {
                "id": "46da0914-b046-45ad-8847-1c65c82ac71c",
                "parentId": "0",
                "content": "期待更多这样的内容",
                "createAt": "2025-08-07T10:09:30.304"
            }
        ]
    }
```
We see that through simple configuration, we made the one-to-many return of the first n items easy and simple and can quickly support pagination, but attentive friends must have found a problem. The comments we need are not spread across the entire post. Although posts and comments are one-to-many, comments themselves are also self-referential, and comment design also supports nested replies, so how should we set it so that the returned comments support returning the first level?

### EXTRA_AUTO_INCLUDE_CONFIGURE
Using eq's `EXTRA_AUTO_INCLUDE_CONFIGURE` can add extra fields or additional search sorting and other processing to `selectAutoInclude` queries

For more information about `EXTRA_AUTO_INCLUDE_CONFIGURE` please [see the documentation](/easy-query-doc/en/ability/return-result/extra)

First step: Use the plugin to quickly prompt and insert `EXTRA_AUTO_INCLUDE_CONFIGURE` into the original dto object

<img :src="$withBase('/images/extra-include-tip.jpg')">

We remove the `select` operation because we don't need it

Finally, our return dto is as follows
```java

/**
 * create time 2025/8/6 22:45
 * {@link com.eq.doc.domain.Post}
 *
 * @author xuejiaming
 */
@Data
public class PostPage9Response {
    private String id;
    private String title;
    private String content;
    private String userId;
    private LocalDateTime publishAt;

    @NavigateFlat(pathAlias = "user.id")
    private String userName;

    /**
     * Comment information
     **/
    @Navigate(value = RelationTypeEnum.OneToMany,orderByProps = {
            @OrderByProperty(property = "createAt",asc = true)
    },limit = 3)
    private List<InternalComment> commentList;

    /**
     * {@link Comment}
     **/
    @Data
    public static class InternalComment {


        private static final ExtraAutoIncludeConfigure EXTRA_AUTO_INCLUDE_CONFIGURE = CommentProxy.TABLE.EXTRA_AUTO_INCLUDE_CONFIGURE()
                .where(t_comment -> {
                    t_comment.parentId().eq("0");
                });

        private String id;
        private String parentId;
        private String content;
        private LocalDateTime createAt;
    }

}
```
We see the middle sql as follows
```sql

    SELECT
        t2.`id` AS `id`,
        t2.`parent_id` AS `parent_id`,
        t2.`content` AS `content`,
        t2.`create_at` AS `create_at`,
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
                t.`post_id` 
            ORDER BY
                t.`create_at` ASC)) AS `__row__` 
            FROM
                `t_comment` t 
            WHERE
                t.`parent_id` = '0'  ①
                AND t.`post_id` IN ('09e8395e-b7f7-48b4-8227-fcbf96c35d1e', '5d40f560-af15-4566-93cd-9359e0a27501', '76cdba56-b1f8-4432-bc0e-764d491c6cd5', '81eb5fb7-ec57-45d3-b9b9-5e6217ec4d31', '8a6f16a6-b51e-4a39-9ea9-fda57502bb29', 'a6982186-afc5-4f49-977d-97ff8c25cd9f', 'b1eb997d-9cb0-40ca-9495-a9d41da21125', 'b4f74aeb-3868-4810-9845-cab9e882229b', 'bf7e62ee-d833-4f5a-9a0a-07b9634ba26a', 'c6d0631f-160a-4a8c-8401-62db614f87c8', 'd9629994-d9fa-46a3-bd7c-5982f0900a3d', 'ed01ea8a-4162-42ba-a632-dd6d67bf9d45', 'f27edcf7-0fd8-44e3-b3cc-cbba41427dfe')) t1 
        WHERE
            t1.`__row__` >= 1 
            AND t1.`__row__` <= 3) t2
```
- ① was added by us through extra configuration

The returned json is as follows
```json
{
        "id": "b4f74aeb-3868-4810-9845-cab9e882229b",
        "title": "初探人工智能",
        "content": "# 这是用户用户E的帖子内容\n包含丰富的文本内容...",
        "userId": "2ae21dfa-9330-4d8c-bbfa-6b4618c56c45",
        "publishAt": "2025-08-07T02:09:30.301",
        "userName": "2ae21dfa-9330-4d8c-bbfa-6b4618c56c45",
        "commentList": [
            {
                "id": "238fea11-c5d1-4485-977d-a0126cb74402",
                "parentId": "0",
                "content": "期待更多这样的内容",
                "createAt": "2025-08-07T09:09:30.304"
            },
            {
                "id": "e216eaf8-bf15-4eeb-aa4c-6489be83c355",
                "parentId": "0",
                "content": "内容很实用",
                "createAt": "2025-08-07T16:09:30.304"
            },
            {
                "id": "830bd1d9-1600-43a2-94b7-f6426a8a78c9",
                "parentId": "0",
                "content": "写得真详细",
                "createAt": "2025-08-07T17:09:30.304"
            }
        ]
    }
```

The returned post node perfectly meets our content

But sometimes we may need to return post information and the first three contents and merge the first three contents into one field, so how should we do it

### joining - comma separated
Sometimes we want to return, for example, today's user posts with each post content and the first three comments separated by commas returned to the frontend to display on the pagination, at this time we have two choices

- First, we can return through eq's powerful expression function `joining`
- Second is to return a structured dto, let the frontend handle it
```json
{
    "postId":"",
    "title":"",
    "comments":[
        {
            "content":""
        },
        {
            "content":""
        }
    ]
}
```

The first method uses the expression function joining to return one-to-many

The joining function is divided into two usage methods, namely property joining and standard collection joining

#### Property joining (generally not commonly used)
This api is mainly commonly used for Group, after which you can use `groupTable().name().joining(",",true)`

Parameter  | Function  
---  | --- 
Parameter 1 | Which separator to use, default `,`
Parameter 2  | Whether to deduplicate, default `false`


#### Standard collection joining

Parameter  | Function  
---  | --- 
Parameter 1 | The expression that needs to be separated by commas or other characters, for example `joining(o->o.name())` means to separate the collection's `name` property with commas
Parameter 2  | Which separator to use, default `,`

So how should we deduplicate the separated content inside the standard collection's `joining`? We can use the chain `post.comments().distinct().joining(o->o.content())`


As usual, we still define the corresponding dto
```java

@Data
@EntityProxy
public class PostPage10Response {
    private String id;
    private String title;
    private String content;
    private String userId;
    private LocalDateTime publishAt;

    private String userName;
    
    private String commentContent;

}



    @PostMapping("/postWithCommentPage3")
    public List<PostPage10Response> postWithCommentPage3(@RequestBody PostPage7Request request) {
        return easyEntityQuery.queryable(Post.class)
                .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS)
                .where(t_post -> {
                    t_post.title().contains(request.getTitle());
                    t_post.user().name().contains(request.getUserName());
                })
                .select(t_post -> new PostPage10ResponseProxy()
                        .selectAll(t_post)
                        .userName().set(t_post.user().name())
                        .commentContent().set(
                            t_post.commentList()①
                                .where(c->c.parentId().eq("0"))②
                                .elements(0,2)③
                                .joining(c->c.content())④
                            )
                ).toList();
    }
```

Let's look at the expression `t_post.commentList().where(c->c.parentId().eq("0")).joining(c->c.content())` This expression merges the comment collection `commentList` under the post through where filtering to get the first three content items
- ① represents the subquery collection item to be returned `commentList`
- ② filters this subquery collection item
- ③ selects element indexes [0...2], i.e., the first three
- ④ aggregates and separates by commas `commentList.content`

```json
{
        "id": "09e8395e-b7f7-48b4-8227-fcbf96c35d1e",
        "title": "夏日旅行攻略",
        "content": "# 这是用户用户D的帖子内容\n包含丰富的文本内容...",
        "userId": "15b6a7c1-3f27-4d21-b67c-9c05cd9bf4b6",
        "publishAt": "2025-08-05T03:09:30.301",
        "userName": "用户D",
        "commentContent": "非常好的分享！,期待更多这样的内容,非常好的分享！"
    },
    {
        "id": "5d40f560-af15-4566-93cd-9359e0a27501",
        "title": "健身计划分享",
        "content": "# 这是用户用户E的帖子内容\n包含丰富的文本内容...",
        "userId": "2ae21dfa-9330-4d8c-bbfa-6b4618c56c45",
        "publishAt": "2025-08-04T08:09:30.301",
        "userName": "用户E",
        "commentContent": "完全同意你的观点,期待更多这样的内容,写得真详细"
    }
```
From the result, we can clearly see that `commentContent` is combined together by the `joining` function separated by commas
Let's take a look at the corresponding sql
```sql

    SELECT
        t.`id`,
        t.`title`,
        t.`content`,
        t.`user_id`,
        t.`publish_at`,
        t1.`name` AS `user_name`,
        (SELECT
            GROUP_CONCAT(t2.`content` SEPARATOR ',') 
        FROM
            `t_comment` t2 
        WHERE
            t2.`post_id` = t.`id` 
            AND t2.`parent_id` = '0' 
        LIMIT
            3) AS `comment_content` 
    FROM
        `t_post` t 
    INNER JOIN
        `t_user` t1 
            ON t1.`id` = t.`user_id`
```

The framework clearly assembles the result set through the `group_concat` function to the `comment_content` column through `select subquery`

::: warning Performance!!!
> If users dislike the low performance of select subqueries, eq thoughtfully provides subquery-to-`groupJoin` conversion to help users achieve more efficient sql
:::

Of course, here for demonstration, we used content comma separation. In essence, it should be more appropriate to separate categories with commas

Next, we create the post's category relationship table

The post and category relationship is many-to-many associated through the CategoryPost table

```java

@Data
@Table("t_post")
@EntityProxy
@EasyAlias("t_post")
@EasyAssertMessage("未找到对应的帖子信息")
public class Post implements ProxyEntityAvailable<Post, PostProxy> {
    //....other business fields and navigation properties


    /**
     * Post category information
     **/
    @Navigate(value = RelationTypeEnum.ManyToMany,
            selfProperty = {PostProxy.Fields.id},
            selfMappingProperty = {CategoryPostProxy.Fields.postId},
            mappingClass = CategoryPost.class, targetProperty = {CategoryProxy.Fields.id},
            targetMappingProperty = {CategoryPostProxy.Fields.categoryId}, subQueryToGroupJoin = true) ①
    private List<Category> categoryList;
}
```

- Where we see ① `subQueryToGroupJoin = true`, this configuration item allows the original many-to-many subquery to directly use `groupJoin` when used, which can make the generated sql more efficient

Return post content + user + first three comments + comma-separated categories

Set return dto
```java

/**
 * create time 2025/8/6 22:45
 * {@link com.eq.doc.domain.Post}
 *
 * @author xuejiaming
 */
@Data
public class PostPage11Response {

    private static final ExtraAutoIncludeConfigure EXTRA_AUTO_INCLUDE_CONFIGURE = PostProxy.TABLE.EXTRA_AUTO_INCLUDE_CONFIGURE()
            .select(t_post -> Select.of(
                    t_post.categoryList().joining(cate->cate.name()).as("categoryNames")
            ));
        
    private String id;
    private String title;
    private String content;
    private String userId;
    private LocalDateTime publishAt;

    @NavigateFlat(pathAlias = "user.id")
    private String userName;

    @SuppressWarnings("EasyQueryFieldMissMatch")
    private String categoryNames;

    /**
     * Comment information
     **/
    @Navigate(value = RelationTypeEnum.OneToMany, orderByProps = {
            @OrderByProperty(property = "createAt", asc = true)
    }, limit = 3)
    private List<InternalComment> commentList;

    /**
     * {@link Comment}
     **/
    @Data
    public static class InternalComment {


        private static final ExtraAutoIncludeConfigure EXTRA_AUTO_INCLUDE_CONFIGURE = CommentProxy.TABLE.EXTRA_AUTO_INCLUDE_CONFIGURE()
                .where(t_comment -> {
                    t_comment.parentId().eq("0");
                });

        private String id;
        private String parentId;
        private String content;
        private LocalDateTime createAt;
    }

}




@PostMapping("/postList4")
public List<PostPage11Response> postList4(@RequestBody PostPage7Request request) {
    return easyEntityQuery.queryable(Post.class)
            .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS)
            .where(t_post -> {
                t_post.title().contains(request.getTitle());
                t_post.user().name().contains(request.getUserName());
            })
            .selectAutoInclude(PostPage11Response.class).toList();
}
```

We support direct return of extra fields by adding extra fields to the main table

- `@SuppressWarnings("EasyQueryFieldMissMatch")` This annotation is mainly used to suppress plugin warnings. If you think warnings don't matter, you can omit this annotation, it has no effect on the result

```json

    {
        "id": "0c6ab3ab-29a4-4320-a08e-195bdac27095",
        "title": "JVM调优实战",
        "content": "# 这是用户用户C的帖子内容\n包含丰富的文本内容...",
        "userId": "2e509ef4-0282-448f-ace0-43501d46ccf4",
        "publishAt": "2025-08-04T23:42:43.525",
        "userName": "2e509ef4-0282-448f-ace0-43501d46ccf4",
        "categoryNames": "娱乐,教育",
        "commentList": [
            {
                "id": "2d3643e6-8fb5-4a2b-a0bc-1c92030bfa34",
                "parentId": "0",
                "content": "完全同意你的观点",
                "createAt": "2025-08-07T00:42:43.526"
            },
            {
                "id": "5f7b2333-5578-40cd-940e-28e97d1b0aa1",
                "parentId": "0",
                "content": "完全同意你的观点",
                "createAt": "2025-08-07T11:42:43.526"
            },
            {
                "id": "0b1d0cbd-62a7-4922-b5fe-0ef4780e4c24",
                "parentId": "0",
                "content": "内容很实用",
                "createAt": "2025-08-07T15:42:43.526"
            }
        ]
    },
    {
        "id": "1a0e5854-c748-4c6b-a11d-d5bbb58326a1",
        "title": "电影推荐合集",
        "content": "# 这是用户用户B的帖子内容\n包含丰富的文本内容...",
        "userId": "70ec5f9f-7e9b-4f57-b2a4-9a35a163bd3e",
        "publishAt": "2025-08-03T02:42:43.525",
        "userName": "70ec5f9f-7e9b-4f57-b2a4-9a35a163bd3e",
        "categoryNames": "教育,科技",
        "commentList": [
            {
                "id": "723a588c-0d95-4db7-be6b-1745bfcfc540",
                "parentId": "0",
                "content": "内容很实用",
                "createAt": "2025-08-07T00:42:43.526"
            },
            {
                "id": "116ab46b-9b61-4644-ac10-73e65f5a01b9",
                "parentId": "0",
                "content": "内容很实用",
                "createAt": "2025-08-07T18:42:43.526"
            },
            {
                "id": "65cb0f86-7076-46a6-b333-c9c50e9336ae",
                "parentId": "0",
                "content": "写得真详细",
                "createAt": "2025-08-07T18:42:43.526"
            }
        ]
    }

```

Completely perfectly meets the results we need
```sql

-- 1st SQL data

    SELECT
        t5.`__joining2__` AS `category_names`,
        t.`id`,
        t.`title`,
        t.`content`,
        t.`user_id`,
        t.`publish_at` 
    FROM
        `t_post` t 
    LEFT JOIN
        (SELECT
            t3.`post_id` AS `post_id`, GROUP_CONCAT(t2.`name` SEPARATOR ',') AS `__joining2__` FROM `t_category` t2 
        INNER JOIN
            `t_category_post` t3 
                ON t2.`id` = t3.`category_id` 
        GROUP BY
            t3.`post_id`) t5 
            ON t5.`post_id` = t.`id`
-- 2nd SQL data

    SELECT
        t2.`id` AS `id`,
        t2.`parent_id` AS `parent_id`,
        t2.`content` AS `content`,
        t2.`create_at` AS `create_at`,
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
                t.`post_id` 
            ORDER BY
                t.`create_at` ASC)) AS `__row__` 
            FROM
                `t_comment` t 
            WHERE
                t.`parent_id` = '0' 
                AND t.`post_id` IN ('015c8538-0eaa-4afb-a1c7-4cca00dd6638', '0c6ab3ab-29a4-4320-a08e-195bdac27095', '1a0e5854-c748-4c6b-a11d-d5bbb58326a1', '31a955ba-04ec-4d07-a6d4-fac6c408ab7d', '36eba6b0-5dd4-41b3-a4af-d9c522a86b3a', '573ca56a-4575-458e-8258-7b76c2cfe959', '5f72b5bf-3ae6-4bd6-9df9-cf0c43abc37c', '63d5b82f-64e6-4985-ad4b-acf71d8368fc', '669ce2a5-abaf-49e8-bb7e-e498f7377b15', '73f5d341-c6df-43a1-afcd-e246c4d1fcc9', '89bf6652-0ae0-451a-8a16-d9b543898f81', '8dbcfcfe-44a7-45c2-9db9-d0302c5a9a94')) t1 
        WHERE
            t1.`__row__` >= 1 
            AND t1.`__row__` <= 3) t2
-- 3rd SQL data

    SELECT
        `id` 
    FROM
        `t_user` 
    WHERE
        `id` IN ('3b63ddd9-b038-4c24-969e-8b478fe862a5', '2e509ef4-0282-448f-ace0-43501d46ccf4', '70ec5f9f-7e9b-4f57-b2a4-9a35a163bd3e', 'f2bf383e-ee8d-44c5-968d-263191ab058e', 'eda79345-6fbf-4ca6-b9bf-4743a3f991e4')
```

- The first SQL, we see used to query and return post information and the corresponding categoryNames field using `groupJoin` to replace many-to-many self-query
- The second SQL, we see the framework using `partition by` allows users to easily return the first n comment items
- The third SQL, we use `NavigateFlat` secondary query to eliminate n+1 and return user information

So far, our post-related queries have come to an end. We mainly implemented how the framework can quickly query under one-to-many, many-to-one, and many-to-many relationships and support implicit use of numerous window functions