---
title: Logging Configuration
order: 50
---

# Printing SQL Logs
`easy-query` defaults to adapting the SLF4J logging interface. If you have a custom logging interface, you can implement it yourself



::: code-tabs
@tab SpringBoot
```yml
logging:
  level:
    com.easy.query.core: debug
```
@tab Console
```java
LogFactory.useStdOutLogging();//Framework defaults to System.out.println、System.err.println
```
:::

# Custom Logging
## springboot

```java

//Create a logging print implementation that inherits from com.easy.query.core.logging.Log
public class MySysOutLogImpl implements Log {
    /**
     * Must implement a constructor that takes a single string parameter
     * @param clazz
     */
    public MySysOutLogImpl(String clazz){
        
    }
    @Override
    public boolean isDebugEnabled() {
        return true;
    }

    @Override
    public boolean isTraceEnabled() {
        return true;
    }

    @Override
    public void error(String s, Throwable e) {
        System.out.println("----Start----");
        System.err.println(s);
        e.printStackTrace(System.err);
        System.out.println("----End----");
    }

    @Override
    public void error(String s) {
        System.out.println("----Start----");
        System.err.println(s);
        System.out.println("----End----");
    }

    @Override
    public void debug(String s) {
        System.out.println("----Start----");
        System.out.println(s);
        System.out.println("----End----");
    }

    @Override
    public void trace(String s) {
        System.out.println("----Start----");
        System.out.println(s);
        System.out.println("----End----");
    }

    @Override
    public void warn(String s) {
        System.out.println("----Start----");
        System.out.println(s);
        System.out.println("----End----");
    }
}


```



::: code-tabs
@tab SpringBoot Configuration
```yml

easy-query:
  enable: true
  name-conversion: underlined
  database: mysql
  #Mainly need to configure logging here
  log-class: com.easyquery.springbootdemo.logging.MySysOutLogImpl
  print-sql: true
```
@tab Console
```java
EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .optionConfigure(op -> {
                    op.setPrintSql(true);
                    op.setLogClass(MySysOutLogImpl.class);
                })
                .useDatabaseConfigure(new MySQLDatabaseConfiguration())
                .build();
```
:::

