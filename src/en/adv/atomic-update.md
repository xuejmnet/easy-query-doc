---
title: Column Value Atomic Update (Deprecated❌)
---
`easy-query` provides atomic column updates, mainly for atomic updates of current data's inventory or amount, etc. It needs to be used with track updates and cannot be used alone. For example, if I have an inventory redundancy field, then when updating, if it is an object update, atomic SQL will be generated (can be customized), such as `update set column=column+1 where id=xxx and column>=xxx`
::: warning Notice!!!
> Only valid for entity object updates. If it is an expression update, it will still be processed according to the expression update, and the current context needs to enable tracking mode, otherwise it cannot be used
:::

## ValueUpdateAtomicTrack
Atomic update interface, needs to be implemented by yourself

### System Default Implementation

Default Implementation  | Default | Description  
--- | --- | --- 
DefaultValueUpdateAtomicTrack | ✅  | No processing
IntegerNotValueUpdateAtomicTrack | ❌  | Non-null int update. If the old value is greater than the new value, generates `update table set column=column-x where id=xx and column>=x`. If the new value is greater than the old value, generates `update table set column=column+x where id=xx`
LongNotValueUpdateAtomicTrack | ❌  | Non-null long update. If the old value is greater than the new value, generates `update table set column=column-x where id=xx and column>=x`. If the new value is greater than the old value, generates `update table set column=column+x where id=xx`

## Example
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


//SpringBoot directly use @EasyQueryTrack aop

TrackManager trackManager = easyQuery.getRuntimeContext().getTrackManager();
try {
    trackManager.begin();
    // id=123 stars=99
    TopicValueUpdateAtomicTrack topicValueUpdateAtomicTrack = easyQuery.queryable(TopicValueUpdateAtomicTrack.class).asTracking().whereById("123").firstOrNull();
    //Set to 98, before and after change is 1
    topicValueUpdateAtomicTrack.setStars(98);
    long l = easyQuery.updatable(topicValueUpdateAtomicTrack).executeRows();
    //UPDATE `t_topic_value_atomic` SET `stars` = `stars`- ? WHERE `id` = ? AND `stars` >= ?
    //UPDATE `t_topic_value_atomic` SET `stars` = `stars`- 1 WHERE `id` = '123' AND `stars` >= 1
}finally {
    trackManager.release();
}

```

