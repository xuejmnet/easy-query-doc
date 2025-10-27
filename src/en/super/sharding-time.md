---
title: Time-based Table Sharding
order: 50
---

In this chapter, we implement the table sharding feature of database and table sharding, implementing time-based table sharding, sharding by month

This is our final Java object
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
## Configure Object
First, let's look at the object
```java
@Data
@Table(value = "t_topic_sharding_time",shardingInitializer = TopicShardingTimeShardingInitializer.class)
public class TopicShardingTime {

    @Column(primaryKey = true)
    //@ShardingExtraTableKey Ignore this annotation for now
    private String id;
    private Integer stars;
    private String title;
    @ShardingTableKey //Indicates this property is the table sharding key
    private LocalDateTime createTime;
}
```
Annotation `Table` property `shardingInitializer = TopicShardingTimeShardingInitializer.class` indicates the sharding initializer uses `TopicShardingTimeShardingInitializer.class`
```java


public class TopicShardingTimeShardingInitializer extends AbstractShardingMonthInitializer<TopicShardingTime> {

    //Indicates the start time during initialization, used to automatically calculate the number of database shards during initialization
    @Override
    protected LocalDateTime getBeginTime() {
        return LocalDateTime.of(2020, 1, 1, 1, 1);
    }

    //End time, when TopicShardingTime is initialized for the first time, it calculates with getBeginTime to determine the current number of database shards
    @Override
    protected LocalDateTime getEndTime() {
        return LocalDateTime.now();
    }


    @Override
    public void configure0(ShardingEntityBuilder<TopicShardingTime> builder) {


    }
}
```
This way we have completed the sharding configuration of the object. What is the specific principle?
First, by setting `beginTime` and `endTime`, when using the `TopicShardingTime` object for the first time, we ensure that the corresponding number of databases can be calculated. The specific code is in the default sharding initializer `AbstractShardingMonthInitializer`
```java
 @Override
    public void configure(ShardingEntityBuilder<T> builder) {
        EntityMetadata entityMetadata = builder.getEntityMetadata();
        EasyQueryOption easyQueryOption = builder.getEasyQueryOption();
        String defaultDataSourceName = easyQueryOption.getDefaultDataSourceName();
        String tableName = entityMetadata.getTableName();
        //Prevent the system from publishing at midnight and the scheduled task just runs at 23:59:00-00:00:00 time point, causing the next run to be at 00:00:01-59, missing a few seconds, so need to add 5 minutes
        LocalDateTime setBeginTime = getBeginTime().plusMinutes(5);

        LocalDateTime beginTime = getBeginTimeToStart(setBeginTime);
        LocalDateTime endTime = getEndTime();
        if (beginTime.isAfter(endTime)) {
            throw new IllegalArgumentException("begin time:" + beginTime + " is after end time:" + endTime);
        }
        String tableSeparator = getTableSeparator();

        LinkedHashMap<String, Collection<String>> initTables = new LinkedHashMap<>();
        //Should not be after endTime, can equal endTime
        while (!beginTime.isAfter(endTime)) {
            String dataSource = formatDataSource(beginTime, defaultDataSourceName);
            String tail = formatTail(beginTime);
            Collection<String> actualTableNames = EasyMapUtil.computeIfAbsent(initTables,dataSource, key -> new ArrayList<>());
            actualTableNames.add(tableName + tableSeparator + tail);
            beginTime = getNextTime(beginTime);
        }

        //Initialize actual tables
        builder.actualTableNameInit(initTables);
        configure0(builder);
    }
```

## Configure Route
```java

public class TopicShardingTimeTableRoute extends AbstractMonthTableRoute<TopicShardingTime> {

    @Override
    protected LocalDateTime convertLocalDateTime(Object shardingValue) {
        return (LocalDateTime)shardingValue;
    }
}

```

By inheriting the default abstract route `AbstractMonthTableRoute`, we very simply implemented the sharding rule

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
                    //Enable scheduled task, otherwise tomorrow's table or next month's table will not exist in memory
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
Configure `ShardingInitializer` and add route

