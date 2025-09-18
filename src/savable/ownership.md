---
title: 对象所属权变更
order: 110
---

# 对象所属权变更
在 ORM（对象关系映射）里说的 对象所属权变更，一般指的是实体之间关系的“主控方”发生变化，或者说 某个对象从一个父对象的“归属”转移到另一个父对象。
换句话说，它涉及 谁来维护外键 / 关系字段 的改变。

## 案例

```java

    @PostMapping("/create2")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object create2() {
        ArrayList<SaveUser> users = new ArrayList<>();
        {

            SaveUser saveUser = new SaveUser();
            users.add(saveUser);
            saveUser.setId("小明1的id");
            saveUser.setName("小明1");
            saveUser.setAge(19);
            saveUser.setCreateTime(LocalDateTime.now());

            SaveUserExt saveUserExt = new SaveUserExt();
            saveUserExt.setMoney(BigDecimal.ZERO);
            saveUserExt.setHealthy(true);
            saveUser.setSaveUserExt(saveUserExt);

            SaveUserAddress saveUserAddress = new SaveUserAddress();
            saveUserAddress.setId("小明1的家的id");
            saveUserAddress.setProvince("浙江省");
            saveUserAddress.setCity("绍兴市");
            saveUserAddress.setArea("越城区");
            saveUserAddress.setAddress("小明1的家");
            saveUser.setSaveUserAddress(saveUserAddress);
        }
        {

            SaveUser saveUser = new SaveUser();
            users.add(saveUser);
            saveUser.setId("小明2的id");
            saveUser.setName("小明2");
            saveUser.setAge(19);
            saveUser.setCreateTime(LocalDateTime.now());

            SaveUserExt saveUserExt = new SaveUserExt();
            saveUserExt.setMoney(BigDecimal.ZERO);
            saveUserExt.setHealthy(true);
            saveUser.setSaveUserExt(saveUserExt);

            SaveUserAddress saveUserAddress = new SaveUserAddress();
            saveUserAddress.setId("小明2的家的id");
            saveUserAddress.setProvince("浙江省");
            saveUserAddress.setCity("绍兴市");
            saveUserAddress.setArea("越城区");
            saveUserAddress.setAddress("小明2的家");
            saveUser.setSaveUserAddress(saveUserAddress);
        }
        easyEntityQuery.savable(users).executeCommand();
        return "ok";
    }


    @PostMapping("/change2")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object change2() {

        List<SaveUser> list = easyEntityQuery.queryable(SaveUser.class)
                .include(save_user -> save_user.saveUserAddress())
                .toList();
        SaveUser xm1 = list.get(0);
        SaveUserAddress xm1address = xm1.getSaveUserAddress();
        SaveUser xm2 = list.get(1);
        SaveUserAddress xm2address = xm2.getSaveUserAddress();
        xm1.setSaveUserAddress(xm2address);
        xm2.setSaveUserAddress(xm1address);

        easyEntityQuery.savable(list).executeCommand();
        return "ok";
    }
```
新增小明1和小明2两个对象,分别交换两个用户地址
```java
com.easy.query.core.exception.EasyQueryInvalidOperationException: relation value not equals,entity:[SaveUserAddress],property:[uid],value:[b8aefc1c7ef040379839d26af91765d3],should:[8f5a841478164e97b09db58107ace085]. Current OwnershipPolicy does not allow reassignment.
```
提示错误无法变更对象所有权,框架为了保证数据的误操作和正确性默认不允许用户变更对象的所有权,也就是值对象无法轻易变更所属的聚合根,我们可以通过配置让框架支持所有权变更
```java
easyEntityQuery.savable(list)
                .configure(s->s.getSaveBehavior().add(SaveBehaviorEnum.ALLOW_OWNERSHIP_CHANGE))
                .executeCommand();
```
通过添加`ownershipPolicy(OwnershipPolicyEnum.AllowOwnershipChange)`让框架支持值对象所有权的变更
```sql

UPDATE `t_save_user_addr`
SET `uid` = '小明1的id'
WHERE `id` = '小明2的家的id'

UPDATE `t_save_user_addr`
SET `uid` = '小明2的id'
WHERE `id` = '小明1的家的id'

```