---
title: 自定义列输出
order: 70
---

# 自定义列输出
`easy-query`的`select`目前支持两种方式返回自定义列，一个是自己手动进行`select`的`column`一个是加入返回对象，返回对象被解析的`columnName`和sql的返回列名一致才会

## java对象
```java

@Data
public class BlogEntityTest2 {

    /**
     * 标题
     */
    private String title;
    /**
     * 内容
     */
    private String content;
    /**
     * 博客链接
     */
    @Column("my_url")
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


## 输出指定列
```java
List<BlogEntityTest2> blogEntityTest2s = easyQuery.queryable(BlogEntity.class)
                    .select(BlogEntityTest2.class, o -> o.columnAs(BlogEntity::getUrl, BlogEntityTest2::getUrl)).toList();


==> Preparing: SELECT t.`url` AS `my_url` FROM t_blog t WHERE t.`deleted` = ?
==> Parameters: false(Boolean)
<== Total: 100
```


## 相同属性不同列名不映射
`BlogEntity`.`url`和`BlogEntityTest2`.`url`在`Bean`层面拥有一样的属性名称一样的属性类型,但是因为`BlogEntityTest2`.`url`映射到`my_url`列上所以无法自动映射
```java
List<BlogEntityTest2> blogEntityTest2s = easyQuery.queryable(BlogEntity.class)
                    .select(BlogEntityTest2.class).toList();


==> Preparing: SELECT t.`title`,t.`content`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM t_blog t WHERE t.`deleted` = ?
==> Parameters: false(Boolean)
<== Total: 100
```

## 全字段查询
全字段查询自动以`resultClass`为主映射`columnName`相同列
```java
List<BlogEntityTest2> blogEntityTest2s = easyQuery.queryable(BlogEntity.class)
                .select(BlogEntityTest2.class,o->o.columnAll()).toList();


==> Preparing: SELECT t.`title`,t.`content`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM t_blog t WHERE t.`deleted` = ?
==> Parameters: false(Boolean)
<== Total: 100
```


## 追加映射字段
```java
List<BlogEntityTest2> blogEntityTest2s = easyQuery.queryable(BlogEntity.class)
                    .select(BlogEntityTest2.class,o->o.columnAll().columnAs(BlogEntity::getUrl,BlogEntityTest2::getUrl)).toList();



==> Preparing: SELECT t.`title`,t.`content`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top`,t.`url` AS `my_url` FROM t_blog t WHERE t.`deleted` = ?
==> Parameters: false(Boolean)
<== Total: 100
```

## 忽略查询字段
查询映射到对象`BlogEntityTest2`在原来的查询结果上忽略`BlogEntity`.`title`字段的查询映射,因为`columnAll`如果真是查询表所有字段但是映射到`BlogEntityTest2`后会丢失所以没有必要查询全字段,直接查询映射字段即可
```java
List<BlogEntityTest2> blogEntityTest2s = easyQuery.queryable(BlogEntity.class)
                    .select(BlogEntityTest2.class,o->o.columnAll().columnIgnore(BlogEntity::getTitle).columnAs(BlogEntity::getUrl,BlogEntityTest2::getUrl)).toList();


==> Preparing: SELECT t.`content`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top`,t.`url` AS `my_url` FROM t_blog t WHERE t.`deleted` = ?
==> Parameters: false(Boolean)
<== Total: 100
```
