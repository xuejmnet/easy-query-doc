---
title: DML操作
---
## DML操作

### 插入

#### 插入对象

插入时，调用`insertable`方法时，必须要再调用`executeRows`方法，传入`true`代表将为插入的对象设置生成的id值。

```java
    @Test
    public void testInsert() {
        User user = new User();
        user.setName("新用户");
        user.setCreateTime(new Date());
        //插入，参数可以是单个对象或对象集合
        long rows = easyEntityQuery.insertable(user).executeRows(true);
        Assertions.assertTrue(rows > 0);
        Assertions.assertNotNull(user.getId());
    }

```

#### 插入策略

Easy Query默认采用`SQLExecuteStrategyEnum.ONLY_NOT_NULL_COLUMNS`策略进行插入，也就是默认只插入有值的列，可以使用`setSQLStrategy`方法设置执行策略，设置`SQLExecuteStrategyEnum.ALL_COLUMNS`可以插入全部列。

```java
    @Test
    public void testInsertAllColumns() {
        User user = new User();
        user.setName("新用户");
        user.setCreateTime(new Date());
        long rows = easyEntityQuery.insertable(user).setSQLStrategy(SQLExecuteStrategyEnum.ALL_COLUMNS).executeRows(true);
        Assertions.assertTrue(rows > 0);
        Assertions.assertNotNull(user.getId());
    }
```

#### 插入Map

Easy Query也支持插入Map对象，注意，key是列名，不是实体类的属性名，同时，不支持主键回填。

```java
    @Test
    public void testInsertMap() {
        Map<String, Object> userMap = new LinkedHashMap<>();
        userMap.put("name", "小明");
        userMap.put("create_time", new Date());
        userMap.put("enabled", true);
        long rows = easyEntityQuery.mapInsertable(userMap) .asTable("user").executeRows(true);
        Assertions.assertTrue(rows > 0);
        Assertions.assertNull(userMap.get("id"));
    }
```

### 更新

#### 更新对象

更新时，调用`updatable`方法时，必须要再调用`executeRows`方法。

```java
    @Test
    public void testUpdate() {
        User user = easyEntityQuery.queryable(User.class).findNotNull(1);
        DateTime updateTime = new DateTime();
        user.setUpdateTime(updateTime);
        //更新，参数可以是单个对象或对象集合
        easyEntityQuery.updatable(user).executeRows();
        //更新
        long rows = easyEntityQuery.updatable(user).executeRows();
        Assertions.assertTrue(rows > 0);
    }
```

#### 更新策略

Easy Query默认采用`SQLExecuteStrategyEnum.ONLY_NOT_NULL_COLUMNS`策略进行更新，也就是默认只更新有值的列，可以使用`setSQLStrategy`方法设置执行策略，设置`SQLExecuteStrategyEnum.ALL_COLUMNS`可以更新全部列。

```java
    @Test
    public void testUpdateAll() {
        User user = easyEntityQuery.queryable(User.class).findNotNull(1);
        DateTime updateTime = new DateTime();
        user.setUpdateTime(updateTime);
        //更新，默认只更新有值的列，设置SQLExecuteStrategyEnum.ALL_COLUMNS可以更新全部列
        long rows = easyEntityQuery.updatable(user).setSQLStrategy(SQLExecuteStrategyEnum.ALL_COLUMNS).executeRows();
        Assertions.assertTrue(rows > 0);
        Assertions.assertNotNull(user.getId());
    }
```

#### 更新指定列

```java
    @Test
    public void testUpdateCustomColumn() {
        User user = easyEntityQuery.queryable(User.class).findNotNull(1);
        DateTime updateTime = new DateTime();
        user.setUpdateTime(updateTime);
        //更新指定列
        updateTime.offset(DateField.SECOND, 1);
        long rows = easyEntityQuery.updatable(user)
                .setColumns(o -> o.updateTime())//多个字段使用FETCHER.setColumns(o->o.FETCHER.name().updateTime())
                .whereColumns(o -> o.id())//多个字段使用FETCHER.whereColumns(o->o.FETCHER.id().name())
                .executeRows();
        Assertions.assertTrue(rows > 0);

        //更新指定列
        updateTime.offset(DateField.SECOND, 1);
        rows = easyEntityQuery.updatable(User.class)
                .setColumns(o -> {
                    o.updateTime().set(updateTime);
                })
                .where(o -> o.id().eq(user.getId()))
                .executeRows();
        Assertions.assertTrue(rows > 0);

        //更新指定列并断言
        updateTime.offset(DateField.SECOND, 1);
        easyEntityQuery.updatable(User.class)
                .setColumns(o -> {
                    o.updateTime().set(updateTime);
                })
                .where(o -> o.id().eq(user.getId()))
                .executeRows(1, "更新失败");
        //断受影响行数，如果不匹配则会抛异常,如果当前操作不在事务内执行那么会自动开启事务!!!会自动开启事务!!!会自动开启事务!!!来实现并发更新控制,因此当前的更新操作将失效
    }

```

#### 更新类型转换的列

Easy Query支持更新的值类型转换。

```java
    @Test
    public void testUpdateColumnType() {
        //自动转换类型
       long rows = easyEntityQuery.updatable(User.class)
                .setColumns(o -> {
                    o.name().set(o.id().toStr());
                    //toStr和.setPropertyType(String.class)效果是一样的
                    o.name().set(o.id().setPropertyType(String.class));
                })
                .whereById("1")
                .executeRows();
        Assertions.assertTrue(rows > 0);
    }
```

### 更新自增值

Easy Query支持调用`increment`方法自增值， 默认自增1，可以传入指定的参数值进行自增，另外可以使用`decrement`方法自减。

```java
    @Test
    public void testUpdateIncrement() {
        User user = easyEntityQuery.queryable(User.class).findNotNull(1);
                .setColumns(o -> {
                    o.version().increment();
                })
                .where(o -> o.id().eq(user.getId()))
                .executeRows();
        Assertions.assertTrue(rows > 0);
    }

```

#### 差异更新

Easy Query支持差异更新，它可以监听被追踪的对象,并且生成差异更新语句,而不是无脑的对对象进行全字段更新,使用时需要开启当前追踪环境并且对查询出来的结果进行追踪后续即可监听到变更列实现差异化update语句

正常情况下如果用户想使用差异更新,那么需要对查询采用`asTracking`来让返回结果被追踪,或者调用`easyQuery.addTracking`来让需要更新的对象被追踪

首先，需要全局配置`default-track`为true时，差异更新才会生效。

开启差异更新后，在查询时可以使用`asTracking`来追踪查询处理的对象。

```java

    @Test
    public void testUpdateTrack() {
        TrackManager trackManager = easyEntityQuery.getRuntimeContext().getTrackManager();
        try {
            trackManager.begin();
            User user = new User();
            user.setName("新用户");
            user.setCreateTime(new Date());
            user.setVersion(1);
            easyEntityQuery.insertable(user).executeRows(true);

            User existUser = easyEntityQuery.queryable(User.class).asTracking().findNotNull(user.getId());
            existUser.setVersion(existUser.getVersion() + 1);
            easyEntityQuery.updatable(existUser).executeRows();
        } finally {
            trackManager.release();
        }

    }


```

前面追踪的是查询结果，Easy Query提供了`addTracking`方法，可以用于追踪指定的对象，比如当查询出来的数据过多时，可以只追踪某条数据。

```java
    @Test
    public void testUpdateTrackControl() {
        TrackManager trackManager = easyEntityQuery.getRuntimeContext().getTrackManager();
        try {
            trackManager.begin();
            User user = new User();
            user.setName("新用户");
            user.setCreateTime(new Date());
            user.setVersion(1);
            easyEntityQuery.insertable(user).executeRows(true);

            User existUser = easyEntityQuery.queryable(User.class).findNotNull(user.getId());
            //如果数据量多，可以只追踪一条
            easyEntityQuery.addTracking(existUser);
            existUser.setVersion(existUser.getVersion() + 1);
            easyEntityQuery.updatable(existUser).executeRows();
        } finally {
            trackManager.release();
        }
    }
```

在SpringBoot环境下，Easy Query支持使用`@EasyQueryTrack`进行简化操作，就像开启事务那样。

```java
    @EasyQueryTrack
    public void testUpdateTrackControl() {
        trackManager.begin();
        User user = new User();
        user.setName("新用户");
        user.setCreateTime(new Date());
        user.setVersion(1);
        easyEntityQuery.insertable(user).executeRows(true);

        User existUser = easyEntityQuery.queryable(User.class).findNotNull(user.getId());
        //如果数据量多，可以只追踪一条
        easyEntityQuery.addTracking(existUser);
        existUser.setVersion(existUser.getVersion() + 1);
        easyEntityQuery.updatable(existUser).executeRows();
    }
```

#### 更新Map

Easy Query也支持更新Map对象，注意，key是列名，不是实体类的属性名。

```java
    @Test
    public void testUpdateMap() {
        Map<String, Object> userMap = new LinkedHashMap<>();
        userMap.put("id", 1);
        userMap.put("update_time", new Date());
        long rows = easyEntityQuery.mapUpdatable(userMap)
                .asTable("user")
                .setSQLStrategy(SQLExecuteStrategyEnum.ONLY_NOT_NULL_COLUMNS)
                .whereColumns("id")
                .executeRows();
        Assertions.assertTrue(rows > 0);
    }
```

#### 更新自定义sql

```java
    @Test
    public void testUpdateCustomSQL() {
        long rows = easyEntityQuery.updatable(User.class)
                .setColumns(o -> {
                    o.version().setSQL("ifnull({0},0)+{1}", (context) -> {
                        context.expression(o.version())
                                .value(1);
                    });
                })
                .where(o -> o.id().eq(1))
                .executeRows();
        Assertions.assertTrue(rows > 0);
    }
```

### 删除

#### 逻辑删除

Easy Query支持物理删除和逻辑删除，默认情况下使用逻辑删除。

要使用逻辑删除，需要声明字段，例如：

```java
@LogicDelete(strategy = LogicDeleteStrategyEnum.BOOLEAN)
private Boolean deleted;
```

调用`deletable`方法将会修改`deleted`为`true`，因此如果不声明字段，那么将会抛出异常。

```java
    @Test
    public void testLogicDelete() {
        //默认情况下，EasyQuery使用逻辑删除
        Company company = new Company();
        company.setName("新公司");
        company.setDeleted(false);
        easyEntityQuery.insertable(company).executeRows(true);
        long rows = easyEntityQuery.deletable(Company.class)
                .where(c -> c.name().eq("新公司"))
                .executeRows();
        Assertions.assertTrue(rows > 0);

        //根据对象id删除
        company = new Company();
        company.setName("新公司");
        company.setDeleted(false);
        easyEntityQuery.insertable(company).executeRows(true);
        rows = easyEntityQuery.deletable(company).executeRows();
        Assertions.assertTrue(rows > 0);
    }
```

注意`deleted`不能为`null`，因为查询时不会判断null

#### 物理删除

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

#### 禁用部分逻辑删除

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

#### 自定义逻辑删除策略

Easy Query除了支持简单的逻辑删除字段，还支持自定义逻辑删除策略

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

在类中声明策略：
```java
@EntityProxy
@Table
@Data
public class Product implements ProxyEntityAvailable<Product, ProductProxy> {
    @Column(primaryKey = true, generatedKey = true)
    Integer id;

    String name;

    @LogicDelete(strategy = LogicDeleteStrategyEnum.CUSTOM, strategyName = "MyLogicDelStrategy")
    LocalDateTime deletedTime;

    Integer deletedUserId;
}
```

自定义策略：
```java
public class CustomLogicDelStrategy extends AbstractLogicDeleteStrategy {
    @Override
    protected SQLExpression1<WherePredicate<Object>> getPredicateFilterExpression(LogicDeleteBuilder builder, String propertyName) {
        return o -> o.isNull(propertyName);
    }

    @Override
    protected SQLExpression1<ColumnSetter<Object>> getDeletedSQLExpression(LogicDeleteBuilder builder, String propertyName) {
        return o -> o.set(propertyName, LocalDateTime.now())
                .set("deletedUserId", 1);
    }

    @Override
    public String getStrategy() {
        return "CustomLogicDelStrategy";
    }

    @Override
    public Set<Class<?>> allowedPropertyTypes() {
        return new HashSet<>(Arrays.asList(LocalDateTime.class));
    }
}
```
注意，调用多次使用了`CustomLogicDelStrategy`的删除方法时，只会调用一次`CustomLogicDelStrategy`实例的接口方法，


注册策略：
```java
        QueryRuntimeContext runtimeContext = easyEntityQuery.getRuntimeContext();
        QueryConfiguration queryConfiguration = runtimeContext.getQueryConfiguration();
        queryConfiguration.applyLogicDeleteStrategy(new CustomLogicDelStrategy());
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

### 更新或插入

Easy Query提供了`conflictThen`方法，它用于插入或更新操作

`conflictThen`方法的第一个参数指定需要更新的列，第二个参数指定需要判断的列，支持多列(mysql不支持指定所以设置了也无效)，如果这些列对应的值已存在，那么执行更新操作，否则执行插入操作，插入的是全部列。

下面将测试已存在匹配项，Easy Query进行更新的情况。

```java
    @Test
    public void testOnConflictThenUpdate() {
        //根据id字段判断是否存在匹配项，此处存在，更新全部列
        User user = easyEntityQuery.queryable(User.class).findNotNull(1);
        Date updateTime = new Date();
        user.setUpdateTime(updateTime);
        long rows = easyEntityQuery.insertable(user)
                .onConflictThen(o -> o.FETCHER.allFields())
                .executeRows();
        Assertions.assertTrue(rows > 0);

        //根据id字段判断是否存在匹配项，此处存在，更新指定列
        user = easyEntityQuery.queryable(User.class).findNotNull(1);
        updateTime = new Date();
        user.setUpdateTime(updateTime);
        rows = easyEntityQuery.insertable(user)
                .onConflictThen(o -> o.FETCHER.updateTime())
                .executeRows();
        Assertions.assertTrue(rows > 0);
    }
```

下面将测试不存在匹配项，Easy Query进行插入的情况。

```java
    @Test
    public void testOnConflictThenInsert() {
        //根据id字段判断是否存在匹配项，此处不存在，插入全部列
        User user = new User();
        Date createTime = new Date();
        user.setName("新用户");
        user.setCreateTime(createTime);
        user.setVersion(1);
        user.setEnabled(true);
        long rows = easyEntityQuery.insertable(user)
                //mysql不支持使用多列进行判断是否存在匹配项
                .onConflictThen(null, o -> o.FETCHER.id())
                .executeRows();
        Assertions.assertTrue(rows > 0);
    }
```

### 事务

Easy Query默认提供手动开启事务的功能,并且在springboot下可以跨非代理方法生效,唯一限制就是当前线程内的

事务相关方法如下：

| 方法                                                      | 默认值 | 描述                                                         |
| --------------------------------------------------------- | ------ | ------------------------------------------------------------ |
| beginTransaction                                          | null   | 参数表示数据库隔离级别,默认采用`datasource`的可以自定义 Connection.TRANSACTION_READ_UNCOMMITTED,Connection.TRANSACTION_READ_COMMITTED,Connection.TRANSACTION_REPEATABLE_READ,* Connection.TRANSACTION_SERIALIZABLE. |
| Transaction.commit                                        |        | 提交事务                                                     |
| Transaction.rollback                                      |        | 回滚事务                                                     |
| registerListener(TransactionListener transactionBehavior) |        | 设置当前事务的执行行为,包括提交前提交后等处理                |
| close                                                     |        | 关闭事务,如果事务未提交则自动调用回滚                        |

#### 简单环境

使用Easy Query开启事务，如下：

```java

    @Test
    public void testTransaction() {
        try (Transaction transaction = easyEntityQuery.beginTransaction()) {
            User user = new User();
            user.setName("新用户");
            user.setVersion(1);
            user.setEnabled(true);
            easyEntityQuery.insertable(user).executeRows();
            easyEntityQuery.insertable(user).executeRows();
            if (true) {
                throw new RuntimeException("模拟异常");
            }
            transaction.commit();
        }
    }
```

#### SpringBoot环境

Easy Query支持Spring事务注解，因此不用调用`beginTransaction`方法开启事务了

```java

    @Transaction
    public void testTransaction() {
        User user = new User();
        user.setName("新用户");
        user.setVersion(1);
        user.setEnabled(true);
        easyEntityQuery.insertable(user).executeRows();
        easyEntityQuery.insertable(user).executeRows();
        if (true) {
            throw new RuntimeException("模拟异常");
        }
    }
```
