import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
  "/": [
    "",
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
          children: ["readme.md","dependency-injection","config-java","config-kotlin","config-solon","config-spring-boot","config-option","annotation","replace-configure","logging","value-converter","kapt","easy-trans"],
        },
        {
          text: "基础操作",
          prefix: "basic/",
          children: ["readme.md","api-use","performance-desc","performance","proxy-starter","insert","update","delete","transaction"],
        },
        {
          text: "查询",
          prefix: "query/",
          children: ["readme.md","or-condition","paging","multi-query","group","select","native-sql","dynamic-table","stream-query","basic-type","to-map","select-column","union","select-sub","sub-query","relation","fill","where","reuse","case-when","dynaimic-where","dynamic-sort"],
        },
        {
          text: "高级",
          prefix: "adv/",
          children: ["readme.md","logic-delete","interceptor","batch","column-encryption","column-sql-func-auto","generated-key-sql-column","data-tracking","version","column-func","atomic-update"],
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
