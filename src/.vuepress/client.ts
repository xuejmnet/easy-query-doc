import { defineClientConfig } from "vuepress/client";
import { onMounted, nextTick } from "vue";
import Typed from "typed.js";

// 保存 Typed 实例，用于销毁旧实例
let typedInstance: Typed | null = null;

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
    // 只在客户端环境执行（SSR 兼容）
    if (typeof window !== 'undefined') {
      // 路由切换后重新初始化
      router.afterEach(() => {
        setTimeout(() => {
          tryInitTyped();
        }, 100);
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
        });
      });
    }
  },
});

