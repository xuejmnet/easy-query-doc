---
title: 动态join
---

# 动态join
`easy-query`在`2.3.0^`版本添加了配置项`relation-table-append`默认`smart`可以自动识别使用使用了`relationTable`

## 案例
```java
String companyName="公司";
List<MyComUser> list = easyEntityQuery.queryable(MyComUser.class)
        .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT)
        .where(su -> {
            su.myCompany().name().like(companyName);
        }).toList();


==> Preparing: SELECT t.`id`,t.`com_id`,t.`user_id`,t.`gw` FROM `my_com_user` t LEFT JOIN `my_company_info` t1 ON t1.`id` = t.`com_id` WHERE t1.`name` LIKE ?
==> Parameters: %公司%(String)

//上下两个表达式因为参数没有生效所以生成的sql也会动态的智能添加relationTable

String companyName="";
List<MyComUser> list = easyEntityQuery.queryable(MyComUser.class)
        .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT)
        .where(su -> {
            su.myCompany().name().like(companyName);
        }).toList();

==> Preparing: SELECT t.`id`,t.`com_id`,t.`user_id`,t.`gw` FROM `my_com_user` t




//不使用filterConfigure
String companyName="";
List<MyComUser> list = easyEntityQuery.queryable(MyComUser.class)
        .where(su -> {
            su.myCompany().name().like(EasyStringUtil.isNotBlank(companyName),companyName);
        }).toList();

==> Preparing: SELECT t.`id`,t.`com_id`,t.`user_id`,t.`gw` FROM `my_com_user` t


//在2.3.0之前的版本需要手动if包裹条件，2.3.0后更加智能

String companyName="";
List<MyComUser> list = easyEntityQuery.queryable(MyComUser.class)
        .where(su -> {
            if(EasyStringUtil.isNotBlank(companyName)){
                su.myCompany().name().like(companyName);
            }
        }).toList();
==> Preparing: SELECT t.`id`,t.`com_id`,t.`user_id`,t.`gw` FROM `my_com_user` t
```
