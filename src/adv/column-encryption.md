---
title: 数据库列加密
order: 60
---

# 数据库列加密
`easy-query`提供了建议的数据列加密功能,可以实现功能复杂的数据库列加密,并且可以支持模糊查询.实现方式具体请看[阿里巴巴密文字段检索方案](https://jaq-doc.alibaba.com/docs/doc.htm?treeId=1&articleId=106213&docType=1) ，这边`easy-query`给出了一个默认的实现,并且支持所有数据库

## EncryptionStrategy

方法  | 参数 | 描述  
--- | --- | --- 
encrypt | 对象,属性,值 | 加密值,在插入修改查询的时候会被调用
decrypt | 对象,属性,值 | 解密值,在查询的时候会被解密

## Encryption

属性  | 默认值 | 描述  
--- | --- | --- 
strategy | 无 | 加密策略实现类,使用具体那个加密策略来实现当前列的加密
supportQueryLike | false | 是否支持模糊查询,默认不支持,默认支持等于匹配,区别在于使用like或者like相关查询的时候会将入参进行相同方式加密后匹配,需要加密算法支持模糊查询

## demo数据

::: code-tabs
@tab SysUserEncryption
```java
@Data
@Table("t_sys_user_encryption")
public class SysUserEncryption {
    @Column(primaryKey = true)
    private String id;
    private String name;
    @Encryption(strategy = Base64EncryptionStrategy.class)
    private String phoneNotSupportLike;
    @Encryption(strategy = Base64EncryptionStrategy.class)
    private String addressNotSupportLike;
    private String phoneSupportLike;
    private String addressSupportLike;
}
```
@tab Base64EncryptionStrategy
```java

/**
 * create time 2023/4/4 11:38
 * 如果是spring项目可以通过@Component 否则就自行添加到EasyQueryConfiguration.applyEncryptionStrategy
 *
 * @author xuejiaming
 */
public class Base64EncryptionStrategy implements EncryptionStrategy {
    @Override
    public Object encrypt(Class<?> entityClass, String propertyName, Object plaintext) {
        if(plaintext==null){
            return null;
        }
        return new String(Base64Util.encode(plaintext.toString().getBytes(StandardCharsets.UTF_8)),StandardCharsets.UTF_8);
    }

    @Override
    public Object decrypt(Class<?> entityClass, String propertyName, Object ciphertext) {
        if(ciphertext==null){
            return null;
        }

        return new String(Base64Util.decode(ciphertext.toString().getBytes(StandardCharsets.UTF_8)),StandardCharsets.UTF_8);
    }
}

```
@tab SQL
```sql
-- 数据库表结构语句
create table t_sys_user_encryption
(
    id varchar(32) not null comment '主键ID'primary key,
    name varchar(32) not null comment '名称',
    phone_not_support_like varchar(100) null comment '不支持like的手机号',
    phone_support_like varchar(200) null comment '支持like的手机号',
    address_not_support_like varchar(1024)  null comment '支持like的地址',
    address_support_like varchar(1024)  null comment '不支持like的地址'
)comment '用户字段加密表';
```
:::


## 插入数据测试
```java
SysUserEncryption sysUserEncryption = new SysUserEncryption();
sysUserEncryption.setId("1");
sysUserEncryption.setName("name1");
sysUserEncryption.setPhoneNotSupportLike("12345678901");
sysUserEncryption.setAddressNotSupportLike("浙江省绍兴市越城区城市广场旁边2-102");
long l1 = easyQuery.insertable(sysUserEncryption).executeRows();
Assert.assertEquals(1,l1);
SysUserEncryption sysUserEncryption1 = easyQuery.queryable(SysUserEncryption.class).whereById("1").firstOrNull();
Assert.assertNotNull(sysUserEncryption1);
Assert.assertEquals(sysUserEncryption.getId(),sysUserEncryption1.getId());
Assert.assertEquals(sysUserEncryption.getPhoneNotSupportLike(),sysUserEncryption1.getPhoneNotSupportLike());
Assert.assertEquals(sysUserEncryption.getAddressNotSupportLike(),sysUserEncryption1.getAddressNotSupportLike());
SysUserEncryption sysUserEncryption2 = easyQuery.queryable(SysUserEncryption.class).where(o -> o.eq(SysUserEncryption::getPhoneNotSupportLike, "12345678901")).firstOrNull();
Assert.assertNotNull(sysUserEncryption2);
Assert.assertEquals(sysUserEncryption1.getId(),sysUserEncryption2.getId());
SysUserEncryption sysUserEncryption3 = easyQuery.queryable(SysUserEncryption.class).where(o -> o.like(SysUserEncryption::getPhoneNotSupportLike, "12345678901")).firstOrNull();
Assert.assertNull(sysUserEncryption3);


==> Preparing: INSERT INTO t_sys_user_encryption (`id`,`name`,`phone_not_support_like`,`address_not_support_like`,`phone_support_like`,`address_support_like`) VALUES (?,?,?,?,?,?) 
==> Parameters: 1(String),name1(String),MTIzNDU2Nzg5MDE=(String),5rWZ5rGf55yB57uN5YW05biC6LaK5Z+O5Yy65Z+O5biC5bm/5Zy65peB6L65Mi0xMDI=(String),null(null),null(null)
<== Total: 1
==> Preparing: SELECT t.`id`,t.`name`,t.`phone_not_support_like`,t.`address_not_support_like`,t.`phone_support_like`,t.`address_support_like` FROM t_sys_user_encryption t WHERE t.`id` = ? LIMIT 1
==> Parameters: 1(String)
<== Total: 1
==> Preparing: SELECT t.`id`,t.`name`,t.`phone_not_support_like`,t.`address_not_support_like`,t.`phone_support_like`,t.`address_support_like` FROM t_sys_user_encryption t WHERE t.`phone_not_support_like` = ? LIMIT 1
==> Parameters: MTIzNDU2Nzg5MDE=(String)
<== Total: 1
==> Preparing: SELECT t.`id`,t.`name`,t.`phone_not_support_like`,t.`address_not_support_like`,t.`phone_support_like`,t.`address_support_like` FROM t_sys_user_encryption t WHERE t.`phone_not_support_like` LIKE ? LIMIT 1
==> Parameters: %12345678901%(String)
<== Total: 0
```

## 加密实现类支持模糊搜索高性能

[阿里巴巴密文字段检索方案](https://jaq-doc.alibaba.com/docs/doc.htm?treeId=1&articleId=106213&docType=1)

这边采用阿里巴巴密文字段检索方案,来实现本次功能,实现手机地址的加密存储且高性能模糊搜索

### 加密方式
AES/CBC/PKCS5Padding 加密长度,`非中文单个字符占一个长度`,`中文一个字符占两个长度`,`默认非中文4个长度为一组`,`中文两个为一组`,如果需要搜索默认需要至少4个非中文字符或者2个中文字符如下



算法/模式/填充  | 16 字节加密后数据长度 | 不满 16 字节加密后长度 |本次采用
--- | --- | --- | ---
AES/CBC/NoPadding         | 16 |  不支持        | ❌
**AES/CBC/PKCS5Padding**  | 32 |  16     | ✅
AES/CBC/ISO10126Padding   | 32 |  16     | ❌
AES/CFB/NoPadding         | 16 |  原始数据长度     | ❌
AES/CFB/PKCS5Padding      | 32 |  16     | ❌
AES/CFB/ISO10126Padding   | 32 |  16     | ❌
AES/ECB/NoPadding         | 16 |  不支持     | ❌
AES/ECB/PKCS5Padding      | 32 |  16     | ❌
AES/ECB/ISO10126Padding   | 32 |  16     | ❌
AES/OFB/NoPadding         | 16 |  原始数据长度     | ❌
AES/OFB/PKCS5Padding      | 32 |  16     | ❌
AES/OFB/ISO10126Padding   | 32 |  16     | ❌
AES/PCBC/NoPadding        | 16 |  不支持     | ❌
AES/PCBC/PKCS5Padding     | 32 |  16     | ❌
AES/PCBC/ISO10126Padding  | 32 |  16    | ❌

### 实现加密策略
`easy-query`很贴心的给各位提供了默认的加密策略抽象,您只需要将秘钥和偏移量进行填入即可`AbstractUnSupportEmojiAesBase64EncryptionStrategy`或`AbstractSupportEmojiAesBase64EncryptionStrategy`。
<font color='red'>这边提供的抽象秘钥和偏移量必须全是16位长度的字符串</font>】




::: warning 说明!!!
> `AbstractUnSupportEmojiAesBase64EncryptionStrategy`抽象类默认仅支持非emoji的列,比如中文数字英文特殊符号等,`AbstractSupportEmojiAesBase64EncryptionStrategy`支持emoji的处理,两者的区别就是相对的不支持`Emoji`的策略性能会稍微高一点点
:::

### AbstractUnSupportEmojiAesBase64EncryptionStrategy
不支持emoji

### AbstractSupportEmojiAesBase64EncryptionStrategy

方法  |  默认值   |  描述  
--- | ---  | --- 
getIv| 无 |  16位向量
getKey| 无 | 16位秘钥
encryptWordMinLength| 4 | 最小加密长度
chineseCharOccupancyLength| 2| 一个中文占用长度
throwIfDecryptFail| true | 遇到错误是否抛出


::: warning 说明!!!
> 默认`AbstractUnSupportEmojiAesBase64EncryptionStrategy`和`AbstractSupportEmojiAesBase64EncryptionStrategy`对于数据库传入空字符串也会加密所以`isBlank`和`lisNotBlank`这种函数就会失效建议用户自行实现如果传入空是否不加密还是空
:::

```java
public class MyEncryptionStrategy extends AbstractSupportEmojiAesBase64EncryptionStrategy {
    @Override
    public String getIv() {
        return "A-16-Byte-String";
    }

    @Override
    public String getKey() {
        return "1234567890abcdef";
    }

}

```

修改原始的对象
```java
@Data
@Table("t_sys_user_encryption")
public class SysUserEncryption {
    @Column(primaryKey = true)
    private String id;
    private String name;
    @Encryption(strategy = Base64EncryptionStrategy.class)
    private String phoneNotSupportLike;
    @Encryption(strategy = Base64EncryptionStrategy.class)
    private String addressNotSupportLike;
    @Encryption(strategy = MyEncryptionStrategy.class,supportQueryLike = true)
    private String phoneSupportLike;
    @Encryption(strategy = MyEncryptionStrategy.class,supportQueryLike = true)
    private String addressSupportLike;
}
```


### 测试
```java
SysUserEncryption sysUserEncryption = new SysUserEncryption();
sysUserEncryption.setId("2");
sysUserEncryption.setName("name2");
sysUserEncryption.setPhoneSupportLike("12345678901");
sysUserEncryption.setAddressSupportLike("浙江省绍兴市越城区城市广场旁边2-102");
long l1 = easyQuery.insertable(sysUserEncryption).executeRows();
Assert.assertEquals(1,l1);

==> Preparing: INSERT INTO t_sys_user_encryption (`id`,`name`,`phone_not_support_like`,`address_not_support_like`,`phone_support_like`,`address_support_like`) VALUES (?,?,?,?,?,?) 
==> Parameters: 2(String),name2(String),null(null),null(null),PBNjuyKlEazZoRRnMUupJA==IgrQqipSFtsBJal4l1uviA==act0SMpmvTNWd/+aBXnybA==avtYLQlFEztwFOYNB0x+Cw==XORntDPVNDrdId+JLsMH4w==S+w1G858r9lawlqhSbHw9A==VRhLsnycy28X4io+sRAScA==XNGeRBsmiV4Jd+iMjzyd6w==(String),5JxqmAe3vLE3As62ds8z/Q==RfK4efiC8TpWrlW8EYOE7Q==xYgFo1HQhvsZb3aqqJEr0w==taspTHZ7faxKgLu8WiR4xg==3K4XEON1qksj0l068srXLg==kGziT8zvaq0Mr4mgC0o8ew==o/KgX28zI/vzwYP6H+yBPQ==bIV0eBlAxjvAu53mCRCJKQ==3T589p9NTva5G7yy6Tw1zA==CbmPqpgcbPXq9ZnKJ6eFOg==7TBMWW5dxwjhmnuxffO2BQ==87EZCkWnYFik+lABuLm/0g==SiaBG+vnzNx/p2/7VNtYmw==R+BfXClbpMfdtvtgNpb2Kg==2bm0wNpPthXLTTf3ePF8Ow==/RAvJwP3bdCH88opBIxHNA==YtwmFV6JyKHYTLkcp3Xxvw==(String)
<== Total: 1

```
```java

SysUserEncryption sysUserEncryption1 = easyQuery.queryable(SysUserEncryption.class).whereById("2").firstOrNull();
Assert.assertNotNull(sysUserEncryption1);
Assert.assertEquals(sysUserEncryption.getId(),sysUserEncryption1.getId());
Assert.assertEquals(sysUserEncryption.getPhoneSupportLike(),sysUserEncryption1.getPhoneSupportLike());
Assert.assertEquals(sysUserEncryption.getAddressSupportLike(),sysUserEncryption1.getAddressSupportLike());



==> Preparing: SELECT t.`id`,t.`name`,t.`phone_not_support_like`,t.`address_not_support_like`,t.`phone_support_like`,t.`address_support_like` FROM t_sys_user_encryption t WHERE t.`id` = ? LIMIT 1
==> Parameters: 2(String)
<== Total: 1


```
```java

SysUserEncryption sysUserEncryption2 = easyQuery.queryable(SysUserEncryption.class).where(o -> o.eq(SysUserEncryption::getPhoneSupportLike, "12345678901")).firstOrNull();
Assert.assertNotNull(sysUserEncryption2);
Assert.assertEquals(sysUserEncryption1.getId(),sysUserEncryption2.getId());



==> Preparing: SELECT t.`id`,t.`name`,t.`phone_not_support_like`,t.`address_not_support_like`,t.`phone_support_like`,t.`address_support_like` FROM t_sys_user_encryption t WHERE t.`phone_support_like` = ? LIMIT 1
==> Parameters: PBNjuyKlEazZoRRnMUupJA==IgrQqipSFtsBJal4l1uviA==act0SMpmvTNWd/+aBXnybA==avtYLQlFEztwFOYNB0x+Cw==XORntDPVNDrdId+JLsMH4w==S+w1G858r9lawlqhSbHw9A==VRhLsnycy28X4io+sRAScA==XNGeRBsmiV4Jd+iMjzyd6w==(String)
<== Total: 1



```
```java

SysUserEncryption sysUserEncryption3 = easyQuery.queryable(SysUserEncryption.class).where(o -> o.like(SysUserEncryption::getPhoneSupportLike, "34567")).firstOrNull();
Assert.assertNotNull(sysUserEncryption3);


==> Preparing: SELECT t.`id`,t.`name`,t.`phone_not_support_like`,t.`address_not_support_like`,t.`phone_support_like`,t.`address_support_like` FROM t_sys_user_encryption t WHERE t.`phone_support_like` LIKE ? LIMIT 1
==> Parameters: %act0SMpmvTNWd/+aBXnybA==avtYLQlFEztwFOYNB0x+Cw==%(String)
<== Total: 1



```
```java

SysUserEncryption sysUserEncryption4 = easyQuery.queryable(SysUserEncryption.class).where(o -> o.like(SysUserEncryption::getAddressSupportLike, "2-102")).firstOrNull();
Assert.assertNotNull(sysUserEncryption4);


==> Preparing: SELECT t.`id`,t.`name`,t.`phone_not_support_like`,t.`address_not_support_like`,t.`phone_support_like`,t.`address_support_like` FROM t_sys_user_encryption t WHERE t.`address_support_like` LIKE ? LIMIT 1
==> Parameters: %/RAvJwP3bdCH88opBIxHNA==YtwmFV6JyKHYTLkcp3Xxvw==%(String)
<== Total: 1


```
```java

SysUserEncryption sysUserEncryption5 = easyQuery.queryable(SysUserEncryption.class).where(o -> o.likeMatchRight(SysUserEncryption::getAddressSupportLike, "2-102")).firstOrNull();
Assert.assertNotNull(sysUserEncryption5);


==> Preparing: SELECT t.`id`,t.`name`,t.`phone_not_support_like`,t.`address_not_support_like`,t.`phone_support_like`,t.`address_support_like` FROM t_sys_user_encryption t WHERE t.`address_support_like` LIKE ? LIMIT 1
==> Parameters: %/RAvJwP3bdCH88opBIxHNA==YtwmFV6JyKHYTLkcp3Xxvw==(String)
<== Total: 1

```
```java

SysUserEncryption sysUserEncryption6 = easyQuery.queryable(SysUserEncryption.class).where(o -> o.likeMatchLeft(SysUserEncryption::getAddressSupportLike, "浙江省绍兴市")).firstOrNull();
Assert.assertNotNull(sysUserEncryption6);


==> Preparing: SELECT t.`id`,t.`name`,t.`phone_not_support_like`,t.`address_not_support_like`,t.`phone_support_like`,t.`address_support_like` FROM t_sys_user_encryption t WHERE t.`address_support_like` LIKE ? LIMIT 1
==> Parameters: 5JxqmAe3vLE3As62ds8z/Q==RfK4efiC8TpWrlW8EYOE7Q==xYgFo1HQhvsZb3aqqJEr0w==taspTHZ7faxKgLu8WiR4xg==3K4XEON1qksj0l068srXLg==%(String)
<== Total: 1


```
```java

SysUserEncryption sysUserEncryption7 = easyQuery.queryable(SysUserEncryption.class).where(o -> o.like(SysUserEncryption::getAddressSupportLike, "绍兴")).firstOrNull();
Assert.assertNotNull(sysUserEncryption7);


==> Preparing: SELECT t.`id`,t.`name`,t.`phone_not_support_like`,t.`address_not_support_like`,t.`phone_support_like`,t.`address_support_like` FROM t_sys_user_encryption t WHERE t.`address_support_like` LIKE ? LIMIT 1
==> Parameters: %taspTHZ7faxKgLu8WiR4xg==%(String)
<== Total: 1

```
```java

//中文单字符不支持查询所以是空
SysUserEncryption sysUserEncryption8 = easyQuery.queryable(SysUserEncryption.class).where(o -> o.like(SysUserEncryption::getAddressSupportLike, "绍")).firstOrNull();
Assert.assertNull(sysUserEncryption8);

==> Preparing: SELECT t.`id`,t.`name`,t.`phone_not_support_like`,t.`address_not_support_like`,t.`phone_support_like`,t.`address_support_like` FROM t_sys_user_encryption t WHERE t.`address_support_like` LIKE ? LIMIT 1
==> Parameters: %UXUfduoPhC3qV7yzGkaYHg==%(String)
<== Total: 0
```

```java
sysUserEncryption7.setPhoneSupportLike("13232323321");
long l2 = easyQuery.updatable(sysUserEncryption7).executeRows();
Assert.assertEquals(1,l2);

==> Preparing: UPDATE t_sys_user_encryption SET `name` = ?,`phone_not_support_like` = ?,`address_not_support_like` = ?,`phone_support_like` = ?,`address_support_like` = ? WHERE `id` = ?
==> Parameters: name2(String),null(null),null(null),7OH9gTLq8hK4vflSizrRKg==rsW+JktKi+3iIq0Xm3vSSw==/RYbVYX8k/qGMprCZslddg==rsW+JktKi+3iIq0Xm3vSSw==/RYbVYX8k/qGMprCZslddg==TncRPIKuqNopeX/GJCgjGw==UH8PuTSDSuiTj+rLVsnjOA==2EppLfMm+O7BMtPJ7xH7CA==(String),5JxqmAe3vLE3As62ds8z/Q==RfK4efiC8TpWrlW8EYOE7Q==xYgFo1HQhvsZb3aqqJEr0w==taspTHZ7faxKgLu8WiR4xg==3K4XEON1qksj0l068srXLg==kGziT8zvaq0Mr4mgC0o8ew==o/KgX28zI/vzwYP6H+yBPQ==bIV0eBlAxjvAu53mCRCJKQ==3T589p9NTva5G7yy6Tw1zA==CbmPqpgcbPXq9ZnKJ6eFOg==7TBMWW5dxwjhmnuxffO2BQ==87EZCkWnYFik+lABuLm/0g==SiaBG+vnzNx/p2/7VNtYmw==R+BfXClbpMfdtvtgNpb2Kg==2bm0wNpPthXLTTf3ePF8Ow==/RAvJwP3bdCH88opBIxHNA==YtwmFV6JyKHYTLkcp3Xxvw==(String),2(String)
<== Total: 1
```

```java
long l3 = easyQuery.updatable(SysUserEncryption.class).set(SysUserEncryption::getPhoneSupportLike, "19876543210")
        .where(o -> o.eq(SysUserEncryption::getId, "2")).executeRows();
Assert.assertEquals(1,l2);

==> Preparing: UPDATE t_sys_user_encryption SET `phone_support_like` = ? WHERE `id` = ?
==> Parameters: 5mvI8ru5KU2gEoqUhUCR7A==MXfvDfZA1YdM7qws03g1ew==82zyfpam7R2nhH8QGEV2PA==IRTc1Xc89aXhLz6g2EMWtw==U+T8I0LMIZE62zLYLQPcHw==z21auLlv0TzO5sWM8E15Sg==o601InWNlOLFRSPiuivKLA==WlISXTG+AJUzRY1SF31+Eg==(String),2(String)
<== Total: 1
```
当然目前算法不一定是最优的空间也不一定是最有效的,但是这边也是提供了默认的希望大家可以pr相关思路算法等,`easy-query`目前可以做到高性能无感的列加密存储处理