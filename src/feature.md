---
title: 新功能
order: 110
---

## 聚合根保存
`3.1.21+`版本支持完整的聚合根对象保存,用户可以实现无感聚合根保存对象树链路

`springboot`或者`solon`需要在`@EasyQueryTrack`注解下开启追踪模式才可以非框架下可以手动开启追踪
```java

        TrackManager trackManager = easyEntityQuery.getRuntimeContext().getTrackManager();
        try {
            trackManager.begin();
            M8SaveRoot root = new M8SaveRoot();
            root.setName("rootname");
            root.setCode("rootcode");
            M8SaveRootOne rootOne = new M8SaveRootOne();
            root.setM8SaveRootOne(rootOne);

            try (Transaction transaction = easyEntityQuery.beginTransaction()) {
                easyEntityQuery.savable(root).executeCommand();//自动保存M8SaveRoot和M8SaveRootOne，并且关联属性框架会自动处理
                transaction.commit();
            }

        } finally {
            trackManager.release();
        }

```

## groupJoin智能条件
 隐式Group，隐式Partition 性能再优化
`3.0.90`将支持groupJoin如果存在单个关联key被外部筛选则会将该筛选条件穿透进子查询内部

目前开启该功能需要自行替换服务
```java
.replaceService(SubQueryExtraPredicateProvider.class, DefaultSubQueryExtraPredicateProvider.class)
```

```java

        List<M8Province> list = easyEntityQuery.queryable(M8Province.class)
                .configure(s->s.getBehavior().add(EasyBehaviorEnum.ALL_SUB_QUERY_GROUP_JOIN))
                .where(m -> {
                    m.cities().any(c->{
                        c.id().eq("c1");
                        c.name().eq("杭州");

                        c.areas().flatElement().name().eq("上城区");
                    });
                    m.id().eq("p1");
                }).toList();
```
<img :src="$withBase('/images/subQuery-extra-where.png')">

## WhereConditionProvider
新增`WhereConditionProvider`接口支持用户自定义实现`@EasyWhereCondition`的查询的默认比较符

## include+limit
`3.0.78`默认将`include+limit`由`union all`变为`partition by`的实现

## includeBy
在多次include下嵌套结构很难编写所以eq提供了includeBy方便用户在多次调用下进行额外操作

```java

List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
        .includeBy(s -> Include.of(
                s.schoolTeachers().flatElement().schoolClasses().asIncludeQueryable().where(a -> a.name().like("123")),
                s.schoolStudents().flatElement().schoolClass().asIncludeQueryable().where(x -> x.schoolStudents().flatElement().name().eq("123")),
                s.schoolStudents().asIncludeQueryable().where(x -> x.name().eq("123"))
        ))
        .toList();
```

比如`s.schoolTeachers().flatElement().schoolClasses().asIncludeQueryable()`会查询`schoolTeachers`和`schoolClasses`只要是路径上的都会被自动查询,如果需要对路径某个节点进行额外操作就单独处理该路径即可


## cteviewer

a表是一个自关联表,其中a表的pid在b表中,所以我们需要使用a join b来获取变成一张cteviewer然后进行自关联

## whereObject
支持对象筛选隐式关系
```java
@Data
public class SysUserQueryDTO {

    @EasyWhereCondition(propName = "bankCards.code")
    private String bankCardCode;
    @EasyWhereCondition(propName = "bankCards.type")
    private String bankCardType;
    @EasyWhereCondition(propName = "bankCards.bank.name", type = EasyWhereCondition.Condition.IN)
    private List<String> bankCardBankNames;
}

 SysUserQueryDTO queryDTO = new SysUserQueryDTO();
        queryDTO.setBankCardCode("123");
        queryDTO.setBankCardType("储蓄卡");
        queryDTO.setBankCardBankNames(Arrays.asList("工商银行","建设银行"));
        List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
                .whereObject(queryDTO)
                .toList();

```

## sharding union all
`3.0.57`支持分片使用union all这样可以保证大部分复杂sql都支持
```java

        List<Map<String, Object>> list = easyEntityQuery.queryable(TopicSharding.class)
                .configure(s->s.getBehavior().addBehavior(EasyBehaviorEnum.SHARDING_UNION_ALL))
                .where(t -> {
                    t.id().in(Arrays.asList("20000","20001"));
                })
                .groupBy(t -> GroupKeys.of(t.createTime()))
                .select(group -> {
                    MapProxy mapProxy = new MapProxy();
                    mapProxy.put("createTime", group.groupTable().createTime());
                    mapProxy.put("idCount", group.count(t -> t.id()));
                    return mapProxy;
                }).toList();
```

## filter
`3.0.48` `o.user().filter(u->{})` `o.userList().filter(u->{})` 后续的隐式join增加on条件，后续的隐式子查询增加where，隐式group增加
```java
List<Draft2<String, Long>> list = easyEntityQuery.queryable(DocUser.class)
                .subQueryToGroupJoin(o -> o.bankCards())
                .where(user -> {
                    //后续user下的bankCards自动携带对应的条件包括select和order里面
                    user.bankCards().filter(x -> {
                        //支持隐式join和普通属性筛选
                        x.bank().name().eq("银行");
                        x.type().like("45678");
                    });

                    user.bankCards().any();
                }).select(user -> Select.DRAFT.of(
                        user.name(),
                        user.bankCards().count()
                )).toList();


            List<SysBankCard> list = easyEntityQuery.queryable(SysBankCard.class)
                    .where(bank_card -> {
                    //后续SysBankCard下的bank自动携带对应的条件包括select和order里面
                        bank_card.bank().filter(t -> {
                            t.or(() -> {
                                t.name().like("工商银行");
                                t.name().contains("建设银行");
                            });
                        });

                        bank_card.bank().name().contains("123");
                    }).toList();
```

## PropagationValueFilter
`3.0.46`支持`filterConfigure`,实现`PropagationValueFilter`的接口支持filterConfigure传递
```java

        List<SysBank> list = easyEntityQuery.queryable(SysBank.class)
                .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS)
                .where(bank -> {
                    bank.name().eq("");
                    bank.bankCards().any(s -> s.type().eq(""));
                }).toList();
```

## offsetChunk
`3.0.37`因为`toChunk`有时候会对返回结果进行处理,导致`chunk`不准确,所以用户可以自行进行偏移量处理
```java

        easyEntityQuery.queryable(BlogEntity.class)
                .orderBy(b -> b.createTime().asc())
                .orderBy(b -> b.id().asc())
                .offsetChunk(3, chunk -> {
                    for (BlogEntity blog : chunk.getValues()) {
                        a.incrementAndGet();
                    }
                    //偏移量为本次查询到的结果
                    return chunk.offset(chunk.getValues().size());
                });



        easyEntityQuery.queryable(BlogEntity.class)
                .orderBy(b -> b.createTime().asc())
                .orderBy(b -> b.id().asc())
                .offsetChunk(100, chunk -> {
                    for (BlogEntity blog : chunk.getValues()) {
                        a.incrementAndGet();
                    }
                    //不进行偏移
                    return chunk.offset(0);
                });
```

## partition by order
`3.0.36^`支持navigate添加属性partitionOrder默认没有排序则报错
```java
    /**
     * 用户拥有的银行卡数
     */
    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = {"id"}, targetProperty = {"uid"},orderByProps = {
            @OrderByProperty(property = "openTime",asc = true),
            @OrderByProperty(property = "code",asc = false,mode = OrderByPropertyModeEnum.NULLS_FIRST),
    },partitionOrder = PartitionOrderEnum.NAVIGATE)
    private List<SysBankCard> bankCard4s;

```
```sql

-- 对应sql
PARTITION BY t1.`uid` ORDER BY t1.`open_time` ASC,CASE WHEN t1.`code` IS NULL THEN 0 ELSE 1 END ASC,t1.`code` DESC
```
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