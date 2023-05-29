---
title: 分片默认行为配置
---

# 分片默认行为配置


## 默认行为
方法  | 默认值 | 描述  
--- | --- | --- 
connectionMode | `ConnectionModeEnum.SYSTEM_AUTO`  | 系统自动选择有内存严格和连接数严格,内存严格表示会多开连接数，连接数严格会选择少开连接数在内存归并
maxShardingQueryLimit | `5`  | 当出现跨分片聚合也就是通过表达式无法精确到具体路由或筛选后路由大于1那么会开启最多多少个线程为一组进行查询聚合,默认是5。注意这个值的设置不可以大于数据库连接池数量
executorMaximumPoolSize | `0`  | 当值为0时分片聚合采用无界队列`Executors.newCachedThreadPool`,如果自定义必须大于`maxShardingQueryLimit`*分库数量，执行线程数 如果为0那么采用无界线程池`Executors.newCachedThreadPool`,如果是大于0采用长度为`executorQueueSize`的有界队列,核心线程数采用`executorCorePoolSize`并且需要比 `executorCorePoolSize`值大
executorCorePoolSize | 当前环境线程数且最小为:`4`  | 当且仅当`executorMaximumPoolSize`>0生效
executorQueueSize | `1024`  | 当且仅当`executorMaximumPoolSize`>0生效 分片聚合执行线程队列
throwIfRouteNotMatch | `true`  | 当查询没有路由匹配的时候查询是否报错,true:表示报错,false:表示返回默认值
shardingExecuteTimeoutMillis | `30000(ms)`  | 分片聚合超时时间默认30秒
maxShardingRouteCount | `128`  | 当出现条件分片大于多少时报错默认128,就是比如select where update where delete where路由到过多的表就会报错,entity操作比如update对象，insert，delete对象不会判断这个条件
defaultDataSourceName | `ds0`  | 默认分库数据源名称,分表设置与否无关紧要
defaultDataSourceMergePoolSize | `0`  | 默认数据源的数据源连接池大小分表有效,一般设置为最少最少 >= maxShardingQueryLimit，当小于maxShardingQueryLimit后启动会抛出警告，建议和实际数据库连接池大小一致或者比实际稍小,用于防止获取链接死锁程序假死,假设线程池为3并且不设置当前值,那么如果有3个线程a,b,c分别需要聚合2个分片,那么如果线程a,b,c都拿到1个线程的情况下想要拿到下一个链接需要其中一个释放,那么就会导致死锁要分别等到其他线程超时,默认`DataSource.getConnection`没有设置超时时间所以需要自己定义,如果程序不涉及同DataSource分配聚合那么那么就不需要设置该值,如果需要聚合的情况下并且存在外部orm或者getconnection那么可能导致无法正确反应超时可以适当将该值降低
multiConnWaitTimeoutMillis | `5000(ms)`  | 默认5秒分表聚合多链接获取分表插入更新删除同理多个线程间等待获取时间单位毫秒(ms),用于分片聚合查询时一次性获取多个数据库connection但是因为连接池有限所以多个聚合线程间会等待防止死锁，比如连接池2个链接,本次查询需要2个链接聚合有两个线程,a线程已经获取了一个connection,b线程也获取一个,那么a线程想要获取下一个就必须等待b线程释放，b线程想要获取下一个也需要a线程释放或者等到`DataSource.getConnection()`超时
warningBusy | `true`  | 当获取链接时间大于`multiConnWaitTimeoutMillis*0.8`并且没有超时那么会log.warn打印警告信息
