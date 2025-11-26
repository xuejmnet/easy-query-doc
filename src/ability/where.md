---
title: where进阶
order: 7
---

## API

::: tip 动态控制where生效!!!
> 如果第一个参数为true则表示需要执行当前where,否则就是不需要比如`where(false,o->o.id().eq("123"))`因为第一个参数为`false`那么整个`where`将不会生效,不填写第一个参数则视为当前`where`生效
:::


| 方法 | 描述|
| ------------------------------ | ---------------------------- |
| `where(expression)`            | 传入表达式方法筛选数据集结果|
| `whereObject(Object)`          | 传入一个对象来实现对当前对象解析后的where生成 筛选数据集结果|
| `whereById(Object)`            | 传入一个id来实现对数据库集合的筛选,当前表必须是有且仅有一个主键的时候才可以否则将会抛错 |
| `whereByIds(array)`            | 传入一个id集合来实现对数据库集合的筛选,当前表必须是有且仅有一个主键的时候才可以否则将会抛错   |



::: tip 说明!!!
> `whereObject`具体参考[DTO映射基础](/easy-query-doc/dto-query/filter)
:::


## 结构化对象返回



```java

@Data
@Table("t_topic")
@EntityProxy
@EasyAssertMessage("未找到主题信息")
@EasyAlias("t_topic")//添加这个注解那么plugin可以快速帮助你生成别名
@FieldNameConstants
public class Topic implements ProxyEntityAvailable<Topic, TopicProxy> {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;
}
```

## `where(expression)`
在表达式链式中您可以用单个`where`来描述当前表达式的筛选,当然您也可以用多个`where`来组合,多个where之间不存在`select`或者`groupBy`那么多个`where`之间会互相`append`,
其中`where`的入参表示当前表的一个别名变量如果您熟悉`java`的`stream api`或者`dotnet`的`linq`那么当前表达式您可以易如反掌的写出来

### 单表where
单表的where入参我们只会有一个当前表的别名用来描述当前表,因为有上下文的约束所以用户无法使用非当前表达式的其他表可以减少用户在编写dsl时候的很多心智问题

```java

easyEntityQuery.queryable(Topic.class)
        .where(t_topic -> {
            t_topic.title().like("123");
            t_topic.stars().gt(1);
        }).toList();
//上下两个写法一样
easyEntityQuery.queryable(Topic.class)
        .where(t_topic -> {
            t_topic.title().like("123");
        })
        .where(t_topic -> {
            t_topic.stars().gt(1);
        }).toList();

//当然如果您的`where`里面只有一个条件那么大括号也可以省略(这是lambda的基本常识不做过多解释)

easyEntityQuery.queryable(Topic.class)
        .where(t_topic -> t_topic.title().like("123"))
        .where(t_topic -> t_topic.stars().gt(1)).toList();
```

### 多表where
多表的`where`入参个数有两个选择一个是1个入参表示主表,一个是n个入参顺序上分别表示主表+join表*n,join后的on也是一样的处理
```java
easyEntityQuery.queryable(Topic.class)
        .leftJoin(BlogEntity.class,(t_topic, t_blog) -> {
            t_topic.id().eq(t_blog.id());
        })
        .where((t_topic, t_blog) -> {
            t_topic.title().like("123");
            t_blog.status().eq(1);
        }).toList();
```



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

`3.0.46^`版本新增`NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS`支持传递到整个dsl包括隐式子查询和隐式groupJoin和隐式partation，如果用户需要自己实现可以通过实现接口由`ValueFilter`变成`PropagationValueFilter`

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

> 必须写到对应的`where`前面后续的`where`才会生效，用户可以自定义,比如满足的条件是优先满足`eq、ge、gt`等的第一个 boolean 条件,后续才会判断`valueFilter`，如果有多个`where`部分 where 需要自定义那么可以采用`filterConfigure(AnyValueFilter.DEFAULT)`来恢复到所有参数都接受,一般用于查询时可以少写很多判断
> 
:::

条件接受默认接口`ValueFilter`如果你自定义的直接实现这个那么同一个表达式的子查询则不会生效,依然需要你手动去处理,为了让同一个表达式的子查询生效,请使用`PropagationValueFilter`接口来实现这个接口相关操作,默认`.filterConfigure(NotNullOrEmptyValueFilter.DEFAULT)`可以改为`.filterConfigure(NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS)`那么同一个表达式的子查询也会对其参数null或空的使用忽略模式。

::: warning 注意点及说明!!!

什么是同一个表达式的子查询,就是非`easyEntityQuery`bean注入的子查询，譬如`o.userList()....`或者`o.expression().subQueryable(xxx.class)`这一类子查询我们认为是同一个表达式子查询,由`easyEntityQuery.queryable(xxx.class)`创建的我们认为是不同表达式的子查询这种子查询是独立配置
:::


### 动态列

有时候我们的搜索不一定是动态是否生效有可能需要实现动态的列名处理,这边eq提供了任意列`anyColumn`需要`eq2.6.2+`

`anyColumn(property)`支持隐式join:比如`o.anyColumn("user.age")`等于`o.user().age()`
```java

        List<DocBankCard> list = easyEntityQuery.queryable(DocBankCard.class)
                .where(bank_card -> {
                    bank_card.anyColumn("code").eq("456");
                    //上下两者写法一样
                    //bank_card.code().eq("321");
                }).toList();
```

## 相关搜索

`注解查询` `动态查询` `json查询` `对象查询` `form查询` `表单查询`
