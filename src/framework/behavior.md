---
title: 行为
order: 110
---

# 行为
是`eq`定义的一些配置，通常我们通过`.configure(s -> s.getBehavior().add(EasyBehaviorEnum.SMART_PREDICATE))`,有时候我们希望默认表达式就添加该行为所以需要自定义初始化行为,`eq 3.1.90+`版本添加`ContextBehaviorFactory`接口抽象

## ContextBehaviorFactory
默认实现为`DefaultContextBehaviorFactory`
```java
public class DefaultContextBehaviorFactory implements ContextBehaviorFactory{
    @Override
    public EasyBehavior create() {
        EasyBehavior easyBehavior = new EasyBehavior();
        easyBehavior.addBehavior(EasyBehaviorEnum.USE_TRACKING);
        return easyBehavior;
    }
}

```
如果用户需要可以自行定义初始化行为

## EasyBehavior
默认行为如下
`EasyBehaviorEnum.LOGIC_DELETE.getCode() | EasyBehaviorEnum.USE_INTERCEPTOR.getCode() | EasyBehaviorEnum.JDBC_LISTEN.getCode()`
- 启用逻辑删除
- 启用拦截器
- 启用jdbc监听