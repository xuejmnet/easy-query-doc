import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/easy-query-doc/",

  locales: {
    "/": {
      lang: "zh-CN",
      title: "文档演示",
      description: "easy-query的文档演示",
    },
    "/en/": {
      lang: "en-US",
      title: "Documentation",
      description: "Documentation for easy-query",
    },
  },

  // 减少并发构建数量，降低内存使用
  shouldPrefetch: false,

  theme,
  // Enable it with pwa
  // shouldPrefetch: false,
});
