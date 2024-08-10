---
title: 自定义异常
---

框架对于firstNotNull和singleNotNull抛出了系统自定义级别的异常,用户可以通过重写`AssertExceptionFactory`来实现抛出的异常是用户自定义的

```java

public interface AssertExceptionFactory {
    //当调用firstNotNull结果为null时抛出的异常
    @NotNull
    <T> RuntimeException createFirstNotNullException(Query<T> query, String msg, String code);
    //当调用singleNotNull结果为null时抛出的异常
    @NotNull
    <T> RuntimeException createSingleNotNullException(Query<T> query,String msg, String code);
    //当调用singleNotNull或者singleOrNull结果为大于1个时抛出的异常
    @NotNull
    <T> RuntimeException createSingleMoreElementException(Query<T> query);
}

```
