---
title: DTO筛选
order: 10
---

## DTO筛选
将前端请求转成java对象后传入api实现对表达式的筛选,简化用户在编写form表单时的很多重复性查询条件,默认支持平铺属性在平铺的请求对象属性上面添加多级导航即可譬如`@EasyWhereCondition(propName = "bankCards.code")`如果遇到`ToMnay`则会将查询转成子查询并且相同导航节点会合并如果是`ToOne`则会转成`join`默认和用户手写dsl一致

## API


| 方法 | 描述|
| ------------------------------ | ---------------------------- |
| `whereObject(Object)`          | 传入一个对象来实现对当前对象解析后的where生成 筛选数据集结果|

## 默认行为
框架提供注解为`@EasyWhereCondition`默认行为是`like`，用户可以通过`defaultCondition`配置项进行修改默认行为`like`或者`contains`，区别就是`like`会将用户的百分号`%`视为通配符，而`contains`则会将百分号`%`视为被查询的一部分

## EasyWhereCondition注解
| 属性              | 默认值 | 描述                                                                                      |
| ----------------- | ------ | ----------------------------------------------------------------------------------------- |
| strict            | true   | 严格模式,如果属性没有映射到对象上报错,如果表`tableIndex`不在当前上下文中也报错            |
| tableIndex        | 0      | 当前条件用于查询哪张表                                                                    |
| allowEmptyStrings | false  | 是否允许空字符串,如果允许表示空也会加入到表达式内而不是忽略                               |
| propName          | ""     | 当前属性映射到数据库对象的属性名称,为空表示使用当前属性名,支持隐式join和隐式子查询        |
| type              | LIKE   | 当前属性和数据库对象属性以哪种表达式构建条件,支持构建eq实例时设置默认行为                        |
| mode              | SINGLE | `SINGLE`:表示当前属性是一对一数据库列,`MULTI_OR`:表示当前值对多个数据库列并且用 or 来连接 |
| propNames         | []     | 当前属性映射到哪两个属性列,比如前端传递`keyword`字段需要搜索`name`或者`idCard`就可以用当前属性配合`mode=MULIT_OR`     |
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

## 属性隐式筛选
`whereObject`使用隐式join和隐式子查询
```java

/**
 * create time 2025/8/10 21:18
 * {@link SysUser}
 *
 * @author xuejiaming
 */
@Data
public class SysUserQueryDTO2 {

    @EasyWhereCondition(propName = "bankCards.code",type = EasyWhereCondition.Condition.STARTS_WITH)
    private String bankCardCode;
    @EasyWhereCondition(propName = "bankCards.bank.name", type = EasyWhereCondition.Condition.IN)
    private List<String> bankCardBankNames;
    @EasyWhereCondition(propName = "bankCards.type",type = EasyWhereCondition.Condition.CONTAINS)
    private String bankCardType;
    @EasyWhereCondition(propName = "bankCards.type",type = EasyWhereCondition.Condition.ENDS_WITH)
    private String bankCardType2;
    @EasyWhereCondition(propName = "bankCards.type",type = EasyWhereCondition.Condition.CONTAINS)
    private String bankCardType3;
}
```

::: tip 说明!!!
> 添加@link后，你在编写propName的时候会有对应的插件提示
:::

```java

SysUserQueryDTO2 queryDTO = new SysUserQueryDTO2();
queryDTO.setBankCardCode("123%");
queryDTO.setBankCardType("储蓄_卡");
queryDTO.setBankCardType2("储蓄卡");
queryDTO.setBankCardType3("储蓄卡");
queryDTO.setBankCardBankNames(Arrays.asList("工商银行","建设银行"));
List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .configure(s->s.getBehavior().add(EasyBehaviorEnum.ALL_SUB_QUERY_GROUP_JOIN))//依然支持groupJoin合并子查询
        .whereObject(queryDTO)
        .where(user -> {
        })
        .toList();

SELECT t.`id`, t.`name`, t.`phone`, t.`age`, t.`create_time`
FROM `t_sys_user` t
	LEFT JOIN (
		SELECT t1.`uid` AS `uid`, COUNT(1) > 0 AS `__any2__`
		FROM `t_bank_card` t1
			INNER JOIN `t_bank` t3 ON t3.`id` = t1.`bank_id`
		WHERE LOCATE('123%', t1.`code`) = 1
			AND t3.`name` IN ('工商银行', '建设银行')
			AND LOCATE('储蓄_卡', t1.`type`) > 0
			AND t1.`type` LIKE CONCAT('%', '储蓄卡')
			AND t1.`type` LIKE CONCAT('%', '储蓄卡', '%')
		GROUP BY t1.`uid`
	) t2
	ON t2.`uid` = t.`id`
WHERE IFNULL(t2.`__any2__`, false) = true
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

[《替换框架行为 ❗️❗️❗️》](/easy-query-doc/framework/replace-configure)

### 接口

`WhereObjectQueryExecutor` 默认实现 `DefaultWhereObjectQueryExecutor`

您可以自行实现这个并且使用自己的注解来配合使用

## 相关搜索

`注解查询` `动态查询` `json查询` `对象查询` `dto查询` `form查询` `表单查询`