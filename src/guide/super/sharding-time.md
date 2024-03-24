---
title: 时间分表
order: 50
---

本章节我们实现分库分表的分表功能,实现按时间分表，按月份表

这是我们最终的java对象
```java

@Data
@Table(value = "t_topic_sharding_time",shardingInitializer = TopicShardingTimeShardingInitializer.class)
public class TopicShardingTime {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    @ShardingTableKey
    private LocalDateTime createTime;
}



public class TopicShardingTimeShardingInitializer extends AbstractShardingMonthInitializer<TopicShardingTime> {

    @Override
    protected LocalDateTime getBeginTime() {
        return LocalDateTime.of(2020, 1, 1, 1, 1);
    }

    @Override
    protected LocalDateTime getEndTime() {
        return LocalDateTime.now();
    }


    @Override
    public void configure0(ShardingEntityBuilder<TopicShardingTime> builder) {


    }
}
```
## 配置对象
首先我们来看下对象
```java
@Data
@Table(value = "t_topic_sharding_time")
public class TopicShardingTime {

    @Column(primaryKey = true)
    //@ShardingExtraTableKey 先忽略该注解
    private String id;
    private Integer stars;
    private String title;
    @ShardingTableKey //表示这个属性为分表键
    private LocalDateTime createTime;
}
```
注解`Table`属性`shardingInitializer = TopicShardingTimeShardingInitializer.class`表示分初始化器使用`TopicShardingTimeShardingInitializer.class`
```java


public class TopicShardingTimeShardingInitializer extends AbstractShardingMonthInitializer<TopicShardingTime> {

    //表示初始化时的开始时间用来初始化自动计算数据库的分片数量
    @Override
    protected LocalDateTime getBeginTime() {
        return LocalDateTime.of(2020, 1, 1, 1, 1);
    }

    //结束时间,即TopicShardingTime第一次被初始化时和getBeginTime互相计算出现在数据库的分片数量
    @Override
    protected LocalDateTime getEndTime() {
        return LocalDateTime.now();
    }


    @Override
    public void configure0(ShardingEntityBuilder<TopicShardingTime> builder) {


    }
}
```
这样我们就完成了对象的分片配置,具体原理是为什么呢？
首先我们通过设置`beginTime`和`endTime`在初次使用`TopicShardingTime`对象的时候确保可以计算出对应的数据库应有的db数量,具体代码在`AbstractShardingMonthInitializer`这个默认的分片初始化器里面
```java
 @Override
    public void configure(ShardingEntityBuilder<T> builder) {
        EntityMetadata entityMetadata = builder.getEntityMetadata();
        EasyQueryOption easyQueryOption = builder.getEasyQueryOption();
        String defaultDataSourceName = easyQueryOption.getDefaultDataSourceName();
        String tableName = entityMetadata.getTableName();
        //防止系统在凌晨发布定时任务刚好在23:59:00-00:00:00时间点运行过,导致下次运行会在00:00:01-59,会缺几秒导致没有加到内存中所以需要加5分钟
        LocalDateTime setBeginTime = getBeginTime().plusMinutes(5);

        LocalDateTime beginTime = getBeginTimeToStart(setBeginTime);
        LocalDateTime endTime = getEndTime();
        if (beginTime.isAfter(endTime)) {
            throw new IllegalArgumentException("begin time:" + beginTime + " is after end time:" + endTime);
        }
        String tableSeparator = getTableSeparator();

        LinkedHashMap<String, Collection<String>> initTables = new LinkedHashMap<>();
        //应该是不在endTime后可以等于endTime
        while (!beginTime.isAfter(endTime)) {
            String dataSource = formatDataSource(beginTime, defaultDataSourceName);
            String tail = formatTail(beginTime);
            Collection<String> actualTableNames = EasyMapUtil.computeIfAbsent(initTables,dataSource, key -> new ArrayList<>());
            actualTableNames.add(tableName + tableSeparator + tail);
            beginTime = getNextTime(beginTime);
        }

        //初始化实际表
        builder.actualTableNameInit(initTables);
        configure0(builder);
    }
```

## 配置路由
```java

public class TopicShardingTimeTableRoute extends AbstractMonthTableRoute<TopicShardingTime> {

    @Override
    protected LocalDateTime convertLocalDateTime(Object shardingValue) {
        return (LocalDateTime)shardingValue;
    }
}

```

通过继承默认抽象路由`AbstractMonthTableRoute`我们非常简单的实现了分片的规则

```java

        EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .optionConfigure(op -> {
                    op.setDeleteThrowError(false);
                    op.setExecutorCorePoolSize(1);
                    op.setExecutorMaximumPoolSize(0);
                    op.setMaxShardingQueryLimit(10);
                    op.setThrowIfRouteNotMatch(false);
                    op.setMaxShardingRouteCount(512);
                    op.setDefaultDataSourceMergePoolSize(20);
                    //开启定时任务 不然明天的表或者下个月的表不会在内存中存在
                    op.setStartTimeJob(true);
                    op.setReverseOffsetThreshold(10);
                })
                .useDatabaseConfigure(new MySQLDatabaseConfiguration())
                .build();
        DefaultEasyEntityQuery easyEntityQuery = new DefaultEasyEntityQuery(easyQueryClient);
        QueryRuntimeContext runtimeContext = easyQuery.getRuntimeContext();
        QueryConfiguration configuration = runtimeContext.getQueryConfiguration();
        configuration.applyShardingInitializer(new TopicShardingTimeShardingInitializer());
        TableRouteManager tableRouteManager = runtimeContext.getTableRouteManager();
        tableRouteManager.addRoute(new TopicShardingTimeTableRoute());
```
配置`ShardingInitializer`和添加路由即可
