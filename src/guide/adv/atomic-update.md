---
title: 列值原子更新(废弃❌)
---
`easy-query`提供了原子列更新,主要是针对当前数据的库存或者金额等数据进行原子更新,需要配合track更新,无法单独使用,譬如我有一个库存冗余字段,那么在更新的时候如果是对象更新那么将会生成原子sql(可以自定义)比如`update set column=column+1 where id=xxx and column>=xxx`
::: warning 说明!!!
> 仅entity对象更新有效,如果是表达式更新那么还是按表达式更新来处理，并且需要当前上下文开启追踪模式不然无法使用
:::

## ValueUpdateAtomicTrack
原子更新接口,需要自行实现

### 系统默认实现

默认实现  | 默认 | 描述  
--- | --- | --- 
DefaultValueUpdateAtomicTrack | ✅  | 不处理
IntegerNotValueUpdateAtomicTrack | ❌  | 非null的int更新,如果旧值比新值大生成`update table set column=column-x where id=xx and column>=x`,如果新值比旧值大`update table set column=column+x where id=xx`
LongNotValueUpdateAtomicTrack | ❌  | 非null的int更新,如果旧值比新值大生成`update table set column=column-x where id=xx and column>=x`,如果新值比旧值大`update table set column=column+x where id=xx`

## 例子
```java
@Data
@Table("t_topic_value_atomic")
@ToString
public class TopicValueUpdateAtomicTrack {

    @Column(primaryKey = true)
    private String id;
    @Column(valueUpdateAtomicTrack = IntegerNotValueUpdateAtomicTrack.class)
    private Integer stars;
    private String title;
    private Integer topicType;
    private LocalDateTime createTime;
}


//SpringBoot 直接使用@EasyQueryTrack aop

TrackManager trackManager = easyQuery.getRuntimeContext().getTrackManager();
try {
    trackManager.begin();
    // id=123 stars=99
    TopicValueUpdateAtomicTrack topicValueUpdateAtomicTrack = easyQuery.queryable(TopicValueUpdateAtomicTrack.class).asTracking().whereById("123").firstOrNull();
    //设置98 前后变更 1
    topicValueUpdateAtomicTrack.setStars(98);
    long l = easyQuery.updatable(topicValueUpdateAtomicTrack).executeRows();
    //UPDATE `t_topic_value_atomic` SET `stars` = `stars`- ? WHERE `id` = ? AND `stars` >= ?
    //UPDATE `t_topic_value_atomic` SET `stars` = `stars`- 1 WHERE `id` = '123' AND `stars` >= 1
}finally {
    trackManager.release();
}

```