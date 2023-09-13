---
title: 动态排序
---

# 动态排序
`easy-query`针对api请求支持对象的动态排序功能,可以实现列表title的排序并且支持多级排序

## ObjectSort
实现动态排序接口

方法  | 默认值 | 说明  
--- | --- | --- 
dynamicMode | `DynamicModeEnum.STRICT`  | 策略默认,严格模式下所有属性必须在对象属性里面不然会报错,如果是忽略模式那么就是忽略该属性
useStrictMode | `true`  | 是否为严格模式
configure | -  | 配置动态排序




## ObjectSortBuilder
实现动态排序配置器

方法  | 参数 | 说明  
--- | --- | --- 
allowed | 排序属性  | 允许那些属性可以排序,如果调用一次后,那么后续所有的属性必须在`allowed`里面
notAllowed | 不允许排序属性  | 不允许排序的属性,哪怕传递了也不会生效不会报错
orderBy | 排序属性、是否正序、哪张表默认(0)  | 排序属性表示按这个属性排序,是否正序表示排序是否使用`ASC`,默认表是0开始,join一张表就有两张表,如果严格模式,tableIndex不在上下文表中那么将会抛错

<img src="/table-sort.png">

## 单字段动态排序
首先我们实现`ObjectSort`接口的方法,传入builder对象排序属性和是否正序即可
```java
@Data
public class BlogSortRequest implements ObjectSort {
    //需要排序的属性
    private String sort;
    //是否正序
    private Boolean asc;
    @Override
    public void configure(ObjectSortBuilder builder) {
        if(EasyStringUtil.isNotBlank(sort)&&asc!=null){
            builder.orderBy(sort,asc);
        }
    }
}


BlogSortRequest blogSortRequest = new BlogSortRequest();
blogSortRequest.setSort("title");
blogSortRequest.setAsc(true);
String sql = easyQuery.queryable(BlogEntity.class)
        .orderByObject(blogSortRequest)
        .select(o->o.column(BlogEntity::getId).column(BlogEntity::getTitle)
                .column(BlogEntity::getContent))
        .toSQL();

// SELECT `id`,`title`,`content` FROM `t_blog` WHERE `deleted` = ? ORDER BY `title` ASC
```

## 多字段组合动态排序
请求对象中有一个集合,集合内部是一个每个属性采用何种排序方法
```java

@Data
public class BlogSortMultiRequest implements ObjectSort {
    //需要排序的属性集合
    private List<SortConfig> orders=new ArrayList<>();
    @Override
    public void configure(ObjectSortBuilder builder) {
        for (SortConfig order : orders) {
            builder.orderBy(order.getProperty(),order.getAsc());
        }
    }

    @Data
    public static class SortConfig{
        //需要排序的字段
        private String property;
        //是否正序
        private Boolean asc;
    }
}



BlogSortMultiRequest blogSortRequest = new BlogSortMultiRequest();
BlogSortMultiRequest.SortConfig sortConfig = new BlogSortMultiRequest.SortConfig();
sortConfig.setProperty("title");
sortConfig.setAsc(true);
blogSortRequest.getOrders().add(sortConfig);
BlogSortMultiRequest.SortConfig sortConfig1 = new BlogSortMultiRequest.SortConfig();
sortConfig1.setProperty("star");
sortConfig1.setAsc(false);
blogSortRequest.getOrders().add(sortConfig1);
String sql = easyQuery.queryable(BlogEntity.class)
        .orderByObject(blogSortRequest)
        .select(o->o.column(BlogEntity::getId).column(BlogEntity::getTitle)
                .column(BlogEntity::getContent))
        .toSQL();


// SELECT `id`,`title`,`content` FROM `t_blog` WHERE `deleted` = ? ORDER BY `title` ASC,`star` DESC
```

## join动态排序

```java

@Data
public class BlogSortJoinRequest implements ObjectSort {
    private List<SortConfig> orders=new ArrayList<>();
    @Override
    public void configure(ObjectSortBuilder builder) {
        for (SortConfig order : orders) {
            //如果采用 createTime 排序那么就使用第二张表
            int tableIndex = Objects.equals(order.getProperty(), "createTime") ? 1 : 0;
            builder.orderBy(order.getProperty(),order.getAsc(),tableIndex);
        }
    }

    @Data
    public static class SortConfig{
        private String property;
        private Boolean asc;
    }
}



BlogSortJoinRequest blogSortRequest = new BlogSortJoinRequest();
BlogSortJoinRequest.SortConfig sortConfig = new BlogSortJoinRequest.SortConfig();
sortConfig.setProperty("title");
sortConfig.setAsc(true);
blogSortRequest.getOrders().add(sortConfig);
BlogSortJoinRequest.SortConfig sortConfig1 = new BlogSortJoinRequest.SortConfig();
sortConfig1.setProperty("createTime");
sortConfig1.setAsc(false);
blogSortRequest.getOrders().add(sortConfig1);
String sql = easyQuery.queryable(BlogEntity.class)
        .innerJoin(Topic.class,(t,t1)->t.eq(t1,BlogEntity::getId, Topic::getId))
        .orderByObject(blogSortRequest)
        .select(o->o.column(BlogEntity::getId).column(BlogEntity::getTitle)
                .column(BlogEntity::getContent))
        .toSQL();

// SELECT t.`id`,t.`title`,t.`content` FROM `t_blog` t INNER JOIN `t_topic` t1 ON t.`id` = t1.`id` WHERE t.`deleted` = ? ORDER BY t.`title` ASC,t1.`create_time` DESC
```

## UISort
如果你不想为每个查询定义专门的排序类可以添加通用自行实现

```java

public class UISort implements ObjectSort {

    private final Map<String, Boolean> sort;

    public UISort(Map<String,Boolean> sort){

        this.sort = sort;
    }
    @Override
    public void configure(ObjectSortBuilder builder) {
        for (Map.Entry<String, Boolean> s : sort.entrySet()) {

            builder.orderBy(s.getKey(),s.getValue());
        }
    }
}
```

排序交互全是属性所以完全可以避免sql注入的bug
```java
HashMap<String, Boolean> id = new HashMap<String, Boolean>() {{
    put("id", true);
    put("title", false);
}};
String sql = easyQuery.queryable(BlogEntity.class)
        .orderByObject(new UISort(id))
        .toSQL();
Assert.assertEquals("SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? ORDER BY `id` ASC,`title` DESC",sql);




HashMap<String, Boolean> id = new HashMap<String, Boolean>() {{
    put("id1", true);
    put("title", false);
}};

try {

    String sql = easyQuery.queryable(BlogEntity.class)
            .orderByObject(new UISort(id))
            .toSQL();
}catch (EasyQueryOrderByInvalidOperationException exception){
    Assert.assertEquals("id1",exception.getPropertyName());
    Assert.assertEquals("BlogEntity not found [id1] in entity class",exception.getMessage());
}
```