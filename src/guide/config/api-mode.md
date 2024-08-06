---
title: api模式❗️❗️❗️
---

## 五种模式
`easy-query`提供了四种模式的api查询 (`lambda表达式树`由社区用户开发，作者并不负责相关bug处理)
- `对象`模式
- `属性`模式
- `lambda`模式
- `lambda表达式树`模式（新）


api  | 开发方便性                                | 可维护性 | 性能| 缺点
--- |--------------------------------------| ---  | --- | --- 
对象 | 非常好配合插件几乎无敌流畅                        | 易维护 | 非常好 | 配合插件能非常流畅,使用apt来生成除了build也很流畅
属性 | 一般主要没有智能提示                           | 难维护 | 非常好 | 难维护,重构无法找到属性对应的引用
lambda | 非常好无需插件配合就有完善的智能提示,书写一般Class::Method | 易维护 | 较好 | 解析表达式性能会稍稍低于`属性模式`和`代理模式`,需要将`lambda转成属性`
lambda表达式树（新） | 使用纯lambda表达式，可与宇宙最强orm efcore匹敌      | 易维护 | 较好 | 暂不支持分库分表注解 (由社区成员开发,不建议上生产环境)

## 单表查询

::: code-tabs
@tab 对象模式
```java


// 创建一个可查询SysUser的表达式
EntityQueryable<SysUserProxy, SysUser> queryable = entityQuery.queryable(SysUser.class);

//单个条件链式查询
//toList表示查询结果集
List<SysUser> sysUsers = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq( "123xxx"))
        .toList();



//条件= 和 like 组合 中间默认是and连接符
List<SysUser> sysUsers =entityQuery.queryable(SysUser.class)
        .where(o ->{
                o.id().eq("123xxx");
                o.idCard().like("123")
        }).toList();//toList表示查询结果集


//多个where之间也是用and链接和上述方法一个意思 条件= 和 like 组合 中间默认是and连接符
List<SysUser> sysUsers = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq("123xxx"))
        .where(o -> o.idCard().like("123")).toList();


//返回单个对象没有查询到就返回null
SysUser sysUser1 = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq("123xxx"))
        .where(o -> o.idCard().like( "123")).firstOrNull();


//采用创建时间倒序和id正序查询返回第一个
SysUser sysUser1 = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq"123xxx"))
        .where(o -> o.idCard().like("123"))
        .orderBy(o->o.createTime().desc())
        .orderBy(o->o.id().asc()).firstOrNull();

//仅查询id和createTime两列
SysUser sysUser1 = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq("123xxx"))
        .where(o -> o.idCard().like("123"))
        .orderBy(o->o.createTime().desc())
        .orderBy(o->o.id().asc())
        .select(o->new SysUserProxy()
                .selectExpressions(o.id(),o.createTime())
        )
        .firstOrNull();
        
```
@tab lambda模式
```java
// 创建一个可查询SysUser的表达式
Queryable<SysUser> queryable = easyQuery.queryable(SysUser.class);

//单个条件链式查询
//toList表示查询结果集 
List<SysUser> sysUsers = easyQuery.queryable(SysUser.class)
                .where(o -> o.eq(SysUser::getId, "123xxx"))
                .toList();

//条件= 和 like 组合 中间默认是and连接符
List<SysUser> sysUsers = easyQuery.queryable(SysUser.class)
        .where(o -> o
                .eq(SysUser::getId, "123xxx")
                .like(SysUser::getIdCard,"123")
        ).toList();//toList表示查询结果集 


//多个where之间也是用and链接和上述方法一个意思 条件= 和 like 组合 中间默认是and连接符
List<SysUser> sysUsers = easyQuery.queryable(SysUser.class)
        .where(o -> o.eq(SysUser::getId, "123xxx"))
        .where(o -> o.like(SysUser::getIdCard,"123")).toList();


//返回单个对象没有查询到就返回null
SysUser sysUser1 = easyQuery.queryable(SysUser.class)
        .where(o -> o.eq(SysUser::getId, "123xxx"))
        .where(o -> o.like(SysUser::getIdCard, "123")).firstOrNull();


//采用创建时间倒序和id正序查询返回第一个
SysUser sysUser1 = easyQuery.queryable(SysUser.class)
        .where(o -> o.eq(SysUser::getId, "123xxx"))
        .where(o -> o.like(SysUser::getIdCard, "123"))
        .orderByDesc(o->o.column(SysUser::getCreateTime))
        .orderByAsc(o->o.column(SysUser::getId)).firstOrNull();


//仅查询id和createTime两列
SysUser sysUser1 = easyQuery.queryable(SysUser.class)
        .where(o -> o.eq(SysUser::getId, "123xxx"))
        .where(o -> o.like(SysUser::getIdCard, "123"))
        .orderByDesc(o->o.column(SysUser::getCreateTime))
        .orderByAsc(o->o.column(SysUser::getId))
        .select(o->o.column(SysUser::getId).column(SysUser::getCreateTime))
        //.select(o->o.columnAll().columnIgnore(SysUser::getCreateTime))//获取user表的所有字段除了createTime字段
        .firstOrNull();
```
@tab 属性模式
```java
// 创建一个可查询SysUser的表达式
Queryable<SysUser> queryable = easyQuery.queryable(SysUser.class);

//单个条件链式查询
//toList表示查询结果集 
List<SysUser> sysUsers = easyQuery.queryable(SysUser.class)
                .where(o -> o.eq("id", "123xxx"))
                .toList();

//条件= 和 like 组合 中间默认是and连接符
List<SysUser> sysUsers = easyQuery.queryable(SysUser.class)
        .where(o -> o
                .eq("id", "123xxx")
                .like("idCard","123")
        ).toList();//toList表示查询结果集 


//多个where之间也是用and链接和上述方法一个意思 条件= 和 like 组合 中间默认是and连接符
List<SysUser> sysUsers = easyQuery.queryable(SysUser.class)
        .where(o -> o.eq("id", "123xxx"))
        .where(o -> o.like("idCard","123")).toList();


//返回单个对象没有查询到就返回null
SysUser sysUser1 = easyQuery.queryable(SysUser.class)
        .where(o -> o.eq("id", "123xxx"))
        .where(o -> o.like("idCard", "123")).firstOrNull();


//采用创建时间倒序和id正序查询返回第一个
SysUser sysUser1 = easyQuery.queryable(SysUser.class)
        .where(o -> o.eq("id", "123xxx"))
        .where(o -> o.like("idCard", "123"))
        .orderByDesc(o->o.column("createTime"))
        .orderByAsc(o->o.column("id")).firstOrNull();


//仅查询id和createTime两列
SysUser sysUser1 = easyQuery.queryable(SysUser.class)
        .where(o -> o.eq("id", "123xxx"))
        .where(o -> o.like("idCard", "123"))
        .orderByDesc(o->o.column("createTime"))
        .orderByAsc(o->o.column("id"))
        .select(o->o.column("id").column("createTime"))
        //.select(o->o.columnAll().columnIgnore("createTime"))//获取user表的所有字段除了createTime字段
        .firstOrNull();
```
@tab lambda表达式树模式（新）
```java
// 创建一个可查询SysUser的表达式
LQuery<SysUser> queryable = elq.queryable(SysUser.class);

// 单个条件链式查询
List<SysUser> sysUsers1 = elq.queryable(SysUser.class)
        .where(o -> o.getId() == "123xxx")
        .toList();// toList表示查询结果集


// == 运算符会被翻译成sql中的 = 运算符，&& 运算符会被翻译成sql中的 AND 运算符 ，字符串的contains方法翻译成sql中的 LIKE 运算符
List<SysUser> sysUsers2 = elq.queryable(SysUser.class)
        .where(o -> o.getId() == "123xxx" && o.getIdCard().contains("123"))
        .toList();


// 多个where之间默认进行 AND 连接
List<SysUser> sysUsers3 = elq.queryable(SysUser.class)
        .where(o -> o.getId() == "123xxx")
        // AND
        .where(o -> o.getIdCard().contains("123"))
        .toList();


//返回单个对象没有查询到就返回null
SysUser sysUser1 = elq.queryable(SysUser.class)
        .where(o -> o.getId() == "123xxx")
        .where(o -> o.getIdCard().contains("123"))
        .firstOrNull();


//采用创建时间倒序和id正序查询返回第一个
SysUser sysUser2 = elq.queryable(SysUser.class)
        .where(o -> o.getId() == "123xxx")
        .where(o -> o.getIdCard().contains("123"))
        .orderBy(o -> o.getCreateTime())
        .orderBy(o -> o.getId())
        .firstOrNull();

//仅查询id和createTime两列
LQuery<SysUser> sysUserLQuery = elq.queryable(SysUser.class)
        .where(o -> o.getId() == "123xxx")
        .where(o -> o.getIdCard().contains("123"))
        .orderBy(o -> o.getCreateTime())
        .orderBy(o -> o.getId());

// 匿名类形式返回
List<? extends TempResult> list = sysUserLQuery
        .select(s -> new TempResult()
        {
            String tid = s.getId();
            LocalDateTime ct = s.getCreateTime();
        })
        .toList();

// 指定类型返回，自动与类字段映射，支持dto
// 此时会select全字段
SysUser sysUser3 = sysUserLQuery.select(SysUser.class).firstOrNull();

// select无参时等同于条件为queryable时填入的class
SysUser sysUser4 = sysUserLQuery.select().firstOrNull();


// 指定类型同时限制sql选择的字段
SysUser sysUser5 = sysUserLQuery
        .select(s ->
        {
            SysUser temp = new SysUser();
            temp.setId(s.getId());
            temp.setCreateTime(s.getCreateTime());
            //此时选择了SysUser的id和createTime字段
            return temp;
        }).firstOrNull();
```
:::

## proxy模式
因为proxy涉及到apt代理对象的自动生成和插件的整合,所以这边单独进行文档编写说来演示如何使用proxy编写易于表达维护的orm语法

### 依赖安装
如果你只需要使用代理模式那么在可以自行安装依赖或者使用整合包比如`springboot`下的`starter`或者`solon`下的`plugin`,下面仅展示控制台程序下使用的依赖
```xml
<properties>
    <easy-query.version>latest-version</easy-query.version>
</properties>
<!--  提供了代理模式支持apt模式以非lambda形式的强类型sql语法 -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-api-proxy</artifactId>
    <version>${easy-query.version}</version>
</dependency>
<!--  提供了apt自动生成代理对象 如果您使用entityQuery查询并且采用@EntityFileProxy那么这个依赖可以省略-->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-processor</artifactId>
    <version>${easy-query.version}</version>
</dependency>
<!--  这边以mysql为例 其实不需要添加下面的包也可以运行,指示默认的个别数据库行为语句没办法生成 -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-mysql</artifactId>
    <version>${easy-query.version}</version>
</dependency>
```

::: warning 说明!!!
> 如果您的项目是多模块,请在对应模块需要生成代理对象的类处都添加`sql-processor`,对应的模块是指当前模块有`@EntityProxy`注解
:::


## lambda表达式树模式

lambda表达式树模式无需进行额外的构建，同时也不需要来自apt生成的代理类的支持，只需要在正确配置后进行打包后即可食用

### 依赖安装

在你需要的模块下引入sql-api-lambda依赖后写好配置即可（只需要普通的maven打包即可，不用构建，再说一遍，不用构建！）

```xml
<project>

    <properties>
        <easy-query.version>latest-version</easy-query.version>
    </properties>
    <dependencies>
        
        <!-- 你的其他依赖包 -->

        <!-- sql-api-lambda依赖 -->
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-api-lambda</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>${你的版本}</version>
                <configuration>
                    <!--必要参数，用于注册编译器插件-->
                    <compilerArgs>
                        <arg>-Xplugin:ExpressionTree</arg>
                    </compilerArgs>
                    <annotationProcessorPaths>
                        <!--必要参数，用于注册编译器插件-->
                        <path>
                            <groupId>com.easy-query</groupId>
                            <artifactId>sql-api-lambda</artifactId>
                            <version>${project.version}</version>
                        </path>
                        <!-- 你的其他注解处理器 -->
<!--                        假设你还引入了lombok-->
<!--                        <path>-->
<!--                            <groupId>org.projectlombok</groupId>-->
<!--                            <artifactId>lombok</artifactId>-->
<!--                            <version>1.18.24</version>-->
<!--                        </path>-->
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

