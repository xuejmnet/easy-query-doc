---
title: DTO Sorting
order: 20
---


# DTO Sorting
`easy-query` supports dynamic sorting function for API requests, which can implement list title sorting and supports multi-level sorting

## ObjectSort
Implement dynamic sorting interface

Method  | Default Value | Description  
--- | --- | --- 
dynamicMode | `DynamicModeEnum.STRICT`  | Policy default, in strict mode all properties must be in the object properties otherwise an error will be reported, if ignore mode then ignore the property
useStrictMode | `true`  | Whether to use strict mode
configure | -  | Configure dynamic sorting




## ObjectSortBuilder
Implement dynamic sort configurator

Method  | Parameter | Description  
--- | --- | --- 
allowed | Sorting property  | Allow which properties can be sorted, if called once, then all subsequent properties must be in `allowed`
notAllowed | Not allowed sorting property  | Properties that are not allowed to be sorted, even if passed will not take effect and will not report errors
orderBy | Sorting property, whether ascending, which table default (0)  | Sorting property means sort by this property, whether ascending means whether the sorting uses `ASC`, the default table starts from 0, joining a table will have two tables, if strict mode and tableIndex is not in the context table then an error will be thrown

## orderBy Method
Parameter   | Description  
---  | --- 
propertyName | Property name, supports multi-level such as `name` or `user.name`
asc | Indicates whether ascending, true is ascending, false is descending
orderByMode | Indicates sorting for null value situation setting, `null_first` or `null_last` passing `null` means sorting does not handle `null`
tableIndex | Indicates which table in explicit join `from table is 0`, each `join+1`, default value `0` is main table



<img :src="$withBase('/images/table-sort.png')">

## Single Field Dynamic Sorting
First we implement the method of the `ObjectSort` interface, passing the builder object sorting property and whether ascending
```java
@Data
public class BlogSortRequest implements ObjectSort {
    //Property to sort
    private String sort;
    //Whether ascending
    private Boolean asc;
    @Override
    public void configure(ObjectSortBuilder builder) {
        if(EasyStringUtil.isNotBlank(sort)){
            builder.orderBy(sort, asc == null || asc);
            builder.orderBy(sort, asc == null || asc, OrderByModeEnum.NULLS_LAST);
            // builder.orderBy(sort,asc);
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

## Multi-Field Combination Dynamic Sorting
The request object has a collection, and inside the collection is how each property uses what sorting method
```java

@Data
public class BlogSortMultiRequest implements ObjectSort {
    //Property collection to sort
    private List<SortConfig> orders=new ArrayList<>();
    @Override
    public void configure(ObjectSortBuilder builder) {
        for (SortConfig order : orders) {
            builder.orderBy(order.getProperty(),order.getAsc()==null || order.getAsc(),order.getNullMode());
        }
    }

    @Data
    public static class SortConfig{
        //Field to sort
        private String property;
        //Whether ascending
        private Boolean asc;
        //Null handling
        private OrderByModeEnum nullMode;
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
sortConfig.setNullMode(OrderByModeEnum.NULLS_LAST);
blogSortRequest.getOrders().add(sortConfig1);
String sql = easyQuery.queryable(BlogEntity.class)
        .orderByObject(blogSortRequest)
        .select(o->o.column(BlogEntity::getId).column(BlogEntity::getTitle)
                .column(BlogEntity::getContent))
        .toSQL();


// SELECT `id`,`title`,`content` FROM `t_blog` WHERE `deleted` = ? ORDER BY `title` ASC,CASE WHEN `star` IS NULL THEN 1 ELSE 0 END ASC,`star` DESC
```

## Join Dynamic Sorting

```java

@Data
public class BlogSortJoinRequest implements ObjectSort {
    private List<SortConfig> orders=new ArrayList<>();
    @Override
    public void configure(ObjectSortBuilder builder) {
        for (SortConfig order : orders) {
            //If using createTime sorting then use the second table
            int tableIndex = Objects.equals(order.getProperty(), "createTime") ? 1 : 0;
            builder.orderBy(order.getProperty(),order.getAsc()==null||order.getAsc(),tableIndex);
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
If you don't want to define a dedicated sorting class for each query, you can add a universal implementation yourself

```java

public class UISort implements ObjectSort {

    //The Boolean type of map can be changed to a custom type so that it can support NullMode
    private final Map<String, Boolean> sort;

    public UISort(Map<String,Boolean> sort){

        this.sort = sort;
    }
    @Override
    public void configure(ObjectSortBuilder builder) {
        for (Map.Entry<String, Boolean> s : sort.entrySet()) {
            //Judge whether key and value are null yourself because it is a wrapper type and npe may occur
            // key is the property that needs to be sorted, value indicates whether the sorting is asc
            builder.orderBy(s.getKey(),s.getValue()==null||s.getValue());
        }
    }
}
```

Sorting interactions are all properties so SQL injection bugs can be completely avoided
```java
HashMap<String, Boolean> id = new HashMap<>();
id.put("id", true);//id ascending
id.put("title", false);//title descending
String sql = easyQuery.queryable(BlogEntity.class)
        .orderByObject(new UISort(id))
        .toSQL();
Assert.assertEquals("SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? ORDER BY `id` ASC,`title` DESC",sql);




HashMap<String, Boolean> id = new HashMap<>();
id.put("id1", true);//id1 property is not in BlogEntity so an error will be reported
id.put("title", false);

try {

    String sql = easyQuery.queryable(BlogEntity.class)
            .orderByObject(new UISort(id))
            .toSQL();
}catch (EasyQueryOrderByInvalidOperationException exception){
    Assert.assertEquals("id1",exception.getPropertyName());
    Assert.assertEquals("BlogEntity not found [id1] in entity class",exception.getMessage());
}
```

## anyColumn Sorting
`eq2.6.2+` provides `anyColumn` method supporting getting any property and `ToOne object property` such as `anyColumn("name")` and `anyColumn("user.name")`

```java

ArrayList<Tuple3<String, Boolean, OrderByModeEnum>> sorts = new ArrayList<>();
sorts.add(new Tuple3<>("user.age", false, OrderByModeEnum.NULLS_LAST));
sorts.add(new Tuple3<>("type", true, OrderByModeEnum.NULLS_LAST));


List<DocBankCard> list = easyEntityQuery.queryable(DocBankCard.class)
        .where(bank_card -> {
            bank_card.anyColumn("code").nullOrDefault("123").eq("456");
            //The writing below is the same as above
            // bank_card.code().asAny().nullOrDefault("789").eq("987");
            // bank_card.code().nullOrDefault("654").eq("321");
        })
        .orderBy(bank_card -> {
            for (Tuple3<String, Boolean, OrderByModeEnum> sort : sorts) {
                bank_card.anyColumn(sort.t1()).orderBy(sort.t2(), sort.t3());
            }
        }).toList();


==> Preparing: SELECT t.`id`,t.`uid`,t.`code`,t.`type`,t.`bank_id` FROM `doc_bank_card` t LEFT JOIN `doc_user` t1 ON t1.`id` = t.`uid` WHERE IFNULL(t.`code`,?) = ? ORDER BY CASE WHEN t1.`age` IS NULL THEN 1 ELSE 0 END ASC,t1.`age` DESC,CASE WHEN t.`type` IS NULL THEN 1 ELSE 0 END ASC,t.`type` ASC
==> Parameters: 123(String),456(String)
```

## Dynamic asc or desc

```java
List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .where(m -> {
            m.name().contains("zhang san");
            m.age().gt(20);
        }).orderBy(m -> {
            m.age().orderBy(true);//true means asc
            //m.age().orderBy(false);//false means desc
        }).toList();
```

## Subquery Count Sorting
```java
List<SysBank> banks = easyEntityQuery.queryable(SysBank.class)
        .where(bank -> {
            bank.name().contains("123");
        }).orderBy(bank -> {
            bank.bankCards().where(bc -> bc.type().eq("Savings Card")).count().asc();
        }).toList();
```


