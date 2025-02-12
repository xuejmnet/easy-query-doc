---
title: API模式
---

## 前言

前面在[快速开始](../../startup//quick-start.md)章节中，我们使用了Easy Query的对象模式进行操作，下面我们将详细讲解Easy Query的API模式。


## API模式

Easy Query提供了多种API模式使用，包括对象模式，代理模式，属性模式和lambda模式。

Easy Query早期版本使用的是lambda模式，传入lambda表达式作为属性，每次编写实体类属性都要写两个分号，不建议使用，虽然有类型提示，维护比较好，它的条件比较不够直观，而且解析表达式性能会稍稍低于属性模式和代理模式,因为需要将lambda表达式转成属性。
接着，Easy Query推出了属性模式，不建议直接使用，与lambda模式类似，只不过是传入属性名称作为属性，没有类型提示，难维护，它的条件比较不够直观，修改实体类属性无法同步修改引用处，主要用于支持动态生成查询条件。
最后，Easy Query推出了更简便，更好维护以及更高效的代理模式和对象模式。

```java
    @Test
    public void testApiMode() {
        DataSource dataSource = Config.geMysqlDataSource();
        //采用控制台输出打印sql
        LogFactory.useStdOutLogging();
        //属性模式
        EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .optionConfigure(op -> {
                    op.setPrintSql(true);
                    op.setKeepNativeStyle(true);
                    op.setDefaultTrack(true);
                })
                .useDatabaseConfigure(new H2DatabaseConfiguration())
                .build();
        User user = easyQueryClient.queryable(User.class)
                .where(u -> u.eq("name", "张三"))
                .firstNotNull();
        user.setUpdateTime(LocalDateTime.now());
        easyQueryClient.updatable(user).executeRows();
        Integer userId = user.getId();
        easyQueryClient.updatable(User.class)
                .set("updateTime",LocalDateTime.now())
                .where(o -> o.eq("id",userId))
                .executeRows();

        //lambda模式
        DefaultEasyQuery easyQuery = new DefaultEasyQuery(easyQueryClient);
        user = easyQuery.queryable(User.class)
                .where(u -> u.eq(User::getName, "张三"))
                .firstNotNull();
        user.setUpdateTime(LocalDateTime.now());
        easyQuery.updatable(user).executeRows();
        easyQuery.updatable(User.class)
                .set(User::getUpdateTime,LocalDateTime.now())
                .where(o -> o.eq(User::getId,userId))
                .executeRows();

        //代理模式
        DefaultEasyProxyQuery easyProxyQuery = new DefaultEasyProxyQuery(easyQueryClient);
        user = easyProxyQuery.queryable(UserProxy.createTable())
                .where(u -> u.name().eq("张三"))
                .firstNotNull();
        user.setUpdateTime(LocalDateTime.now());
        easyProxyQuery.updatable(user).useProxy(UserProxy.createTable()).executeRows();
        easyProxyQuery.updatable(UserProxy.createTable())
                .setColumns(o -> {
                    o.updateTime().set(LocalDateTime.now());
                })
                .where(o -> o.id().eq(userId))
                .executeRows();

        //对象模式
        DefaultEasyEntityQuery easyEntityQuery = new DefaultEasyEntityQuery(easyQueryClient);
        easyEntityQuery.updatable(user).executeRows();
        easyEntityQuery.updatable(User.class)
                .setColumns(o -> {
                    o.updateTime().set(LocalDateTime.now());
                })
                .where(o -> o.id().eq(userId))
                .executeRows();
    }
```
::: warning 注意
属性模式和lambda模式下，在编写查询条件时，关系运算符是在前面的，这是不够直观表达的，因此对象模式做了改进。
:::

从上面的例子中可以看出对象模式与代理模式的区别。

在对象模式下，只需要在声明实体类实现`ProxyEntityAvailable`接口来关联代理类，因为需要使用代理类来设置查询条件，这是对象模式的唯一缺点，
之后无论是查询还是更新操作，都可以直接使用实体类，这样更简单直观。
代理模式下，虽然不用实现`ProxyEntityAvailable`接口，查询时比对象模式简便，但在更新时，除了传入实体类对象外，还需要显式传入代理类对象来关联代理类，相对繁琐。
同时，在可读性上，对象模式更加直观，易于理解。
因此无论是易用性还是可读性，实体类模式表现更佳，强烈推荐使用实体类模式。
在后面的章节中，只会重点讲解实体类模式。