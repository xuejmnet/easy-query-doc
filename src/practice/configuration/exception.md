---
title: 自定义异常
order: 2
---

正常业务开发我们都会选择性的使用自定义异常然后全局拦截来作为业务中断的消息返回到前端。

## 异常

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

//正常业务我们会抛出业务异常

SysUser u=query(SysUser.class).whereById("123").singleOrNull();
if(u==null){
    throw new BusinessException("未找到对应的用户信息");
}
//下面这种方式也可以
SysUser u=query(SysUser.class).whereById("123").singleNotNull(()->new BusinessException("未找到对应的用户信息"));
```

## 进阶
因为上述代码存在很多冗余重复性的代码,所以我们对全局拦截器进行修改让其拦截`easy-query`的异常那么上述代码我们可以改成
```java
SysUser u=query(SysUser.class).whereById("123").singleNotNull("未找到对应的用户信息");
// 抛出 EasyQuerySignleNotNullException 
```

如果你大部分的时候不需要编写错误信息且大部分时候错误都是一样的情况下那么我建议这么来处理
```java
@EasyAssertMessage("未找到对应的用户信息")
public class SysUser{
    //省略.....
}
```
我们在用户表的实体上添加断言信息下面代码可以改成

```java
SysUser u=query(SysUser.class).whereById("123").singleNotNull();//如果不写自动抛出@EasyAssertMessage内容,也可以手动写入进行覆盖
// 抛出 EasyQuerySignleNotNullException 
```

## 高阶
前面我们通过拦截easy-query的异常来实现自定义响应那么有时候我们系统已经拦截了,我希望easy-query抛出我们自定义的异常怎么办

这边`easy-query`提供了接口`AssertExceptionFactory`我们只需要参考`DefaultAssertExceptionFactory`然后替换框架默认行为即可[可以点击这边查看](/easy-query-doc/config/replace-configure)
我们自定义实现类
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
        return new BusinessException("查询结果大于1条");
    }
}
```

## springboot替换
```java

//实现一个启动配置
public class MyStarterConfigurer implements StarterConfigurer {
    @Override
    public void configure(ServiceCollection services) {
        //addService如果不存在就添加存在就替换
        services.addService(AssertExceptionFactory.class, MyAssertExceptionFactory.class);//就会将默认的easy-query实例的异常断言接口进行替换
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

## 非springboot
```java

EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
        .setDefaultDataSource(dataSource)
        .optionConfigure(op -> {
            op.setPrintSql(true);
        })
        .useDatabaseConfigure(new MySQLDatabaseConfiguration())
        .replaceService(AssertExceptionFactory.class, MyAssertExceptionFactory.class);//就会将默认的easy-query实例的异常断言接口进行替换
        .build();
```