---
title: 动态条件
---

# 动态条件

通过 springboot 上传 json 对象实现条件查询,目前有两种解决方案,一个是动态条件来构建 where,一个是通过 object 对象来实现动态查询

## 默认配置项

| 模式     | 优点                            | 缺点                                                     |
| -------- | ------------------------------- | -------------------------------------------------------- |
| 动态条件 | 可以实现任意复杂条件构建        | 对于大部分业务场景过于复杂                               |
| 对象查询 | 可以快速实现基于 dto 的条件查询 | 条件仅支持 and,且属性名需要一致,不一致需要手动映射为一致 |

## 动态条件

框架提供了多种动态条件方式

- `if`条件包裹
- api 第一个参数`boolean`,where 第一个参数`boolean`
- `filterConfigure`

::: code-tabs
@tab 对象模式

```java

BlogQuery1Request query = new BlogQuery1Request();
query.setOrder(BigDecimal.valueOf(1));
query.setContent("标题");
query.setPublishTimeBegin(LocalDateTime.now());
query.setPublishTimeEnd(LocalDateTime.now());
query.setStatusList(Arrays.asList(1,2));

List<BlogEntity> result = easyEntityQuery.queryable(BlogEntity.class)
    .where(o -> {

            //当query.getContext不为空是添加查询条件 content like query.getContext
            o.content().like(EasyStringUtil.isNotBlank(query.getContent()), query.getContent());
            //上下两种效果一样具体如何使用自己选择
            if(EasyStringUtil.isNotBlank(query.getContent())){
                o.content().like(query.getContent());
            }

            //当query.getOrder不为null是添加查询条件 content = query.getContext
            o.order().eq(query.getOrder() != null, query.getOrder());
            //当query.getPublishTimeBegin()不为null添加左闭区间,右侧同理 publishTimeBegin <= publishTime <= publishTimeEnd
            o.publishTime().rangeClosed(query.getPublishTimeBegin() != null, query.getPublishTimeBegin(), query.getPublishTimeEnd() != null, query.getPublishTimeEnd());
            //添加in条件
            o.status().in(EasyCollectionUtil.isNotEmpty(query.getStatusList()), query.getStatusList());
    })
    .where(query.getOrder() != null,o -> {
            //当query.getOrder不为null是添加查询条件 content = query.getContext
            o.order().eq(query.getOrder());
    }).toList();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ? AND `order` = ? AND `publish_time` >= ? AND `publish_time` <= ? AND `status` IN (?,?)
==> Parameters: false(Boolean),%标题%(String),1(BigDecimal),2023-07-14T22:05:24.971(LocalDateTime),2023-07-14T22:05:24.971(LocalDateTime),1(Integer),2(Integer)
<== Time Elapsed: 5(ms)
<== Total: 0



BlogQuery1Request query = new BlogQuery1Request();
query.setContent("标题");
query.setPublishTimeBegin(LocalDateTime.now());
query.setPublishTimeEnd(LocalDateTime.now());
query.setStatusList(Arrays.asList(1,2));

List<BlogEntity> result = easyQuery.queryable(BlogEntity.class)
    .where(o -> {

            //当query.getContext不为空是添加查询条件 content like query.getContext
            o.content().like(EasyStringUtil.isNotBlank(query.getContent()), query.getContent());
            //当query.getOrder不为null是添加查询条件 content = query.getContext
            o.order().eq(query.getOrder() != null, query.getOrder());//不生效
            //当query.getPublishTimeBegin()不为null添加左闭区间,右侧同理 publishTimeBegin <= publishTime <= publishTimeEnd
            o.publishTime().rangeClosed(query.getPublishTimeBegin() != null, query.getPublishTimeBegin(), query.getPublishTimeEnd() != null, query.getPublishTimeEnd());
            //添加in条件
            o.status().in(EasyCollectionUtil.isNotEmpty(query.getStatusList()), query.getStatusList());

    }).toList();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ? AND `publish_time` >= ? AND `publish_time` <= ? AND `status` IN (?,?)
==> Parameters: false(Boolean),%标题%(String),1(BigDecimal),2023-07-14T22:05:24.971(LocalDateTime),2023-07-14T22:05:24.971(LocalDateTime),1(Integer),2(Integer)
<== Time Elapsed: 5(ms)
<== Total: 0
```

@tab lambda 模式

```java

BlogQuery1Request query = new BlogQuery1Request();
query.setOrder(BigDecimal.valueOf(1));
query.setContent("标题");
query.setPublishTimeBegin(LocalDateTime.now());
query.setPublishTimeEnd(LocalDateTime.now());
query.setStatusList(Arrays.asList(1,2));

List<BlogEntity> result = easyQuery.queryable(BlogEntity.class)
    .where(o -> o
            //当query.getContext不为空是添加查询条件 content like query.getContext
            .like(EasyStringUtil.isNotBlank(query.getContent()), BlogEntity::getContent, query.getContent())
            //当query.getOrder不为null是添加查询条件 content = query.getContext
            .eq(query.getOrder() != null, BlogEntity::getOrder, query.getOrder())
            //当query.getPublishTimeBegin()不为null添加左闭区间,右侧同理 publishTimeBegin <= publishTime <= publishTimeEnd
            .rangeClosed(BlogEntity::getPublishTime, query.getPublishTimeBegin() != null, query.getPublishTimeBegin(), query.getPublishTimeEnd() != null, query.getPublishTimeEnd())
            //添加in条件
            .in(EasyCollectionUtil.isNotEmpty(query.getStatusList()), BlogEntity::getStatus, query.getStatusList())
    ).toList();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ? AND `order` = ? AND `publish_time` >= ? AND `publish_time` <= ? AND `status` IN (?,?)
==> Parameters: false(Boolean),%标题%(String),1(BigDecimal),2023-07-14T22:05:24.971(LocalDateTime),2023-07-14T22:05:24.971(LocalDateTime),1(Integer),2(Integer)
<== Time Elapsed: 5(ms)
<== Total: 0



BlogQuery1Request query = new BlogQuery1Request();
query.setContent("标题");
query.setPublishTimeBegin(LocalDateTime.now());
query.setPublishTimeEnd(LocalDateTime.now());
query.setStatusList(Arrays.asList(1,2));

List<BlogEntity> result = easyQuery.queryable(BlogEntity.class)
    .where(o -> o
            //当query.getContext不为空是添加查询条件 content like query.getContext
            .like(EasyStringUtil.isNotBlank(query.getContent()), BlogEntity::getContent, query.getContent())
            //当query.getOrder不为null是添加查询条件 content = query.getContext
            .eq(query.getOrder() != null, BlogEntity::getOrder, query.getOrder())//不生效
            //当query.getPublishTimeBegin()不为null添加左闭区间,右侧同理 publishTimeBegin <= publishTime <= publishTimeEnd
            .rangeClosed(BlogEntity::getPublishTime, query.getPublishTimeBegin() != null, query.getPublishTimeBegin(), query.getPublishTimeEnd() != null, query.getPublishTimeEnd())
            //添加in条件
            .in(EasyCollectionUtil.isNotEmpty(query.getStatusList()), BlogEntity::getStatus, query.getStatusList())
    ).toList();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ? AND `publish_time` >= ? AND `publish_time` <= ? AND `status` IN (?,?)
==> Parameters: false(Boolean),%标题%(String),1(BigDecimal),2023-07-14T22:05:24.971(LocalDateTime),2023-07-14T22:05:24.971(LocalDateTime),1(Integer),2(Integer)
<== Time Elapsed: 5(ms)
<== Total: 0
```

@tab 属性模式

```java

BlogQuery1Request query = new BlogQuery1Request();
query.setOrder(BigDecimal.valueOf(1));
query.setContent("标题");
query.setPublishTimeBegin(LocalDateTime.now());
query.setPublishTimeEnd(LocalDateTime.now());
query.setStatusList(Arrays.asList(1,2));

List<BlogEntity> result = easyQueryClient.queryable(BlogEntity.class)
    .where(o -> o
            //当query.getContext不为空是添加查询条件 content like query.getContext
            .like(EasyStringUtil.isNotBlank(query.getContent()), "content", query.getContent())
            //当query.getOrder不为null是添加查询条件 content = query.getContext
            .eq(query.getOrder() != null, "order", query.getOrder())
            //当query.getPublishTimeBegin()不为null添加左闭区间,右侧同理 publishTimeBegin <= publishTime <= publishTimeEnd
            .rangeClosed("publishTime", query.getPublishTimeBegin() != null, query.getPublishTimeBegin(), query.getPublishTimeEnd() != null, query.getPublishTimeEnd())
            //添加in条件
            .in(EasyCollectionUtil.isNotEmpty(query.getStatusList()), "status", query.getStatusList())
    ).toList();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ? AND `order` = ? AND `publish_time` >= ? AND `publish_time` <= ? AND `status` IN (?,?)
==> Parameters: false(Boolean),%标题%(String),1(BigDecimal),2023-07-14T22:05:24.971(LocalDateTime),2023-07-14T22:05:24.971(LocalDateTime),1(Integer),2(Integer)
<== Time Elapsed: 5(ms)
<== Total: 0



BlogQuery1Request query = new BlogQuery1Request();
query.setContent("标题");
query.setPublishTimeBegin(LocalDateTime.now());
query.setPublishTimeEnd(LocalDateTime.now());
query.setStatusList(Arrays.asList(1,2));

List<BlogEntity> result = easyQueryClient.queryable(BlogEntity.class)
    .where(o -> o
            //当query.getContext不为空是添加查询条件 content like query.getContext
            .like(EasyStringUtil.isNotBlank(query.getContent()), "content", query.getContent())
            //当query.getOrder不为null是添加查询条件 content = query.getContext
            .eq(query.getOrder() != null, "order", query.getOrder())//不生效
            //当query.getPublishTimeBegin()不为null添加左闭区间,右侧同理 publishTimeBegin <= publishTime <= publishTimeEnd
            .rangeClosed("publishTime", query.getPublishTimeBegin() != null, query.getPublishTimeBegin(), query.getPublishTimeEnd() != null, query.getPublishTimeEnd())
            //添加in条件
            .in(EasyCollectionUtil.isNotEmpty(query.getStatusList()), "status", query.getStatusList())
    ).toList();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ? AND `publish_time` >= ? AND `publish_time` <= ? AND `status` IN (?,?)
==> Parameters: false(Boolean),%标题%(String),1(BigDecimal),2023-07-14T22:05:24.971(LocalDateTime),2023-07-14T22:05:24.971(LocalDateTime),1(Integer),2(Integer)
<== Time Elapsed: 5(ms)
<== Total: 0
```

:::

## 条件接受

`1.4.31^`以上版本支持`ValueFilter` 条件接收器,`Queryable`默认行为`AnyValueFilter.DEFAULT`所有的条件都接受,框架提供了一个可选`NotNullOrEmptyValueFilter.DEFAULT`当传入的条件参数值非 null 且字符串的情况下非空那么才会增加到条件里面,仅 where 条件生效。并且只有左侧是属性而非属性函数时才会生效如果左侧为函数那么将不会生效

如果存在隐式 join 那么`2.3.0^`版本可以做到更加智能的处理

用户也可以自定义实现接口

```java
public interface ValueFilter {
    boolean accept(TableAvailable table, String property, Object value);
}

public class AnyValueFilter implements ValueFilter {
    public static final ValueFilter DEFAULT=new AnyValueFilter();
    private AnyValueFilter(){

    }
    @Override
    public boolean accept(TableAvailable table, String property, Object value) {
        return true;
    }
}
public class NotNullOrEmptyValueFilter implements ValueFilter {
    public static final ValueFilter DEFAULT=new NotNullOrEmptyValueFilter();
    @Override
    public boolean accept(TableAvailable table, String property, Object value) {
        if(value==null){
            return false;
        }
        if(value instanceof String){
            return EasyStringUtil.isNotBlank((String) value);
        }
        return true;
    }
}

```

```java

BlogQuery1Request query = new BlogQuery1Request();
query.setOrder(BigDecimal.valueOf(1));
query.setContent("标题");
query.setPublishTimeBegin(LocalDateTime.now());
query.setPublishTimeEnd(LocalDateTime.now());
query.setStatusList(Arrays.asList(1,2));

List<BlogEntity> result = easyEntityQuery.queryable(BlogEntity.class)
    .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT)//设置非null字符串非空 后续的where才会添加到条件中
    .where(o -> {

            //当query.getContext不为空是添加查询条件 content like query.getContext
            o.content().like(query.getContent());
            //当query.getOrder不为null是添加查询条件 content = query.getContext
            o.order().eq(query.getOrder());
            //当query.getPublishTimeBegin()不为null添加左闭区间,右侧同理 publishTimeBegin <= publishTime <= publishTimeEnd
            o.publishTime().rangeClosed(query.getPublishTimeBegin(), query.getPublishTimeEnd());
            //添加in条件
            o.status().in(query.getStatusList());
    }).toList();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ? AND `order` = ? AND `publish_time` >= ? AND `publish_time` <= ? AND `status` IN (?,?)
==> Parameters: false(Boolean),%标题%(String),1(BigDecimal),2023-07-14T22:05:24.971(LocalDateTime),2023-07-14T22:05:24.971(LocalDateTime),1(Integer),2(Integer)
<== Time Elapsed: 5(ms)
<== Total: 0



BlogQuery1Request query = new BlogQuery1Request();
query.setContent("标题");
query.setPublishTimeBegin(LocalDateTime.now());
query.setPublishTimeEnd(LocalDateTime.now());
query.setStatusList(Arrays.asList(1,2));

List<BlogEntity> result = easyQuery.queryable(BlogEntity.class)
    .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT)//设置非null字符串非空 后续的where才会添加到条件中
    .where(o -> {

            //当query.getContext不为空是添加查询条件 content like query.getContext
            o.content().like(query.getContent());
            //当query.getOrder不为null是添加查询条件 content = query.getContext
            o.order().eq(query.getOrder());//不生效
            //当query.getPublishTimeBegin()不为null添加左闭区间,右侧同理 publishTimeBegin <= publishTime <= publishTimeEnd
            o.publishTime().rangeClosed(query.getPublishTimeBegin(), query.getPublishTimeEnd());
            //添加in条件
            o.status().in(query.getStatusList());

    }).toList();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ? AND `publish_time` >= ? AND `publish_time` <= ? AND `status` IN (?,?)
==> Parameters: false(Boolean),%标题%(String),1(BigDecimal),2023-07-14T22:05:24.971(LocalDateTime),2023-07-14T22:05:24.971(LocalDateTime),1(Integer),2(Integer)
<== Time Elapsed: 5(ms)
<== Total: 0
```

```java
  String toSql = easyQuery
                .queryable(Topic.class)
                .leftJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
                .leftJoin(BlogEntity.class, (t,t1, t2) -> t.eq(t2, Topic::getId, BlogEntity::getId))
                .leftJoin(BlogEntity.class, (t, t1, t2, t3) -> t.eq(t3, Topic::getId, BlogEntity::getId))
                .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT)//设置非null字符串非空 后续的where才会添加到条件中
                .where(o -> o.eq(Topic::getId, ""))
                //.filterConfigure(AnyValueFilter.DEFAULT)//恢复如果后面没有自定义where那么不需要恢复
                .limit(1, 2)
                .toSQL();
// SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t
// LEFT JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id`
// LEFT JOIN `t_blog` t2 ON t2.`deleted` = ? AND t.`id` = t2.`id`
// LEFT JOIN `t_blog` t3 ON t3.`deleted` = ? AND t.`id` = t3.`id`
// LIMIT 2 OFFSET 1

```

条件拦截,加入我的 where 条件大部分都符合极个别不符合可以通过提前返回不符的来保证剩余的都可以进行

```java
String id="";
String userName=null;
String nickname="BBB";
Boolean leftEnable=true;


    String sql = easyQuery.queryable(DefTable.class)
            .leftJoin(DefTableLeft1.class, (t, t1) -> t.eq(t1, DefTable::getId, DefTableLeft1::getDefId))
            .filterConfigure((t, p, v) -> {//分别是table，property，value
                if ("id".equals(p)) { //无论.eq(DefTable::getId, id) 这个方法属性为id的比较是啥结果都会添加到条件里面
                    return true;
                }
                return NotNullOrEmptyValueFilter.DEFAULT.accept(t, p, v);
            })
            .where((t, t1) -> t
                    .eq(DefTable::getId, id)//虽然id为空但是还是加入到了sql中
                    .eq(DefTable::getUserName, userName)
                    .eq(DefTable::getNickname, nickname)
                    .then(t1).eq(DefTableLeft1::getEnable, leftEnable)).toSQL();
// SELECT t.id,t.user_name,t.nickname,t.enable,t.score,t.mobile,t.avatar,t.number,t.status,t.created,t.options FROM t_def_table t
// LEFT JOIN t_def_table_left1 t1 ON t.id = t1.def_id
// WHERE t.id = ? AND t.nickname = ? AND t1.enable = ?


```

::: warning 注意点及说明!!!

> 必须写到对应的`where`前面后续的`where`才会生效，用户可以自定义,比如满足的条件是优先满足`eq、ge、gt`等的第一个 boolean 条件,后续才会判断`valueFilter`，如果有多个`where`部分 where 需要自定义那么可以采用`filterConfigure(NotNullOrEmptyValueFilter.DEFAULT)`来恢复到所有参数都接受,一般用于查询时可以少写很多判断
> 
:::

## 属性一对一查询

object 的一个属性对应数据库查询的一列

`@EasyWhereCondition`

| 属性              | 默认值 | 描述                                                                                      |
| ----------------- | ------ | ----------------------------------------------------------------------------------------- |
| strict            | true   | 严格模式,如果属性没有映射到对象上报错,如果表`tableIndex`不在当前上下文中也报错            |
| tableIndex        | 0      | 当前条件用于查询哪张表                                                                    |
| allowEmptyStrings | false  | 是否允许空字符串,如果允许表示空也会加入到表达式内而不是忽略                               |
| propName          | ""     | 当前属性映射到数据库对象的属性名称,为空表示使用当前属性名                                 |
| type              | LIKE   | 当前属性和数据库对象属性以哪种表达式构建条件                                              |
| mode              | SINGLE | `SINGLE`:表示当前属性是一对一数据库列,`MULTI_OR`:表示当前值对多个数据库列并且用 or 来连接 |
| propNames         | []     | 当前属性映射到哪两个属性列                                                                |
| tablesIndex       | []     | 可以和 propNames 长度不一样,不一样的代表 0 主表                                           |

::: warning 说明!!!

> 属性默认是支持 like,可以通过指定条件,如果查询属性与数据库对象属性不一致可以通过`propName`改写
> 
:::

```java

@Data
public class BlogQuery2Request {

    /**
     * 标题
     */
    @EasyWhereCondition
    private String title;
    /**
     * 内容
     */
    @EasyWhereCondition
    private String content;
    /**
     * 点赞数
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.EQUAL)
    private Integer star;
    /**
     * 发布时间
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.RANGE_LEFT_CLOSED,propName = "publishTime")
    private LocalDateTime publishTimeBegin;
    @EasyWhereCondition(type = EasyWhereCondition.Condition.RANGE_RIGHT_CLOSED,propName = "publishTime")
    private LocalDateTime publishTimeEnd;
    /**
     * 评分
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.GREATER_THAN_EQUAL)
    private BigDecimal score;
    /**
     * 状态
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.LESS_THAN_EQUAL)
    private Integer status;
    /**
     * 排序
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.GREATER_THAN)
    private BigDecimal order;
    /**
     * 是否置顶
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.NOT_EQUAL)
    private Boolean isTop;
    /**
     * statusList没有对应的属性名称所以需要改写为映射到status
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.IN,propName = "status")
    private List<Integer> statusList=new ArrayList<>();
    /**
     * statusNotList没有对应的属性名称所以需要改写为映射到status
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.NOT_IN,propName = "status")
    private List<Integer> statusNotList=new ArrayList<>();
}
```

## 动态查询条件 1

```java

 BlogQuery2Request query = new BlogQuery2Request();
query.setOrder(BigDecimal.valueOf(1));
query.setContent("标题");
query.setPublishTimeBegin(LocalDateTime.now());
query.setPublishTimeEnd(LocalDateTime.now());
query.setStatusList(Arrays.asList(1,2));

List<BlogEntity> queryable = easyQuery.queryable(BlogEntity.class)
        .whereObject(query).toList();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ? AND `publish_time` >= ? AND `publish_time` <= ? AND `order` = ? AND `status` IN (?,?)
==> Parameters: false(Boolean),%标题%(String),2023-07-14T22:37:47.865(LocalDateTime),2023-07-14T22:37:47.865(LocalDateTime),1(BigDecimal),1(Integer),2(Integer)
<== Time Elapsed: 4(ms)
<== Total: 0



BlogQuery2Request query = new BlogQuery2Request();
query.setContent("标题");
query.setPublishTimeEnd(LocalDateTime.now());
query.setStatusList(Arrays.asList(1,2));

List<BlogEntity> queryable = easyQuery.queryable(BlogEntity.class)
        .whereObject(query).toList();


==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ? AND `publish_time` <= ? AND `status` IN (?,?)
==> Parameters: false(Boolean),%标题%(String),2023-07-14T22:37:47.880(LocalDateTime),1(Integer),2(Integer)
<== Time Elapsed: 2(ms)
<== Total: 0
```

## 属性一对多查询

object 的一个属性对应数据库查询的多列

```java

@Data
public class BlogQueryRequest implements ObjectSort {

    /**
     * 标题
     */
    @EasyWhereCondition
    private String title;
    /**
     * 标题
     */
    @EasyWhereCondition(mode = EasyWhereCondition.Mode.MULTI_OR,propNames = {"title","content"})
    private String title2;
    /**
     * 标题
     */
    @EasyWhereCondition(mode = EasyWhereCondition.Mode.MULTI_OR,propNames = {"id","content"},type = EasyWhereCondition.Condition.EQUAL)
    private String title3;
    /**
     * 内容
     */
    @EasyWhereCondition(propName = "url")
    private String content;
    /**
     * 点赞数
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.EQUAL)
    private Integer star;
    /**
     * 发布时间
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.RANGE_LEFT_CLOSED,propName = "publishTime")
    private LocalDateTime publishTimeBegin;
    @EasyWhereCondition(type = EasyWhereCondition.Condition.RANGE_RIGHT_CLOSED,propName = "publishTime")
    private LocalDateTime publishTimeEnd;
    /**
     * 评分
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.GREATER_THAN_EQUAL)
    private BigDecimal score;
    /**
     * 状态
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.LESS_THAN_EQUAL)
    private Integer status;
    /**
     * 排序
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.GREATER_THAN)
    private BigDecimal order;
    /**
     * 是否置顶
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.NOT_EQUAL)
    private Boolean isTop;
    @EasyWhereCondition(type = EasyWhereCondition.Condition.IN,propName = "status")
    private List<Integer> statusList=new ArrayList<>();
    @EasyWhereCondition(type = EasyWhereCondition.Condition.NOT_IN,propName = "status")
    private List<Integer> statusNotList=new ArrayList<>();


    private List<String> orders=new ArrayList<>();
    @Override
    public void configure(ObjectSortBuilder builder) {
        for (String order : orders) {
            builder.orderBy(order,true);
        }
    }
}


BlogQueryRequest blogQueryRequest = new BlogQueryRequest();
blogQueryRequest.setTitle("123");
blogQueryRequest.setTitle2("123");
blogQueryRequest.setTitle3("123");
blogQueryRequest.setContent("123");
blogQueryRequest.setStar(123);
blogQueryRequest.setPublishTimeBegin(LocalDateTime.now());
blogQueryRequest.setPublishTimeEnd(LocalDateTime.now());
blogQueryRequest.setScore(new BigDecimal("123"));
blogQueryRequest.setStatus(1);
blogQueryRequest.setOrder(new BigDecimal("12"));
blogQueryRequest.setIsTop(false);
blogQueryRequest.getOrders().add("status");
blogQueryRequest.getOrders().add("score");
String sql = easyQuery.queryable(BlogEntity.class)
        .whereObject(true, blogQueryRequest)
        .orderByObject(true, blogQueryRequest)
        .toSQL();
Assert.assertEquals("SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `title` LIKE ? AND (`title` LIKE ? OR `content` LIKE ?) AND (`id` = ? OR `content` = ?) AND `url` LIKE ? AND `star` = ? AND `publish_time` >= ? AND `publish_time` <= ? AND `score` >= ? AND `status` <= ? AND `order` > ? AND `is_top` <> ? ORDER BY `status` ASC,`score` ASC", sql);

```

## 动态条件多表 join

通过修改`@EasyWhereCondition`的`tableIndex`或者`tablesIndex`(区别就是属性是否是对应多个属性)来指定当前属性对应的 join 的哪张表

| 类型          | 构建条件           |
| ------------- | ------------------ |
| String        | 不为 null 且不为空 |
| Integer       | 不为 null          |
| Short         | 不为 null          |
| Double        | 不为 null          |
| Float         | 不为 null          |
| BigDecimal    | 不为 null          |
| LocalDateTime | 不为 null          |
| List          | 不为 null 且不为空 |
| Array         | 不为 null 且不为空 |

## 替换 whereObject 实现

`easy-query`默认采用接口模式实现`whereObject`用户可以自行替换框架行为,甚至`@EasyWhereCondition`也可以自己实现

### 如何替换框架行为

[《替换框架行为 ❗️❗️❗️》](/easy-query-doc/config/replace-configure)

### 接口

`WhereObjectQueryExecutor` 默认实现 `DefaultWhereObjectQueryExecutor`

您可以自行实现这个并且使用自己的注解来配合使用

## 相关搜索

`注解查询` `动态查询` `dto查询` `json查询` `对象查询` `form查询` `表单查询`
