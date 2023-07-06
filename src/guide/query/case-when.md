---
title: CaseWhen
---


# CaseWhen
`easy-query`可以自定义实现`case when`,其中框架默认提供多种实现

方法  | 描述 | 用法  
--- | --- | --- 
SQLClientFunc | 支持`EasyQueryClient`表达式api  | SQLClientFunc.caseWhenBuilder(t).caseWhen(f -> f.eq("title", "123"), "111").caseWhen(f -> f.eq("title", "456"), "222").elseEnd("2223")
SQL4JFunc | 支持`EasyQuery`表达式api  | SQL4JFunc.caseWhenBuilder(o).caseWhen(f -> f.eq(Topic::getTitle, "123"), "111").caseWhen(f -> f.eq(Topic::getTitle, "456"), "222").elseEnd("2223")
SQL4KtFunc | 支持`EasyKtQuery`表达式api  | SQL4KtFunc.caseWhenBuilder(selector).caseWhen(f -> f.eq(t.title(), "123"), "111").caseWhen(f -> f.eq(t.title(), "456"), "222").elseEnd("2223")
SQLProxyFunc | 支持`EasyProxyQuery`表达式api   | SQLProxyFunc.caseWhenBuilder(selector).caseWhen(f -> f.eq(t.title(), "123"), "111").caseWhen(f -> f.eq(t.title(), "456"), "222").elseEnd("2223")


## 简单查询
```java
//proxy代理模式
List<Topic> list = easyProxyQuery.queryable(TopicProxy.DEFAULT)
                .where((filter, t) -> filter.like(t.title(), "someTitle"))
                .select(TopicProxy.DEFAULT, (selector, t) -> selector
                        .sqlColumnAs(
                                SQLProxyFunc.caseWhenBuilder(selector)
                                        .caseWhen(f -> f.eq(t.title(), "123"), "111")
                                        .caseWhen(f -> f.eq(t.title(), "456"), "222")
                                        .elseEnd("222")
                                , TopicProxy::title)
                        .column(t.id())
                ).toList();

==> Preparing: SELECT CASE WHEN t.`title` = ? THEN ? WHEN t.`title` = ? THEN ? ELSE ? END AS `title`,t.`id` FROM `t_topic` t WHERE t.`title` LIKE ?
==> Parameters: 123(String),111(String),456(String),222(String),222(String),%someTitle%(String)
<== Time Elapsed: 3(ms)
<== Total: 0

//lambda强类型模式
List<Topic> list = easyQuery.queryable(Topic.class)
                .where(t -> t.like(Topic::getTitle, "someTitle"))
                .select(Topic.class, t -> t
                        .sqlColumnAs(
                                SQL4JFunc.caseWhenBuilder(t)
                                        .caseWhen(f -> f.eq(Topic::getTitle, "123"), "111")
                                        .caseWhen(f -> f.eq(Topic::getTitle, "456"), "222")
                                        .elseEnd("222")
                                , Topic::getTitle)
                        .column(Topic::getId)
                ).toList();

==> Preparing: SELECT CASE WHEN t.`title` = ? THEN ? WHEN t.`title` = ? THEN ? ELSE ? END AS `title`,t.`id` FROM `t_topic` t WHERE t.`title` LIKE ?
==> Parameters: 123(String),111(String),456(String),222(String),222(String),%someTitle%(String)
<== Time Elapsed: 3(ms)
<== Total: 0

//property属性模式
List<Topic> list = easyQueryClient.queryable(Topic.class)
                .where(t -> t.like("title", "someTitle"))
                .select(Topic.class, t -> t
                        .sqlColumnAs(
                                SQLClientFunc.caseWhenBuilder(t)
                                        .caseWhen(f -> f.eq("title", "123"), "111")
                                        .caseWhen(f -> f.eq("title", "456"), "222")
                                        .elseEnd("222")
                                , "title")
                        .column("id")
                ).toList();

==> Preparing: SELECT CASE WHEN t.`title` = ? THEN ? WHEN t.`title` = ? THEN ? ELSE ? END AS `title`,t.`id` FROM `t_topic` t WHERE t.`title` LIKE ?
==> Parameters: 123(String),111(String),456(String),222(String),222(String),%someTitle%(String)
<== Time Elapsed: 2(ms)
<== Total: 0
```