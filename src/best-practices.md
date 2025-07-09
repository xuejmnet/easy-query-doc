---
title: 实体设计最佳实践🔥
order: 120
---

# 对象设计
`easy-query`的实战环境会尽可能的给大家带来实际开发过程中我们采用的设计类型，并且给大家带来更多的解决方案

默认我们都会通过新建一个基类类满足公用的对象,并且会对数据库进行额外设计字段，比如`id`，`createTime`，`createBy`，`updateTime`，`updateBy`，`deleted`，`deleteTime`，`deleteBy`


更多主键设置模式可以参考 [不基于BaseEntity的其他模式](https://github.com/dromara/easy-query/issues/231) https://github.com/dromara/easy-query/issues/231

```java

@Data
public abstract class BaseEntity implements Serializable, Cloneable {

    private static final long serialVersionUID = -1L;
    /**
     * 记录标识;记录标识
     */
    @Column(primaryKey = true)
    private String id;
    /**
     * 创建时间;创建时间
     */
    @UpdateIgnore
    private LocalDateTime createTime;
    /**
     * 修改时间;修改时间
     */
    private LocalDateTime updateTime;
    /**
     * 创建人;创建人
     */
    @UpdateIgnore
    private String createBy;
    /**
     * 修改人;修改人
     */
    private String updateBy;
    /**
     * 是否删除;是否删除
     * 其中[strategyName = "DELETE_WITH_USER_TIME"]表示逻辑删除策略使用名称叫做[DELETE_WITH_USER_TIME]的
     * 所以你自定义的时候必须注册一个名称[DELETE_WITH_USER_TIME]的逻辑删除
     */
    @LogicDelete(strategy = LogicDeleteStrategyEnum.CUSTOM,strategyName = "DELETE_WITH_USER_TIME")
    @UpdateIgnore
    private Boolean deleted;

    /**
     * 删除人
     */
    @UpdateIgnore
    private String deleteBy;

    /**
     * 删除时间
     */
    @UpdateIgnore
    private LocalDateTime deleteTime;

}

```

然后我们会添加对应的自动添加处理，新建拦截器,需要支持对象插入的时候可以进行创建人和创建时间的自动赋值,对象修改时可以进行修改人和修改时间的自动赋值，表达式更新的时候也可以对修改时间和修改人进行自动处理
```java


@Component
@AllArgsConstructor(onConstructor_ = @Autowired)
public class DefaultEntityInterceptor implements EntityInterceptor, UpdateSetInterceptor, UpdateEntityColumnInterceptor {

    //如果你是springsecurity可以用这个SecurityContextHolder.getContext()
    //如果你是satoken那么直接用StpUtil
    private final CurrentUser currentUser;//对springboot进行的封装可以通过jwt获取对应的当前操作人用户

    /**
     * 添加默认的数据
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
            //如果使用sa-token这边采用StpUtil.getLoginIdAsString()会让导致程序需要验证
            //,所以这边需要先判断是否登录,未登录就给默认值,不然就获取
            //updateBy同理
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
        //如果你部分对象需要使用雪花id,那么你可以定义一个雪花id的空接口
        //然后让对象继承这个空接口
        // if(雪花ID.class.isAssignableFrom(entity.getClass())){
        //     if (baseEntity.getId() == null) {
        //         baseEntity.setId(//赋值雪花id);
        //     }
        // }else{
        //     if (baseEntity.getId() == null) {
        //         baseEntity.setId(IdHelper.nextId());
        //     }
        // }
    }

    /**
     * 添加更新对象参数
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
     * 表达式更新set参数添加
     *
     * @param entityClass
     * @param entityUpdateExpressionBuilder
     * @param columnSetter
     */
    @Override
    public void configure(Class<?> entityClass, EntityUpdateExpressionBuilder entityUpdateExpressionBuilder, ColumnSetter<Object> columnSetter) {
        //创建两个属性比较器 如果你觉得你程序里面不会手动去修改这两个值那么也可以不加这个判断
        EntitySegmentComparer updateTime = new EntitySegmentComparer(entityClass, "updateTime");
        EntitySegmentComparer updateBy = new EntitySegmentComparer(entityClass, "updateBy");
        columnSetter.getSQLBuilderSegment().forEach(k -> {
            updateTime.visit(k);
            updateBy.visit(k);
            return updateTime.isInSegment() && updateBy.isInSegment();
        });
        //是否已经set了
        if (!updateBy.isInSegment()) {
            String userId = StringUtils.defaultString(CurrentUserHelper.getUserId());
            columnSetter.set( "updateBy", userId);
        }
        if (!updateTime.isInSegment()) {
            columnSetter.set("updateTime", LocalDateTime.now());
        }
    }
    /**
     * 对象属性更新指定列更新
     *
     * @param entityClass
     * @param entityUpdateExpressionBuilder
     * @param columnSelector
     * @param entity
     */
    @Override
    public void configure(Class<?> entityClass, EntityUpdateExpressionBuilder entityUpdateExpressionBuilder, ColumnOnlySelector<Object> columnSelector, Object entity) {
        //创建两个属性比较器
        EntitySegmentComparer updateTime = new EntitySegmentComparer(entityClass, "updateTime");
        EntitySegmentComparer updateBy = new EntitySegmentComparer(entityClass, "updateBy");
        columnSelector.getSQLSegmentBuilder().forEach(k -> {
            updateTime.visit(k);
            updateBy.visit(k);
            return updateTime.isInSegment() && updateBy.isInSegment();
        });
        //是否已经set了
        if (!updateTime.isInSegment()) {
            columnSelector.column("updateTime");
        }
        if (!updateBy.isInSegment()) {
            columnSelector.column( "updateBy");
        }
    }

    @Override
    public String name() {
        return "DEFAULT_INTERCEPTOR";//后续禁用拦截器或者启用拦截器使用这个名称代表当前拦截器
    }
    /**
     * 那些对象需要用到这个拦截器(这边设置继承BaseEntity的对象)
     */
    @Override
    public boolean apply(Class<?> entityClass) {
        return BaseEntity.class.isAssignableFrom(entityClass);
    }
}

```

创建时间和创建人和修改时间修改人已经添加的情况下我们还需要对删除时间删除人进行处理
```java

@Component
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class MyBooleanLogicDeleteStrategy extends AbstractLogicDeleteStrategy {
    private final CurrentUser currentUser;
    private static final Set<Class<?>> allowedPropertyTypes =new HashSet<>(Arrays.asList(Boolean.class,boolean.class));
    @Override
    public String getStrategy() {
        return "DELETE_WITH_USER_TIME";//后续用户指定逻辑删除名称就是用这个名称即可
    }

    @Override
    public Set<Class<?>> allowedPropertyTypes() {
        return allowedPropertyTypes;
    }


    @Override
    protected SQLExpression1<WherePredicate<Object>> getPredicateFilterExpression(LogicDeleteBuilder builder, String propertyName) {
        return o -> o.eq(propertyName, false);
    }

    @Override
    protected SQLExpression1<ColumnSetter<Object>> getDeletedSQLExpression(LogicDeleteBuilder builder, String propertyName) {
        //表达式内部的参数不可以提取出来,如果提取出来那么就确定了,而不是实时的 如果一定要提取出来请参考下面的方法
        return o -> o.set(propertyName, true).set("deleteBy",currentUser.getUserId()).set("deleteTime", LocalDateTime.now());
    }

    //@Override
    //protected SQLExpression1<ColumnSetter<Object>> getDeletedSQLExpression(LogicDeleteBuilder builder, String propertyName) {
    //    //表达式内部的参数不可以提取出来,如果提取出来那么就确定了,而不是实时的
    //    return o -> {
    //        //如果判断动态条件过于复杂可以通过大括号来实现内部的编程而不是链式
    //        //在这边可以提取对应的表达式参数
    //            String userId=currentUser.getUserId();
    //            o.set(propertyName, true).set("deleteBy",userId).set("deleteTime", LocalDateTime.now());
    //    };
    //}
}
```

这样我们就完成了新增自动填充创建信息和修改信息,删除自动填充删除信息,而不需要人为手动赋值


## 额外搜索
`主键` `雪花id` `自定义主键`