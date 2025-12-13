---
title: New Features
order: 110
---
## joining Supports Sorting
`3.1.60+` joining function supports comma separation and sorting (if database supports)
```java

        easyEntityQuery.queryable(SysBank.class)
                .configure(s -> s.getBehavior().add(EasyBehaviorEnum.ALL_SUB_QUERY_GROUP_JOIN))
                .where(bank -> {
                    bank.name().like("Bank");
                })
                .select(bank -> Select.PART.of(
                        bank,
                        bank.bankCards()
                                .orderBy(o -> o.openTime().asc())
                                .orderBy(o -> o.type().desc())
                                .distinct()
                                .joining(s -> s.type())
                )).toList();


SELECT t.`id`, t.`name`, t.`create_time`, t2.`__joining2__` AS `__part__column1`
FROM `t_bank` t
	LEFT JOIN (
		SELECT t1.`bank_id` AS `__group_key1__`, GROUP_CONCAT(DISTINCT t1.`type` ORDER BY t1.`open_time` ASC, t1.`type` DESC SEPARATOR ',') AS `__joining2__`
		FROM `t_bank_card` t1
		GROUP BY t1.`bank_id`
	) t2
	ON t2.`__group_key1__` = t.`id`
WHERE t.`name` LIKE '%Bank%'
```
## Static Inner Class Supports @EntityProxy
`3.1.53+` supports static inner classes using `@EntityProxy`, can be used for complex intermediate objects without creating independent dto files, and supports explicit package name declaration (recommend upgrading plugin to 0.1.72+)
```java

    @Data
    @EntityProxy(value = "MyTestb",generatePackage = "com.easy.query.test1")
    public static class MyTest2{
        private String id;
        private String name;
    }
```
## selectAutoIncludeTable
`3.1.51+` by default using `selectAutoInclude` if there is a database entity (@Table) entity, it will report an error by default, you can choose warning or ignore

## notEmptyAll
`3.1.51+` supports `all` function and requires collection not empty
```java

        List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
                .where(user -> {
                    user.bankCards().where(bc -> bc.type().eq("Savings Card")).notEmptyAll(bc -> bc.code().startsWith("33123"));
                }).toList();
```

## include2
Remove `includeBy` use plugin hint `include2` (because there are two parameters inside include), used to handle complex multi-chain structured `include`
```java
                List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                        .include((c,s)->{
                            c.query(s.schoolTeachers().flatElement().schoolClasses()).where(a -> a.name().like("123"));
                            c.query(s.schoolStudents().flatElement().schoolClass()).where(x -> x.schoolStudents().flatElement().name().eq("123"));
                            c.query(s.schoolStudents()).where(x -> x.name().ne("123"));
                        })
                        .toList();
```
## include Unified
`3.1.49+` eq unified all include, no need to distinguish between include or includes
## Subquery all Function
`3.1.46+` eq added the subquery `all` function
```java
  LocalDateTime time = LocalDateTime.of(2020, 1, 1, 0, 0, 0);
  List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
                .where(user -> {
                    user.bankCards().where(bc -> bc.type().eq("储蓄卡")).all(bc -> bc.openTime().le(time));
                }).toList();
```
This expression queries users where all their savings cards were opened before `2020-01-01`

::: warning Note!!!
> The assertion inside the `all` function is an independent assertion. It asserts the expression before the `all` function and does not simply combine the `where` before `all` with `all`. It's a very semantically sound expression (the `all` assertion on an empty collection is always `true`)
:::

## toResultSet
`3.1.43+` eq added the `toResultSet` method to support users handling `ResultSet` themselves without any framework processing (does not support include and other operations, only suitable for single table)
```java
List<BlogEntity> resultSet = easyEntityQuery.queryable(SysUser.class)
                    .where(s -> {
                        s.id().isNotNull();
                    }).toResultSet(context -> {
                        ArrayList<BlogEntity> blogEntities = new ArrayList<>();
                        StreamResultSet streamResultSet = context.getStreamResultSet();
                        ResultSet resultSetResultSet = streamResultSet.getResultSet();
                        while (resultSetResultSet.next()) {
                            BlogEntity blogEntity = new BlogEntity();
                            blogEntity.setId(resultSetResultSet.getString(1));
                            blogEntities.add(blogEntity);
                        }
                        return blogEntities;
                    });
```
## Kotlin Infix
`3.1.43+` kotlin supports infix, suggest upgrading plugin to `0.1.67`, see kotlin-related eq documentation for details
## forEach
`3.1.38+` supports forEach for iterating and processing results. Scenario: when using multiple includes, you may need to check if the root node status is correct. For performance reasons, you should check first before including, rather than including everything and then checking
```java

M8SaveA a1 = easyEntityQuery.queryable(M8SaveA.class).whereById("1")
        .includeBy(m -> Include.of(
                m.m8SaveB().m8SaveC().m8SaveD().asIncludeQueryable()
        ))
        .forEach(item -> {
            if (item.getId().equals("1")) {
                throw new RuntimeException("123123");
            }
        }).singleNotNull();

This expression will first perform the assertion and then perform the `include`
```

## DuckDB Query Excel
`3.1.33+` version supports duckdb reading excel and supports implicit operations and join operations

```java

@Data
@EntityProxy
@Table(value = "read_xlsx('./ducktest.xlsx',sheet='Sheet1')", keyword = false)
public class ExcelDuck implements ProxyEntityAvailable<ExcelDuck, ExcelDuckProxy> {

    private String id;
    private String name;
    private Integer age;

    /**
     *
     **/
    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = {ExcelDuckProxy.Fields.id}, targetProperty = {ExcelDuck2Proxy.Fields.uid})
    private List<ExcelDuck2> excelDuck2List;
}


@Data
@EntityProxy
@Table(value = "read_xlsx('./ducktest.xlsx',sheet='Sheet2')",keyword = false)
public class ExcelDuck2 implements ProxyEntityAvailable<ExcelDuck2, ExcelDuck2Proxy> {

    private String id;
    private String uid;
    private String name;
    private Integer age;
}


List<ExcelDuck> list = easyEntityQuery.queryable(ExcelDuck.class)
        .configure(s->s.getBehavior().add(EasyBehaviorEnum.ALL_SUB_QUERY_GROUP_JOIN))
        .where(e -> {
            e.excelDuck2List().any(s->s.id().eq("2"));
        }).toList();

SELECT t."id", t."name", t."age"
FROM read_xlsx('./ducktest.xlsx', sheet = 'Sheet1') t
	LEFT JOIN (
		SELECT t1."uid" AS "uid", COUNT(1) > 0 AS "__any2__"
		FROM read_xlsx('./ducktest.xlsx', sheet = 'Sheet2') t1
		WHERE t1."id" = '2'
		GROUP BY t1."uid"
	) t2
	ON t2."uid" = t."id"
WHERE COALESCE(t2."__any2__", false) = true
```

## Max(Min) Column
`3.1.32+` version supports getting the maximum column in the same row, and ignores null by default

Supports `GREATEST` and `LEAST`. If supported and can ignore null, use this function. If not supported or cannot ignore null, use `case when` or other methods
```java
        List<DamengMyTopic> list = entityQuery.queryable(DamengMyTopic.class)
                .where(d -> {
                    d.expression().maxColumns(d.id(), d.title(), d.title().nullOrDefault(d.id())).eq("123");
                }).toList();
```
## Offset Functions
`3.1.30+` version supports offset functions `LAG`, `LEAD`, `FIRST_VALUE`, `LAST_VALUE`, `NTH_VALUE`
```java
        easyEntityQuery.queryable(SysBankCard.class)
                .orderBy(bank_card -> {
                    bank_card.openTime().asc();
                })
                .select(bank_card -> Select.DRAFT.of(
                        bank_card.type(),
                        bank_card.type().offset().prev(1),
                        bank_card.type().offset().firstValue()
                )).toList();
```

## Aggregate Root Saving
`3.1.24+` version supports complete aggregate root object saving, users can achieve seamless aggregate root saving of object tree chains

`springboot` or `solon` needs to enable tracking mode under the `@EasyQueryTrack` annotation. Non-framework users can manually enable tracking
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
                easyEntityQuery.savable(root).executeCommand();//Automatically save M8SaveRoot and M8SaveRootOne, and the framework will automatically handle associated properties
                transaction.commit();
            }

        } finally {
            trackManager.release();
        }

```

## groupJoin Smart Conditions
 Implicit Group, Implicit Partition performance re-optimization
`3.0.90` will support groupJoin. If there is a single associated key filtered externally, the filtering condition will penetrate into the subquery

Currently, to enable this feature, you need to replace the service yourself
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
Added `WhereConditionProvider` interface to support users customizing the default comparison operator for `@EasyWhereCondition` queries

## include+limit
`3.0.78` changed the default implementation of `include+limit` from `union all` to `partition by`

## includeBy
In multiple includes, nested structures are difficult to write, so eq provides includeBy to facilitate users to perform additional operations during multiple calls

```java

List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
        .includeBy(s -> Include.of(
                s.schoolTeachers().flatElement().schoolClasses().asIncludeQueryable().where(a -> a.name().like("123")),
                s.schoolStudents().flatElement().schoolClass().asIncludeQueryable().where(x -> x.schoolStudents().flatElement().name().eq("123")),
                s.schoolStudents().asIncludeQueryable().where(x -> x.name().eq("123"))
        ))
        .toList();
```

For example, `s.schoolTeachers().flatElement().schoolClasses().asIncludeQueryable()` will query `schoolTeachers` and `schoolClasses`. All nodes on the path will be automatically queried. If you need to perform additional operations on a certain node of the path, just process that path separately

## cteviewer

Table a is a self-referential table, where the pid of table a is in table b, so we need to use a join b to get a cteviewer and then perform self-referential operations

## whereObject
Supports object filtering with implicit relationships
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
`3.0.57` supports sharding using union all, which can ensure that most complex SQL is supported
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
`3.0.48` `o.user().filter(u->{})` `o.userList().filter(u->{})` adds on conditions for subsequent implicit joins, adds where for subsequent implicit subqueries, adds for implicit groups
```java
List<Draft2<String, Long>> list = easyEntityQuery.queryable(DocUser.class)
                .subQueryToGroupJoin(o -> o.bankCards())
                .where(user -> {
                    //Subsequent bankCards under user automatically carry corresponding conditions including select and order
                    user.bankCards().filter(x -> {
                        //Supports implicit join and ordinary property filtering
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
                    //Subsequent bank under SysBankCard automatically carries corresponding conditions including select and order
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
`3.0.46` supports `filterConfigure`, implementing the `PropagationValueFilter` interface to support filterConfigure propagation
```java

        List<SysBank> list = easyEntityQuery.queryable(SysBank.class)
                .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS)
                .where(bank -> {
                    bank.name().eq("");
                    bank.bankCards().any(s -> s.type().eq(""));
                }).toList();
```

## offsetChunk
`3.0.37` because `toChunk` sometimes processes the returned results, causing `chunk` to be inaccurate, so users can perform offset processing themselves
```java

        easyEntityQuery.queryable(BlogEntity.class)
                .orderBy(b -> b.createTime().asc())
                .orderBy(b -> b.id().asc())
                .offsetChunk(3, chunk -> {
                    for (BlogEntity blog : chunk.getValues()) {
                        a.incrementAndGet();
                    }
                    //The offset is the size of the results queried this time
                    return chunk.offset(chunk.getValues().size());
                });



        easyEntityQuery.queryable(BlogEntity.class)
                .orderBy(b -> b.createTime().asc())
                .orderBy(b -> b.id().asc())
                .offsetChunk(100, chunk -> {
                    for (BlogEntity blog : chunk.getValues()) {
                        a.incrementAndGet();
                    }
                    //Do not offset
                    return chunk.offset(0);
                });
```

## partition by order
`3.0.36^` supports navigate adding attribute partitionOrder, an error will be reported if there is no sorting by default
```java
    /**
     * Number of bank cards owned by the user
     */
    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = {"id"}, targetProperty = {"uid"},orderByProps = {
            @OrderByProperty(property = "openTime",asc = true),
            @OrderByProperty(property = "code",asc = false,mode = OrderByPropertyModeEnum.NULLS_FIRST),
    },partitionOrder = PartitionOrderEnum.NAVIGATE)
    private List<SysBankCard> bankCard4s;

```
```sql

-- Corresponding SQL
PARTITION BY t1.`uid` ORDER BY t1.`open_time` ASC,CASE WHEN t1.`code` IS NULL THEN 0 ELSE 1 END ASC,t1.`code` DESC
```
## trigger
`3.0.35^` added expression trigger
```java

easyQueryClient.addTriggerListener(triggerEvent -> {

    //business
    });
```

## Inline View with Subsequent Implicit Queries
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
`3.0.30^` implicit join needs to add additional on conditions
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
`3.0.29^` multi-level `include` implementation optimization
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
`3.0.27^` PR extension provided by a third-party author

## ClassProxy
`3.0.26^` supports non-`@EntityProxy` to continue chaining
```java

List<TopicTypeTest1> list = easyEntityQuery.queryable(TopicTypeTest1.class)
        .select(t -> new ClassProxy<>(TopicTypeTest1.class)
                .field(TopicTypeTest1.Fields.topicType).set(t.topicType())
        ).toList();
```

## whereObject
`3.0.24^` supports range single property (collection or array) whereObject annotation
```java
@EasyWhereCondition(type = EasyWhereCondition.Condition.RANGE_OPEN,propName = "publishTime")
private List<LocalDateTime> publishTimeOpen;
```

## valueConvert
`3.0.22^` supports temporary custom processing of return results on the stack (input parameter may be null)
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
