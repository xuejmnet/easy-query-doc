---
title: 帖子相关查询
order: 30
---

# 帖子相关查询
本章节主要已帖子为话题实战教用户如何使用eq进行相关业务开发


## 帖子分页
对Post表进行分页按`publishAt`倒序进行排序按`title`进行搜索

首先我们定一个公用类
```java

@Data
public class PageRequest {
    private Integer pageIndex=1;
    private Integer pageSize=5;
}
```
定义请求参数
```java
@Data
public class PostPageRequest extends PageRequest {
    private String title;
}
```

### 分页动态条件
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
这边提供了两种方式实现动态查询,当title不为空的时候加入表达式筛选,执行我们来看看实际情况

- 使用if函数包裹表达式断言,支持任意java表达式
- 使用断言函数第一个参数重载，默认第一个参数为true才会执行断言操作
- 使用where重载第一个参数为true执行当前where

请求参数
```json
{"pageIndex":1,"pageSize":5,"title":"电影"}
```

```java
==> Preparing: SELECT COUNT(*) FROM `t_post` WHERE `title` LIKE CONCAT('%',?,'%')
==> Parameters: 电影(String)


==> Preparing: SELECT `id`,`title`,`content`,`user_id`,`publish_at` FROM `t_post` WHERE `title` LIKE CONCAT('%',?,'%') ORDER BY `publish_at` DESC LIMIT 3
==> Parameters: 电影(String)
```


::: danger container还是like!!!
> 细心地朋友会发现我们使用了contains函数而不是like函数,因为当传入的查询条件本身带有%时那么like会让%变成通配符，而contains会将%视为被查询的一部分,这是需要用户注意的,具体使用contains还是like应该有用户自行决断
:::

推荐写法🔥: 可能由用户会问如果我添加的条件有很多怎么办难道每一个都要这么写一遍吗?eq贴心的提供了多种方式来实现动态查询比如`filterConfigure`
```java

    easyEntityQuery.queryable(Post.class)
          .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS)
          .where(t_post -> {
              t_post.title().contains(request.getTitle());
          })
          .orderBy(t_post -> t_post.publishAt().desc())
          .toPageResult(pageIndex,pageSize);
```
通过添加`filterConfigure`支持让参数为null不参与业务,如果是字符串则必须保证`isNotBlank`，当然用户也可以通过自己的自定义来实现

[更多的动态条件设置请参考文档](/easy-query-doc/ability/adv/where)


::: tip 动态参数!!!
> 正常我们推荐使用`filterConfigure`或者使用`if`函数包裹条件而不是使用方法参数的第一个`boolean`类型来控制，因为参数boolean类型重载相对会让表达式不够直观且难以阅读所以我们极力推荐另外几种方式
:::

我们学会了如何在单表查询分页下使用动态参数控制sql,那么接下来我们将学习如何使用参数外部控制动态排序

### 分页动态排序
首先我们对请求的条件进行修改
```java
@Data
public class PostPage3Request extends PageRequest {
    private String title;

    private List<InternalOrder> orders;

    @Data
     public static class InternalOrder{
         private String property;//这个是查询Post内的属性字段
         private boolean asc;//表示是否需要正序排序
     }
}

@PostMapping("/page3")
public EasyPageResult<Post> page3(@RequestBody PostPage3Request request) {
    return easyEntityQuery.queryable(Post.class)
            .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS)
            .where(t_post -> {
                t_post.title().contains(request.getTitle());
            })
            //这个request.getOrders()!=null为true才会执行后续的方法也可以使用if包裹
            //当然如果你能确保request.getOrders()肯定不等于null的那么不需要加这个判断
            .orderBy(request.getOrders()!=null,t_post -> {
                for (PostPage3Request.InternalOrder order : request.getOrders()) {
                    //anyColumn表示需要排序的字段,orderBy表示使用正序还是倒序
                    t_post.anyColumn(order.getProperty()).orderBy(order.isAsc());
                }
            })
            .toPageResult(request.getPageIndex(),request.getPageSize());
}
```
请求参数
```json
{"pageIndex":1,"pageSize":5,"title":"","orders":[{"property":"publishAt","asc":false},{"property":"title","asc":true}]}
```
执行请求后生成的sql为
```sql
==> Preparing: SELECT COUNT(*) FROM `t_post`
<== Time Elapsed: 13(ms)

==> Preparing: SELECT `id`,`title`,`content`,`user_id`,`publish_at` FROM `t_post` ORDER BY `publish_at` DESC,`title` ASC LIMIT 5
<== Time Elapsed: 17(ms)
```

支持我们已经支持了分页的动态排序,当然动态排序功能远不止此,[更多动态排序请点击链接](/easy-query-doc/ability/adv/order)

### 分页join筛选
当然对于大部分业务而言实体对象不是一个孤单对象,当前的`Post`对象也是如此，我们经常会有连表或者子查询等操作，那么`eq`是如何快速便捷的实现`join`的呢

下面这种通过关联关系实现join的操作我们称之为`隐式join`

- 查询帖子要求查询条件是某个用户的

首先因为涉及到join那么eq提供了关联关系将原先的`Post`单表和用户表进行多对一的关联

#### 通过插件生成关联关系
- 第一步呼出ui界面
<img :src="$withBase('/images/navigate2.jpg')">
- 第二步设置关联关系
<img :src="$withBase('/images/navigate-ui.jpg')">
选择好对应的关联键后点击确认插件会帮你自动生成强类型属性|lombok属性或字符串

当然你也可以手写关联关系

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
     * 发帖人
     **/
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {PostProxy.Fields.userId}, targetProperty = {UserProxy.Fields.id})
    private User user;
}
```

修改完实体对象后我们做了一个`post.userId=user.id`的关系接下来我们创建查询对象

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
- ①是我们新添加的查询属性`userName`

接下来我们发送请求
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

- ①我们使用了用户名称作为筛选条件
- ②我们使用了用户下的创建时间作为排序时间,`user.createAt`中`user`是关联导航属性就是我们之前定义的多对一,`createAt`是这个导航属性的字段名

当我们传递`userName`那么看下sql会是怎么样的
```sql
==> Preparing: SELECT COUNT(*) FROM `t_post` t

==> Preparing: SELECT t.`id`,t.`title`,t.`content`,t.`user_id`,t.`publish_at` FROM `t_post` t LEFT JOIN `t_user` t1 ON t1.`id` = t.`user_id` ORDER BY t1.`create_at` DESC,t.`title` ASC LIMIT 5

```
我们惊讶的发现eq非常智能的将分页中的`total`查询的所有`join`都去掉了,并且返回集合的那个sql任然保留,如果我们将`orderBy`也去掉会发现eq居然整个sql都不会添加`join`选项
```sql
==> Preparing: SELECT COUNT(*) FROM `t_post` t
<== Time Elapsed: 21(ms)
<== Total: 1
==> Preparing: SELECT t.`id`,t.`title`,t.`content`,t.`user_id`,t.`publish_at` FROM `t_post` t ORDER BY t.`title` ASC LIMIT 5
<== Time Elapsed: 18(ms)
<== Total: 5
```
你没有看错动态join就是这么简单，这就是真正的只能orm框架

### 回顾一下
- 首先我们添加了动态查询筛选器配置`filterConfigure(NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS)`让所有条件参数非null非空的值支持加入条件，这样就做到了动态查询的特性
- 第二点因为我们传递userName参数，所以表达式的`t_post.user().name().contains(request.getUserName());`会生效并且会自动根据对应的关系使用`leftJoin`将post和user关联起来并且查询post下的user下的姓名
- 第三点因为我们没有传递userName参数，所以表达式的`t_post.user().name().contains(request.getUserName());`不会生效,但是`orderBy`的`user.createAt`还是会生效,所以page的时候`total`的哪一次查询因为没有使用`user`表所以不会`join`，但是toList的那一次因为`orderBy`用到了所以任然会进行`leftJoin`


## 扩展篇
### 为什么使用leftJoin
因为任何两张表的关系在没有明确指定一定存在的情况下那么leftJoin的操作是不会影响主表的结果集,假如每个Post并不是都会有一个user的情况下我如果使用user.createAt进行排序那么inner join会让主表的结果集变少,但这是完全不被允许的这种做法会大大增加用户使用的心智负担

那么如果我希望使用`innerJoin`而不是`leftJoin`呢，我们可以再配置`@Navigate`的时候通过属性`required=true`来告知框架Post必定有user
```java
//.....省略其它代码
public class Post{

    /**
     * 发帖人
     **/
    @Navigate(value = RelationTypeEnum.ManyToOne,
            selfProperty = {PostProxy.Fields.userId},
            targetProperty = {UserProxy.Fields.id},
            required = true) ①
    private User user;
}
```
添加①属性`required = true`这样查询我们就能够发现框架会智能的使用`innerJoin`而不是`leftJoin`
```sql
==> Preparing: SELECT COUNT(*) FROM `t_post` t INNER JOIN `t_user` t1 ON t1.`id` = t.`user_id` WHERE t1.`name` LIKE CONCAT('%',?,'%')
==> Parameters: 用户A(String)


==> Preparing: SELECT t.`id`,t.`title`,t.`content`,t.`user_id`,t.`publish_at` FROM `t_post` t INNER JOIN `t_user` t1 ON t1.`id` = t.`user_id` WHERE t1.`name` LIKE CONCAT('%',?,'%') ORDER BY t1.`create_at` DESC,t.`title` ASC LIMIT 3
==> Parameters: 用户A(String)

```

### 隐式join怎么添加on条件

很多细心的盆友可能希望我们在关联用户的时候添加额外的查询条件那么应该如何实现呢

请求json为如下不查询userName,不进行user的属性排序
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
- ①会将条件添加到join的on上面实现关联关系的定义筛选

奇怪的事情发生了为什么这次我们没有传递user相关的数据依然给我们把`inner join`加上了,其实本质是`inner join`的`on`条件是会影响主表数量，本质和写到`where`里面是一样的,所以虽然你没有`where`的条件但是`inner join`的`on`条件依然会让整个表达式的`join`无法动态优化,



::: tip filter!!!
> 关联关系的`filter`会以`join on`的形式出现在sql中,相当于是额外对关联关系的筛选，缩小关系表,又因为post和user的关系为post必定有user:`required=true`所以会使用`inner join`代替`left join`
:::

## 帖子内容返回用户名
我们之前使用关联让帖子筛选支持用户姓名,那么如果我们需要返回帖子和对应的发帖人姓名应该怎么处理呢
### 创建响应dto
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
- ①在dto上标记当前表来自于哪张表,插件可以提示相关错误
- ②自定义dto对象代理实现表达式内赋值
- ③因为①的存在所以④会有插件提示不存在这个字段的警告，通过添加③来让插件不进行提示
- ④额外增加一个字段接受用户姓名

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
- ①通过@EntityProxy注解eq框架会生成代理对象，改对象支持dsl表达式赋值
- ②通过使用隐式join的方式赋值到dto中

```sql
==> Preparing: SELECT COUNT(*) FROM `t_post` t

==> Preparing: SELECT t.`id` AS `id`,t.`title` AS `title`,t.`content` AS `content`,t.`user_id` AS `user_id`,t.`publish_at` AS `publish_at`,t1.`name` AS `user_name` FROM `t_post` t INNER JOIN `t_user` t1 ON t1.`id` = t.`user_id` ORDER BY t.`title` ASC LIMIT 5
```
我们可以看到生成的sql将`join`的`user`表的`name`赋值给了dto的`userName`属性

那么如果属性很多又一样我们是否可以有建议方便的做法呢
```java
.select(t_post -> new PostPage4ResponseProxy()
        .selectAll(t_post) ①
        .userName().set(t_post.user().name())
)
```
- ①将原先的属性赋值使用`selectAll`进行复制如果存在不需要的字段则可通过`selectIgnores`进行排除如下
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
                        .selectAll(t_post)//查询post的全字段
                        .selectIgnores(t_post.title())//排除title
                        .userName().set(t_post.user().name())
                )
                .toPageResult(request.getPageIndex(), request.getPageSize());
```
```sql
==> Preparing: SELECT COUNT(*) FROM `t_post` t

==> Preparing: SELECT t.`id`,t.`content`,t.`user_id`,t.`publish_at`,t1.`name` AS `user_name` FROM `t_post` t INNER JOIN `t_user` t1 ON t1.`id` = t.`user_id` ORDER BY t.`title` ASC LIMIT 5

```

那么是否有不使用@EntityProxy的方式来返回呢

### include查询


有时候我们希望返回的数据内容包含用户相关信息那么我们应该如何操作才能将返回的post信息里面包含user信息呢

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
这次我们选择返回post本体对象,并且不定义dto结构返回

```sql
==> Preparing: SELECT COUNT(*) FROM `t_post` t


==> Preparing: SELECT t.`id`,t.`title`,t.`content`,t.`user_id`,t.`publish_at` FROM `t_post` t LIMIT 5


==> Preparing: SELECT t.`id`,t.`name`,t.`phone`,t.`create_at` FROM `t_user` t WHERE t.`id` IN (?,?,?,?)
==> Parameters: c529b9ba-a90d-490e-9bad-15ef7c4f33cc(String),8510a91a-274e-494f-9325-f55c004706e5(String),1b59fa07-1824-4e01-a491-c780d167cf44(String),23376c96-a315-4a3f-aeb8-2e29c02f330b(String)
```

框架通过多次分批返回将整个数据返回(注意数据二次查询没有N+1问题完全放心使用)，且返回的数据是以结构化对象的形式来返回到前端的

返回的响应数据
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

那么如果我们希望返回的时候只返回user的id和name应该如何实现

- 第一种返回数据库对象但是只查询id和name
- 第二种定义dto使用`selectAutoInclude`

### include部分列
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
返回的响应数据
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
include函数存在多个重载其中第二参数用于描述前一个include和对应的额外操作这边设置为只返回id和name

我们看到查询的时候仅查询id和name

这种查询返回的任然是数据库对象所以无法再返回的形状上移除`phone`和`createAt`,那么是否有一种办法可以做到形状确定呢

答案是有的时候dto来代替数据库对象在使用`selectAutoInclude`api


### 结构化dto
结构化dto用来返回dto且形状确定适合生成文档和下游数据交互那么可以通过安装插件后进行如下操作

第一步我们使用插件创建结构化dto

在dto的package处右键选择`CreateStructDTO`

<img :src="$withBase('/images/csdto1.jpg')">

第二步选择要返回的对象

<img :src="$withBase('/images/csdto2.jpg')">

第三步勾选要返回的字段

<img :src="$withBase('/images/csdto3.jpg')">

确定dto名称后框架会帮我们直接生成dto对象
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

框架依然通过in来解决n+1的问题实现结构化的对象返回,框架支持任意结构化对象返回包括结构化对象扁平化

- ①`selectAutoInclude`是`select`api和`include`的结合，会自动安装dto的要求将数据结构进行组装返回

::: danger 说明!!!
> 注意千万不要再`selectAutoInclude`中传入数据库对象,因为数据库对象的传入会导致`selectAutoInclude`将整个关系树连根拔起都查询出来
> 注意千万不要再`selectAutoInclude`中传入数据库对象,因为数据库对象的传入会导致`selectAutoInclude`将整个关系树连根拔起都查询出来
> 注意千万不要再`selectAutoInclude`中传入数据库对象,因为数据库对象的传入会导致`selectAutoInclude`将整个关系树连根拔起都查询出来
:::



::: tip selectAutoInclude!!!
> `selectAutoInclude`这个api是eq的核心数据查询api之一用户必须完全掌握可以提高1000%的效率,并且没有n+1问题支持后续一对一 一对多的任意数据穿透查询
:::

### NavigateFlat 🔥

返回数据的时候我们如果不希望以结构化对象的形式返回,希望将user对象平铺到整个post中，又不希望使用set手动复制那么可以通过`@NavigateFlat`来实现额外属性的获取
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

注意我们必须要将①的link表示添加上，这样我们在写②的pathAlias时插件会自动给出相应的提示,查询是我们将使用`selectAutoInclude`来实现万能查询

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

::: danger 说明!!!
> 注意千万不要再`selectAutoInclude`中传入数据库对象,因为数据库对象的传入会导致`selectAutoInclude`将整个关系树连根拔起都查询出来
> 注意千万不要再`selectAutoInclude`中传入数据库对象,因为数据库对象的传入会导致`selectAutoInclude`将整个关系树连根拔起都查询出来
> 注意千万不要再`selectAutoInclude`中传入数据库对象,因为数据库对象的传入会导致`selectAutoInclude`将整个关系树连根拔起都查询出来
:::

