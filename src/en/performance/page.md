---
title: Pagination Query Count Slow
order: 60
---

`eq`'s toPageResult provides 3 parameters. If you pass a parameter greater than or equal to 0 for the third parameter, it means you told the framework how many totals there are in this query. Then the framework will not query `count` but directly use `toList` to return the result count `pageSize` in the form of `limit+toList`.

Combined with the frontend not performing page jumps, you can optimize performance degradation when pagination+count, and you can use `Integer.MAX_VALUE` as a fixed value.

<!-- ## MySQL
MySQL large data table parallel manual splitting feasibility

For example, if a query has a condition from 2020 to 2024, can it be split into 4 years and then 4 SQL queries run in parallel to aggregate the results? The feasibility of splitCountBy setting? Set splitColumn such as time, then query the condition result is max and min before count for an extra query to speed up count feasibility??? -->

