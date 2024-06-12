---
title: 快速了解api🔥🔥🔥
---

## 快速查询
`easy-query`提供了一套快速查询的api,这套api支持`sql`模式的增删改查和join,也支持`stream`模式的对象函数查询扩展

### 快速筛选
首先我们定义一个`user`用户信息对象
```java
@Table("t_user")
@Data
@EntityProxy
public class SysUser implements ProxyEntityAvailable<SysUser , SysUserProxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;
    private LocalDateTime createTime;

}
```

筛选用户名称包含小明的
```java
easyEntityQuery.queryable(SysUser.class)
    .where(s->s.name().like("小明"))
    .toList()
```
筛选用户名称包含小明并且是2020年以前创建的
```java
easyEntityQuery.queryable(SysUser.class)
    .where(s->{
            s.name().like("小明");
            s.createTime().lt(LocalDateTime.of(2020,1,1,0,0))
    })
    .toList()
```
筛选用户名称包含小明的或者名称包含小红的
```java
easyEntityQuery.queryable(SysUser.class)
    .where(s->{
        s.or(()->{
            s.name().like("小明");
            s.name().like("小红");
        })

    })
    .toList()
```
假设我们存在一张表是用户地址信息表
```java
@Table("t_user_address")
@Data
@EntityProxy
public class SysUserAddress implements ProxyEntityAvailable<SysUserAddress , SysUserAddressProxy> {
    @Column(primaryKey = true)
    private String id;
    private String userId;
    private String province;
    private String city;
    private String area;
    private String addr;

}
```
筛选用户叫做小明并且地址是绍兴的
```java

easyEntityQuery.queryable(SysUser.class)
    .leftJoin(SysUserAddress.class,(s,a)->s.id().eq(a.userId()))
    .where((s,a)->{
            s.name().like("小明");
            a.area().eq("绍兴");
    })
    .toList()
```

::: tip 说明!!!
> 上述这个模式我们称之为显式join,就是手动将用户表和用户地址表进行join
:::
接下来我们在用户表上添加一个对象关联关系,一对一用户地址表,用来表明一个用户有一个地址
```java
@Table("t_user")
@Data
@EntityProxy
public class SysUser implements ProxyEntityAvailable<SysUser , SysUserProxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;
    private LocalDateTime createTime; 

    @Navigate(value = RelationTypeEnum.OneToOne,targetProperty = "userId")
    private SysUserAddress address;

}
```
接下来我们再次来筛选用户叫做小明并且地址是绍兴的
```java

easyEntityQuery.queryable(SysUser.class)
    .where(s->{
            s.name().like("小明");
            s.address().area().eq("绍兴");
    })
    .toList()
```
::: tip 说明!!!
> 上述这个模式我们称之为隐式join,就是因为用户表里面已经约定好和用户地址的对应关系,所以无需手动join也可以实现筛选
:::

接下来我们给用户添加书籍,一个用户拥有多本书籍
```java
@Table("t_user_book")
@Data
@EntityProxy
@EasyAlias("user")
public class UserBook implements ProxyEntityAvailable<UserBook , UserBookProxy> {
    @Column(primaryKey = true)
    private String id;
    
    private String userId;
    private String name;
    private LocalDateTime createTime;
    private String author;
}
```
如果我们要查找哪些用户拥有《java高级开发》的书籍
```java
//第一种情况我们可以通过in子查询来实现

List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            user.id().in(
                    easyEntityQuery.queryable(UserBook.class)
                            .where(u_book -> {
                                u_book.name().like("java高级开发");
                            }).select(u_book -> u_book.userId())
            );
        }).toList();

//第二种情况我们可以用exists

List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            user.expression().exists(()->{
                return easyEntityQuery.queryable(UserBook.class)
                        .where(u_book -> {
                            u_book.userId().eq(user.id());//指定条件链接内外两张表
                            u_book.name().like("java高级开发");
                        });
            });
        }).toList();
```
::: tip 说明!!!
> 上述这个模式我们称之为显式子查询,就是手动将用户表和用户书本表表通过子查询关联in或者exists的方式进行链接查询
:::

接下来我们在用户表示添加一个对象就是用户拥有的书本,用户和书本关系为一对多表名一个用户拥有多本书籍
```java
@Table("t_user")
@Data
@EntityProxy
public class SysUser implements ProxyEntityAvailable<SysUser , SysUserProxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;
    private LocalDateTime createTime; 

    @Navigate(value = RelationTypeEnum.OneToOne,targetProperty = "userId")
    private SysUserAddress address;

    @Navigate(value = RelationTypeEnum.OneToMany,targetProperty = "userId")
    private List<UserBook> books;
}
```
接下来我们继续查找哪些用户拥有《java高级开发》的书籍
```java

List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            //any就是可以理解为stream查询中的anyMatch,也可以where(条件).any();
            user.books().any(book -> {
                book.name().like("java高级开发");
            });
        }).toList();
//上下两个方法都行
// List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
//         .where(user -> {
//             user.books().where(book -> {
//                 book.name().like("java高级开发");
//             }).any();
//         }).toList();

//如果我们对子表的条件有且仅有一个的时候我们还可以简化any的写法
List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            //展开元素进判断单个条件name
            user.books().flatElement().name().like("java高级开发");
        }).toList();
```
::: tip 说明!!!
> 上述这个模式我们称之为隐式子查询,就是通过模型对象关系自动动将用户表和用户书本表表通过关联关系进行关联查询
:::

如果我们需要查询用户至少有两本金庸小说的书籍
```java
//显式子查询
List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            user.expression().subQuery(() -> {
                return easyEntityQuery.queryable(UserBook.class)
                        .where(u_book -> {
                            u_book.author().eq("金庸");
                            u_book.userId().eq(user.id());
                        }).selectCount();
            }).gt(2L);
        }).toList();

//隐式子查询
List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            user.books().where(book -> {
                book.author().eq("金庸");
            }).count().gt(2L);
        }).toList();
```
上下两个查询高判立下下面的更加优雅更加通俗易懂