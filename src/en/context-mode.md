---
title: Entity No-Interface Mode
order: 150
---

# Entity No-Interface Mode
`ProxyEntityAvailable` Sometimes users may wish to use `eq` without adding the `ProxyEntityAvailable` interface, which is also possible. Upgrade to `3.1.26^`

## Query
Taking `Topic` and `Blog` as examples, create a new `DbContext` class type for database context interaction
```java
@Component//Register as Bean
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

`createDbSet` can convert the proxy object instance to the corresponding `DbSet`


## How to Query Insert Update Delete
Single table
```java

List<Topic> list = dbContext.topic().where(s -> {
    s.id().eq("123");
}).toList();
```
Multiple tables
```java

            List<Topic> list1 = dbContext.topic()
                    .leftJoin(dbContext.blog(), (a, b) -> {
                        a.id().eq(b.id());
                    }).where((t_topic, t_blog) -> {
                        t_topic.id().eq("123");
                    }).toList();
```

Insert
```java

        Topic topic = new Topic();
        dbContext.topic().insertable(topic).executeRows();
        dbContext.topic().insertable(Arrays.asList(topic)).executeRows();
```
Update
```java

        Topic topic = new Topic();
        //Entity update
        dbContext.topic().updatable(topic).executeRows();
        dbContext.topic().updatable(Arrays.asList(topic)).executeRows();
        //Expression update
        dbContext.topic()
                .setColumns(t_topic -> t_topic.title().set("123"))
                .where(t_topic -> t_topic.id().eq("1123"))
                .executeRows();
```
Delete
```java

        Topic topic = new Topic();
        dbContext.topic().deletable(topic).executeRows();
        dbContext.topic().deletable(Arrays.asList(topic)).executeRows();
        dbContext.topic()
                .deleteBy(t_topic -> t_topic.id().eq("1123"))
                .executeRows();
```
Save
```java

        Topic topic = new Topic();
        dbContext.topic().savable(topic).executeCommand();
        dbContext.topic().savable(Arrays.asList(topic)).executeCommand();
```
