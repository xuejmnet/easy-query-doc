---
title: Audit Log
order: 160
---

Audit log is a type of log that helps users focus on understanding data changes and tracing data audits in the system. It is commonly used for recording sensitive information changes and data versions.

`eq` can implement audit logs by intercepting through the `EntityExpressionExecutor` interface and implementing expression execution yourself to achieve corresponding functions.

This chapter's [demo click](https://github.com/xuejmnet/eq-aduitlog)


This chapter uses source code 3.0.18+
## EntityExpressionExecutor
`EntityExpressionExecutor` is the corresponding interface for eq to execute expressions and native SQL


Method  | Description  
---  | --- 
query  | Expression query result (not used yet)
queryStreamResultSet  | Streaming result object return, used to return regular collections and single objects
querySQL  | Native SQL string query
querySQLStreamResultSet  | Native SQL string streaming result return
executeSQLRows  | Native SQL string execution
insert  | Object insert execution
executeRows  | Expression or object execution update or delete


## Description (Optional)
Define annotation to describe and parse related information. Of course, you can use eq's or swagger's
```java
@Target({ElementType.TYPE, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Description {
    String value();
}
```

## Utility Class
```java

public class EasyQueryUtils {

    /**
     * Get the primary key value of the entity
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
For extensibility, let's first define a `DatabaseInterceptor` interface
```java

public interface DatabaseInterceptor {

    /**
     * Interceptor order
     * @return
     */
    int sort();
    /**
     * Whether to accept the current interceptor
     */
    boolean apply(Class<?> entityClass);

    /**
     * Intercept after successful insert
     */
    <T> void insert(List<T> entities, EntityInsertExpressionBuilder expressionBuilder, ExecutorContext executorContext);

    /**
     * Intercept after successful update
     */
    <T> void update(List<T> entities, EntityUpdateExpressionBuilder expressionBuilder, ExecutorContext executorContext);

    /**
     * Intercept after successful delete
     */
    <T> void delete(List<T> entities, EntityDeleteExpressionBuilder expressionBuilder, ExecutorContext executorContext);

    /**
     * Intercept after successful expression update or delete execution
     */
    void executeRows(EntityPredicateSQLExpression entityPredicateSQLExpression, ExecutorContext executorContext);

}
```

## DatabaseLoggingInterceptor
Implement the interceptor. Users can choose to add or not add `logTimeListen`
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
        //Control yourself, for example, the class must satisfy a certain interface or annotation
        return true;
    }

    @Override
    public <T> void insert(List<T> entities, EntityInsertExpressionBuilder expressionBuilder, ExecutorContext executorContext) {
        logTimeListen(()->{
            addLog(entities, expressionBuilder, Oper.Add);
        },"Object insert intercept expression");
    }

    @Override
    public <T> void update(List<T> entities, EntityUpdateExpressionBuilder expressionBuilder, ExecutorContext executorContext) {
        logTimeListen(()->{
            addUpdateLog(entities, expressionBuilder);
        },"Object update intercept expression");
    }

    @Override
    public <T> void delete(List<T> entities, EntityDeleteExpressionBuilder expressionBuilder, ExecutorContext executorContext) {
        logTimeListen(()->{
            addLog(entities, expressionBuilder, Oper.Delete);
        },"Object delete intercept expression");
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
        },"Modify delete intercept expression");
    }

    /**
     * Optional listen warning
     * @param actionExpression
     * @param key
     */
    private void logTimeListen(SQLActionExpression actionExpression,String key){
        long start = System.currentTimeMillis();
        actionExpression.apply();
        long end = System.currentTimeMillis();
        long elapsed = end - start;
        if(elapsed>1000){
            log.error("Interceptor method {}, execution time too long, elapsed: {}ms",key,elapsed);
        }
    }

    private <T> void addUpdateLog(List<T> entities, EntityExpressionBuilder expressionBuilder) {
        QueryRuntimeContext runtimeContext = expressionBuilder.getRuntimeContext();
        EntityMetadata entityMetadata = runtimeContext.getEntityMetadataManager().getEntityMetadata(expressionBuilder.getQueryClass());
        String type = getTableName(entityMetadata) + " " + Oper.Modify;
        for (T entity : entities) {
            String detail = getLogDetail(entity, entityMetadata, runtimeContext);
            log(type, getKey(entity, entityMetadata), detail);
        }
    }

    private <T> void addLog(List<T> entities, EntityExpressionBuilder expressionBuilder, Oper oper) {
        EntityMetadata entityMetadata = expressionBuilder.getRuntimeContext().getEntityMetadataManager().getEntityMetadata(expressionBuilder.getQueryClass());
        String type = getTableName(entityMetadata) + " " + oper.name();
        for (T entity : entities) {
            String detail = getLogDetail(entity, entityMetadata);
            log(type, getKey(entity, entityMetadata), detail);
        }
    }

    private static String getLogDetail(Object entity, EntityMetadata entityMetadata) {
        Collection<ColumnMetadata> columns = entityMetadata.getColumns();
        StringBuilder sb = new StringBuilder();
        for (ColumnMetadata column : columns) {
            Object value = EasyBeanUtil.getCurrentPropertyValue(entity, column);
            if (value == null) {
                continue;
            }

            String comment = column.getComment();
            String display = getOrDefault(comment,column.getName());
            sb.append(display).append(":").append(value).append(LINE);
        }
        if (sb.length() > 0) {
            sb.deleteCharAt(sb.length() - 1);
        }
        return sb.toString();
    }
    private static String getOrDefault(String comment,String def){
        if(EasyStringUtil.isNotBlank(comment)){
            return comment;
        }
        return def;
    }

    private static String getLogDetail(Object entity, EntityMetadata entityMetadata, QueryRuntimeContext runtimeContext) {
        EntityMetadataManager entityMetadataManager = runtimeContext.getEntityMetadataManager();
         TrackContext currentTrackContext = runtimeContext.getTrackManager().getCurrentTrackContext();
        if(currentTrackContext==null){
            return getLogDetail(entity, entityMetadata);
        }
        EntityState entityState = currentTrackContext.getTrackEntityState(entity);
        if (entityState == null) {
            return getLogDetail(entity, entityMetadata);
        }
        StringBuilder sb = new StringBuilder();
        EntityTrackProperty entityTrackProperty = EasyTrackUtil.getTrackDiffProperty(entityMetadataManager, entityState);
        entityTrackProperty.getDiffProperties().forEach((name, state) -> {
            String comment = state.getColumnMetadata().getComment();
            String display = getOrDefault(comment,name);
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
        String comment = entityMetadata.getComment();
        return EasyStringUtil.isBlank(comment) ? entityMetadata.getTableName() : comment;
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
        EntityMetadata entityMetadata = expression.getTable(0).getEntityMetadata();
        ToSQLContext sqlContext = getToSQLContext(expression);
        String sql = expression.getSetColumns().toSQL(sqlContext);
        if (sqlContext.getParameters().isEmpty() || !StringUtils.hasText(sqlContext.getParameters().get(0).getPropertyNameOrNull())) {
            Object[] parameters = sqlContext.getParameters().stream().map(SQLParameter::getValue).toArray();
            return formatWith(sql, parameters);
        }
        StringBuilder sb = new StringBuilder();
        sqlContext.getParameters().forEach(parameter -> {
            String name = parameter.getPropertyNameOrNull();
            ColumnMetadata columnOrNull = entityMetadata.getColumnOrNull(name);
            String display = name;
            if(columnOrNull!=null){
                String comment = columnOrNull.getComment();
                display = getOrDefault(comment, name);
            }
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
Database interceptor collector. Because `eq` provides IoC but only supports injection of interfaces and classes, not direct injection of collection generics, we use a collector to collect multiple interface implementations and then inject them
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


## Custom Expression Executor
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
Configure spring-boot starter. If you are using other frameworks, it is the same. Use the framework's provided single interface multiple implementation method to obtain. You can temporarily use a single `DatabaseInterceptor` interceptor
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

