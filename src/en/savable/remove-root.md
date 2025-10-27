---
title: Remove Aggregate Root
order: 120
---

# Remove Aggregate Root
Normally, our `savable` only has the function of adding or modifying. By adding `removeRoot`, we can achieve deletion of the entire aggregate root.
```java
//include query
            try (Transaction transaction = easyEntityQuery.beginTransaction()) {
                easyEntityQuery.savable(m8SaveRoot).removeRoot().executeCommand();
                transaction.commit();
            }
```
`removeRoot` will set all navigation properties of the object to null, and then all navigations queried this time will be deleted.

