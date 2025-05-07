---
title: 深分页反向排序
order: 40
---

`eq`贴心的为用户提供了反向排序功能,这个功能适合深分页下的数据返回,利用反向排序让程序在分页的时候能够快速的返回数据结果,之前在分页页面已经提及了这次额外以性能点重新提及一遍


## 反向排序分页
当我们在使用分页查询的时候
具体原理看下图
<!-- <img src="/reverse.png"> -->
<img :src="$withBase('/images/reverse.png')">


### 配置项

配置名称  | 默认值 | 描述  
--- | --- | --- 
reverseOffsetThreshold| 0 | 反向排序偏移量阈值,比如设置为`10000`那么分页的时候如果offset>设置的值`10000`并且offset>(total*0.5)也就是查询偏移量超过了总数的一半那么会启用反向排序

编程式开启
```java

easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
        .setDefaultDataSource(dataSource)
        .optionConfigure(op -> {
            op.setReverseOffsetThreshold(10);
        })
        .useDatabaseConfigure(new MySQLDatabaseConfiguration())
        .build();
```

### 案例
案例我们可以知晓当我们的偏移量大于总数的一半且大于反排阈值10的时候那么`asc`会变成`desc`,然后深分页会变成浅分页
```java

EasyPageResult<Topic> pageResult = easyEntityQuery.queryable(Topic.class)
        .where(t_topic -> {
            t_topic.id().isNotNull();
        }).orderBy(t_topic -> t_topic.createTime().asc()).toPageResult(7, 10);


==> Preparing: SELECT COUNT(*) FROM `t_topic` WHERE `id` IS NOT NULL
<== Time Elapsed: 3(ms)
<== Total: 1
==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` IS NOT NULL ORDER BY `create_time` DESC LIMIT 10 OFFSET 31
<== Time Elapsed: 3(ms)
<== Total: 10
```

### 运行时不启用反排
```java


EasyPageResult<Topic> pageResult = easyEntityQuery.queryable(Topic.class)
        .configure(op->{
            //设置不使用反排分页
            op.setReverseOrder(false);
        })
        .where(t_topic -> {
            t_topic.id().isNotNull();
        }).orderBy(t_topic -> t_topic.createTime().asc())
        .toPageResult(7, 10);


==> Preparing: SELECT COUNT(*) FROM `t_topic` WHERE `id` IS NOT NULL
<== Time Elapsed: 2(ms)
<== Total: 1
==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` IS NOT NULL ORDER BY `create_time` ASC LIMIT 10 OFFSET 60
<== Time Elapsed: 3(ms)
<== Total: 10
```