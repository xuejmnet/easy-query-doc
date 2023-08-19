---
title: 动态条件
---

# 动态条件
通过springboot上传json对象实现条件查询,目前有两种解决方案,一个是动态条件来构建where,一个是通过object对象来实现动态查询

## 默认配置项
模式  | 优点 | 缺点  
--- | --- | --- 
动态条件 | 可以实现任意复杂条件构建  | 对于大部分业务场景过于复杂
对象查询 | 可以快速实现基于dto的条件查询  | 条件仅支持and,且属性名需要一致,不一致需要手动映射为一致

## 查询对象
```java

@Data
public class BlogQuery1Request {

    /**
     * 标题
     */
    private String title;
    /**
     * 内容
     */
    private String content;
    /**
     * 点赞数
     */
    private Integer star;
    /**
     * 发布时间
     */
    private LocalDateTime publishTimeBegin;
    private LocalDateTime publishTimeEnd;
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
    private List<Integer> statusList=new ArrayList<>();
    private List<Integer> statusNotList=new ArrayList<>();
}

```

## 动态条件

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

## 条件接受
`1.4.1^`以上版本支持`ConditionAccepter` 条件接收器,`Queryable`默认行为`ConditionAllAccepter.DEFAULT`所有的条件都接受,框架提供了一个可选`ConditionDefaultAccepter.DEFAULT`当传入的条件参数值非null且字符串的情况下非空那么才会增加到条件里面,仅where条件生效。

用户也可以自定义实现接口
```java
public interface ConditionAccepter {
    boolean accept(TableAvailable table, String property, Object value);
}

public class ConditionAllAccepter implements ConditionAccepter {
    public static final ConditionAccepter DEFAULT=new ConditionAllAccepter();
    private ConditionAllAccepter(){

    }
    @Override
    public boolean accept(TableAvailable table, String property, Object value) {
        return true;
    }
}

public class ConditionDefaultAccepter implements ConditionAccepter {
    public static final ConditionAccepter DEFAULT=new ConditionDefaultAccepter();
    @Override
    public boolean accept(TableAvailable table, String property, Object value) {
        if(value==null){
            return false;
        }
        if(value instanceof String){
            return EasyStringUtil.isNotBlank((String) value);
        }
        return false;
    }
}

```

```java
  String toSql = easyQuery
                .queryable(Topic.class)
                .leftJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
                .leftJoin(BlogEntity.class, (t,t1, t2) -> t.eq(t2, Topic::getId, BlogEntity::getId))
                .leftJoin(BlogEntity.class, (t, t1, t2, t3) -> t.eq(t3, Topic::getId, BlogEntity::getId))
                .conditionConfigure(ConditionDefaultAccepter.DEFAULT)//设置非null字符串非空 后续的where才会添加到条件中
                .where(o -> o.eq(Topic::getId, ""))
                //.conditionConfigure(ConditionAllAccepter.DEFAULT)//恢复如果后面没有自定义where那么不需要恢复
                .limit(1, 2)
                .toSQL();
// SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t 
// LEFT JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` 
// LEFT JOIN `t_blog` t2 ON t2.`deleted` = ? AND t.`id` = t2.`id` 
// LEFT JOIN `t_blog` t3 ON t3.`deleted` = ? AND t.`id` = t3.`id` 
// LIMIT 2 OFFSET 1
   
```

条件拦截,加入我的where条件大部分都符合极个别不符合可以通过提前返回不符的来保证剩余的都可以进行
```java
String id="";
String userName=null;
String nickname="BBB";
Boolean leftEnable=true;


    String sql = easyQuery.queryable(DefTable.class)
            .leftJoin(DefTableLeft1.class, (t, t1) -> t.eq(t1, DefTable::getId, DefTableLeft1::getDefId))
            .conditionConfigure((t, p, v) -> {//分别是table，property，value
                if ("id".equals(p)) { //无论.eq(DefTable::getId, id) 这个方法属性为id的比较是啥结果都会添加到条件里面
                    return true;
                }
                return ConditionDefaultAccepter.DEFAULT.accept(t, p, v);
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
> 必须写到对应的`where`前面后续的`where`才会生效，用户可以自定义,比如满足的条件是优先满足`eq、ge、gt`等的第一个boolean条件,后续才会判断`conditionAccepter`，如果有多个`where`部分where需要自定义那么可以采用`conditionConfigure(ConditionDefaultAccepter.DEFAULT)`来恢复到所有参数都接受,一般用于查询时可以少写很多判断
:::
## 查询对象


`@EasyWhereCondition`

属性  | 默认值 | 描述  
--- | --- | --- 
strict | true  | 严格模式,如果属性没有映射到对象上报错,如果表`tableIndex`不在当前上下文中也报错
tableIndex | 0  | 当前条件用于查询哪张表
allowEmptyStrings | false  | 是否允许空字符串,如果允许表示空也会加入到表达式内而不是忽略
propName | ""  | 当前属性映射到数据库对象的属性名称,为空表示使用当前属性名
type | LIKE | 当前属性和数据库对象属性以哪种表达式构建条件



::: warning 说明!!!
> 属性默认是支持like,可以通过指定条件,如果查询属性与数据库对象属性不一致可以通过`propName`改写
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

## 动态查询条件
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




类型  | 构建条件 
--- | --- 
String | 不为null且不为空  
Integer | 不为null
Short | 不为null
Double | 不为null
Float | 不为null
BigDecimal | 不为null
LocalDateTime | 不为null
List | 不为null且不为空
Array | 不为null且不为空  