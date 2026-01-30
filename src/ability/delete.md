---
title: 删除
order: 40
---


## 逻辑删除

Easy Query支持物理删除和逻辑删除，默认情况下使用逻辑删除。

要使用逻辑删除，需要声明字段，例如：

```java
@LogicDelete(strategy = LogicDeleteStrategyEnum.BOOLEAN)
private Boolean deleted;
```

调用`deletable`方法将会修改`deleted`为`true`，因此如果不声明字段，那么将会抛出异常。

```java
    @Test
    public void testLogicDelete1() {
        //默认情况下，EasyQuery使用逻辑删除 自增id
        Company company = new Company();
        company.setName("新公司");
        company.setDeleted(false);
        easyEntityQuery.insertable(company).executeRows(true);//回填自增id
        long rows = easyEntityQuery.deletable(Company.class)
                .where(c -> c.name().eq("新公司"))
                .executeRows();
        Assertions.assertTrue(rows > 0);
    }
    @Test
    public void testLogicDelete1() {
        //默认情况下，EasyQuery使用逻辑删除 自增id
        Company company = new Company();
        company.setName("新公司");
        company.setDeleted(false);
        easyEntityQuery.insertable(company).executeRows(true);//回填自增id
        //根据对象id删除
        rows = easyEntityQuery.deletable(company).executeRows();
        Assertions.assertTrue(rows > 0);
    }
```

如果`deleted`在数据库有默认值那么可以不设置,这样`insertable`就不会将`deleted`字段加入sql中数据库会使用默认值

## 物理删除

Easy Query也支持物理删除，需要在全局配置或者当前方法配置允许执行DELETE语句，否则执行DELETE将会抛出异常。

通过调用`disableLogicDelete`方法可以禁用逻辑删除

```java
    @Test
    public void testDelete() {
        Company company = new Company();
        company.setName("新公司");
        easyEntityQuery.insertable(company).executeRows(true);
        long rows = easyEntityQuery.deletable(company)
                .disableLogicDelete()//禁用逻辑删除,使用物理删除 生成delete语句
                .allowDeleteStatement(true)//如果不允许物理删除那么设置允许 配置项delete-throw
                .executeRows();
        Assertions.assertTrue(rows > 0);

        Assertions.assertThrows(EasyQueryInvalidOperationException.class, () -> {
            easyEntityQuery.deletable(company).disableLogicDelete().allowDeleteStatement(false).executeRows();
        });
    }
```

## 禁用部分逻辑删除

Easy Query支持查询时移除部分表的逻辑删除条件。
```java
    @Test
    public void testQueryDisableLogicDelete() {
        //删除所有公司
        easyEntityQuery.deletable(Company.class).where(c -> c.id().isNotNull()).executeRows();
        //查询用户关联未删除的公司
        List<UserVo> userVos = easyEntityQuery.queryable(User.class)
                .leftJoin(Company.class, (u, c) -> u.companyId().eq(c.id()))
                .select(UserVo.class, (u, c) -> Select.of(
                        c.name().as(UserVo::getCompanyName)
                ))
                .toList();
        for (UserVo userVo : userVos) {
            Assertions.assertNull(userVo.getCompanyName());
        }

        //部分禁用逻辑删除，查询用户关联全部公司
        userVos = easyEntityQuery.queryable(User.class)
                .leftJoin(Company.class, (u, c) -> u.companyId().eq(c.id()))
                .tableLogicDelete(() -> false)
                .select(UserVo.class, (u, c) -> Select.of(
                        c.name().as(UserVo::getCompanyName)
                ))
                .toList();
        for (UserVo userVo : userVos) {
            Assertions.assertNotNull(userVo.getCompanyName());
        }
        //查询全部数据，包括已删除的
        List<Company> companyList = easyEntityQuery.queryable(Company.class).disableLogicDelete().toList();
        for (Company company : companyList) {
            company.setDeleted(false);
        }
        //恢复全部数据，包括已删除的
        long size = easyEntityQuery.updatable(companyList).disableLogicDelete().executeRows();
        Assertions.assertEquals(companyList.size(), size);
    }
```

## 自定义逻辑删除策略

Easy Query除了支持简单的逻辑删除字段，还支持自定义逻辑删除策略。

自定义逻辑删除策略：
```java
public class CustomLogicDelStrategy extends AbstractLogicDeleteStrategy {
    @Override
    protected SQLActionExpression1<WherePredicate<Object>> getPredicateFilterExpression(LogicDeleteBuilder builder, String propertyName) {
        return o -> o.isNull(propertyName);
    }

    @Override
    protected SQLActionExpression1<ColumnSetter<Object>> getDeletedSQLExpression(LogicDeleteBuilder builder, String propertyName) {
        return o -> o.set(propertyName, LocalDateTime.now())
                .set("deletedUserId", 1);
    }

    @Override
    public String getStrategy() {
        return "CustomLogicDelStrategy";
    }
}
```

::: danger 注意
我们在调用多次使用了`CustomLogicDelStrategy`的删除方法时，Easy Query只会调用一次`CustomLogicDelStrategy`实例的接口方法，错误示例：
```java
    @Override
    protected SQLActionExpression1<ColumnSetter<Object>> getDeletedSQLExpression(LogicDeleteBuilder builder, String propertyName) {
        //`getDeletedSQLExpression`方法只调用一次，返回的方法将会调用多次，因此now值获取后将是固定值而不是动态值
        LocalDateTime now = LocalDateTime.now();
        return o -> o.set(propertyName, now)
                .set("deletedUserId", 1);
    }
```
::: 

注册逻辑删除策略：
```java
        QueryRuntimeContext runtimeContext = easyEntityQuery.getRuntimeContext();
        QueryConfiguration queryConfiguration = runtimeContext.getQueryConfiguration();
        queryConfiguration.applyLogicDeleteStrategy(new CustomLogicDelStrategy());
```

执行SQL如下：
```sql
-- 删除商品表
DROP TABLE IF EXISTS product CASCADE;

-- 创建商品表
CREATE TABLE product (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    deleted_time DATETIME,
    deleted_user_id INTEGER
);
```

在类中使用逻辑删除策略：
```java
@EntityProxy
@Table
@Data
public class Product implements ProxyEntityAvailable<Product, ProductProxy> {
    @Column(primaryKey = true, generatedKey = true)
    Integer id;

    String name;

    //注意strategyName为自定义逻辑删除的getStrategy返回的字符串,如果使用自定义逻辑删除必须将strategy策略改为LogicDeleteStrategyEnum.CUSTOM
    @LogicDelete(strategy = LogicDeleteStrategyEnum.CUSTOM, strategyName = "CustomLogicDelStrategy")
    LocalDateTime deletedTime;

    Integer deletedUserId;
}
```

```java
    @Test
    public void testCustomLogicDelete() {
        Product product = new Product();
        product.setName("香蕉");
        easyEntityQuery.insertable(product).executeRows(true);
        easyEntityQuery.deletable(product).executeRows();
        easyEntityQuery.deletable(product).executeRows();
    }
```