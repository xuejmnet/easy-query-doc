---
title: 修改
order: 30
---

# 修改
`EasyQuery`提供了单条修改、批量修改和表达式修改数据的方法,可以返回数据库执行修改后的受影响行数。

数据库建表脚本
```sql
create table t_topic
(
    id varchar(32) not null comment '主键ID'primary key,
    stars int not null comment '点赞数',
    title varchar(50)  null comment '标题',
    create_time datetime not null comment '创建时间'
)comment '主题表';
```
java实体对象
```java
@Data
@Table("t_topic")
@EntityFileProxy
public class Topic implements ProxyEntityAvailable<Topic , TopicProxy> {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;

}

```
## 0.对象主键更新

::: code-tabs
@tab 对象模式
```java
Topic topic=easyeasyEntityQuery.queryable(Topic.class).whereById("2").firstOrNull();
long rows = easyEntityQuery.updatable(topic)
                .executeRows();
```
@tab lambda模式
```java
Topic topic=easyQuery.queryable(Topic.class).whereById("2").firstOrNull();
long rows = easyQuery.updatable(topic)
                .executeRows();
```
:::

## 1.更新指定列

::: code-tabs
@tab 对象模式
```java

long rows = easyEntityQuery.updatable(Topic.class)
                .setColumns(o->{
                    o.stars().set(12);//如果存在多个set就自行添加即可
                    //o.title().set("newTitle");
                })
                .where(o->o.id().eq(2))
                .executeRows()
//rows为1
easyEntityQuery.updatable(Topic.class)
                .setColumns(o->{
                    o.stars().set(12);
                })
                .where(o->o.id().eq(2))
                    .executeRows(1,"更新失败");
//判断受影响行数并且进行报错,如果当前操作不在事务内执行那么会自动开启事务!!!会自动开启事务!!!会自动开启事务!!!来实现并发更新控制,异常为:EasyQueryConcurrentException 
//抛错后数据将不会被更新
==> Preparing: UPDATE t_topic SET `stars` = ? WHERE `id` = ?
==> Parameters: 12(Integer),2(String)
<== Total: 1
        
```
@tab lambda模式

```java
long rows = easyQuery.updatable(Topic.class)
                .set(Topic::getStars, 12)
                .where(o -> o.eq(Topic::getId, "2"))
                .executeRows();
//rows为1
easyQuery.updatable(Topic.class)
                    .set(Topic::getStars, 12)
                    .where(o -> o.eq(Topic::getId, "2"))
                    .executeRows(1,"更新失败");
//判断受影响行数并且进行报错,如果当前操作不在事务内执行那么会自动开启事务!!!会自动开启事务!!!会自动开启事务!!!来实现并发更新控制,异常为:EasyQueryConcurrentException 
//抛错后数据将不会被更新
==> Preparing: UPDATE t_topic SET `stars` = ? WHERE `id` = ?
==> Parameters: 12(Integer),2(String)
<== Total: 1
```
:::
支持多次`set`,多次set表示`set`拼接

## 2.表列自更新

::: code-tabs
@tab 对象模式
```java

long rows = easyEntityQuery.updatable(Topic.class)
                .setColumns(o->{
                    o.stars().set(o.stars());
                })
                .where(o->o.id().eq("2"))
                .executeRows();
//rows为1

==> Preparing: UPDATE t_topic SET `stars` = `stars` WHERE `id` = ?
==> Parameters: 2(String)
<== Total: 1


long rows =  easyEntityQuery.updatable(Topic.class)
        .setColumns(o->{
                //o.title().set(o.stars());编译报错因为starts是Integer类型二title是String类型
                o.title().set(o.stars().toStr());
                //o.title.setNull()//设置为null
                //o.title.set((String)null)//设置为null
        })
        .whereById("1")
        .executeRows();
//rows为1

==> Preparing: UPDATE t_topic SET `title` = CAST(`stars` AS CHAR) WHERE `id` = ?
==> Parameters: 1(String)
<== Total: 1

//如果不想stars转成字符串可以用setPropertyType方法来处理

long rows =  easyEntityQuery.updatable(Topic.class)
        .setColumns(o->{
                //先将stars设置propertyType
                o.title().set(o.stars().setPropertyType(String.class));
        })
        .whereById("1")
        .executeRows();



==> Preparing: UPDATE t_topic SET `title` = `stars` WHERE `id` = ?
==> Parameters: 1(String)
<== Total: 1
        
```
@tab lambda模式

```java
long rows = easyQuery.updatable(Topic.class)
                    .set(Topic::getTitle, Topic::getStars)
                    .where(o -> o.eq(Topic::getId, "2"))
                    .executeRows();
//rows为1

==> Preparing: UPDATE t_topic SET `title` = `stars` WHERE `id` = ?
==> Parameters: 2(String)
<== Total: 1
```
:::

## 3.表列原子更新
::: code-tabs
@tab 对象模式

```java

    long rows1 = easyEntityQuery.updatable(Topic.class)
                .setColumns(o->{
                    o.stars().increment();
                })
                .where(o->o.id().eq("2"))
                .executeRows();
    long rows2 = easyEntityQuery.updatable(Topic.class)
                .setColumns(o->{
                    o.stars().increment(2);
                })
                .where(o->o.id().eq("2"))
                .executeRows();
   long rows3 = easyEntityQuery.updatable(Topic.class)
                .setColumns(o->{
                    o.stars().decrement();
                })
                .where(o->o.id().eq("2"))
                .executeRows();
  long rows4 = easyEntityQuery.updatable(Topic.class)
                .setColumns(o->{
                    o.stars().decrement(2);
                })
                .where(o->o.id().eq("2"))
                .executeRows();

==> Preparing: UPDATE t_topic SET `stars` = `stars`+? WHERE `id` = ?
==> Parameters: 1(Integer),2(String)
<== Total: 1
==> Preparing: UPDATE t_topic SET `stars` = `stars`+? WHERE `id` = ?
==> Parameters: 2(Integer),2(String)
<== Total: 1
==> Preparing: UPDATE t_topic SET `stars` = `stars`-? WHERE `id` = ?
==> Parameters: 1(Integer),2(String)
<== Total: 1
==> Preparing: UPDATE t_topic SET `stars` = `stars`-? WHERE `id` = ?
==> Parameters: 2(Integer),2(String)
<== Total: 1
```
@tab lambda模式

```java
long rows1 = easyQuery.updatable(Topic.class)
        .setIncrement(Topic::getStars)
        .where(o -> o.eq(Topic::getId, "2")).executeRows();

long rows2 = easyQuery.updatable(Topic.class)
        .setIncrement(Topic::getStars,2)
        .where(o -> o.eq(Topic::getId, "2")).executeRows();

long rows3 = easyQuery.updatable(Topic.class)
        .setDecrement(Topic::getStars)
        .where(o -> o.eq(Topic::getId, "2")).executeRows();

long rows4 = easyQuery.updatable(Topic.class)
        .setDecrement(Topic::getStars,2)
        .where(o -> o.eq(Topic::getId, "2")).executeRows();

==> Preparing: UPDATE t_topic SET `stars` = `stars`+? WHERE `id` = ?
==> Parameters: 1(Integer),2(String)
<== Total: 1
==> Preparing: UPDATE t_topic SET `stars` = `stars`+? WHERE `id` = ?
==> Parameters: 2(Integer),2(String)
<== Total: 1
==> Preparing: UPDATE t_topic SET `stars` = `stars`-? WHERE `id` = ?
==> Parameters: 1(Integer),2(String)
<== Total: 1
==> Preparing: UPDATE t_topic SET `stars` = `stars`-? WHERE `id` = ?
==> Parameters: 2(Integer),2(String)
<== Total: 1
```
:::


## 3.差异更新
::: tip 说明!!!
> 差异更新可以自动监听被追踪的对象,并且生成差异更新语句,而不是无脑的对对象进行全字段更新,使用时需要开启当前追踪环境并且对查询出来的结果进行追踪后续即可监听到变更列实现差异化update语句
:::
正常情况下如果用户想使用差异更新,那么需要对查询采用`asTracking`来让返回结果被追踪,或者调用`easyQuery.addTracking`来让需要更新的对象被追踪

如果希望默认是追踪的可以设置启动配置`defaultTrack`为true那么只需要开始上下文环境即可

::: danger 错误的用法!!!
> 开启上下文追踪但是没有将查询结果对象附加到当前上下文,所以框架无法追踪对象变更无法有效生成差异更新
:::

当全局配置`default-track`未配置或者配置为`false`时以下不使用`asTracking`的查询结果不会被追踪所有视为错误用法,但是如果`default-track`设置为了`true`那么以下用法查询的数据会被追踪被视为正确的用法
::: code-tabs
@tab 对象模式
```java
TrackManager trackManager = easyEntityQuery.getRuntimeContext().getTrackManager();
try{

        trackManager.begin();
        Topic topic = easyEntityQuery.queryable(Topic.class)
                .where(o -> o.id().eq("7")).firstNotNull("未找到对应的数据");
        String newTitle = "test123" + new Random().nextInt(100);
        topic.setTitle(newTitle);
        long rows=easyEntityQuery.updatable(topic).executeRows();

}finally {
        trackManager.release();
}
```

@tab lambda模式
```java
TrackManager trackManager = easyQuery.getRuntimeContext().getTrackManager();
try{

        trackManager.begin();
        Topic topic = easyEntityQuery.queryable(Topic.class)
                .where(o -> o.eq(Topic::getId, "7")).firstNotNull("未找到对应的数据");
        String newTitle = "test123" + new Random().nextInt(100);
        topic.setTitle(newTitle);
        long rows=easyQuery.updatable(topic).executeRows();

}finally {
        trackManager.release();
}
```


::: 
```log
==> Preparing: UPDATE t_topic SET `stars` = ?,`title` = ?,`create_time` = ? WHERE `id` = ?
==> Parameters: 107(Integer),test12364(String),2023-03-27T22:05:23(LocalDateTime),7(String)
<== Total: 1
```

::: tip 正确的用法!!!
> - 要注意是否开启了追踪`spring-boot`下用`@EasyQueryTrack`注解即可开启
> - 是否将当前对象添加到了追踪上下文 查询添加`asTracking`或者 手动将查询出来的对象进行`easyQuery.addTracking(Object entity)`
> - 全局配置`default-track`设置为`true`那么查询不需要加`asTracking`,否则需要手动加`asTracking`才能对查询出来的结果进行追踪,如果不需要追踪可以使用`asNoTracking`
:::

::: code-tabs
@tab 对象模式
```java
TrackManager trackManager = easyEntityQuery.getRuntimeContext().getTrackManager();
try{
        trackManager.begin();
        Topic topic = easyEntityQuery.queryable(Topic.class)
                .where(o -> o.id().eq( "7")).asTracking().firstNotNull("未找到对应的数据");
        String newTitle = "test123" + new Random().nextInt(100);
        topic.setTitle(newTitle);
        long l = easyEntityQuery.updatable(topic).executeRows();
}finally {

        trackManager.release();
}
```

@tab lambda模式
```java
TrackManager trackManager = easyQuery.getRuntimeContext().getTrackManager();
try{
        trackManager.begin();
        Topic topic = easyQuery.queryable(Topic.class)
                .where(o -> o.eq(Topic::getId, "7")).asTracking().firstNotNull("未找到对应的数据");
        String newTitle = "test123" + new Random().nextInt(100);
        topic.setTitle(newTitle);
        long l = easyQuery.updatable(topic).executeRows();
}finally {

        trackManager.release();
}
```


::: 
```log
==> Preparing: UPDATE t_topic SET `title` = ? WHERE `id` = ?
==> Parameters: test1239(String),7(String)
<== Total: 1
```

清晰的看到差异更新只会更新需要更新的列

::: warning 追踪注意点及说明!!!
> 原因是正确的写法在开启追踪后查询使用了`.asTracking()`那么会让所有的结果集全部被追踪(如果查询数据量有几万或者几十万那么性能肯定会有影响)，被追踪的返回结果对象必须要满足是数据库实体才可以，如果附加实体的时候发现当前上下文已经有被追踪的实体，那么直接放弃当前查询出来的结果，直接使用被追踪的数据作为当前对象，如果需要更新的列一个都没有，那么easy-query将不会生成update的sql语句并且返回0行，因为没有数据需要被修改
:::

- 选择性追踪
我们可能会有这样的需求这边需要查询出几百上万条数据，但是追踪更新只会涉及到1-2条，如果整个查询采用`.asTracking()`那么性能会相对低下，所以提供了额外的追踪方法
```java
 TrackManager trackManager = easyQuery.getRuntimeContext().getTrackManager();
        try{

            trackManager.begin();
            Topic topic = easyQuery.queryable(Topic.class)
                    .where(o -> o.eq(Topic::getId, "7")).firstNotNull("未找到对应的数据");
            easyQuery.addTracking(topic);
            String newTitle = "test123" + new Random().nextInt(100);
            topic.setTitle(newTitle);
            long l = easyQuery.updatable(topic).executeRows();
        }finally {

            trackManager.release();
        }
```
```log
==> Preparing: UPDATE t_topic SET `title` = ? WHERE `id` = ?
==> Parameters: test12398(String),7(String)
<== Total: 1
```
通过对查询数据采用非追踪查询后续再修改数据前将其进行添加到追踪里面可以保证更新也是差异更新

可能会有小伙伴认为这种做法太复杂了有没有建议的方法，这边`easy-query`已经给大家针对spring-boot的项目进行了aop的封装，
如果是springboot的小伙伴只需要在更新方法外部加上aop注解即可`@EasyQueryTrack`
```java
@GetMapping("/sayHello")
@EasyQueryTrack
public Object sayHello() {
TestUserMysql0 testUserMysql = easyQuery.queryable(TestUserMysql0.class)
        .asTracking()//如果不添加那么不会追踪数据
        .firstOrNull();
return testUserMysql;
}
```
## 4.指定列更新或条件
在对象更新的情况下可以选择对应的列进行set或者进行where
::: code-tabs
@tab 对象模式
```java

Topic topic = easyEntityQuery.queryable(Topic.class).whereById("15").firstOrNull();
Assert.assertNotNull(topic);
long rows4 = easyEntityQuery.updatable(topic)
        .setColumns(o->o.createTime())//多个字段使用FETCHER.setColumns(o->o.FETCHER.createTime().title().name())
        .whereColumns(o->o.stars()).executeRows();//多个字段使用FETCHER.whereColumns(o->o.FETCHER.createTime().title().name())
Assert.assertEquals(1, rows4);

```

@tab lambda模式
```java

Topic topic = easyQuery.queryable(Topic.class).whereById("15").firstOrNull();
Assert.assertNotNull(topic);
long rows4 = easyQuery.updatable(topic)
        .setColumns(o->o.column(Topic::getCreateTime))
        .whereColumns(o->o.column(Topic::getStars)).executeRows();
Assert.assertEquals(1, rows4);

```

::: 

```sql

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`id` = ? LIMIT 1
==> Parameters: 15(String)
<== Time Elapsed: 3(ms)
<== Total: 1
==> Preparing: UPDATE `t_topic` SET `create_time` = ? WHERE `stars` = ?
==> Parameters: 2023-06-08T10:48:05(LocalDateTime),115(Integer)
<== Total: 1
```

## 5.策略更新
只更新null列到数据库
```java
 Topic topic = easyQuery.queryable(Topic.class)
                .whereId("9").firstOrNull();
long l1 = easyQuery.updatable(topic)
                .setSQLStrategy(UpdateStrategyEnum.ONLY_NULL_COLUMNS)
                .executeRows();
```
```log
==> Preparing: UPDATE t_topic SET `title` = ? WHERE `id` = ?
==> Parameters: null(null),9(String)
<== Total: 1
```

只更新非null列到数据库
```java
 Topic topic = easyQuery.queryable(Topic.class)
                .whereId("10").firstOrNull();
long l1 = easyQuery.updatable(topic)
        .setSQLStrategy(UpdateStrategyEnum.ONLY_NOT_NULL_COLUMNS)
        .executeRows();
```
```log
==> Preparing: UPDATE t_topic SET `stars` = ?,`create_time` = ? WHERE `id` = ?
==> Parameters: 110(Integer),2023-03-30T23:12:06(LocalDateTime),10(String)
<== Total: 1
```


## Map更新
`easy-query`还支持`Map`结构的数据更新支持,其中`map`的`key`表示数据库对应的列名,并且不需要添加asTable来指定操作的数据库表名
```java
HashMap<String, Object> stringObjectHashMap = new HashMap<>();
stringObjectHashMap.put("id","123");
stringObjectHashMap.put("name","123");
stringObjectHashMap.put("name1",null);
easyQuery.mapUpdatable(stringObjectHashMap)
        .asTable("my_table")
        .setSQLStrategy(SQLExecuteStrategyEnum.ALL_COLUMNS)
        .whereColumns("id")
        .executeRows();


UPDATE `my_table` SET `name` = ?,`name1` = ? WHERE `id` = ?
```

## 6.更新自定义sql

::: code-tabs
@tab 对象模式
```java

long rows = easyEntityQuery.updatable(Topic.class)
        .setColumns(o->{
        o.stars().setSQL("ifnull({0},0)+{1}", (context) -> {
                context.expression(o.stars())
                        .value(1);
        });
        })
        .where(o -> o.id().eq("2"))
        .executeRows();

UPDATE `t_topic` SET `stars` = ifnull(`stars`,0)+? WHERE `id` = ?
```

@tab lambda模式
```java

long rows = easyQuery.updatable(Topic.class)
        .setSQLSegment(Topic::getStars, "ifnull({0},0)+{1}", (context) -> {
        context.expression(Topic::getStars)
                .value(1);
        })
        .where(o -> o.eq(Topic::getId, "2"))
        .executeRows();

UPDATE `t_topic` SET `stars` = ifnull(`stars`,0)+? WHERE `id` = ?
```

::: 

## 7.注意
更新优先级顺序

手动指定更新 > 手动指定策略 > 自动追踪 > 全局配置策略

- 手动指定更新 eq.update(Topic.class).setColumns().where().executeRows()
- 手动指定策略 eq.update(topics).setSQLStrategy(SQLExecuteStrategyEnum.ONLY_NULL_COLUMNS).executeRows()
- 自动追踪 track{ update setColumns whereColumns}
- 全局配置策略 全局配置的更新策略


