---
title: 配置参数选项(重要)❗️❗️❗️
---
# 可配置参数选项
在使用前希望用户可以首先查看一遍可选择配置项,有利于了解如何进行优化

## 默认配置项
配置名称  | 默认值 | 描述  
--- | --- | --- 
database | `DatabaseEnum.MYSQL`  | 默认使用`mysql`语法如果你的数据库默认支持mysql语法且`easy-query`暂未提供对应数据库的语法方言,那么可以直接用`mysql`的语法和方言
deleteThrow | `true`  | `easy-query`为了针对数据安全进行了默认的不允许物理删除,并不是不可以执行delete操作而是不可以在执行delete后生成delete语句,建议使用逻辑删除来规避。比如`delete from t_user where uid=1` 在使用逻辑删除后会变成`update t_user set deleted=1 where uid=1`使用逻辑删除框架默认实现该功能,用户还是一样使用`deletable`方法来调用执行
nameConversion | `underlined`  | 目前有两个选择当然用户也可以自行实现接口`NameConversion`,目前可选`default`、`underlined`、`upper_underlined`、`lower_camel_case`、`upper_camel_case`,启用`default`表示默认的对象和数据库映射关系为属性名如属性名`userAge`那么对应数据库也是`userAge`列名,`underlined`表示采用下划线`userAge`将对应数据库`user_age`列,当然全局设置了后面也可以在`@Column`上进行手动指定对应的列名
insertStrategy | `ONLY_NOT_NULL_COLUMNS`  | `insert`命名默认采用非null列插入,如果一张表存在`id`和`name`那么当`name`为null列时生成的sql将不会指定`name`列比如`insert into t_user (id) values(?)`如果`name`列不是null,那么生成的sql将是`insert into t_user (id,name) values(?,?)`，因为默认为非null列插入所以执行的sql是单条单条执行,并不会合并批处理,相对性能会稍微低一点,当然也可以在执行时手动更改执行策略为`SQLExecuteStrategyEnum.ALL_COLUMNS`那么将会进行`executeBatch`
updateStrategy | `ALL_COLUMNS`  | 默认update命令生成的语句将是对整个对象的所有列进行更新,不会判断是否为null,默认这种情况下会将多个对象进行合并执行batch而不是单条执行
insertBatchThreshold | 1024  | 如果insertable一次性添加对象集合大于等于1024个那么会对其进行相同sql进行合并提高执行效率,链接字符串需要添加`rewriteBatchedStatements=true`,可以通过调用insert或者update的batch方法来手动使用或者禁用
updateBatchThreshold | 1024  | 如果updatable一次性添加对象集合大于等于1024个那么会对其进行相同sql进行合并提高执行效率,链接字符串需要添加`rewriteBatchedStatements=true`,可以通过调用insert或者update的batch方法来手动使用或者禁用
logClass | -  | `spring-boot`下默认是`com.easy.query.sql.starter.logging.Slf4jImpl`实现如果你是非`spring-boot`可以自行实现或者使用控制台日志`LogFactory.useStdOutLogging()`
queryLargeColumn | `true`  | 默认依然查询被标记为`@Column`下`large`的列，如果需要不查询建议在设置为`large`的前提下将对应列设置为`@UpdateIgnore`并且`updateSetInTrackDiff = true`防止在全列更新后导致未查询结果也被更新为null
printSql | `true`  | 是否打印执行sql,这个和log不一样,因为考虑到有时候可能需要查看sql而不是将log输出,所以如歌设置为true,那么执行的sql和执行的结果将会以`log.info()`被记录到日志里面,如果您没有设置log那么一样看不到对应的执行sql
defaultTrack | `false` | 默认是否使用追踪模式,如果为`true`那么只需要开启当前上下文追踪,或者`SpringBoot`下使用`@EasyQueryTrack`那么默认就会调用`asTracking()`
relationGroupSize | 512 | include的关联查询单次查询最多支持的关联id,如果超出将会分为两个语句执行
noVersionError | true | 当对象存在版本号并且是表达式更新的那么如果不添加版本号`withVersion`将会报错,必须要设置对应的版本号,如果不希望报错可以通过`ignoreVersion`来忽略
keepNativeStyle | false | `false`:表示默认行为,`sqlNativeSegment`中如果纯在参数行为,那么默认单引号字符串模板需要改成双引号,因为底层format采用的是`MessageFormat`.如果配置为`true`,那么默认将单引号改为双引号,用户输入的表达式将会和执行的一致,当然可以在调用时调用`keepStyle`或者将单引号改为双单引号来处理
warningColumnMiss| `true` | 当jdbc的resultSet对应的coluName无法映射到entity属性上时将会以log.warning进行日志输出，`true`:表示警告.`false`:表示不警告
## 分表分库特有配置

配置名称  | 默认值 | 描述  
--- | --- | --- 
connectionMode | `SYSTEM_AUTO`  | 默认框架将链接分片的链接模式改为自动,框架会自动处理,无需用户指定,当然链接模式用户也可以自行指定,1.`MEMORY_STRICTLY`内存严格模式,就是说如果存在跨表或者跨库查询那么本次查询将会严格控制内存,尽可能的一次性查询所有的表,那么针对单个库如果查询所有表每个表都需要一个`connection`所以可能会单次查询耗尽链接池的链接甚至不够,所以一般会和下面的配置参数`maxShardingQueryLimit`配合作为限制,2.`CONNECTION_STRICTLY`连接数限制,就是还是以`maxShardingQueryLimit`作为最大链接数尽可能少的使用连接数去执行跨分片的查询归并,主要是影响分片后的聚合模式,是采用流失聚合还是内存聚合，一般用户无需设置。
maxShardingQueryLimit❗️ | `5`  | 假设单次查询涉及到跨13张表查询,因为查询未带分片键,所以本次查询会将13张同数据库下的表进行分组以没5张为一组分成3组最后一组为3张表,当前查询会一次性获取5个链接这5个链接会通过`defaultDataSourceMergePoolSize`参数进行限制，然后再本次查询完成后归还到`DataSource`连接池中,这个参数不可以设置的比`DataSource`的`pool-size`大,否则可能会导致程序假死,因为连接池为20如果单次查询需要21那么会一直等待直到超时也获取不到21个
defaultDataSourceMergePoolSize❗️ | `0`  | 如果你的所有表中有分片表那么一定要设置这个值,且必须设置小于等于`DataSource`的连接池大小,假设连接池大小为100,那么这个值可以设置60,70，80甚至100,但是不可以比连接池大,且必须大于等于`maxShardingQueryLimit`,如果连接池100当前值设置为10,那么意味着所有线程只有10个连接池内的链接可以被用来进行分片聚合查询(每个数据源10个)
multiConnWaitTimeoutMillis | `5000`  | 默认针对分片链接获取大于1的操作进行`defaultDataSourceMergePoolSize`总数的扣减,比如上述100个连接池分片设置为10个,那么如果有3个线程都需要5个分片聚合那么肯定有一个线程无法获取到那么就会等到默认5秒,如果超过这个时间还是无法获取前两个还未查询完成,那么将会抛错
warningBusy | `true`  | 在分片聚合的时候因为需要单次获取多个链接,还是上述案例假设第三个线程获取到了5个链接但是获取的时间超过了`multiConnWaitTimeoutMillis`时间的80%那么框架将会打印获取链接是繁忙的,您可能需要重新调整`defaultDataSourceMergePoolSize`这个值和调整连接池大小
maxShardingRouteCount | `128`  | 当出现条件分片大于多少时报错默认128,就是比如select where update where delete where路由到过多的表就会报错,涉及entity操作比如update对象，insert，delete对象不会判断这个条件
defaultDataSourceName | `ds0`  | 默认分库数据源名称,如果你不需要分库那么可以不用去设置该值
shardingExecuteTimeoutMillis | `60000`  | 分片聚合超时时间默认60秒单位(ms),包括增删改查
throwIfRouteNotMatch | `true`  | 当查询没有匹配到路由是否选择报错,默认是如果不选择保存则返回默认值,譬如按时间分片,开始分片表为2020年1月那么如果你查下2019年或者查询未来的时间那么框架内部还没有这个时间所以本次查询获取到的路由为空,您可以选择不报错返回默认值,比如toList那么就是空集合,count就是0等等
executorMaximumPoolSize | `0`  | 分片聚合最大线程数,默认为0将使用`Executors.newCachedThreadPool`线程池,如果需要设置或者自定义请设置为最小maxShardingQueryLimit*分片数目,设置值后将使用有界队列线程池
executorCorePoolSize | `Math.min(processors, 4)`  | 仅`executorMaximumPoolSize`>0时生效,其中`processors`是`Runtime.getRuntime().availableProcessors()`
executorQueueSize | `1024`  | 仅`executorMaximumPoolSize`>0时生效，线程池有界队列大小
startTimeJob| `false` | 当使用系统默认的按时间分片时设置这个配置为`true`那么框架会在内存中添加对应的系统表,原理就是开启一个定时任务线程去执行

## spring-boot
通过配置文件可以直接配置上述选项
```yml

easy-query:
  enable: true
  name-conversion: underlined
  database: mysql
  #如果执行物理删除delete语句将会报错 如果改为false,后续可以通过allowDeleteStatment来允许
  delete-throw: true
  #打印sql显示(需要框架默认有日志以 log.info打印)
  print-sql: true
  #sqlNativeSegment输入和格式化无需处理单引号会自动处理为双单引号
  keep-native-style: true
  ......
```

## 非spring-boot
```java
 EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .optionConfigure(op -> {
                    op.setDeleteThrowError(true);//设置不允许物理删除
                    op.setPrintSql(true);//设置以log.info模式打印执行sql信息
                    ......//此处用于配置系统默认配置选项
                })
                .replaceService(NameConversion.class, UnderlinedNameConversion.class)//替换框架内部的属性和列转换模式改为大写转下划线
                .useDatabaseConfigure(new MySQLDatabaseConfiguration())//设置方言语法等为mysql的
                .build();
```