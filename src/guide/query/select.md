---
title: select
order: 40
---

# select
`easy-query`的`select`是用来终结当前表达式生成新的表达式的方式

## API
方法  | 参数 | 返回  | 描述
--- | --- | --- | --- 
`select(SqlExpression selectExpression)` | 列选择器  | this | 返回当前`Queryable`对象指定的列,用于按需查询
`select(Class<TR> resultClass)` | 列选择器返回对象  | this | 返回当前`Queryable`对象属性映射所对应的列名和返回结果属性列名一样的列,即两者属性名可以不一致但是只要两者属性名都是映射为相同`columnName`即可互相映射，如果返回结果属性类型不包容原属性类型，比如`String->Integer` 那么可能会出现转换失败
`select(Class<TR> resultClass, SqlExpression selectExpression)` | 列选择器返回对象,列选择器  | this | 返回当前`Queryable`对象属性映射所对应的列名和返回结果属性列名一样的列,即两者属性名可以不一致但是只要两者属性名都是映射为相同`columnName`即可互相映射，如果返回结果属性类型不包容原属性类型，比如`String->Integer` 那么可能会出现转换失败,区别就是可以自己手动指定列,<font color="red">**！！！该方法默认不查询任何列需要手动在第二个参数表达式指定！！！**</font>


## selector说明
```java

@Data
@Table("t_topic")
@ToString
public class Topic {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;
}

@Data
public class BaseEntity implements Serializable {
    private static final long serialVersionUID = -4834048418175625051L;

    @Column(primaryKey = true)
    private String id;
    /**
     * 创建时间;创建时间
     */
    private LocalDateTime createTime;
    /**
     * 修改时间;修改时间
     */
    private LocalDateTime updateTime;
    /**
     * 创建人;创建人
     */
    private String createBy;
    /**
     * 修改人;修改人
     */
    private String updateBy;
    /**
     * 是否删除;是否删除
     */
    @LogicDelete(strategy = LogicDeleteStrategyEnum.BOOLEAN)
    private Boolean deleted;
}
@Data
@Table("t_blog")
@Accessors(chain = true)
public class BlogEntity extends BaseEntity{

    /**
     * 标题
     */
    private String title;
    /**
     * 内容
     */
    @Column(large = true)
    private String content;
    /**
     * 博客链接
     */
    private String url;
    /**
     * 点赞数
     */
    private Integer star;
    /**
     * 发布时间
     */
    private LocalDateTime publishTime;
    /**
     * 评分
     */
    private BigDecimal score;
    /**
     * 状态
     */
    private Integer status;
    /**
     * 排序
     */
    private BigDecimal order;
    /**
     * 是否置顶
     */
    private Boolean isTop;
    /**
     * 是否置顶
     */
    private Boolean top;
}

```
### 按需返回VO对象
定义返回的VO
```java

@Data
@ToString
public class BlogEntityVO1 {

    /**
     * 评分
     */
    private BigDecimal score;
    /**
     * 状态
     */
    @Column(value = "status")
    private Integer abc;
    /**
     * 排序
     */
    private BigDecimal order;
    /**
     * 是否置顶
     */
    private Boolean isTop;
    /**
     * 是否置顶
     */
    private Boolean top;
}


BlogEntityVO1 blogEntityVO1 = easyQuery.queryable(BlogEntity.class)
        .where(o -> o.eq(BlogEntity::getId, "2"))
        .select(BlogEntityVO1.class).firstOrNull();


//生成的sql按需只返回VO对象有的并且自动映射到abc属性上
==> Preparing: SELECT t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`id` = ? LIMIT 1
==> Parameters: false(Boolean),2(String)
<== Time Elapsed: 2(ms)
<== Total: 1
BlogEntityVO1(score=1.20, abc=1, order=2.40, isTop=true, top=true)


//调用了columnAll但是并不会查询所有列,只会查询映射到VO上的列
BlogEntityVO1 blogEntityVO1 = easyQuery.queryable(BlogEntity.class)
        .where(o -> o.eq(BlogEntity::getId, "2"))
        .select(BlogEntityVO1.class,o->o.columnAll()).firstOrNull();


==> Preparing: SELECT t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`id` = ? LIMIT 1
==> Parameters: false(Boolean),2(String)
<== Time Elapsed: 2(ms)
<== Total: 1
BlogEntityVO1(score=1.20, abc=1, order=2.40, isTop=true, top=true)

//如果select第二个参数过后没有任何select projects那么会自动调用columnAll防止出现select *
BlogEntityVO1 blogEntityVO1 = easyQuery.queryable(BlogEntity.class)
        .where(o -> o.eq(BlogEntity::getId, "2"))
        .select(BlogEntityVO1.class,o->o.columnIgnore(BlogEntity::getId)).firstOrNull();


==> Preparing: SELECT t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`id` = ? LIMIT 1
==> Parameters: false(Boolean),2(String)
<== Time Elapsed: 2(ms)
<== Total: 1
BlogEntityVO1(score=1.20, abc=1, order=2.40, isTop=true, top=true)


//仅查询单个列那么只返回单个列，并且主动设置映射到对应的数据上
BlogEntityVO1 blogEntityVO1 = easyQuery.queryable(BlogEntity.class)
        .where(o -> o.eq(BlogEntity::getId, "2"))
        .select(BlogEntityVO1.class,o->o.columnIgnore(BlogEntity::getId).columnAs(BlogEntity::getOrder,BlogEntityVO1::getScore)).firstOrNull();


==> Preparing: SELECT t.`order` AS `score` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`id` = ? LIMIT 1
==> Parameters: false(Boolean),2(String)
<== Time Elapsed: 2(ms)
<== Total: 1
BlogEntityVO1(score=2.40, abc=null, order=null, isTop=null, top=null)



BlogEntityVO1 blogEntityVO1 = easyQuery.queryable(BlogEntity.class)
        .where(o -> o.eq(BlogEntity::getId, "2"))
        .select(BlogEntityVO1.class,o->o.columnAll().columnIgnore(BlogEntity::getScore)).firstOrNull();


==> Preparing: SELECT t.`status`,t.`order`,t.`is_top`,t.`top` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`id` = ? LIMIT 1
==> Parameters: false(Boolean),2(String)
<== Time Elapsed: 2(ms)
<== Total: 1
BlogEntityVO1(score=null, abc=1, order=2.40, isTop=true, top=true)
```
如果出现多表属性映射,可以将相识度高的先进行`columnAll`然后将不需要的`columnIgnore`剩下的可以进行`columnAs`这样比手写一个一个的`columnAs`方便很多
### 按需快速join返回列
这边限制VO对象返回Topic的id其他都是Blog的属性
```java

@Data
@ToString
public class BlogEntityVO2 {

    /**
     * 希望返回Topic的id其他都是Blog的属性
     */
    private String id;
    /**
     * 标题
     */
    private String title;
    /**
     * 内容
     */
    @Column(large = true)
    private String content;
    /**
     * 博客链接
     */
    private String url;
    /**
     * 点赞数
     */
    private Integer star;
    /**
     * 发布时间
     */
    private LocalDateTime publishTime;
    /**
     * 评分
     */
    private BigDecimal score;
    /**
     * 状态
     */
    private Integer status;
    /**
     * 排序
     */
    private BigDecimal order;
    /**
     * 是否置顶
     */
    private Boolean isTop;
    /**
     * 是否置顶
     */
    private Boolean top;
}


BlogEntityVO2 blogEntityVO1 = easyQuery.queryable(Topic.class)
        .leftJoin(BlogEntity.class,(t,t1)->t.eq(t1,Topic::getId,BlogEntity::getId))
        .where(o -> o.eq(Topic::getId, "2"))
        //直接先对第二张表进行全字段获取然后忽略掉id在对第二张表进行id获取
        .select(BlogEntityVO2.class,(t,t1)->t1.columnAll().columnIgnore(BlogEntity::getId).then(t).column(Topic::getId)
                //.columnAs(Topic::getId,BlogEntityVO2::getId)//如果属性对应的columnName不一致需要as处理
        ).firstOrNull();

==> Preparing: SELECT t1.`title`,t1.`content`,t1.`url`,t1.`star`,t1.`publish_time`,t1.`score`,t1.`status`,t1.`order`,t1.`is_top`,t1.`top`,t.`id` FROM `t_topic` t LEFT JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` WHERE t.`id` = ? LIMIT 1
==> Parameters: false(Boolean),2(String)
<== Time Elapsed: 2(ms)
<== Total: 1
BlogEntityVO2(id=2, title=title2, content=content2, url=http://blog.easy-query.com/2, star=2, publishTime=null, score=1.20, status=1, order=2.40, isTop=true, top=true)




BlogEntityVO2 blogEntityVO1 = easyQuery.queryable(Topic.class)
        .leftJoin(BlogEntity.class,(t,t1)->t.eq(t1,Topic::getId,BlogEntity::getId))
        .where(o -> o.eq(Topic::getId, "2"))
        .select(BlogEntityVO2.class,(t,t1)->t1.columnAll().then(t).column(Topic::getId)//如果不进行忽略两个id都查询,但是默认会把后面的覆盖掉前面的
        ).firstOrNull();

==> Preparing: SELECT t1.`id`,t1.`title`,t1.`content`,t1.`url`,t1.`star`,t1.`publish_time`,t1.`score`,t1.`status`,t1.`order`,t1.`is_top`,t1.`top`,t.`id` FROM `t_topic` t LEFT JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` WHERE t.`id` = ? LIMIT 1
==> Parameters: false(Boolean),2(String)
<== Time Elapsed: 2(ms)
<== Total: 1
BlogEntityVO2(id=2, title=title2, content=content2, url=http://blog.easy-query.com/2, star=2, publishTime=null, score=1.20, status=1, order=2.40, isTop=true, top=true)

```

### toMap
```java

Map<String, Object> map = easyQuery.queryable(Topic.class)
        .leftJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
        .where(o -> o.eq(Topic::getId, "2"))
        .select(BlogEntityVO2.class, (t, t1) -> t1.columnAll().then(t).column(Topic::getId)//如果不进行忽略两个id都查询,但是默认会把后面的覆盖掉前面的
        ).toMap();

//相同的代码如果使用toMap将会抛出 IllegalStateException 异常:Duplicate key found: id
```