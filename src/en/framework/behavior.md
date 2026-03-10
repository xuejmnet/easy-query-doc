---
title: Behavior
order: 110
---

# Behavior
These are configurations defined by `eq`. Usually, we add behaviors via `.configure(s -> s.getBehavior().add(EasyBehaviorEnum.SMART_PREDICATE))`. Sometimes we want certain behaviors to be added to expressions by default, so we need to customize the initialization behavior. The `eq 3.1.90+` version adds the `ContextBehaviorFactory` interface abstraction.

## ContextBehaviorFactory
The default implementation is `DefaultContextBehaviorFactory`.
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
Users can define their own initialization behavior if needed.

## EasyBehavior
The default behaviors are as follows:
`EasyBehaviorEnum.LOGIC_DELETE.getCode() | EasyBehaviorEnum.USE_INTERCEPTOR.getCode() | EasyBehaviorEnum.JDBC_LISTEN.getCode()`
- Enable logic delete
- Enable interceptors
- Enable JDBC listeners
