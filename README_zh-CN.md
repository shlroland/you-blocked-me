# 🚗💢 你挡住我了！ (You Blocked Me!)

一个基于 **Effect-ts** 构建，能够同时运行在 **阿里云 ESA** 和 **Cloudflare** 等 Serverless 环境下的现代化挪车通知系统。 🚀

✨ **预览地址：** [rolshen.xin/notify](https://rolshen.xin/notify)

---

## 🌟 核心亮点

### 1. ⚡️ Effect-ts 驱动
本项目核心业务逻辑完全采用了 [Effect-ts](https://effect.website/) 构建。利用其强大的**结构化并发**、**依赖注入**和**错误处理**机制，确保了业务逻辑的健壮性与可维护性。我们不仅仅是用 Effect 写代码，而是拥抱了一种构建高可靠软件的全新范式。

### 2. ☁️ 多云 Serverless 架构
这不仅仅是一个运行在单一平台的应用。我们设计了灵活的适配器模式（Adaptor Pattern），实现了一套业务代码同时在多个边缘计算平台运行：
*   **Aliyun ESA (阿里云边缘安全加速)**
*   **Cloudflare Workers**

系统架构已预留扩展接口，未来将支持更多 Serverless 运行时环境。

### 3. 🔥 极致的现代技术栈
*   **Effect**: 核心业务逻辑与副作用管理
*   **Astro 5.0**: 高性能的现代 Web 框架
*   **React 19 + Tailwind CSS 4**: 快速、美观的 UI 构建


---

## 📖 功能特性

- ⚡️ **即时通知：** 简单的表单即可发送挪车请求，车主秒收通知。
- 📍 **精准定位：** 集成高德地图 API，自动获取并发送当前位置，方便车主找车。
- 🛡️ **隐私保护：** 无需公开电话号码，通过加密通道进行间接沟通。
- 📱 **极致体验：** 专为移动端优化的 UI 体验，单手操作无压力。
- 🔄 **状态追踪：** 实时轮询处理状态，确认车主是否已收到请求并出发。

---

## 🛠️ 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/shlroland/you-blocked-me.git
cd you-blocked-me
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 环境配置

复制 `.env.example` 并更名为 `.env`，填入必要的信息：

```bash
AMAP_SECURITY_KEY=xxx
SERVER3_SEND_KEY=xxx
```

### 4. 开发指南

我们提供了针对不运行时的开发命令：

*   **启动前端开发服务 (Astro):**
    ```bash
    pnpm dev
    ```

*   **启动 Cloudflare Workers 调试环境:**
    ```bash
    pnpm worker:dev:wrangler
    ```

*   **启动 Aliyun ESA 调试环境:**
    ```bash
    pnpm worker:dev:esa
    ```

### 5. 构建部署

根据目标平台选择构建命令：

*   **构建 Aliyun ESA 版本:**
    ```bash
    pnpm build:esa
    ```

*   **构建 Cloudflare 版本:**
    ```bash
    pnpm build:cf
    ```

---

## 🤝 贡献与感谢

💡 **灵感来源：** 感谢 [lesnolie/movecar](https://github.com/lesnolie/movecar) 提供的优秀创意！❤️

欢迎提交 Issue 或 Pull Request，特别是如果你有兴趣通过 Effect-ts 适配更多的 Serverless 平台！

---

🏠 **License:** MIT
