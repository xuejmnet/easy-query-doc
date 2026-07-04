import { defineClientConfig } from "vuepress/client";
import { onMounted, nextTick } from "vue";
import Typed from "typed.js";

// 保存 Typed 实例，用于销毁旧实例
let typedInstance: Typed | null = null;

interface AdItem {
  image: string;
  link: string;
}

// 全局广告位配置
const AD_BANNER_ID = "global-ad-banner-list";
const AD_LIST: AdItem[] = [
  { image: "images/adv/yixin.png", link: "https://yxai.chat/" },
  // { image: "images/adv/adv.png", link: "https://www.baidu.com" },
  // 在这里继续添加更多广告
];
let adImageBase = "";

function injectAdBanner() {
  // 检查是否在浏览器环境（SSR 兼容）
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  // 查找右侧目录容器
  const toc = document.querySelector("aside#toc");
  if (!toc) {
    return false;
  }

  // 如果广告列表已经在目录最顶部，无需重复注入
  if (toc.firstElementChild?.id === AD_BANNER_ID) {
    return true;
  }

  // 如果广告列表在其他位置，先移除
  const existing = document.getElementById(AD_BANNER_ID);
  if (existing) {
    existing.remove();
  }

  const container = document.createElement("div");
  container.id = AD_BANNER_ID;
  container.className = "global-ad-banner-list";

  AD_LIST.forEach((ad, index) => {
    const link = document.createElement("a");
    link.href = ad.link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "global-ad-banner";

    const img = document.createElement("img");
    img.src = `${adImageBase}${ad.image}`;
    img.alt = `广告${index + 1}`;

    link.appendChild(img);
    container.appendChild(link);
  });

  toc.insertBefore(container, toc.firstChild);

  return true;
}

let adObserver: MutationObserver | null = null;

// 通过 MutationObserver 监听目录容器，解决左侧菜单切换时广告被移除的问题
function observeTocForAd() {
  // 检查是否在浏览器环境（SSR 兼容）
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  // 避免重复创建观察者
  if (adObserver) {
    return;
  }

  // 先尝试注入一次
  injectAdBanner();

  adObserver = new MutationObserver(() => {
    injectAdBanner();
  });

  adObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function initTyped() {
  // 检查是否在浏览器环境（SSR 兼容）
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  // 查找目标元素
  const element = document.querySelector('.vuepress_typed');
  
  if (!element) {
    return false;
  }

  // 如果已经有实例，先销毁
  if (typedInstance) {
    typedInstance.destroy();
    typedInstance = null;
  }

  // 创建新的 Typed 实例
  typedInstance = new Typed('.vuepress_typed', {
    strings: [
      '<b><span class="color-clazz">List</span>&lt;<span class="color-clazz">ORM</span>&gt; orm = <span class="color-var">eq</span>.<span class="color-method">queryable</span>(<span class="color-clazz">ORM</span>.<span class="color-key">class</span>)</br><span class="margin-right-home"></span>.<span class="color-method">where</span>(<span class="color-lambda">orm</span> -> <span class="color-lambda">orm</span>.<span class="color-method">name</span>().<span class="color-method">like</span>(<span class="color-const">"easy-query"</span>))</br><span class="margin-right-home"></span>.<span class="color-method">orderBy</span>(<span class="color-lambda">orm</span> -> <span class="color-lambda">orm</span>.<span class="color-method">time</span>().<span class="color-method">asc</span>())</br><span class="margin-right-home"></span>.<span class="color-method">toList</span>()</b>',
      '<b><span class="color-clazz">List</span>&lt;<span class="color-clazz">ORM</span>&gt; orm = <span class="color-var">eq</span>.<span class="color-method">queryable</span>(<span class="color-clazz">ORM</span>.<span class="color-key">class</span>)</br><span class="margin-right-home"></span>.<span class="color-method">where</span>(<span class="color-lambda">orm</span> -> <span class="color-lambda">orm</span>.<span class="color-method">best</span>().<span class="color-method">name</span>().<span class="color-method">like</span>(<span class="color-const">"easy-query"</span>))</br><span class="margin-right-home"></span>.<span class="color-method">orderBy</span>(<span class="color-lambda">orm</span> -> <span class="color-lambda">orm</span>.<span class="color-method">time</span>().<span class="color-method">asc</span>())</br><span class="margin-right-home"></span>.<span class="color-method">toList</span>()</b>',
      '<b><span class="color-clazz">List</span>&lt;<span class="color-clazz">ORM</span>&gt; orm = <span class="color-var">eq</span>.<span class="color-method">queryable</span>(<span class="color-clazz">ORM</span>.<span class="color-key">class</span>)</br><span class="margin-right-home"></span>.<span class="color-method">leftJoin</span>(<span class="color-clazz">BEST</span>.<span class="color-key">class</span>, (<span class="color-lambda">orm</span>, <span class="color-lambda">best</span>) -> <span class="color-lambda">orm</span>.<span class="color-method">id</span>().<span class="color-method">eq</span>(<span class="color-lambda">best</span>.<span class="color-method">id</span>()))</br><span class="margin-right-home"></span>.<span class="color-method">where</span>(( <span class="color-lambda">orm</span>, <span class="color-lambda">best</span>) -> <span class="color-lambda">orm</span>.<span class="color-method">name</span>().<span class="color-method">like</span>(<span class="color-const">"easy-query"</span>))</br><span class="margin-right-home"></span>.<span class="color-method">orderBy</span>(( <span class="color-lambda">orm</span>, <span class="color-lambda">conf</span>) -> <span class="color-lambda">orm</span>.<span class="color-method">time</span>().<span class="color-method">desc</span>())</br><span class="margin-right-home"></span>.<span class="color-method">toList</span>()</b>'
    ],
    typeSpeed: 20,      // 打字速度
    backSpeed: 0,       // 回退速度
    loop: true,         // 循环
    contentType: 'html' // 支持 HTML 内容
  });

  return true;
}

// 尝试初始化，如果失败则重试
function tryInitTyped(maxRetries = 10, delay = 300) {
  // 检查是否在浏览器环境（SSR 兼容）
  if (typeof window === 'undefined') {
    return;
  }

  let retries = 0;
  
  const attemptInit = () => {
    if (initTyped()) {
      return;
    }
    
    retries++;
    if (retries < maxRetries) {
      setTimeout(attemptInit, delay);
    }
  };
  
  attemptInit();
}

export default defineClientConfig({
  enhance({ app, router, siteData }) {
    // 记录站点 base 路径，用于拼接广告图片地址
    adImageBase = siteData.value.base || "";

    // 只在客户端环境执行（SSR 兼容）
    if (typeof window !== 'undefined') {
      // 路由切换后重新初始化
      router.afterEach(() => {
        setTimeout(() => {
          tryInitTyped();
        }, 100);
        observeTocForAd();
      });
    }
  },
  setup() {
    // 只在客户端环境执行（SSR 兼容）
    if (typeof window !== 'undefined') {
      onMounted(() => {
        // 使用 nextTick 确保 DOM 已渲染
        nextTick(() => {
          tryInitTyped();
          observeTocForAd();
        });
      });
    }
  },
});

