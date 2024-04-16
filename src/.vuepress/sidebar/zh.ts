import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
  "/": [
    "",
    "quick-preview",
    {
      text: "起步",
      prefix: "startup/",
      children: ["readme.md","quick-start","quick-plugin","nodsl","sql","framework-springboot","multi-module"],
    },
    // "quick-start",
    "question",
    "db_support",
    {
      text: "文档",
      icon: "note",
      prefix: "guide/",
      children: [
        {
          text: "配置",
          prefix: "config/",
          children: ["readme.md","dependency-injection","config-java","config-kotlin","config-solon","config-spring-boot","config-option","annotation","replace-configure","logging","api-mode","kapt","muti-datasource","easy-trans","plugin","plugin-plus-max-ultra"],
        },
        {
          text: "基础操作",
          prefix: "basic/",
          children: ["readme.md","api-use","performance-desc","performance","proxy-starter","quick-preview","insert","update","delete","insertOrUpdate","transaction"],
        },
        {
          text: "查询",
          prefix: "query/",
          children: ["readme.md","basic-type","anonymous-type","or-condition","paging","multi-query","group","order","select","native-sql","dynamic-table","stream-query","to-map","select-column","union","select-sub","sub-query","relation","relation-filter","fill","where","reuse","case-when","dynamic-where","dynamic-sort"],
        },
        {
          text: "复杂属性",
          prefix: "prop/",
          children: ["readme.md","json-prop","collection-prop","enum-prop","sql-column-prop","combine-prop","aggregate-prop"],
        },
        {
          text: "高级",
          prefix: "adv/",
          children: ["readme.md","value-converter","logic-delete","interceptor","batch","sql-func-v1","sql-func","column-encryption","column-sql-func-auto","generated-key-sql-column","data-tracking","version","column-func-new","column-func","atomic-update","value-object","jdbc-listener"],
        },
        {
          text: "超级",
          prefix: "super/",
          children: ["readme.md","sharding-table.md","sharding-datasource.md","sharding-all.md","default-route-rule","default-route-initializer","sharding-mod.md","sharding-time.md",
          "sharding-all-time.md","sharding-multi.md","sharding-sequence.md"],
        }
      ],
    },
    {
      text: "实战",
      icon: "note",
      prefix: "practice/",
      children: [
        {
          text: "对象",
          prefix: "entity/",
          collapsible:true,
          children: ["readme.md"],
        }
      ],
    },
    "support"
  ],
});
