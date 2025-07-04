---
title: 新功能
order: 110
---


## trigger
`3.0.35^`增加表达式triiger
```java

easyQueryClient.addTriggerListener(triggerEvent -> {

    //business
    });
```

## 内联视图后续隐式查询
`3.0.31^`
```java

@EntityProxy
@Data
public class BankCardGroupBO {
    private String uid;
    private Long count;


    @Navigate(value = RelationTypeEnum.OneToOne, selfProperty = {"uid"}, targetProperty = {"id"}, supportNonEntity = true)
    private SysUser user;
}



List<BankCardGroupBO> list = easyEntityQuery.queryable(SysBankCard.class)
        .groupBy(bank_card -> GroupKeys.of(bank_card.uid()))
        .select(group -> new BankCardGroupBOProxy()
                .uid().set(group.key1())
                .count().set(group.count())
        ).where(b -> {
            b.user().name().contains("123");
        }).toList();



//selectAutoInclude

@Data
public class BankCardSelectAutoInclude {
    private String uid;
    private Long count;


    @Navigate(value = RelationTypeEnum.OneToOne)
    private InternalUser user;

    @Data
    public static class InternalUser{
        private String id;
        private String name;
        private String phone;
        private Integer age;

    }
}

List<BankCardSelectAutoInclude> list = easyEntityQuery.queryable(SysBankCard.class)
        .groupBy(bank_card -> GroupKeys.of(bank_card.uid()))
        .select(group -> new BankCardGroupBOProxy()
                .uid().set(group.key1())
                .count().set(group.count())
        ).selectAutoInclude(BankCardSelectAutoInclude.class).toList();
```

## appendOn
`3.0.30^`隐式join需要添加on额外条件
```java
List<SysBankCard> list = easyEntityQuery.queryable(SysBankCard.class)
        .where(bank_card -> {
            bank_card.bank().appendOn(t -> {
                t.or(() -> {
                    t.name().like("工商银行");
                    t.name().contains("建设银行");
                });
            });

            bank_card.bank().name().contains("123");
        }).toList();
```

## includeMany
`3.0.29^`多层级`include`实现优化
```java

        List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                .includeMany(s -> {
                    return new Include<>(s.schoolTeachers().flatElement().schoolClasses())
                            .where(a -> a.name().like("123"))
                            .thenInclude(s.schoolStudents().flatElement().schoolClass())
                            .where(x -> x.schoolStudents().flatElement().name().eq("123"))
                            .thenInclude(s.schoolStudents())
                            .where(x -> x.name().eq("123"));
                }).toList();
```

## search
`3.0.27^`由三方作者提供pr扩展相关



## ClassProxy
`3.0.26^`支持非`@EntityProxy`也能继续链式
```java

List<TopicTypeTest1> list = easyEntityQuery.queryable(TopicTypeTest1.class)
        .select(t -> new ClassProxy<>(TopicTypeTest1.class)
                .field(TopicTypeTest1.Fields.topicType).set(t.topicType())
        ).toList();
```

## whereObject
`3.0.24^`支持range单属性(集合或数组)whereObject注解
```java
@EasyWhereCondition(type = EasyWhereCondition.Condition.RANGE_OPEN,propName = "publishTime")
private List<LocalDateTime> publishTimeOpen;
```

## valueConvert
`3.0.22^`支持临时堆返回结果进行自定义处理 (入参可能为null)
```java
    List<Topic> list = easyEntityQuery.queryable(Topic.class)
                .select(t_topic -> {
                    return new TopicProxy()
                            .stars().set(t_topic.stars())
                            .title().set(t_topic.stars().valueConvert(s -> s + "-"))
                            .createTime().set(t_topic.createTime())
                            .id().set(t_topic.createTime().format("yyyy-MM-dd HH:mm:ss").valueConvert(s->s+".123"));
                }).toList();
```