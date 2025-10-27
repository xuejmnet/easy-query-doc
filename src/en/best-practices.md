---
title: Entity Design Best Practices🔥
order: 120
---

# Object Design
`easy-query`'s practical environment will try to bring you the design types we use in actual development, and bring you more solutions.

By default, we create a base class to satisfy common objects, and design extra database fields, such as `id`, `createTime`, `createBy`, `updateTime`, `updateBy`, `deleted`, `deleteTime`, `deleteBy`.

## Base Class Abstraction

For more primary key setting modes, see [Other modes not based on BaseEntity](https://github.com/dromara/easy-query/issues/231) https://github.com/dromara/easy-query/issues/231

```java

@Data
public abstract class BaseEntity implements Serializable, Cloneable {

    private static final long serialVersionUID = -1L;
    /**
     * Record identifier
     */
    @Column(primaryKey = true)
    private String id;
    /**
     * Create time
     */
    @UpdateIgnore
    private LocalDateTime createTime;
    /**
     * Update time
     */
    private LocalDateTime updateTime;
    /**
     * Creator
     */
    @UpdateIgnore
    private String createBy;
    /**
     * Updater
     */
    private String updateBy;
    /**
     * Is deleted
     * Where [strategyName = "DELETE_WITH_USER_TIME"] means logical delete strategy uses name called [DELETE_WITH_USER_TIME]
     * So when customizing, must register a logical delete with name [DELETE_WITH_USER_TIME]
     */
    @LogicDelete(strategy = LogicDeleteStrategyEnum.CUSTOM,strategyName = "DELETE_WITH_USER_TIME")
    @UpdateIgnore
    private Boolean deleted;

    /**
     * Deleter
     */
    @UpdateIgnore
    private String deleteBy;

    /**
     * Delete time
     */
    @UpdateIgnore
    private LocalDateTime deleteTime;

}

```

Then we add corresponding auto-fill handling, create interceptor. Need to support auto-assignment of creator and create time when object insert, auto-assignment of updater and update time when object modify, also auto-handle update time and updater for expression update.

## Interceptor Implementation
Auto-fill entity data
```java


@Component
@AllArgsConstructor(onConstructor_ = @Autowired)
public class DefaultEntityInterceptor implements EntityInterceptor, UpdateSetInterceptor, UpdateEntityColumnInterceptor {

    //If you use spring security, can use SecurityContextHolder.getContext()
    //If you use satoken, directly use StpUtil
    private final CurrentUser currentUser;//Wrapper for springboot, can get current operator user through jwt

    /**
     * Add default data
     *
     * @param entityClass
     * @param entityInsertExpressionBuilder
     * @param entity
     */
    @Override
    public void configureInsert(Class<?> entityClass, EntityInsertExpressionBuilder entityInsertExpressionBuilder, Object entity) {
        BaseEntity baseEntity = (BaseEntity) entity;
        if (baseEntity.getCreateTime() == null) {
            baseEntity.setCreateTime(LocalDateTime.now());
        }
        if (baseEntity.getCreateBy() == null) {
            String userId = StringUtils.defaultString(currentUser.getUserId());
            //If using sa-token, using StpUtil.getLoginIdAsString() here will cause program to require verification
            //So need to check if logged in first, give default if not logged in, otherwise get
            //Same for updateBy
            baseEntity.setCreateBy(userId);
        }
        if (baseEntity.getUpdateTime() == null) {
            baseEntity.setUpdateTime(LocalDateTime.now());
        }
        if (baseEntity.getUpdateBy() == null) {
            String userId = StringUtils.defaultString(currentUser.getUserId());
            baseEntity.setUpdateBy(userId);
        }
        if (baseEntity.getDeleted() == null) {
            baseEntity.setDeleted(false);
        }
        
        if (baseEntity.getId() == null) {
            baseEntity.setId(IdHelper.nextId());
        }
        //If part of objects need to use snowflake id, you can define an empty snowflake id interface
        //Then let object inherit this empty interface
        // if(SnowflakeID.class.isAssignableFrom(entity.getClass())){
        //     if (baseEntity.getId() == null) {
        //         baseEntity.setId(//assign snowflake id);
        //     }
        // }else{
        //     if (baseEntity.getId() == null) {
        //         baseEntity.setId(IdHelper.nextId());
        //     }
        // }
    }

    /**
     * Add update object parameters
     *
     * @param entityClass
     * @param entityUpdateExpressionBuilder
     * @param entity
     */
    @Override
    public void configureUpdate(Class<?> entityClass, EntityUpdateExpressionBuilder entityUpdateExpressionBuilder, Object entity) {
        BaseEntity baseEntity = (BaseEntity) entity;
        baseEntity.setUpdateTime(LocalDateTime.now());
        String userId = StringUtils.defaultString(currentUser.getUserId());
        baseEntity.setUpdateBy(userId);
    }

    /**
     * Expression update set parameter addition
     *
     * @param entityClass
     * @param entityUpdateExpressionBuilder
     * @param columnSetter
     */
    @Override
    public void configure(Class<?> entityClass, EntityUpdateExpressionBuilder entityUpdateExpressionBuilder, ColumnSetter<Object> columnSetter) {
        //Create two property comparers. If you think your program won't manually modify these two values, can skip this check
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
    /**
     * Object property update specific column update
     *
     * @param entityClass
     * @param entityUpdateExpressionBuilder
     * @param columnSelector
     * @param entity
     */
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

    @Override
    public String name() {
        return "DEFAULT_INTERCEPTOR";//Use this name to represent current interceptor when disabling or enabling interceptor later
    }
    /**
     * Which objects need to use this interceptor (here set objects inheriting BaseEntity)
     */
    @Override
    public boolean apply(Class<?> entityClass) {
        return BaseEntity.class.isAssignableFrom(entityClass);
    }
}

```

After adding create time, creator, update time, and updater, we still need to handle delete time and deleter.

## Logical Delete Definition
Custom logical delete implementation to fill deleter and delete time
```java

@Component
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class MyBooleanLogicDeleteStrategy extends AbstractLogicDeleteStrategy {
    private final CurrentUser currentUser;
    private static final Set<Class<?>> allowedPropertyTypes =new HashSet<>(Arrays.asList(Boolean.class,boolean.class));
    @Override
    public String getStrategy() {
        return "DELETE_WITH_USER_TIME";//User specifies logical delete name using this name later
    }

    @Override
    public Set<Class<?>> allowedPropertyTypes() {
        return allowedPropertyTypes;
    }


    @Override
    protected SQLActionExpression1<WherePredicate<Object>> getPredicateFilterExpression(LogicDeleteBuilder builder, String propertyName) {
        return o -> o.eq(propertyName, false);
    }

    @Override
    protected SQLActionExpression1<ColumnSetter<Object>> getDeletedSQLExpression(LogicDeleteBuilder builder, String propertyName) {
        //Parameters inside expression cannot be extracted. If extracted, they are determined, not real-time. If must extract, see method below
        return o -> o.set(propertyName, true).set("deleteBy",currentUser.getUserId()).set("deleteTime", LocalDateTime.now());
    }

    //@Override
    //protected SQLActionExpression1<ColumnSetter<Object>> getDeletedSQLExpression(LogicDeleteBuilder builder, String propertyName) {
    //    //Parameters inside expression cannot be extracted. If extracted, they are determined, not real-time
    //    return o -> {
    //        //If judging dynamic conditions is too complex, can use braces to implement internal programming instead of chaining
    //        //Can extract corresponding expression parameters here
    //            String userId=currentUser.getUserId();
    //            o.set(propertyName, true).set("deleteBy",userId).set("deleteTime", LocalDateTime.now());
    //    };
    //}
}
```

This completes auto-fill of create info and update info on insert, auto-fill of delete info on delete, without manual assignment.

## Extra Search
`Primary Key` `Snowflake ID` `Custom Primary Key`
