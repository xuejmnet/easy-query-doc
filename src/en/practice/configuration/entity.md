---
title: Object Design
order: 10
---

# Object Design
The `easy-query` practice section will bring you the design types we adopt in the actual development process as much as possible, and provide you with more solutions.

By default, we will create a base class to satisfy common objects and add additional design fields to the database, such as `id`, `createTime`, `createBy`, `updateTime`, `updateBy`, `deleted`, `deleteTime`, `deleteBy`.


For more primary key setting modes, please refer to [Other modes not based on BaseEntity](https://github.com/dromara/easy-query/issues/231) https://github.com/dromara/easy-query/issues/231

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
     * Creation time
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
     * [strategyName = "DELETE_WITH_USER_TIME"] means the logical delete strategy uses a name called [DELETE_WITH_USER_TIME]
     * So when you customize, you must register a logical delete with the name [DELETE_WITH_USER_TIME]
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

Then we will add corresponding automatic addition processing. Create an interceptor that supports automatic assignment of creator and creation time when inserting objects, automatic assignment of updater and update time when modifying objects, and automatic processing of update time and updater when updating with expressions.
```java


@Component
@AllArgsConstructor(onConstructor_ = @Autowired)
public class DefaultEntityInterceptor implements EntityInterceptor, UpdateSetInterceptor, UpdateEntityColumnInterceptor {

    //If you use Spring Security, you can use SecurityContextHolder.getContext()
    //If you use sa-token, you can directly use StpUtil
    private final CurrentUser currentUser;//Encapsulation for Spring Boot, can obtain the current operator user through JWT

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
            //If using sa-token, using StpUtil.getLoginIdAsString() here will cause the program to require verification
            //So we need to check if logged in first. If not logged in, give a default value, otherwise get it
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
        //If you need to use snowflake ID for some objects, you can define an empty snowflake ID interface
        //Then let the object inherit this empty interface
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
     * Add expression update set parameters
     *
     * @param entityClass
     * @param entityUpdateExpressionBuilder
     * @param columnSetter
     */
    @Override
    public void configure(Class<?> entityClass, EntityUpdateExpressionBuilder entityUpdateExpressionBuilder, ColumnSetter<Object> columnSetter) {
        //Create two property comparers. If you think you won't manually modify these two values in your program, you can also skip this check
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
     * Object property update for specific column update
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
        return "DEFAULT_INTERCEPTOR";//Use this name to represent the current interceptor for subsequent disabling or enabling
    }
    /**
     * Which objects need to use this interceptor (objects that inherit BaseEntity)
     */
    @Override
    public boolean apply(Class<?> entityClass) {
        return BaseEntity.class.isAssignableFrom(entityClass);
    }
}

```

After creation time, creator, update time, and updater are added, we also need to process delete time and deleter.
```java

@Component
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class MyBooleanLogicDeleteStrategy extends AbstractLogicDeleteStrategy {
    private final CurrentUser currentUser;
    @Override
    public String getStrategy() {
        return "DELETE_WITH_USER_TIME";//Users can specify the logical delete name with this name later
    }


    @Override
    protected SQLActionExpression1<WherePredicate<Object>> getPredicateFilterExpression(LogicDeleteBuilder builder, String propertyName) {
        return o -> o.eq(propertyName, false);
    }

    @Override
    protected SQLActionExpression1<ColumnSetter<Object>> getDeletedSQLExpression(LogicDeleteBuilder builder, String propertyName) {
        //Parameters inside the expression cannot be extracted. If extracted, they will be determined. If you must extract them, please refer to the method below
        return o -> o.set(propertyName, true).set("deleteBy",currentUser.getUserId()).set("deleteTime", LocalDateTime.now());
    }

    //@Override
    //protected SQLActionExpression1<ColumnSetter<Object>> getDeletedSQLExpression(LogicDeleteBuilder builder, String propertyName) {
    //    //Parameters inside the expression cannot be extracted. If extracted, they will be determined
    //    return o -> {
    //        //If the dynamic condition judgment is too complex, you can use braces to implement internal programming instead of chaining
    //        //You can extract the corresponding expression parameters here
    //            String userId=currentUser.getUserId();
    //            o.set(propertyName, true).set("deleteBy",userId).set("deleteTime", LocalDateTime.now());
    //    };
    //}
}
```

This way we have completed automatic filling of creation information and modification information on insert, and automatic filling of deletion information on delete, without manual assignment.


## Additional Search
`Primary Key` `Snowflake ID` `Custom Primary Key`

