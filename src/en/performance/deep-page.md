---
title: Deep Pagination Reverse Sort
order: 40
---

`eq` thoughtfully provides users with reverse sort functionality. This feature is suitable for data return in deep pagination, using reverse sort to allow the program to quickly return data results during pagination. This was previously mentioned on the pagination page, this time it is mentioned again from a performance perspective.


## Reverse Sort Pagination
When we are using pagination queries
See the diagram below for the specific principle
<!-- <img src="/reverse.png"> -->
<img :src="$withBase('/images/reverse.png')">


### Configuration Items

Configuration Name  | Default Value | Description  
--- | --- | --- 
reverseOffsetThreshold| 0 | Reverse sort offset threshold. For example, if set to `10000`, then when paginating, if offset > the set value `10000` and offset > (total*0.5), that is, the query offset exceeds half of the total, reverse sort will be enabled

Programmatic Enabling
```java

easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
        .setDefaultDataSource(dataSource)
        .optionConfigure(op -> {
            op.setReverseOffsetThreshold(10);
        })
        .useDatabaseConfigure(new MySQLDatabaseConfiguration())
        .build();
```

### Example
From the example, we can see that when our offset is greater than half of the total and greater than the reverse threshold of 10, then `asc` will become `desc`, and then deep pagination will become shallow pagination
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

### Disable Reverse Sort at Runtime
```java


EasyPageResult<Topic> pageResult = easyEntityQuery.queryable(Topic.class)
        .configure(op->{
            //Set not to use reverse pagination
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

