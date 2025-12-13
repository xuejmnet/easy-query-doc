---
title: Global Interceptor
order: 30
---

# Global Interceptor
`easy-query` provides interceptors by default, supporting batch interception of SQL expressions during engineering:
- Auto-fill id, creator, creation time, updater, update time, etc.
- Automatic tenant id condition filtering for requests
- User permissions, e.g., leaders can view and operate their department and subordinate departments, departments can only view and operate their own department, users can only view and operate their own data
- For example, web request paths like `/company/**` use the current enterprise id `companyId` as a condition to restrict operations to the current enterprise only

If you don't know how to use it, check [Practice Object Design](/en/practice/configuration/entity)

Class  | Name | Description  
--- | --- | --- 
EntityInterceptor | Entity Interceptor  | Used to intercept entities before insert and update
PredicateFilterInterceptor | Condition Interceptor  | Used to dynamically add conditions during query, update, and delete, such as `tenant id`
UpdateSetInterceptor | Update Column Interceptor  | Used to automatically append `set` column operations during update expressions
UpdateEntityColumnInterceptor | Entity Column Update Interceptor  | `EntityInterceptor` mainly assigns values to entities, but when assigning values like `updateTime`, this field may not be updated. This interceptor handles adding the `updateTime` setting at the end

## Interceptor API

Method  | Default/Implementation | Description  
--- | --- | --- 
order | 100  | Used to order interceptor execution, smaller values execute first
enable | true  | Whether to add to expression by default (requires apply=true). true: add by default, false: don't add, can be dynamically set via `ThreadLocal` or call useInterceptor(name) to explicitly use
name | None  | Interceptor name, needs implementation, can use class name by default
apply | Which entities allow this interceptor  | Can use interface implementation check `Interface.class.isAssignableFrom(entityClass);`

::: warning Note!!!
> After creating interceptors, configure them in `QueryConfiguration`. For `springboot` with default `easy-query`, just add `@Component`. For `solon`, check [Configuration or Configure to All DataSources](/en/easy-query-doc/config/config-solon.html#solon-all-configuration)
> If you built `easy-query` yourself, you need to add the interceptor manually:
```java
QueryRuntimeContext runtimeContext = easyQuery.getRuntimeContext();
QueryConfiguration configuration = runtimeContext.getQueryConfiguration();
configuration.applyInterceptor(new MyEntityInterceptor());
```
:::

## Demo Data

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
-- Database table structure statement
create table t_topic_interceptor
(
    id varchar(32) not null comment 'Primary Key' primary key,
    stars int not null comment 'Stars',
    title varchar(50) null comment 'Title',
    create_time datetime not null comment 'Create Time',
    create_by varchar(50) not null comment 'Created By',
    update_time datetime not null comment 'Update Time',
    update_by varchar(50) not null comment 'Updated By',
    tenant_id varchar(50) not null comment 'Tenant'
)comment 'Interceptor Topic Table';
```
:::

## EntityInterceptor

### API

Method  | Default Implementation | Description  
--- | --- | --- 
configureInsert | None  | Configure auto-values for insert: create time, creator
configureUpdate | None  | Configure values to modify on update: update time, updater

Simulate current user tenant object:
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

Interceptor:
```java

/**
 * create time 2023/4/3 21:13
 * For Spring projects add @Component, for non-Spring projects add directly to QueryConfiguration.applyInterceptor
 *
 * @author xuejiaming
 */
public class MyEntityInterceptor implements EntityInterceptor {
    @Override
    public void configureInsert(Class<?> entityClass, EntityInsertExpressionBuilder entityInsertExpressionBuilder, Object entity) {
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
    }

    @Override
    public void configureUpdate(Class<?> entityClass, EntityUpdateExpressionBuilder entityUpdateExpressionBuilder, Object entity) {

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
//Tenant interceptor
public class MyTenantInterceptor implements EntityInterceptor,PredicateFilterInterceptor {
    @Override
    public String name() {
        return "MyTenantInterceptor";
    }

    @Override
    public boolean apply(Class<?> entityClass) {
        return TopicInterceptor.class.isAssignableFrom(entityClass);
    }

    @Override
    public void configure(Class<?> entityClass, LambdaEntityExpressionBuilder lambdaEntityExpressionBuilder, WherePredicate<Object> wherePredicate) {
        if(CurrentUserHelper.getUserId()!=null){
            wherePredicate.eq("tenantId", CurrentUserHelper.getTenantId());
        }
    }

    @Override
    public void configureInsert(Class<?> entityClass, EntityInsertExpressionBuilder entityInsertExpressionBuilder, Object entity) {

        TopicInterceptor topicInterceptor = (TopicInterceptor) entity;
        if (topicInterceptor.getTenantId() == null) {
            topicInterceptor.setTenantId(CurrentUserHelper.getTenantId());
        }
    }
}
```
Test code:
```java
//Set current tenant and user
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
Auto-fill is confirmed during insertion. In actual projects, you can restrict through interfaces. Update time is also automatically updated on updates. However, for expression updates, original operations still apply without automatic updates:
```java
 long l2 = easyQuery.updatable(TopicInterceptor.class).set(TopicInterceptor::getTitle, topicInterceptor2.getTitle())
                .whereId(topicInterceptor2.getId()).executeRows();

==> Preparing: UPDATE t_topic_interceptor SET `title` = ? WHERE `id` = ?
==> Parameters: 123(String),123(String)
<== Total: 1
```
In this case, `updateBy` and `updateTime` are not automatically added to the generated SQL. This is where our `UpdateSetInterceptor` intercepts come into play.

## UpdateSetInterceptor

We implement `UpdateSetInterceptor` on the original interceptor to support expression `set`. You can also create a separate interceptor, allowing selective enabling or disabling.

### API

Method  | Default Implementation | Description  
--- | --- | --- 
configure | None  | Configure expression update set column auto-fill

```java

/**
 * create time 2023/4/3 21:13
 * For Spring projects add @Component, for non-Spring projects add directly to QueryConfiguration.applyInterceptor
 *
 * @author xuejiaming
 */
public class MyEntityInterceptor implements EntityInterceptor, UpdateSetInterceptor {
    @Override
    public void configureInsert(Class<?> entityClass, EntityInsertExpressionBuilder entityInsertExpressionBuilder, Object entity) {
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
    }

    @Override
    public void configureUpdate(Class<?> entityClass, EntityUpdateExpressionBuilder entityUpdateExpressionBuilder, Object entity) {

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
    public void configure(Class<?> entityClass, EntityUpdateExpressionBuilder entityUpdateExpressionBuilder, ColumnSetter<Object> columnSetter) {
        //Create two property comparers
        EntitySegmentComparer updateTime = new EntitySegmentComparer(entityClass, "updateTime");
        EntitySegmentComparer updateBy = new EntitySegmentComparer(entityClass, "updateBy");
        columnSetter.getSQLBuilderSegment().forEach(k -> {
            updateTime.visit(k);
            updateBy.visit(k);
            return updateTime.isInSegment() && updateBy.isInSegment();
        });
        //Check if already set
        if (!updateBy.isInSegment()) {
            String userId = StringUtils.defaultString(CurrentUserHelper.getUserId());
            columnSetter.set( "updateBy", userId);
        }
        if (!updateTime.isInSegment()) {
            columnSetter.set("updateTime", LocalDateTime.now());
        }
    }
}

```

Test:
```java
long l2 = easyQuery.updatable(TopicInterceptor.class)
        //Although we didn't set the properties to set in the expression, the interceptor automatically handles it for us
        .set(TopicInterceptor::getTitle, topicInterceptor2.getTitle())
        .whereId(topicInterceptor2.getId()).executeRows();

==> Preparing: UPDATE t_topic_interceptor SET `title` = ?,`update_by` = ?,`update_time` = ? WHERE `id` = ?
==> Parameters: 123(String),xiaoming1(String),2023-04-03T21:56:39.426(LocalDateTime),123(String)
<== Total: 1
```

So far, most business requirements can be implemented. However, if you have tenants or need to add extra condition filtering to current request queries, `PredicateFilterInterceptor` can help meet this requirement.

## PredicateFilterInterceptor

### API

Method  | Default Implementation | Description  
--- | --- | --- 
configure | None  | Configure expression where conditions for query, update (entity/expression), delete (entity/expression)

### Tenant Multi-Tenant Mode Implementation
- [x] Add tenant id
- [x] Query filter tenant id
- [x] Update add tenant id condition
- [x] Delete add tenant id

Here we create a new tenant interceptor, moving the auto-fill tenant id from the original interceptor to the tenant interceptor:
```java

public class MyTenantInterceptor implements EntityInterceptor,PredicateFilterInterceptor {
    @Override
    public String name() {
        return "MyTenantInterceptor";
    }

    @Override
    public boolean apply(Class<?> entityClass) {
        return TopicInterceptor.class.isAssignableFrom(entityClass);
    }

    @Override
    public void configure(Class<?> entityClass, LambdaEntityExpressionBuilder lambdaEntityExpressionBuilder, WherePredicate<Object> sqlWherePredicate) {
        if(CurrentUserHelper.getUserId()!=null){
            sqlWherePredicate.eq("tenantId", CurrentUserHelper.getTenantId());
        }
    }

    @Override
    public void configureInsert(Class<?> entityClass, EntityInsertExpressionBuilder entityInsertExpressionBuilder, Object entity) {

        TopicInterceptor topicInterceptor = (TopicInterceptor) entity;
        if (topicInterceptor.getTenantId() == null) {
            topicInterceptor.setTenantId(CurrentUserHelper.getTenantId());
        }
    }
}
```

Test:
```java

//Query
TopicInterceptor topicInterceptor1 = easyQuery.queryable(TopicInterceptor.class).whereId("12345").firstOrNull();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time`,t.`create_by`,t.`update_time`,t.`update_by`,t.`tenant_id` FROM t_topic_interceptor t WHERE t.`tenant_id` = ? AND t.`id` = ? LIMIT 1
==> Parameters: abc(String),12345(String)
<== Total: 1

//Entity update

CurrentUserHelper.setUserId("xiaoming1");
long l1 = easyQuery.updatable(topicInterceptor1).executeRows();

==> Preparing: UPDATE t_topic_interceptor SET `stars` = ?,`title` = ?,`update_time` = ?,`update_by` = ? WHERE `tenant_id` = ? AND `id` = ?
==> Parameters: 12345(Integer),12345(String),2023-04-03T22:20:27.756(LocalDateTime),xiaoming1(String),abc(String),12345(String)
<== Total: 1


//Expression update
long l2 = easyQuery.updatable(TopicInterceptor.class).set(TopicInterceptor::getTitle, topicInterceptor2.getTitle())
            .whereId(topicInterceptor2.getId()).executeRows();


==> Preparing: UPDATE t_topic_interceptor SET `title` = ?,`update_by` = ?,`update_time` = ? WHERE `tenant_id` = ? AND `id` = ?
==> Parameters: 12345(String),xiaoming1(String),2023-04-03T22:20:27.773(LocalDateTime),abc(String),12345(String)
<== Total: 1


//Expression delete
long l3 = easyQuery.deletable(TopicInterceptor.class)
                .whereById(topicInterceptor2.getId()).executeRows();

==> Preparing: DELETE FROM t_topic_interceptor WHERE `tenant_id` = ? AND `id` = ?
==> Parameters: abc(String),12345(String)
<== Total: 1

//Entity delete
long l4 = easyQuery.deletable(topicInterceptor2).executeRows();

==> Preparing: DELETE FROM t_topic_interceptor WHERE `tenant_id` = ? AND `id` = ?
==> Parameters: abc(String),12345(String)
<== Total: 0
```

All CRUD operations add corresponding condition expression values, achieving perfect isolation of tenant data at the table structure level, and the user experience is completely seamless.

## UpdateEntityColumnInterceptor

### API

Method  | Default Implementation | Description  
--- | --- | --- 
configure | None  | Configure expression update to select columns to set with auto-fill

```java

/**
 * create time 2023/4/3 21:13
 * For Spring projects add @Component, for non-Spring projects add directly to QueryConfiguration.applyInterceptor
 *
 * @author xuejiaming
 */
public class MyEntityInterceptor implements EntityInterceptor, UpdateEntityColumnInterceptor  {
    @Override
    public void configureInsert(Class<?> entityClass, EntityInsertExpressionBuilder entityInsertExpressionBuilder, Object entity) {
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
    }

    @Override
    public void configureUpdate(Class<?> entityClass, EntityUpdateExpressionBuilder entityUpdateExpressionBuilder, Object entity) {

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
    public void configure(Class<?> entityClass, EntityUpdateExpressionBuilder entityUpdateExpressionBuilder, ColumnOnlySelector<Object> columnSelector, Object entity) {
        //Create two property comparers
        EntitySegmentComparer updateTime = new EntitySegmentComparer(entityClass, "updateTime");
        EntitySegmentComparer updateBy = new EntitySegmentComparer(entityClass, "updateBy");
        columnSelector.getSQLSegmentBuilder().forEach(k -> {
            updateTime.visit(k);
            updateBy.visit(k);
            return updateTime.isInSegment() && updateBy.isInSegment();
        });
        //Check if already set
        if (!updateTime.isInSegment()) {
            columnSelector.column("updateTime");
        }
        if (!updateBy.isInSegment()) {
            columnSelector.column( "updateBy");
        }
    }
}

```

## On-Demand Interception
For example, we have a requirement where some APIs need to filter out test data and don't want to include it in statistics. You can implement on-demand interception.
Create a new expression interceptor `PredicateFilterInterceptor`, then set enable to `false` by default. Use it manually by calling `useInterceptor(name)`, or you can check if it's a specific API endpoint like `startWith("/api/test")`, and use `ThreadLocal` to indicate the current enable value.

