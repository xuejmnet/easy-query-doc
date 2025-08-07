---
title: 文档案例建模
order: 20
---

# 文档案例建模
本章节主要构建实体关系吸引数据关联 	强调关系建模的基础性

通过前一篇[小试牛刀](/easy-query-doc/startup/quick-start) 我们大概清楚地了解了框架的写法和用法,接下来我们会议springboot项目作为基础演示eq的实战功能 

[入门demo请点击链接](https://github.com/xuejmnet/eq-doc) https://github.com/xuejmnet/eq-doc

## 背景
实体关系如下：
- 用户User：每个用户有多篇帖子和多条评论和多个点赞
- 分类Category：帖子所属分类类目支持多个分类一个帖子或者多个帖子公用同一个分类
- 帖子Post：每篇帖子有多个分类并可获得多个赞
- 评论Comment：每条评论属于一个用户并关联一篇帖子 且评论支持楼中楼
- 点赞Like：每个赞关联一篇帖子，多个点赞可以关联同一篇帖子
- 分类帖子关联CategoryPost：帖子和分类的关联关系表
<img :src="$withBase('/images/entity-relation.png')" width="600">

## 创建实体
我们在创建好springboot的相关项目和框架依赖完成后我们开始针对数据表关系进行建模具体代码如下

我们需要对每一张表包括关联关系表进行创建并且设置关联关系，如果您还未安装插件那么请一定要安装好插件这样我们才能更加事半功倍

我们先创建独单对象表也就是实体之间没有相互关系,等需要时我们在创建对象关系

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

注解说明
- @Data 用来快速生成get set方法的lombok注解
- @Table 用来描述当前类是一个数据库实体对象
- @EntityProxy 用来生成apt表达式操作的代理对象
- @EasyAlias 提供插件快速生成lambda别名
- @EasyAssertMessage 提供默认xxxNotNull时错误内容

<!-- ::: tip 快速创建对象关系!!!
> 在有插件的情况下我们可以通过插件提供的Navigate和MappedBy快速创建实体关系和反向关系具体请看插件章节
::: -->

通过框架提供的auto-ddl功能快速实现表的创建和数据的写入
```java
DatabaseCodeFirst databaseCodeFirst = easyEntityQuery.getDatabaseCodeFirst();
databaseCodeFirst.createDatabaseIfNotExists();
easyEntityQuery.syncTableByPackage("com.eq.doc.domain");
```
具体初始化代码请看地址[AppConfiguration](https://github.com/xuejmnet/eq-doc/blob/main/src/main/java/com/eq/doc/configuration/AppConfiguration.java)

