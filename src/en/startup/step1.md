---
title: Case Modeling
order: 20
---

# Case Modeling
This chapter mainly builds entity relationships to highlight data associations, emphasizing the fundamentals of relationship modeling.

Through the previous chapter [Quick Start](/easy-query-doc/en/startup/quick-start), we roughly understood the framework's writing style and usage. Next, we will use a SpringBoot project as a basis to demonstrate eq's practical features.

[Click here for the starter demo](https://github.com/xuejmnet/eq-doc) https://github.com/xuejmnet/eq-doc

## Background
Entity relationships are as follows:
- User: Each user has multiple posts, multiple comments, and multiple likes
- Category: Post category classification, supports multiple categories for one post or multiple posts sharing the same category
- Post: Each post has multiple categories and can receive multiple likes
- Comment: Each comment belongs to a user and is associated with a post, and comments support nested comments (comments within comments)
- Like: Each like is associated with a post, multiple likes can be associated with the same post
- CategoryPost: Association table for posts and categories

<img :src="$withBase('/images/entity-relation.png')" width="600">

## Create Entities
After creating the SpringBoot related project and completing framework dependencies, we start modeling the database table relationships. The specific code is as follows:

We need to create each table including association tables and set up association relationships. If you haven't installed the plugin yet, please make sure to install it so we can be more efficient.

We first create independent single object tables, that is, there are no mutual relationships between entities. When needed, we will create object relationships.

::: tabs

@tab User
```java
@Data
@Table("t_user")
@EntityProxy
@EasyAlias("t_user")
@EasyAssertMessage("未找到对应的用户信息")
public class User implements ProxyEntityAvailable<User , UserProxy> {
    @Column(primaryKey = true,comment = "用户id")
    private String id;
    @Column(comment = "用户姓名")
    private String name;
    @Column(comment = "用户手机")
    private String phone;
    @Column(comment = "创建时间")
    private LocalDateTime createAt;
}

```
@tab Category
```java

@Data
@Table("t_category")
@EntityProxy
@EasyAlias("t_category")
@EasyAssertMessage("未找到对应的类目信息")
public class Category implements ProxyEntityAvailable<Category , CategoryProxy> {
    @Column(primaryKey = true,comment = "类目id")
    private String id;
    @Column(comment = "类目姓名")
    private String name;
    @Column(comment = "类目排序")
    private Integer sort;
}
```
@tab Post
```java

@Data
@Table("t_post")
@EntityProxy
@EasyAlias("t_post")
@EasyAssertMessage("未找到对应的帖子信息")
public class Post implements ProxyEntityAvailable<Post, PostProxy> {
    @Column(primaryKey = true,comment = "帖子id")
    private String id;
    @Column(comment = "帖子标题")
    private String title;
    @Column(comment = "帖子内容")
    private String content;
    @Column(comment = "用户id")
    private String userId;
    @Column(comment = "发布时间")
    private LocalDateTime publishAt;
}

```
@tab Comment
```java
@Data
@Table("t_comment")
@EntityProxy
@EasyAlias("t_comment")
@EasyAssertMessage("未找到对应的评论信息")
public class Comment implements ProxyEntityAvailable<Comment , CommentProxy> {
    @Column(primaryKey = true,comment = "评论id")
    private String id;
    @Column(comment = "父id")
    private String parentId;
    @Column(comment = "帖子内容")
    private String content;
    @Column(comment = "用户id",nullable = false)
    private String userId;
    @Column(comment = "帖子id",nullable = false)
    private String postId;
    @Column(comment = "回复时间")
    private LocalDateTime createAt;
}
```
@tab Like
```java
@Data
@Table("t_like")
@EntityProxy
@EasyAlias("t_like")
@EasyAssertMessage("未找到对应的点赞信息")
public class Like implements ProxyEntityAvailable<Like , LikeProxy> {
    @Column(primaryKey = true,comment = "评论id")
    private String id;
    @Column(comment = "用户id",nullable = false)
    private String userId;
    @Column(comment = "帖子id",nullable = false)
    private String postId;
    @Column(comment = "点赞时间")
    private LocalDateTime createAt;
}
```
@tab CategoryPost
```java
@Data
@Table("t_category_post")
@EntityProxy
@EasyAlias("t_category_post")
@EasyAssertMessage("未找到对应的类目帖子关联信息")
public class CategoryPost implements ProxyEntityAvailable<CategoryPost , CategoryPostProxy> {
    @Column(primaryKey = true,comment = "评论id")
    private String id;
    @Column(comment = "帖子id",nullable = false)
    private String postId;
    @Column(comment = "类目id",nullable = false)
    private String categoryId;
}
```

:::

Annotation descriptions:
- @Data: Lombok annotation to quickly generate get/set methods
- @Table: Describes that the current class is a database entity object
- @EntityProxy: Generates proxy objects for APT expression operations
- @EasyAlias: Provides plugin quick generation of lambda aliases
- @EasyAssertMessage: Provides default error message when using xxxNotNull

<!-- ::: tip Quickly create object relationships!!!
> With the plugin installed, we can quickly create entity relationships and reverse relationships using the plugin's Navigate and MappedBy features. See the plugin chapter for details.
::: -->

Use the framework's auto-ddl feature to quickly implement table creation and data insertion:
```java
DatabaseCodeFirst databaseCodeFirst = easyEntityQuery.getDatabaseCodeFirst();
databaseCodeFirst.createDatabaseIfNotExists();
easyEntityQuery.syncTableByPackage("com.eq.doc.domain");
```
For specific initialization code, see [AppConfiguration](https://github.com/xuejmnet/eq-doc/blob/main/src/main/java/com/eq/doc/configuration/AppConfiguration.java)
