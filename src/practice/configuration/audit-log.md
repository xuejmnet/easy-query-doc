---
title: 审计日志
order: 30
---

审计日志是一种有助于用户关注系统了解数据变更和溯源数据审计的一种日志,常用于用户记录数据的敏感信息变更记录和数据版本.

`eq`实现审计日志可以通过`EntityExpressionExecutor`接口进行拦截自行实现表达式执行来实现对应功能

本章节[demo点击](https://github.com/xuejmnet/eq-aduitlog)


本章节使用源码为3.0.4+
## EntityExpressionExecutor
`EntityExpressionExecutor`是eq执行表达式和原生sql的对应接口


方法  | 描述  
---  | --- 
query  | 表达式查询结果（暂时未用到）
queryStreamResultSet  | 流式结果对象返回,用于返回常规的集合和单个对象
querySQL  | 原生sql字符串查询
querySQLStreamResultSet  | 原生sql字符串流式结果返回
executeSQLRows  | 原生sql字符串执行
insert  | 对象insert执行
executeRows  | 表达式或对象执行update或delete


## Description（可选）
定义注解用来描述解析相关信息,当然你可以用eq的或者用swagger的
```java
@Target({ElementType.TYPE, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Description {
    String value();
}
```

## 工具类
```java

public class EasyQueryUtils {

    /**
     * 获取实体的主键值
     */
    public static Object getKey(Object entity, EntityMetadata entityMetadata) {
        Collection<String> keyProperties = entityMetadata.getKeyProperties();
        List<String> values = new ArrayList<>(keyProperties.size());
        for (String keyProperty : keyProperties) {
            ColumnMetadata column = entityMetadata.getColumnNotNull(keyProperty);
            Object value = EasyBeanUtil.getCurrentPropertyValue(entity, column);
            values.add(value.toString());
        }
        return values.size() == 1 ? values.get(0) : String.join(",", values);
    }
}
```

## DatabaseInterceptor
为了扩展性我们先定义一个`DatabaseInterceptor`接口
```java

public interface DatabaseInterceptor {

    /**
     * 拦截器先后顺序
     * @return
     */
    int sort();
    /**
     * 是否接受当前拦截器
     */
    boolean apply(Class<?> entityClass);

    /**
     * 插入成功后拦截
     */
    <T> void insert(List<T> entities, EntityInsertExpressionBuilder expressionBuilder, ExecutorContext executorContext);

    /**
     * 更新成功后拦截
     */
    <T> void update(List<T> entities, EntityUpdateExpressionBuilder expressionBuilder, ExecutorContext executorContext);

    /**
     * 删除成功后拦截
     */
    <T> void delete(List<T> entities, EntityDeleteExpressionBuilder expressionBuilder, ExecutorContext executorContext);

    /**
     * 表达式更新或删除执行成功后拦截
     */
    void executeRows(EntityPredicateSQLExpression entityPredicateSQLExpression, ExecutorContext executorContext);

}
```

## DatabaseLoggingInterceptor
实现拦截器,其中`logTimeListen`用户可以选择添加或者不添加
```java

@Component
@Slf4j
public class DatabaseLoggingInterceptor implements DatabaseInterceptor {

    @Override
    public int sort() {
        return 0;
    }

    @Override
    public boolean apply(Class<?> clazz) {
        //自行控制比如class必须满足某个接口或者满足某个注解
        return true;
    }

    @Override
    public <T> void insert(List<T> entities, EntityInsertExpressionBuilder expressionBuilder, ExecutorContext executorContext) {
        logTimeListen(()->{
            addLog(entities, expressionBuilder, Oper.Add);
        },"对象插入拦截表达式");
    }

    @Override
    public <T> void update(List<T> entities, EntityUpdateExpressionBuilder expressionBuilder, ExecutorContext executorContext) {
        logTimeListen(()->{
            addUpdateLog(entities, expressionBuilder);
        },"对象更新拦截表达式");
    }

    @Override
    public <T> void delete(List<T> entities, EntityDeleteExpressionBuilder expressionBuilder, ExecutorContext executorContext) {
        logTimeListen(()->{
            addLog(entities, expressionBuilder, Oper.Delete);
        },"对象删除拦截表达式");
    }

    @Override
    public void executeRows(EntityPredicateSQLExpression entityPredicateSQLExpression, ExecutorContext executorContext) {
        Oper oper = Oper.Modify;
        switch (executorContext.getExecuteMethod()) {
            case DELETE:
                oper = Oper.Delete;
                break;
            case INSERT:
                oper = Oper.Add;
                break;
        }
        String type = getTableName(entityPredicateSQLExpression.getTable(0).getEntityMetadata()) + " " + oper;
        logTimeListen(()->{
            log(type, getKey(entityPredicateSQLExpression), getLogDetail(entityPredicateSQLExpression));
        },"修改删除拦截表达式");
    }

    /**
     * 可选监听警告
     * @param actionExpression
     * @param key
     */
    private void logTimeListen(SQLActionExpression actionExpression,String key){
        long start = System.currentTimeMillis();
        actionExpression.apply();
        long end = System.currentTimeMillis();
        long elapsed = end - start;
        if(elapsed>1000){
            log.error("拦截器方法{},执行时间过长,耗时:{}ms",key,elapsed);
        }
    }

    private <T> void addUpdateLog(List<T> entities, EntityExpressionBuilder expressionBuilder) {
        QueryRuntimeContext runtimeContext = expressionBuilder.getRuntimeContext();
        EntityMetadata entityMetadata = runtimeContext.getEntityMetadataManager().getEntityMetadata(expressionBuilder.getQueryClass());
        Map<String, String> descriptions = getDescription(entityMetadata);
        String type = getTableName(entityMetadata) + " " + Oper.Modify;
        for (T entity : entities) {
            String detail = getLogDetail(entity, entityMetadata, descriptions, runtimeContext);
            log(type, getKey(entity, entityMetadata), detail);
        }
    }

    private <T> void addLog(List<T> entities, EntityExpressionBuilder expressionBuilder, Oper oper) {
        EntityMetadata entityMetadata = expressionBuilder.getRuntimeContext().getEntityMetadataManager().getEntityMetadata(expressionBuilder.getQueryClass());
        Map<String, String> descriptions = getDescription(entityMetadata);
        String type = getTableName(entityMetadata) + " " + oper.name();
        for (T entity : entities) {
            String detail = getLogDetail(entity, entityMetadata, descriptions);
            log(type, getKey(entity, entityMetadata), detail);
        }
    }

    private static String getLogDetail(Object entity, EntityMetadata entityMetadata, Map<String, String> descriptions) {
        Collection<ColumnMetadata> columns = entityMetadata.getColumns();
        StringBuilder sb = new StringBuilder();
        for (ColumnMetadata column : columns) {
            Object value = EasyBeanUtil.getCurrentPropertyValue(entity, column);
            if (value == null) {
                continue;
            }
            String display = descriptions.getOrDefault(column.getFieldName(), column.getName());
            sb.append(display).append(":").append(value).append(LINE);
        }
        if (sb.length() > 0) {
            sb.deleteCharAt(sb.length() - 1);
        }
        return sb.toString();
    }

    private static String getLogDetail(Object entity, EntityMetadata entityMetadata, Map<String, String> descriptions, QueryRuntimeContext runtimeContext) {
        EntityMetadataManager entityMetadataManager = runtimeContext.getEntityMetadataManager();
        EntityState entityState = runtimeContext.getTrackManager().getCurrentTrackContext().getTrackEntityState(entity);
        if (entityState == null) {
            return getLogDetail(entity, entityMetadata, descriptions);
        }
        StringBuilder sb = new StringBuilder();
        EntityTrackProperty entityTrackProperty = EasyTrackUtil.getTrackDiffProperty(entityMetadataManager, entityState);
        entityTrackProperty.getDiffProperties().forEach((name, state) -> {
            String display = descriptions.getOrDefault(name, name);
            sb.append(display).append(":").append(state.getOriginal()).append("→").append(state.getCurrent()).append(LINE);
        });
        if (sb.length() > 0) {
            sb.deleteCharAt(sb.length() - 1);
        }
        return sb.toString();
    }

    private void log(String type, String title, String detail) {
        log.info("{},{}:{}", type, title, detail);
    }

    private static String getTableName(EntityMetadata entityMetadata) {
        Description description = entityMetadata.getEntityClass().getAnnotation(Description.class);
        return description == null ? entityMetadata.getTableName() : description.value();
    }

    private static Map<String, String> getDescription(EntityMetadata entityMetadata) {
        Field[] fields = entityMetadata.getEntityClass().getDeclaredFields();
        Map<String, String> map = new HashMap<>();
        for (Field field : fields) {
            Description description = field.getAnnotation(Description.class);
            if (description != null) {
                map.put(field.getName(), description.value());
            }
        }
        return map;
    }

    private static String getKey(Object entity, EntityMetadata entityMetadata) {
        Object key = EasyQueryUtils.getKey(entity, entityMetadata);
        if (key instanceof String) {
            return (String) key;
        } else {
            return Objects.isNull(key) ? "null" : key.toString();
        }
    }

    private static String getKey(EntityPredicateSQLExpression expression) {
        if (expression.getWhere().isEmpty()) {
            return "null";
        }
        ToSQLContext whereContext = getToSQLContext(expression);
        String where = expression.getWhere().toSQL(whereContext);
        if (whereContext.getParameters().isEmpty()) {
            String last = where.split("=")[1].trim();
            return last.isEmpty() ? where.substring(Math.max(0, where.length() - 30)) : last;
        }
        List<Object> values = whereContext.getParameters().stream().map(SQLParameter::getValue).collect(Collectors.toList());
        if (values.size() == 1) {
            Object key = values.get(0);
            if (key instanceof String) {
                return (String) key;
            } else {
                return Objects.isNull(key) ? "null" : key.toString();
            }
        }
        return values.stream().map(Object::toString).collect(Collectors.joining(","));
    }

    private static String getLogDetail(EntityPredicateSQLExpression expression) {
        if (expression instanceof EntityUpdateSQLExpression) {
            EntityUpdateSQLExpression updateExpression = (EntityUpdateSQLExpression) expression;
            if (updateExpression.getSetColumns().isNotEmpty()) {
                return getUpdateExpressionDetail(updateExpression);
            }
        }
        return getExpressionDetail(expression);
    }

    private static String getUpdateExpressionDetail(EntityUpdateSQLExpression expression) {
        if (expression.getSetColumns().isEmpty()) {
            return getExpressionDetail(expression);
        }
        Map<String, String> descriptions = getDescription(expression.getTable(0).getEntityMetadata());
        ToSQLContext sqlContext = getToSQLContext(expression);
        String sql = expression.getSetColumns().toSQL(sqlContext);
        if (sqlContext.getParameters().isEmpty() || !StringUtils.hasText(sqlContext.getParameters().get(0).getPropertyNameOrNull())) {
            Object[] parameters = sqlContext.getParameters().stream().map(SQLParameter::getValue).toArray();
            return formatWith(sql, parameters);
        }
        StringBuilder sb = new StringBuilder();
        sqlContext.getParameters().forEach(parameter -> {
            String name = parameter.getPropertyNameOrNull();
            String display = descriptions.getOrDefault(name, name);
            sb.append(display).append(":").append(parameter.getValue()).append(LINE);
        });
        if (sb.length() > 0) {
            sb.deleteCharAt(sb.length() - 1);
        }
        return sb.toString();
    }

    private static String getExpressionDetail(EntityPredicateSQLExpression expression) {
        ToSQLContext sqlContext = getToSQLContext(expression);
        String sql = expression.toSQL(sqlContext);
        Object[] parameters = sqlContext.getParameters().stream().map(SQLParameter::getValue).toArray();
        return formatWith(sql, parameters);
    }

    private static ToSQLContext getToSQLContext(EntityPredicateSQLExpression expression) {
        TableContext tableContext = expression.getExpressionMetadata().getTableContext();
        return DefaultToSQLContext.defaultToSQLContext(tableContext);
    }

    private static String formatWith(String strPattern, Object... parameters) {
        if (parameters.length == 0) {
            return strPattern;
        }
        String formattedSql = strPattern;
        for (Object parameter : parameters) {
            formattedSql = formattedSql.replaceFirst("\\?", Matcher.quoteReplacement(String.valueOf(parameter)));
        }
        return formattedSql;

    }

    private static final String LINE = System.lineSeparator();

    enum Oper {
        Add,
        Modify,
        Delete
    }

}
```

## DatabaseInterceptorCollector
数据库拦截器收集器,因为`eq`虽然提供了ioc但是仅支持接口和类的注入不支持集合泛型的直接注入,所以我们使用一个收集器将接口多实现进行收集后注入
```java
public class DatabaseInterceptorCollector {
    private final List<DatabaseInterceptor> databaseInterceptors;

    public DatabaseInterceptorCollector(List<DatabaseInterceptor> databaseInterceptors){
        this.databaseInterceptors = databaseInterceptors;
    }

    public List<DatabaseInterceptor> getDatabaseInterceptors() {
        return databaseInterceptors;
    }
}
```


## 自定义表达式执行器
```java

@Slf4j
public class MyEntityExpressionExecutor extends DefaultEntityExpressionExecutor {


    private final List<DatabaseInterceptor> interceptors;

    public MyEntityExpressionExecutor(DatabaseInterceptorCollector databaseInterceptorCollector, ExecutionContextFactory executionContextFactory) {
        super(executionContextFactory);
        this.interceptors = databaseInterceptorCollector.getDatabaseInterceptors();
    }

    @Override
    public <T> long insert(ExecutorContext executorContext, List<T> entities, EntityInsertExpressionBuilder expressionBuilder, boolean fillAutoIncrement) {
        long result = super.insert(executorContext, entities, expressionBuilder, fillAutoIncrement);
        Class<?> clazz = expressionBuilder.getQueryClass();
        for (DatabaseInterceptor interceptor : interceptors) {
            if (interceptor.apply(clazz)) {
                interceptor.insert(entities, expressionBuilder, executorContext);
            }
        }
        return result;
    }

    @Override
    public <T> long executeRows(ExecutorContext executorContext, EntityExpressionBuilder expressionBuilder, List<T> entities) {
        long result = super.executeRows(executorContext, expressionBuilder, entities);
        Class<?> clazz = expressionBuilder.getQueryClass();
        for (DatabaseInterceptor interceptor : interceptors) {
            if (!interceptor.apply(clazz)) {
                continue;
            }
            if (expressionBuilder instanceof EntityUpdateExpressionBuilder) {
                interceptor.update(entities, (EntityUpdateExpressionBuilder) expressionBuilder, executorContext);
            } else if (expressionBuilder instanceof EntityDeleteExpressionBuilder) {
                interceptor.delete(entities, (EntityDeleteExpressionBuilder) expressionBuilder, executorContext);
            }

        }
        return result;
    }
    @Override
    public long executeRows0(ExecutorContext executorContext, EntityPredicateExpressionBuilder entityPredicateExpressionBuilder, EntityPredicateSQLExpression entityPredicateSQLExpression) {
        long result = super.executeRows0(executorContext, entityPredicateExpressionBuilder, entityPredicateSQLExpression);
        Class<?> clazz = entityPredicateExpressionBuilder.getQueryClass();
        for (DatabaseInterceptor interceptor : interceptors) {
            if (interceptor.apply(clazz)) {
                interceptor.executeRows(entityPredicateSQLExpression, executorContext);
            }
        }
        return result;
    }

}

```

## EasyQueryStarterAutoConfiguration
配置springboot启动项，如果你是其他框架那么也是一样的自行使用框架提供的单接口多实现方式获取,可以暂时使用单个`DatabaseInterceptor`拦截器
```java

@Configuration
@EnableConfigurationProperties(EasyQueryProperties.class)
public class EasyQueryStarterAutoConfiguration {


    @Bean
    @Primary
    public StarterConfigurer starterConfigurer(Map<String, DatabaseInterceptor> databaseInterceptorMap) {
        List<DatabaseInterceptor> databaseInterceptors = databaseInterceptorMap.values().stream().sorted(Comparator.comparingInt(DatabaseInterceptor::sort)).collect(Collectors.toList());
        return new EasyQueryStarterConfigurer(new DatabaseInterceptorCollector(databaseInterceptors));
    }

    static class EasyQueryStarterConfigurer implements StarterConfigurer {
        private final DatabaseInterceptorCollector databaseInterceptorCollector;

        public EasyQueryStarterConfigurer(DatabaseInterceptorCollector databaseInterceptorCollector) {
            this.databaseInterceptorCollector = databaseInterceptorCollector;
        }

        @Override
        public void configure(ServiceCollection services) {
            services.addService(databaseInterceptorCollector);
            services.addService(EntityExpressionExecutor.class, MyEntityExpressionExecutor.class);
        }

    }
}
```
