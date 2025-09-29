---
title: 实体无接口模式
order: 150
---

# 实体无接口模式
`ProxyEntityAvailable` 有时候用户可能希望不添加接口`ProxyEntityAvailable`来实现`eq`的使用，那么也是可以的，升级到`3.1.26^`

## 查询
以`Topic`和`Blog`为例,新建一个`DbContext`类型用来做数据库上下文交互用
```java
@Component//注册为Bean
public class DbContext {
    private final EasyEntityQuery easyEntityQuery;

    public DbContext(EasyEntityQuery easyEntityQuery){
        this.easyEntityQuery = easyEntityQuery;
    }

    public DbSet<TopicProxy, Topic> topic(){
        return easyEntityQuery.createDbSet(TopicProxy.createTable());
    }
    public DbSet<BlogEntityProxy, BlogEntity> blog(){
        return easyEntityQuery.createDbSet(BlogEntityProxy.createTable());
    }
}
```

`createDbSet`可以将代理对象实例转成对应的`DbSet`


## 如何查询 新增 修改 删除
单表
```java

List<Topic> list = dbContext.topic().where(s -> {
    s.id().eq("123");
}).toList();
```
多表
```java

            List<Topic> list1 = dbContext.topic()
                    .leftJoin(dbContext.blog(), (a, b) -> {
                        a.id().eq(b.id());
                    }).where((t_topic, t_blog) -> {
                        t_topic.id().eq("123");
                    }).toList();
```

新增
```java

        Topic topic = new Topic();
        dbContext.topic().insertable(topic).executeRows();
        dbContext.topic().insertable(Arrays.asList(topic)).executeRows();
```
修改
```java

        Topic topic = new Topic();
        //实体修改
        dbContext.topic().updatable(topic).executeRows();
        dbContext.topic().updatable(Arrays.asList(topic)).executeRows();
        //表达式修改
        dbContext.topic().updatable()
                .setColumns(t_topic -> t_topic.title().set("123"))
                .where(t_topic -> t_topic.id().eq("1123"))
                .executeRows();
```
删除
```java

        Topic topic = new Topic();
        dbContext.topic().deletable(topic).executeRows();
        dbContext.topic().deletable(Arrays.asList(topic)).executeRows();
        dbContext.topic().deletable()
                .where(t_topic -> t_topic.id().eq("1123"))
                .executeRows();
```
保存
```java

        Topic topic = new Topic();
        dbContext.topic().savable(topic).executeCommand();
        dbContext.topic().savable(Arrays.asList(topic)).executeCommand();
```