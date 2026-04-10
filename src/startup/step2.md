---
title: 帖子相关查询
order: 30
---

# 帖子相关查询
本章节主要以帖子为话题实战教用户如何使用eq进行相关业务开发


## 本章节重点
- 单表操作查询
- 多表join查询
- 子查询`subQuery`和隐式Group `subQueryToGroupJoin`
- 结构化对象结构化集合返回结构化对象`selectAutoInclude`
- 结构化对象平铺`selectAutoInclude`+`NavigateFlat`
- 结构化集合`order`+`limit`返回


## 查询帖子

查询id为123的帖子
```java
Post post = easyEntityQuery.queryable(Post.class)
        .whereById("123")
        .singleOrNull();//如果不存在则返回null


Post post1 = easyEntityQuery.queryable(Post.class)
        .where(t_post -> {
            t_post.id().eq("123");
        })
        .singleOrNull();
```
查询标题包含[故事]的第一个帖子
```java
List<Post> postList = easyEntityQuery.queryable(Post.class)
        .where(t_post -> {
            t_post.title().contains("故事");
        }).toList();
```

我们可以看到我们使用`contains`为什么不使用`like`当然我们也可以使用`like`但是`like`和`contains`有一个区别

::: warning 区别!!!
> 当我们被查询的值包含通配符[%]或[_]那么like会将其视为通配符进行查询,但是contains会把这些通配符视为被查询的一部分不会以通配符的方式执行
>被查询的值为`10%`时`like("10%")`会查询出包含10的哪怕是100,但是`contains("10%")`会查出包含`10%`的`contains`函数会对通配符进行特殊处理
:::


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


::: danger contains还是like!!!
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
> 正常我们推荐使用`filterConfigure`或者使用`if`函数包裹条件而不是使用方法参数的第一个`boolean`类型来控制，因为参数boolean类型重载相对会让表达式不够直观且难以阅读所以我们极力推荐`filterConfigure`或者使用`if`函数包裹条件
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

现在我们已经支持了分页的动态排序,当然动态排序功能远不止此,[更多动态排序请点击链接](/easy-query-doc/ability/adv/order)

### 分页join筛选
当然对于大部分业务而言实体对象不是一个孤单对象,当前的`Post`对象也是如此，我们经常会有连表或者子查询等操作，那么`eq`是如何快速便捷的实现`join`的呢

下面这种通过关联关系实现join的操作我们称之为`隐式join`

- 查询帖子要求查询条件是某个用户的

首先因为涉及到join那么eq提供了关联关系将原先的`Post`单表和用户表进行多对一的关联

#### 通过插件生成关联关系
- 第一步呼出ui界面
在`Post`类内部输入`nav`后会出现`nav2....`的提示

<img :src="$withBase('/images/navigate2.jpg')">

- 第二步设置关联关系
因为用户会发布多个帖子所以用户和帖子之间是一对多,反之帖子和用户就是多对一

<img :src="$withBase('/images/navigate-ui.jpg')">
选择好对应的关联键后点击确认插件会帮你自动生成强类型属性或者lombok属性或字符串

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
我们惊讶的发现eq非常智能的将分页中的`total`查询的所有`join`都去掉了,并且返回集合的那个sql仍然保留,如果我们将`orderBy`也去掉会发现eq居然整个sql都不会添加`join`选项
```sql
==> Preparing: SELECT COUNT(*) FROM `t_post` t
<== Time Elapsed: 21(ms)
<== Total: 1
==> Preparing: SELECT t.`id`,t.`title`,t.`content`,t.`user_id`,t.`publish_at` FROM `t_post` t ORDER BY t.`title` ASC LIMIT 5
<== Time Elapsed: 18(ms)
<== Total: 5
```
你没有看错动态join就是这么简单，这就是真正的智能orm框架

### 回顾一下
- 首先我们添加了动态查询筛选器配置`filterConfigure(NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS)`让所有条件参数非null非空的值支持加入条件，这样就做到了动态查询的特性
- 第二点因为我们传递userName参数，所以表达式的`t_post.user().name().contains(request.getUserName());`会生效并且会自动根据对应的关系使用`leftJoin`将post和user关联起来并且查询post下的user下的姓名
- 第三点因为我们没有传递userName参数，所以表达式的`t_post.user().name().contains(request.getUserName());`不会生效,但是`orderBy`的`user.createAt`还是会生效,所以page的时候`total`的哪一次查询因为没有使用`user`表所以不会`join`，但是toList的那一次因为`orderBy`用到了所以仍然会进行`leftJoin`


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
- ①通过@EntityProxy注解eq框架会生成代理对象，该对象支持dsl表达式赋值
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

这种查询返回的仍然是数据库对象所以无法再返回的形状上移除`phone`和`createAt`,那么是否有一种办法可以做到形状确定呢

答案是有的时候dto来代替数据库对象在使用`selectAutoInclude`api


### 结构化对象转DTO
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
            //.include(t_post -> t_post.user(),uq->{//使用selectAutoInclude后不再需要include ②
                //uq.select(u->u.FETCHER.id().name());
            //})
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
- ②`selectAutoInclude`后原先的`inlcude`可以不使用了，框架会根据dto实体信息自动解析感知需要`include`的对象和部分列，如果显式编写那么还是以手写的include为准

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


`@NavigateFlat`支持任意级别对象关系获取,如果对象关系获取中间存在`toMany`无论是OneToMany还是`ManyToMany`那么最终都会变成`List<?>`集合

## 帖子内容带评论
简单的额外对象获取后我们希望实现返回给前端帖子内容并且携带上前三条相关评论，那么eq有几种方式呢

- `NavigateFlat`+`limit`+`union`
- `NavigateFlat`+`limit`+`partition by`
- `subquery`+`limit`+`joining`
### 评论关系添加
```java

@Data
@Table("t_post")
@EntityProxy
@EasyAlias("t_post")
@EasyAssertMessage("未找到对应的帖子信息")
public class Post implements ProxyEntityAvailable<Post, PostProxy> {
    //....业务字段

    /**
     * 发帖人
     **/
    @Navigate(value = RelationTypeEnum.ManyToOne,
            selfProperty = {PostProxy.Fields.userId},
            targetProperty = {UserProxy.Fields.id},
            required = true)
    private User user;


    /**
     * 评论信息
     **/
    @Navigate(value = RelationTypeEnum.OneToMany,
            selfProperty = {PostProxy.Fields.id},
            targetProperty = {CommentProxy.Fields.postId})
    private List<Comment> commentList;
}

```

因为帖子和评论的关系是一对多所以我们在帖子里面通过插件或者手动添加关联关系
### limit+union
首先我们定义好需要返回的对象

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
     * 评论信息
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

这样我们就设置好了要返回的数据并且支持额外返回3条评论
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
我们看到真的和编写的dto如出一辙的返回了查询结果
```sql
-- 第1条sql数据
 SELECT
        t.`id`,
        t.`title`,
        t.`content`,
        t.`user_id`,
        t.`publish_at` 
    FROM
        `t_post` t

-- 第2条sql数据
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
-- 第3条sql数据
   SELECT
        `id` 
    FROM
        `t_user` 
    WHERE
        `id` IN (?, ?, ?, ?, ?)
```

一个生成了三条sql，中limit+union是第二条sql,但是union相对sql会变得复杂并且冗余所以我们尝试eq提供的第二种方式

### limit+partition by
`springboot`的`application.yml`增加配置项
```yml
easy-query: 
  #支持的数据库
  database: mysql
  #对象属性和数据库列名的转换器
  name-conversion: underlined
  include-limit-mode: partition
```
- `include-limit-mode: partition`这句话让原先的`union all`变成`partition`(后续`partition`可能会变成默认)

接下来我们继续请求
```sql

-- 第1条sql数据

    SELECT
        t.`id`,
        t.`title`,
        t.`content`,
        t.`user_id`,
        t.`publish_at` 
    FROM
        `t_post` t


-- 第2条sql数据

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



-- 第3条sql数据

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
我们看到通过简单的配置我们将一对多返回前n条变动轻松简单并且可以快速实现支持分页,但是细心的朋友肯定发现了一个问题,我们需要的评论并不是平铺到整个post贴子的，帖子和评论虽然是一对多但是评论自己也是自关联，评论设计也是楼中楼为支持的那么我们应该如何设置让我们返回的评论支持返回第一层级呢

### EXTRA_AUTO_INCLUDE_CONFIGURE
使用eq的`EXTRA_AUTO_INCLUDE_CONFIGURE`可以对`selectAutoInclude`的查询添加额外字段或额外搜索排序等处理

关于`EXTRA_AUTO_INCLUDE_CONFIGURE`的更多信息请[查看文档](/easy-query-doc/ability/return-result/extra)

第一步对原始的dto对象进行插件快速提示插入`EXTRA_AUTO_INCLUDE_CONFIGURE`

<img :src="$withBase('/images/extra-include-tip.jpg')">

我们移除`select`操作因为我们不需要

最终我们的返回dto如下
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
     * 评论信息
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
我们看中间sql如下
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
- ①是我们通过额外配置添加上去的

返回的json如下
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

我们返回的post节点完美的符合我们内容

但是有时候我们可能需要返回的是post信息和前三条内容并且将前三条内容合并到一个字段上去那么应该怎么做

### joining逗号分割
有时候我们希望返回比如今日用户发帖各个帖子内容和前三个评论逗号分割返回给前端显示到分页上面,这个时候我们有两种选择

- 第一种我们可以通过eq的强大的表达式函数`joining`来返回
- 第二种是返回结构化dto,让前端去处理
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

第一种通过表达式函数joining来实现返回一对多

joining函数分成两种使用方法,分别是属性joining和标准集合joining

#### 属性joining(一般不太常用)
这个api主要常用户Group后可以通过`groupTable().name().joining(",",true)`

参数  | 功能  
---  | --- 
参数一 | 使用哪个分隔符,默认`,`
参数二  | 是否去重,默认`false`


#### 标准集合joining

参数  | 功能  
---  | --- 
参数一 | 需要被逗号或者其他字符分割的表达式比如`joining(o->o.name())`表示将集合的`name`属性逗号分割
参数二  | 使用哪个分隔符,默认`,`

那么在标准集合的`joining`下我们应该如何对内部的分割内容去重呢可以通过链式`post.comments().distinct().joining(o->o.content())`


一如既往我们还是定义对应的dto
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

我们来看下表达式`t_post.commentList().where(c->c.parentId().eq("0")).joining(c->c.content())`这个表达式是将post下方的评论集合`commentList`通过where筛选取前三个的content内容合并
- ①表示需要被返回的子查询集合项`commentList`
- ②筛选该子查询集合项
- ③选择元素索引[0...2]也就是前三个
- ④聚合逗号分割`commentList.content`

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
通过结果我们可以清晰地看到`commentContent`被`joining`函数通过逗号分割组合在一起了
我们再来看对应的sql
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

框架通过`select子查询`将结果清晰的将结果集通过`group_concat`函数组装到了`comment_content`列上

::: warning 性能!!!
> 如果由用户嫌弃select子查询性能低下eq贴心的提供了子查询转`groupJoin`助力用户实现更高效的sql
:::

当然这边为了演示使用了内容逗号分割，其实本质而言应该是将类目逗号分割更加合适

接下来我们创建帖子的类目关系表

帖子和类目关系是多对多通过CategoryPost表进行关联

```java

@Data
@Table("t_post")
@EntityProxy
@EasyAlias("t_post")
@EasyAssertMessage("未找到对应的帖子信息")
public class Post implements ProxyEntityAvailable<Post, PostProxy> {
    //....其他业务字段和导航属性


    /**
     * 帖子类目信息
     **/
    @Navigate(value = RelationTypeEnum.ManyToMany,
            selfProperty = {PostProxy.Fields.id},
            selfMappingProperty = {CategoryPostProxy.Fields.postId},
            mappingClass = CategoryPost.class, targetProperty = {CategoryProxy.Fields.id},
            targetMappingProperty = {CategoryPostProxy.Fields.categoryId}, subQueryToGroupJoin = true) ①
    private List<Category> categoryList;
}
```

- 其中我们看到①`subQueryToGroupJoin = true`该配置项让原本的多对多子查询可以直接在使用的时候使用`groupJoin`来代替可以让生成的sql性能更加高效

返回帖子内容+用户+评论前三个+所属类目逗号分割

设置返回dto
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
     * 评论信息
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

我们通过对主表进行额外字段的添加让其直接支持额外字段返回

- `@SuppressWarnings("EasyQueryFieldMissMatch")`这个注解主要是用来抑制插件警告，您如果觉得警告无所谓那么可以不加该注解对结果没有影响

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

完全完美符合我们需要的结果
```sql

-- 第1条sql数据

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
-- 第2条sql数据

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
-- 第3条sql数据

    SELECT
        `id` 
    FROM
        `t_user` 
    WHERE
        `id` IN ('3b63ddd9-b038-4c24-969e-8b478fe862a5', '2e509ef4-0282-448f-ace0-43501d46ccf4', '70ec5f9f-7e9b-4f57-b2a4-9a35a163bd3e', 'f2bf383e-ee8d-44c5-968d-263191ab058e', 'eda79345-6fbf-4ca6-b9bf-4743a3f991e4')
```

- 第一条sql我们看到用来查询返回post信息和对应的categoryNames字段使用`groupJoin`来代替多对多自查
- 第二条sql我们看到框架使用`partition by`让用户可以轻松的返回评论信息前n条
- 第三条sql我们使用`NavigateFlat`二次查询杜绝n+1来返回用户信息

到此为止我们的帖子相关的查询已经结束 主要我们实现了框架对一对多 多对一和多对多下如何快速查询并且支持众多开窗函数的隐式使用
