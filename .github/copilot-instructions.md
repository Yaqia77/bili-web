## 快速上手（AI 代理指南）

以下说明面向想快速在本仓库中安全、高效修改/新增代码的 AI 代理。内容基于仓库当前可见文件（主要是 Vite + Vue3 模板改造）。请仅修改可被代码直接验证的内容，避免未验证的全局重构。

- 主要栈：Vue 3 (script setup SFCs)、Vite、Pinia、Vue Router、Element Plus。入口文件：`src/main.js`。
- 包管理：仓库包含 `pnpm-lock.yaml`，优先使用 `pnpm`（命令示例：`pnpm dev`、`pnpm build`、`pnpm preview`）。

关键约定与可修改点
- 路径别名：`@` 指向 `src`（见 `vite.config.js`）。优先使用 `@/...` 进行跨目录导入，例如 `@/components/...`。
- 开发代理：所有以 `/api` 前缀的后端请求通过 Vite proxy 转发到 `http://localhost:7071/`（见 `vite.config.js`）。在后端交互时，使用相对前缀 `/api` 而非硬编码后端地址。
- 全局属性：`src/main.js` 在 `app.config.globalProperties` 上注入了 `VueCookies`、`bodyMaxWidth`、`bodyMinWidth`。当修改布局或组件需要使用这些值时从 `getCurrentInstance().proxy` 读取。
- 状态管理：项目使用 Pinia（`createPinia()`）。新增全局状态请在 `src/stores/` 下创建模块式 store。

代码样式与结构
- SFC 使用 `<script setup>` 风格。大多数组件使用 scoped 样式（`<style scoped>`）。优先跟随既有组件组织模式。
- 样式使用 SCSS，并有全局入口 `src/assets/scss/base.scss`，放置公共变量/混入/重置样式。

常见依赖与意图
- 媒体与播放器：`artplayer`、`hls.js`、`artplayer-plugin-danmuku` → 与视频播放/弹幕相关。
- 可视化：`echarts`。
- 工具/通信：`axios`（HTTP）、`mitt`（事件总线）、`js-md5`、`moment` 等。

项目中需要注意的可观测细节（AI 代理必须核查）
- 文件导入路径不一致：在 `src/views/layout.vue` 内部有 `import LayoutHeader from '@/compontents/LayoutHeader.vue'`，但仓库目录是 `src/components/`（`components` 而非 `compontents`）。这类拼写/路径不一致是常见运行时错误点；在修改 import 时务必验证路径存在并运行 dev 构建检查。
- 只有一个显式路由（`/` 指向 `src/views/layout.vue`）。新增页面请在 `src/views/` 建立 SFC 并在 `src/router/index.js` 注册路由（使用懒加载 `() => import('...')` 的方式与现有一致）。

工作流命令（在 Windows PowerShell 下）
- 本地开发：`pnpm dev`（会启动 Vite，默认端口 3000）
- 生产构建：`pnpm build`
- 本地预览构建产物：`pnpm preview`

良好实践（基于仓库可见模式，非全局建议）
- 修改前先运行 `pnpm dev` 验证编译/热更新，无需额外 lint 配置因为仓库未包含 ESLint/Prettier 配置。
- 与后端交互使用 `/api` 前缀，避免改动 `vite.config.js` 的 proxy 除非确认后端地址变更。
- 新建组件请放在 `src/components/`，并使用 `@/components/Name.vue` 的导入路径。

要查阅的关键文件
- `package.json`（依赖与 scripts）
- `vite.config.js`（alias、proxy、dev server 配置）
- `src/main.js`（应用启动、插件注册、全局属性）
- `src/router/index.js`（路由注册模式）
- `src/views/layout.vue`（页面布局与样式示例）
- `src/assets/scss/base.scss`（全局样式入口）

如果你需要我把这些约定转化为具体的代码修改（修正拼写导入、添加路由、创建 store、或添加 axios base 实例），请说明具体目标，我会先在分支/补丁中小步提交并运行 dev 检查。

---
请告诉我哪些部分需要更详细的示例（例如：axios 实例模版、Pinia store skeleton、或组件结构模版），我将生成并在仓库中添加示例文件。 
