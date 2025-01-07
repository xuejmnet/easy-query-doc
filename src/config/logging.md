---
title: 日志配置
order: 5
---

# 打印sql日志
`easy-query`默认适配slf4j日志接口,如果您有自定义日志接口可以通过自行实现



::: code-tabs
@tab SpringBoot
```yml
logging:
  level:
    com.easy.query.core: debug
```
@tab 控制台
```java
LogFactory.useStdOutLogging();//框架默认System.out.println、System.err.println
```
:::

# 自定义日志
## springboot

```java

//新建一个日志打印的实现继承com.easy.query.core.logging.Log
public class MySysOutLogImpl implements Log {
    /**
     * 必须要实现一个构造函数,传入单个字符串string参数
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
        System.out.println("----开始----");
        System.err.println(s);
        e.printStackTrace(System.err);
        System.out.println("----结束----");
    }

    @Override
    public void error(String s) {
        System.out.println("----开始----");
        System.err.println(s);
        System.out.println("----结束----");
    }

    @Override
    public void debug(String s) {
        System.out.println("----开始----");
        System.out.println(s);
        System.out.println("----结束----");
    }

    @Override
    public void trace(String s) {
        System.out.println("----开始----");
        System.out.println(s);
        System.out.println("----结束----");
    }

    @Override
    public void warn(String s) {
        System.out.println("----开始----");
        System.out.println(s);
        System.out.println("----结束----");
    }
}


```



::: code-tabs
@tab SpringBoot配置
```yml

easy-query:
  enable: true
  name-conversion: underlined
  database: mysql
  #主要是这边需要配置日志
  log-class: com.easyquery.springbootdemo.logging.
  print-sql: true
  #entity映射到dto/vo使用属性匹配模式
  mapping-strategy: property_only
```
@tab 控制台配置
```java
LogFactory.useCustomLogging(MySysOutLogImpl.class);
```
:::


```log

----开始----
==> Preparing: SELECT t.`id`,t.`create_time`,t.`update_time`,t.`create_by`,t.`update_by`,t.`deleted`,t.`title`,t.`content`,t.`url`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`id` = ? LIMIT 1
----结束----
----开始----
==> Parameters: true(Boolean),123(String)
----结束----
----开始----
<== Time Elapsed: 12(ms)
----结束----
----开始----
<== Total: 0
----结束----
```