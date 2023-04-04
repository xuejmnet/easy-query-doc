---
title: 全局拦截器
order: 20
---

# 全局拦截器
`easy-qeury`默认提供了拦截器,支持项目在工程化的时候可以批量拦截sql表达式,比如:自动填充id，自动填充创建人,自动填充创建时间,自动填充修改人,自动填充修改时间等


类  | 名称 | 描述  
--- | --- | --- 
EasyEntityInterceptor | 对象拦截器  | 用于对象插入前和修改前进行对象拦截
EasyPredicateFilterInterceptor | 条件拦截器  | 用户在查询,修改,删除的时候可以通过条件拦截来动态构建添加条件如:`租户id`
EasyUpdateSetInterceptor | 更新列拦截器  | 用户在更新update表达式的时候可以通过当前拦截器自动追加`set`列操作

## EasyInterceptor Api

方法  | 默认值/实现 | 描述  
--- | --- | --- 
order | 100  | 用于对拦截器进行顺序排序执行
defaultEnable | true  | 是否默认添加到表达式中,true:默认添加,false:需要调用`useInteceptor(name)`使用
name | 无  | 拦截器名称需要自己实现,默认可以使用类名
apply | 哪些对象允许采用当前拦截器  | 默认可以才用是否为某个接口的实现`Interface.class.isAssignableFrom(entityClass);`


## demo数据

::: code-tabs
@tab TopicInterceptor
```java
@Data
@Table("t_topic_interceptor")
public class TopicInterceptor {
    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    @UpdateIgnore
    private LocalDateTime createTime;
    @UpdateIgnore
    private String createBy;
    private LocalDateTime updateTime;
    private String updateBy;
    @UpdateIgnore
    private String tenantId;
}
```
@tab SQL
```sql
-- 数据库表结构语句
create table t_topic_interceptor
(
    id varchar(32) not null comment '主键ID'primary key,
    stars int not null comment '点赞数',
    title varchar(50) null comment '标题',
    create_time datetime not null comment '创建时间',
    create_by varchar(50) not null comment '创建人',
    update_time datetime not null comment '修改时间',
    update_by varchar(50) not null comment '修改人',
    tenant_id varchar(50) not null comment '租户'
)comment '拦截器主题表';
```
:::

## EasyEntityInterceptor

### Api

方法  | 默认实现 | 描述  
--- | --- | --- 
configureInsert | 无  | 配置自动插入时的值:创建时间,创建人
configureUpdate | 无  | 配置更新是需要修改的值:修改时间,修改人

模拟当前用户租户对象
```java
public class CurrentUserHelper {
    private static String userId;
    public static void setUserId(String userId){
        CurrentUserHelper.userId=userId;
    }
    public static String getUserId(){
        return userId;
    }
    private static String tenantId;
    public static void setTenantId(String tenantId){
        CurrentUserHelper.tenantId=tenantId;
    }
    public static String getTenantId(){
        return tenantId;
    }
}
```

拦截器
```java

/**
 * create time 2023/4/3 21:13
 * 如果是spring项目添加@Component，如果是非spring项目直接添加到EasyQueryConfiguration.applyEasyInterceptor
 *
 * @author xuejiaming
 */
public class MyEntityInterceptor implements EasyEntityInterceptor {
    @Override
    public void configureInsert(Class<?> entityClass, EntityInsertExpression entityInsertExpression, Object entity) {
        TopicInterceptor topicInterceptor = (TopicInterceptor) entity;
        if (topicInterceptor.getCreateTime() == null) {
            topicInterceptor.setCreateTime(LocalDateTime.now());
        }
        if (topicInterceptor.getCreateBy() == null) {
            topicInterceptor.setCreateBy(CurrentUserHelper.getUserId());
        }
        if (topicInterceptor.getUpdateTime() == null) {
            topicInterceptor.setUpdateTime(LocalDateTime.now());
        }
        if (topicInterceptor.getUpdateBy() == null) {
            topicInterceptor.setUpdateBy(CurrentUserHelper.getUserId());
        }
        if (topicInterceptor.getTenantId() == null) {
            topicInterceptor.setTenantId(CurrentUserHelper.getTenantId());
        }
    }

    @Override
    public void configureUpdate(Class<?> entityClass, EntityUpdateExpression entityUpdateExpression, Object entity) {

        TopicInterceptor topicInterceptor = (TopicInterceptor) entity;
        topicInterceptor.setUpdateTime(LocalDateTime.now());
        topicInterceptor.setUpdateBy(CurrentUserHelper.getUserId());
    }

    @Override
    public String name() {
        return "MyEntityInterceptor";
    }

    @Override
    public boolean apply(Class<?> entityClass) {
        return TopicInterceptor.class.isAssignableFrom(entityClass);
    }
}
```
测试代码
```java
//设置当前租户和当前用户
CurrentUserHelper.setUserId("xiaoming");
CurrentUserHelper.setTenantId("abc");
TopicInterceptor topicInterceptor = new TopicInterceptor();
topicInterceptor.setId("123");
topicInterceptor.setTitle("123");
topicInterceptor.setStars(123);
long l = easyQuery.insertable(topicInterceptor).executeRows();

==> Preparing: INSERT INTO t_topic_interceptor (`id`,`stars`,`title`,`create_time`,`create_by`,`update_time`,`update_by`,`tenant_id`) VALUES (?,?,?,?,?,?,?,?) 
==> Parameters: 123(String),123(Integer),123(String),2023-04-03T21:28:32.643(LocalDateTime),xiaoming(String),2023-04-03T21:28:32.643(LocalDateTime),xiaoming(String),abc(String)
<== Total: 1

TopicInterceptor topicInterceptor1 = easyQuery.queryable(TopicInterceptor.class).whereId("123").firstOrNull();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time`,t.`create_by`,t.`update_time`,t.`update_by`,t.`tenant_id` FROM t_topic_interceptor t WHERE t.`id` = ? LIMIT 1
==> Parameters: 123(String)
<== Total: 1


CurrentUserHelper.setUserId("xiaoming1");
long l1 = easyQuery.updatable(topicInterceptor1).executeRows();

==> Preparing: UPDATE t_topic_interceptor SET `stars` = ?,`title` = ?,`update_time` = ?,`update_by` = ? WHERE `id` = ?
==> Parameters: 123(Integer),123(String),2023-04-03T21:28:32.670(LocalDateTime),xiaoming1(String),123(String)
<== Total: 1
```
插入的时候确定了自动填充,实际项目中可以通过接口来限制,更新的时候也会自动更新时间,但是如果是表达式更新那么还是原先的操作并不会更新
```java
 long l2 = easyQuery.updatable(TopicInterceptor.class).set(TopicInterceptor::getTitle, topicInterceptor2.getTitle())
                .whereId(topicInterceptor2.getId()).executeRows();

==> Preparing: UPDATE t_topic_interceptor SET `title` = ? WHERE `id` = ?
==> Parameters: 123(String),123(String)
<== Total: 1
```
这种情况下`updateBy`和`updateTime`并不会自动添加到生成的sql里面,这个时候我们的`EasyUpdateSetInterceptor`拦截就起作用了

## EasyUpdateSetInterceptor

我们在原先的拦截器上再次实现`EasyUpdateSetInterceptor`让原先的拦截器支持表达式`set`,当然你也可以单独创建一个拦截器,如果单独创建那么可以单独对其进行选择性启用或者禁用


### Api

方法  | 默认实现 | 描述  
--- | --- | --- 
configure | 无  | 配置表达式更新set列自动填充

```java

/**
 * create time 2023/4/3 21:13
 * 如果是spring项目添加@Component，如果是非spring项目直接添加到EasyQueryConfiguration.applyEasyInterceptor
 *
 * @author xuejiaming
 */
public class MyEntityInterceptor implements EasyEntityInterceptor, EasyUpdateSetInterceptor {
    @Override
    public void configureInsert(Class<?> entityClass, EntityInsertExpression entityInsertExpression, Object entity) {
        TopicInterceptor topicInterceptor = (TopicInterceptor) entity;
        if (topicInterceptor.getCreateTime() == null) {
            topicInterceptor.setCreateTime(LocalDateTime.now());
        }
        if (topicInterceptor.getCreateBy() == null) {
            topicInterceptor.setCreateBy(CurrentUserHelper.getUserId());
        }
        if (topicInterceptor.getUpdateTime() == null) {
            topicInterceptor.setUpdateTime(LocalDateTime.now());
        }
        if (topicInterceptor.getUpdateBy() == null) {
            topicInterceptor.setUpdateBy(CurrentUserHelper.getUserId());
        }
        if (topicInterceptor.getTenantId() == null) {
            topicInterceptor.setTenantId(CurrentUserHelper.getTenantId());
        }
    }

    @Override
    public void configureUpdate(Class<?> entityClass, EntityUpdateExpression entityUpdateExpression, Object entity) {

        TopicInterceptor topicInterceptor = (TopicInterceptor) entity;
        topicInterceptor.setUpdateTime(LocalDateTime.now());
        topicInterceptor.setUpdateBy(CurrentUserHelper.getUserId());
    }

    @Override
    public String name() {
        return "MyEntityInterceptor";
    }

    @Override
    public boolean apply(Class<?> entityClass) {
        return TopicInterceptor.class.isAssignableFrom(entityClass);
    }

    @Override
    public void configure(Class<?> entityClass, EntityUpdateExpression entityUpdateExpression, SqlColumnSetter<Object> columnSetter) {
        String updateBy = "updateBy";//属性名用来动态创建lambda
        String updateTime = "updateTime";//属性名用来动态创建lambda
        //是否已经set了
        if(!entityUpdateExpression.getSetColumns().containsOnce(entityClass,updateBy)){
            String userId = CurrentUserHelper.getUserId();
            //获取updateBy属性的lambda表达式
            Property<Object, ?> propertyLambda = EasyUtil.getPropertyGetterLambda(entityClass, updateBy, String.class);
            columnSetter.set(propertyLambda,userId);
        }
        if(!entityUpdateExpression.getSetColumns().containsOnce(entityClass,updateTime)){
            //获取updateTime属性的lambda表达式
            Property<Object, ?> propertyLambda = EasyUtil.getPropertyGetterLambda(entityClass, updateTime, LocalDateTime.class);
            columnSetter.set(propertyLambda,LocalDateTime.now());
        }
    }
}
```

测试
```java
long l2 = easyQuery.updatable(TopicInterceptor.class)
        //虽然我们没有在表达式中设置需要set的属性,但是因为拦截器得原因easy-qeury帮我们自动的进行了处理
        .set(TopicInterceptor::getTitle, topicInterceptor2.getTitle())
        .whereId(topicInterceptor2.getId()).executeRows();

==> Preparing: UPDATE t_topic_interceptor SET `title` = ?,`update_by` = ?,`update_time` = ? WHERE `id` = ?
==> Parameters: 123(String),xiaoming1(String),2023-04-03T21:56:39.426(LocalDateTime),123(String)
<== Total: 1
```

到目前为止基本上大部分的业务需求已经可以实现了，但是如果你是有租户的或者你是需要对当前请求查询条件进行额外条件过滤添加的,那么`EasyPredicateFilterInterceptor`可以帮你满足这个条件

## EasyPredicateFilterInterceptor



### Api

方法  | 默认实现 | 描述  
--- | --- | --- 
configure | 无  | 配置表达式where条件,查询,修改(对象/表达式),删除(对象/表达式)

### 租户模式实现
- [x] 添加租户id
- [x] 查询过滤租户id
- [x] 更新添加租户id条件
- [x] 删除添加租户id

这边我们新建一个租户拦截器,把原先拦截器里面的自动填充租户id移动到租户拦截器里面
```java

public class MyTenantInterceptor implements EasyEntityInterceptor,EasyPredicateFilterInterceptor {
    @Override
    public String name() {
        return "MyTenantInterceptor";
    }

    @Override
    public boolean apply(Class<?> entityClass) {
        return TopicInterceptor.class.isAssignableFrom(entityClass);
    }

    @Override
    public void configure(Class<?> entityClass, LambdaEntityExpression lambdaEntityExpression, SqlPredicate<Object> sqlPredicate) {
        if(CurrentUserHelper.getUserId()!=null){
            //获取租户id的lambda表达式
            Property<Object, ?> tenantId = EasyUtil.getPropertyGetterLambda(entityClass, "tenantId", String.class);
            sqlPredicate.eq(tenantId, CurrentUserHelper.getTenantId());
        }
    }

    @Override
    public void configureInsert(Class<?> entityClass, EntityInsertExpression entityInsertExpression, Object entity) {

        TopicInterceptor topicInterceptor = (TopicInterceptor) entity;
        if (topicInterceptor.getTenantId() == null) {
            topicInterceptor.setTenantId(CurrentUserHelper.getTenantId());
        }
    }

    @Override
    public void configureUpdate(Class<?> entityClass, EntityUpdateExpression entityUpdateExpression, Object entity) {

    }
}
```

测试
```java

//查询
TopicInterceptor topicInterceptor1 = easyQuery.queryable(TopicInterceptor.class).whereId("12345").firstOrNull();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time`,t.`create_by`,t.`update_time`,t.`update_by`,t.`tenant_id` FROM t_topic_interceptor t WHERE t.`tenant_id` = ? AND t.`id` = ? LIMIT 1
==> Parameters: abc(String),12345(String)
<== Total: 1

//实体对象更新

CurrentUserHelper.setUserId("xiaoming1");
long l1 = easyQuery.updatable(topicInterceptor1).executeRows();

==> Preparing: UPDATE t_topic_interceptor SET `stars` = ?,`title` = ?,`update_time` = ?,`update_by` = ? WHERE `tenant_id` = ? AND `id` = ?
==> Parameters: 12345(Integer),12345(String),2023-04-03T22:20:27.756(LocalDateTime),xiaoming1(String),abc(String),12345(String)
<== Total: 1


//表达式更新
long l2 = easyQuery.updatable(TopicInterceptor.class).set(TopicInterceptor::getTitle, topicInterceptor2.getTitle())
            .whereId(topicInterceptor2.getId()).executeRows();


==> Preparing: UPDATE t_topic_interceptor SET `title` = ?,`update_by` = ?,`update_time` = ? WHERE `tenant_id` = ? AND `id` = ?
==> Parameters: 12345(String),xiaoming1(String),2023-04-03T22:20:27.773(LocalDateTime),abc(String),12345(String)
<== Total: 1


//表达式删除
long l3 = easyQuery.deletable(TopicInterceptor.class)
                .whereById(topicInterceptor2.getId()).executeRows();

==> Preparing: DELETE FROM t_topic_interceptor WHERE `tenant_id` = ? AND `id` = ?
==> Parameters: abc(String),12345(String)
<== Total: 1

//对象删除
long l4 = easyQuery.deletable(topicInterceptor2).executeRows();

==> Preparing: DELETE FROM t_topic_interceptor WHERE `tenant_id` = ? AND `id` = ?
==> Parameters: abc(String),12345(String)
<== Total: 0
```

所有的增删改都会添加对应的条件表达式值,可以做到表结构完美隔离租户之间的数据,并且用户使用全程无感

## 按需拦截
比如我们现在有这么一个需求因为部分接口需要针对测试数据进行移除,不希望统计到程序里面所以可以针对部分情况进行按需拦截
可以新建一个表达式拦截器`EasyPredicateFilterInterceptor`,然后默认将deaultEnable改成`false`需要时自行添加条件通过`useInteceptor(name)`