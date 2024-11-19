import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
  "/": [
    "",
    "quick-preview",
    "question",
    {
      text: "起步",
      prefix: "startup/",
      children: ["readme","quick-start","complex-query","ability","annotation"],
    },
    {
      text: "配置",
      prefix: "config/",
      children: ["readme.md","dependency-injection","config-java","config-kotlin","config-solon","config-spring-boot","config-option","annotation","replace-configure","logging","api-mode","kapt","muti-datasource","easy-trans","plugin"],
    },
    {
      text: "基础操作",
      prefix: "basic/",
      children: ["readme.md","api-use","performance-desc","performance","quick-preview","insert","update","delete","insertOrUpdate","transaction"],
    },
    {
      text: "查询",
      prefix: "query/",
      children: ["readme.md","select","basic-type","anonymous-type","or-condition","paging","multi-query","group","partition","order","native-sql","dynamic-table","stream-query","to-map","select-column","union","select-sub","where-sub","relation","relation-filter","select-auto-include","fill","where","reuse","case-when","dynamic-where","dynamic-sort"],
    },
    {
      text: "计算属性",
      prefix: "prop/",
      children: ["readme.md","json-prop","collection-prop","enum-prop","sql-column-prop","status-prop","combine-prop","aggregate-prop","sql-column-generate-prop"],
    },
    {
      text: "高级",
      prefix: "adv/",
      children: ["readme.md","logic-delete","auto-key","interceptor","batch","sql-func-v1","sql-func","column-encryption","column-sql-func-auto","data-tracking","version","column-func-new","column-func","value-object","jdbc-listener","type-handler"],
    },
    {
      text: "注解",
      prefix: "annotations/",
      children: ["navigate-flat"],
    },
    {
      text: "超级",
      prefix: "super/",
      children: ["readme.md","sharding-table.md","sharding-datasource.md","sharding-all.md","default-route-rule","default-route-initializer","sharding-mod.md","sharding-time.md",
      "sharding-all-time.md","sharding-multi.md","sharding-sequence.md"],
    },
    {
      text: "实战",
      icon: "note",
      prefix: "practice/",
      children: [
        {
          text: "基础配置",
          prefix: "configuration/",
          collapsible:true,
          children: ["readme.md","entity.md","exception.md"],
        },
        {
          text: "注解处理器",
          prefix: "apt/",
          collapsible:true,
          children: ["readme.md","compile-repo.md"],
        }
      ],
    },
    "support"
  ],
});
