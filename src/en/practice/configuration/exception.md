---
title: Custom Exception
order: 20
---

In normal business development, we selectively use custom exceptions and then globally intercept them to return messages to the frontend as business interruptions.

## Exception

```java
public class BusinessException extends RuntimeException {
    private final String code;
    private final Object data;

    public BusinessException(String message) {
        this("-1",message);
    }

    public BusinessException(String code,String message) {
        this(code,message,null);
    }

    public BusinessException(String code,String message,Object data) {
        super(message);
        this.code=code;
        this.data=data;
    }

    public String getCode() {
        return code;
    }
    public Object getData() {
        return data;
    }
}

//In normal business, we would throw a business exception

SysUser u=query(SysUser.class).whereById("123").singleOrNull();
if(u==null){
    throw new BusinessException("User information not found");
}
//The following method also works
SysUser u=query(SysUser.class).whereById("123").singleNotNull(()->new BusinessException("User information not found"));
```

## Advanced
Because the above code has a lot of redundant code, we modify the global interceptor to intercept `easy-query` exceptions, so the above code can be changed to:
```java
SysUser u=query(SysUser.class).whereById("123").singleNotNull("User information not found");
// Throws EasyQuerySignleNotNullException 
```

If you don't need to write error messages most of the time and the errors are the same in most cases, then I suggest handling it this way:
```java
@EasyAssertMessage("User information not found")
public class SysUser{
    //omitted.....
}
```
We add assertion information on the user table entity, and the code below can be changed to:

```java
SysUser u=query(SysUser.class).whereById("123").singleNotNull();//If not written, it will automatically throw the content in @EasyAssertMessage. You can also manually write to override
// Throws EasyQuerySignleNotNullException 
```

## Expert
Previously, we intercepted easy-query exceptions to implement custom responses. Sometimes our system has already intercepted them, and we want easy-query to throw our custom exceptions. What should we do?

Here `easy-query` provides the interface `AssertExceptionFactory`. We just need to refer to `DefaultAssertExceptionFactory` and then replace the framework's default behavior [You can click here to view](/easy-query-doc/framework/replace-configure)
We customize the implementation class:
```java

public class MyAssertExceptionFactory implements AssertExceptionFactory {
    private final EntityMetadataManager entityMetadataManager;

    public MyAssertExceptionFactory(EntityMetadataManager entityMetadataManager) {

        this.entityMetadataManager = entityMetadataManager;
    }

    @Override
    public <T> RuntimeException createFindNotNullException(Query<T> query, String msg, String code) {
        if (msg == null && code == null) {
            EntityMetadata entityMetadata = entityMetadataManager.getEntityMetadata(query.queryClass());
            ErrorMessage errorMessage = entityMetadata.getErrorMessage();
            return new BusinessException(errorMessage.getNotNull());
        }
        return new BusinessException(code,msg);
    }

    @Override
    public <T> RuntimeException createRequiredException(Query<T> query, String msg, String code) {
        if (msg == null && code == null) {
            EntityMetadata entityMetadata = entityMetadataManager.getEntityMetadata(query.queryClass());
            ErrorMessage errorMessage = entityMetadata.getErrorMessage();
            return new BusinessException(errorMessage.getNotNull());
        }
        return new BusinessException(code,msg);
    }

    @Override
    public <T> RuntimeException createFirstNotNullException(Query<T> query, String msg, String code) {
        if (msg == null && code == null) {
            EntityMetadata entityMetadata = entityMetadataManager.getEntityMetadata(query.queryClass());
            ErrorMessage errorMessage = entityMetadata.getErrorMessage();
            return new BusinessException(errorMessage.getNotNull());
        }
        return new BusinessException(code,msg);
    }

    @Override
    public <T> RuntimeException createSingleNotNullException(Query<T> query, String msg, String code) {
        if (msg == null && code == null) {
            EntityMetadata entityMetadata = entityMetadataManager.getEntityMetadata(query.queryClass());
            ErrorMessage errorMessage = entityMetadata.getErrorMessage();
            return new BusinessException(errorMessage.getNotNull());
        }
        return new BusinessException(code,msg);
    }

    @Override
    public <T> RuntimeException createSingleMoreElementException(Query<T> query) {
        return new BusinessException("Query result is greater than 1 row");
    }
    
    @Override
    @NotNull
    public RuntimeException createExecuteCurrentException(long expectRows,long realRows, String msg, String code) {
        return new EasyQueryConcurrentException(msg, code);
    }
}
```

## Spring Boot Replacement
```java

//Implement a startup configurer
public class MyStarterConfigurer implements StarterConfigurer {
    @Override
    public void configure(ServiceCollection services) {
        //addService adds if it doesn't exist, replaces if it exists
        services.addService(AssertExceptionFactory.class, MyAssertExceptionFactory.class);//This will replace the default easy-query instance's assertion exception interface
    }
}

@Configuration
public class MyConfiguration {
    @Bean("MyStarterConfigurer")
    @Primary
    public StarterConfigurer starterConfigurer(){
        return new MyStarterConfigurer();
    }
}
```

## Non-Spring Boot
```java

EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
        .setDefaultDataSource(dataSource)
        .optionConfigure(op -> {
            op.setPrintSql(true);
        })
        .useDatabaseConfigure(new MySQLDatabaseConfiguration())
        .replaceService(AssertExceptionFactory.class, MyAssertExceptionFactory.class);//This will replace the default easy-query instance's assertion exception interface
        .build();
```

