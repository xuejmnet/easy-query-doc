import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
  "/": [
    "",
    {
      text: "文档",
      icon: "note",
      prefix: "guide/",
      children: [
        {
          text: "配置",
          prefix: "config/",
          children: ["readme.md","dependency-injection","config-java","config-kotlin","config-option","replace-configure","logging","value-converter"],
        },
        {
          text: "基础操作",
          prefix: "basic/",
          children: ["readme.md","performance","proxy-starter","insert","update","delete","transaction"],
        },
        {
          text: "查询",
          prefix: "query/",
          children: ["readme.md","or-condition","paging","multi-query","group","select","native-sql","dynamic-table","basic-type","to-map","select-column","union","select-sub","sub-query","relation","where","reuse","case-when","client-dynaimic-where","client-dynamic-sort","sql-func","sql-segment"],
        },
        {
          text: "高级",
          prefix: "adv/",
          children: ["readme.md","logic-delete","interceptor","batch","column-encryption","data-tracking","version","column-func","atomic-update"],
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
