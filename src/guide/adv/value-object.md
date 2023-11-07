---
title: 值类型对象
---
`easy-query`在`1.7.0^`版本支持`value-object`值类型对象,用于描述数据库对象的聚合列,譬如
```java

@Table("my_company")
@Data
public class Company {
    @Column(primaryKey = true)
    private String id;
    /**
     * 企业名称
     */
    private String name;
    /**
     * 企业所属省份
     */
    private String province;
    /**
     * 企业所属市区
     */
    private String city;
    /**
     * 企业所属区域
     */
    private String area;
    /**
     * 企业营业执照编号
     */
    private String licenseNo;
    /**
     * 企业营业执照到期时间
     */
    private LocalDateTime licenseDeadline;
    /**
     * 企业营业执照图片
     */
    private String licenseImage;
    /**
     * 企业营业执照经营内容
     */
    private String licenseContent;
}
```
使用值类型后可以改写为
```java
@Table("my_company")
@Data
@ToString
public class ValueCompany {
    @Column(primaryKey = true)
    private String id;
    /**
     * 企业名称
     */
    private String name;
    /**
     * 企业地址信息
     */
    @ValueObject
    private ValueCompanyAddress address;
    /**
     * 企业营业执照信息
     */
    @ValueObject
    private ValueCompanyLicense license;
}


@Data
@EqualsAndHashCode
@ToString
public class ValueCompanyAddress {
    /**
     * 企业所属省份
     */
    private String province;
    /**
     * 企业所属市区
     */
    private String city;
    /**
     * 企业所属区域
     */
    private String area;
}


@Data
@EqualsAndHashCode
@ToString
public class ValueCompanyLicense {

    /**
     * 企业营业执照编号
     */
    private String licenseNo;
    /**
     * 企业营业执照到期时间
     */
    private LocalDateTime licenseDeadline;
    @ValueObject
    private ValueCompanyLicenseExtra extra;//支持ValueObject嵌套
}


@Data
@EqualsAndHashCode
@ToString
public class ValueCompanyLicenseExtra {
    /**
     * 企业营业执照图片
     */
    private String licenseImage;
    /**
     * 企业营业执照经营内容
     */
    private String licenseContent;
}


```

对于大对象属性聚合有着更好的属性表示而不是一股脑儿的展开平铺对象的设计

```sql
-- 数据库搅拌
create table my_company
(
    id varchar(32) not null comment '主键ID'primary key,
    name varchar(32)  null comment '名称',
    province varchar(32)  null comment '省',
    city varchar(32)  null comment '市',
    area varchar(32)  null comment '区',
    license_no varchar(32)  null comment '企业营业执照编号',
    license_deadline datetime  null comment '企业营业执照到期时间',
    license_image varchar(128)  null comment '企业营业执照图片',
    license_content varchar(256)  null comment '企业营业执照经营内容'
)comment '公司表';
```

::: warning 注意点及说明!!!
> 属性模式已经原生支持,通过属性.属性来访问和使用,其中proxy还在适配中,java的lambda版本需要自行实现,kotlin也需要自行实现
:::

## java版本实现
因为java默认不支持lambda表达式的多级获取所以需要使用asm字节码技术自行实现
### 替换系统默认lambda表达式解析
需要添加依赖asm的
```xml

<!--选择自己合适的版本即可-->
<dependency>
    <groupId>org.ow2.asm</groupId>
    <artifactId>asm</artifactId>
    <version>9.6</version>
</dependency>
```
```java
//lambda的类访问器
public class ExpressionClassVisitor extends ClassVisitor {
    private final StringBuilder _methodBody;
    private final String _method;
    private final String _methodDesc;

    public ExpressionClassVisitor(StringBuilder methodBody,SerializedDescriptor serializedDescriptor) {
        super(Opcodes.ASM9);
        this._methodBody = methodBody;
        this._method = serializedDescriptor.getImplMethodName();
        this._methodDesc = serializedDescriptor.getImplMethodSignature();
    }

    @Override
    public MethodVisitor visitMethod(int access, String name, String desc, String signature, String[] exceptions) {

        if (!_method.equals(name) || !_methodDesc.equals(desc))
            return null;

        return new ExpressionMethodVisitor(_methodBody);
    }


    @Override
    public String toString() {
        return _methodBody.toString();
    }
}

//lambda方法访问器
public class ExpressionMethodVisitor extends MethodVisitor {
    private final StringBuilder _methodBody;

    public ExpressionMethodVisitor(StringBuilder methodBody) {
        super(Opcodes.ASM9);
        this._methodBody=methodBody;
    }

    @Override
    public void visitMethodInsn(int opcode, String owner, String name, String desc, boolean itf) {
        if(opcode==Opcodes.INVOKEVIRTUAL){
            String attr = null;
            if (name.startsWith("get")) {
                attr = name.substring(3);
            } else {
                attr = name.substring(2);
            }
            _methodBody.append(".").append(EasyStringUtil.toLowerCaseFirstOne(attr));
        }
    }

    @Override
    public void visitEnd() {
        _methodBody.deleteCharAt(0);
    }
}
//lambda解析器自定义
public class MyLambdaParser implements LambdaParser {
    private static final Cache<SerializedDescriptor, String> lambdaCache = new DefaultMemoryCache<>();
    @Override
    public <T> String getPropertyName(Property<T, ?> property) {
        if (property == null) {
            return null;
        }
        try {
            Method declaredMethod = property.getClass().getDeclaredMethod("writeReplace");
            declaredMethod.setAccessible(Boolean.TRUE);
            SerializedLambda serializedLambda = (SerializedLambda) declaredMethod.invoke(property);


            //Class.method.method....
            if (serializedLambda.getImplMethodKind() == MethodHandleInfo.REF_invokeStatic) {
                return getPropertyNameByInvokeStatic(property.getClass().getClassLoader(), serializedLambda);
            }
            //Class::method
            return getPropertyNameByInvokeVirtual(serializedLambda);

        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
    }
        private static String getPropertyNameByInvokeStatic(ClassLoader classLoader, SerializedLambda serializedLambda) {
            SerializedDescriptor serializedDescriptor = new SerializedDescriptor(serializedLambda);

        String propertyName = lambdaCache.get(serializedDescriptor);
        if (propertyName != null) {
            return propertyName;
        }

        String className = serializedLambda.getImplClass();
        String classFilePath = classFilePath(className);
        StringBuilder methodBody = new StringBuilder();
        ExpressionClassVisitor expressionClassVisitor = new ExpressionClassVisitor(methodBody, serializedDescriptor);
        try (InputStream classStream = getResourceAsStream(classLoader, classFilePath)) {
            ClassReader reader = new ClassReader(classStream);
            reader.accept(expressionClassVisitor, ClassReader.SKIP_DEBUG | ClassReader.SKIP_FRAMES);
            String fullPropertyName = methodBody.toString();
            return lambdaCache.computeIfAbsent(serializedDescriptor, key -> {
                return fullPropertyName;
            });
        } catch (IOException e) {
            throw new RuntimeException("error parsing class file " + classFilePath, e);
        }
    }
        private static InputStream getResourceAsStream(ClassLoader classLoader,
                                                       String path)
                throws FileNotFoundException {
            InputStream stream = classLoader.getResourceAsStream(path);
            if (stream == null)
                throw new FileNotFoundException(path);
            return stream;
        }

    private static String classFilePath(String className) {
        return className.replace('.', '/') + ".class";
    }
    private static String getPropertyNameByInvokeVirtual(SerializedLambda serializedLambda){
        String method = serializedLambda.getImplMethodName();

        String attr = null;
        if (method.startsWith("get")) {
            attr = method.substring(3);
        } else {
            attr = method.substring(2);
        }
        return EasyStringUtil.toLowerCaseFirstOne(attr);
    }
}

//使用前替换掉默认的解析器
EasyLambdaUtil.replaceParser(new MyLambdaParser());
```

## 新增
```java
ValueCompany company = new ValueCompany();
company.setId("my1");
company.setName("myCompany1");
ValueCompanyAddress valueCompanyAddress = new ValueCompanyAddress();
valueCompanyAddress.setProvince("province1");
valueCompanyAddress.setCity("city1");
valueCompanyAddress.setArea("area1");
company.setAddress(valueCompanyAddress);
ValueCompanyLicense valueCompanyLicense = new ValueCompanyLicense();
valueCompanyLicense.setLicenseNo("license1");
valueCompanyLicense.setLicenseDeadline(LocalDateTime.of(2023,1,1,0,0));
ValueCompanyLicenseExtra valueCompanyLicenseExtra = new ValueCompanyLicenseExtra();
valueCompanyLicenseExtra.setLicenseImage("www.baidu.com");
valueCompanyLicenseExtra.setLicenseContent("it编程");
valueCompanyLicense.setExtra(valueCompanyLicenseExtra);
company.setLicense(valueCompanyLicense);
long l = easyQueryClient.insertable(company).executeRows();


==> Preparing: INSERT INTO `my_company` (`id`,`name`,`province`,`city`,`area`,`license_no`,`license_deadline`,`license_image`,`license_content`) VALUES (?,?,?,?,?,?,?,?,?)
==> Parameters: my1(String),myCompany1(String),province1(String),city1(String),area1(String),license1(String),2023-01-01T00:00(LocalDateTime),www.baidu.com(String),it编程(String)
<== Total: 1

```

## 查询
```java
//属性模式
List<ValueCompany> province1 = easyQueryClient.queryable(ValueCompany.class)
        .where(o -> o.eq("address.province", "province1"))
        .toList();

[ValueCompany(id=my1, name=myCompany1, address=ValueCompanyAddress(province=province1, city=city1, area=area1), license=ValueCompanyLicense(licenseNo=license1, licenseDeadline=2023-01-01T00:00, extra=ValueCompanyLicenseExtra(licenseImage=www.baidu.com, licenseContent=it编程)))]


==> Preparing: SELECT `id`,`name`,`province`,`city`,`area`,`license_no`,`license_deadline`,`license_image`,`license_content` FROM `my_company` WHERE `province` = ?
==> Parameters: province1(String)
<== Time Elapsed: 2(ms)
<== Total: 1

//lambda模式
List<ValueCompany> province11 = easyQuery.queryable(ValueCompany.class)
                .where(o -> o.eq(x -> x.getAddress().getProvince(), "province1"))
                .toList();

==> Preparing: SELECT `id`,`name`,`province`,`city`,`area`,`license_no`,`license_deadline`,`license_image`,`license_content` FROM `my_company` WHERE `province` = ?
==> Parameters: province1(String)
<== Time Elapsed: 2(ms)
<== Total: 1

//不查询营业执照额外信息
List<ValueCompany> province2 = easyQueryClient.queryable(ValueCompany.class)
                .where(o -> o.eq("address.province", "province1"))
                .select(o->o.columnAll().columnIgnore("license.extra"))
                .toList();

==> Preparing: SELECT `id`,`name`,`province`,`city`,`area`,`license_no`,`license_deadline` FROM `my_company` WHERE `province` = ?
==> Parameters: province1(String)
<== Time Elapsed: 2(ms)
<== Total: 1

[ValueCompany(id=my1, name=myCompany1, address=ValueCompanyAddress(province=province1, city=city1, area=area1), license=ValueCompanyLicense(licenseNo=license1, licenseDeadline=2023-01-01T00:00, extra=null))]

 List<ValueCompany> province22 = easyQuery.queryable(ValueCompany.class)
                .where(o -> o.eq(x -> x.getAddress().getProvince(), "province1"))
                .select(o->o.columnAll().columnIgnore(x->x.getLicense().getExtra()))
                .toList();

==> Preparing: SELECT `id`,`name`,`province`,`city`,`area`,`license_no`,`license_deadline` FROM `my_company` WHERE `province` = ?
==> Parameters: province1(String)
<== Time Elapsed: 2(ms)
<== Total: 1

[ValueCompany(id=my1, name=myCompany1, address=ValueCompanyAddress(province=province1, city=city1, area=area1), license=ValueCompanyLicense(licenseNo=license1, licenseDeadline=2023-01-01T00:00, extra=null))]

//仅查询地址和营业执照编号
 List<ValueCompany> province4 = easyQueryClient.queryable(ValueCompany.class)
                .where(o -> o.eq("address.province", "province1"))
                .select(o->o.column("address").column("license.licenseNo"))
                .toList();

==> Preparing: SELECT `province`,`city`,`area`,`license_no` FROM `my_company` WHERE `province` = ?
==> Parameters: province1(String)
<== Time Elapsed: 2(ms)
<== Total: 1

[ValueCompany(id=null, name=null, address=ValueCompanyAddress(province=province1, city=city1, area=area1), license=ValueCompanyLicense(licenseNo=license1, licenseDeadline=null, extra=null))]


List<ValueCompany> province44 = easyQuery.queryable(ValueCompany.class)
                .where(o -> o.eq(x -> x.getAddress().getProvince(), "province1"))
                .select(o->o.column(ValueCompany::getAddress).column(x->x.getLicense().getLicenseNo()))
                .toList();

==> Preparing: SELECT `province`,`city`,`area`,`license_no` FROM `my_company` WHERE `province` = ?
==> Parameters: province1(String)
<== Time Elapsed: 2(ms)
<== Total: 1

[ValueCompany(id=null, name=null, address=ValueCompanyAddress(province=province1, city=city1, area=area1), license=ValueCompanyLicense(licenseNo=license1, licenseDeadline=null, extra=null))]
```

## 更新
```java
//追踪更新进修改营业执照内容
TrackManager trackManager = easyQuery.getRuntimeContext().getTrackManager();
try {
    trackManager.begin();
    easyQuery.addTracking(company);
    company.getLicense().getExtra().setLicenseContent("it++++1");
    easyQuery.updatable(company).executeRows();
}
finally {
    trackManager.release();
}

==> Preparing: UPDATE `my_company` SET `license_content` = ? WHERE `id` = ?
==> Parameters: it++++1(String),my1(String)
<== Total: 1


//直接更新
easyQuery.updatable(company).executeRows();

==> Preparing: UPDATE `my_company` SET `name` = ?,`province` = ?,`city` = ?,`area` = ?,`license_no` = ?,`license_deadline` = ?,`license_image` = ?,`license_content` = ? WHERE `id` = ?
==> Parameters: myCompany1(String),province1(String),city1(String),area1(String),license1(String),2023-01-01T00:00(LocalDateTime),www.baidu.com(String),it编程(String),my1(String)
<== Total: 1
```

## 相关搜索
`@Embedded` `@Embeddable` `值类型` `值对象`