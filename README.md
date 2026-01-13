# 🚗💢 你挡住我了！ (You Blocked Me!)

一个快速、简单、隐私友好的挪车通知系统。 🚀

✨ **预览地址：** [rolshen.xin/notify](https://rolshen.xin/notify)

---

## 📖 项目简介

当你发现别人的车挡住了你的去路，或者你不得不临时停靠在可能挡住别人的地方时，这个项目能帮你快速建立联系。

💡 **灵感来源：** 感谢 [lesnolie/movecar](https://github.com/lesnolie/movecar) 提供的优秀创意！❤️

---

## 🔥 功能特性

- ⚡️ **即时通知：** 通过简单的表单发送挪车请求，车主秒收通知。
- 📍 **精准定位：** 结合高德地图 API，自动获取并发送当前位置，方便车主找车。
- 🛡️ **隐私保护：** 无需公开电话号码，通过加密通道进行间接沟通。
- 📱 **适配移动端：** 专门优化的 UI 体验，单手操作无压力。
- 🔄 **状态追踪：** 实时轮询处理状态，确认车主是否已收到请求并出发。

---

## 🛠️ 技术栈

这个项目采用了现代化的前端与边缘计算技术：

- **框架：** [Astro 5.0](https://astro.build/) (全能的现代 Web 框架)
- **UI：** [React 19](https://react.dev/) + [Tailwind CSS 4](https://tailwindcss.com/)
- **API：** [Hono](https://hono.dev/) (超轻量级 Web 框架)
- **校验：** [Arktype](https://arktype.io/) (运行时类型校验)
- **部署：** 边缘计算服务 (Edge Workers & KV)

---

## 🚀 快速开始

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

### 4. 启动开发服务

```bash
pnpm dev
```

启动 Worker 服务（用于本地调试 API）：

```bash
pnpm worker:dev
```

---

## 🤝 贡献与感谢

欢迎提交 Issue 或 Pull Request！

再次感谢 [lesnolie/movecar](https://github.com/lesnolie/movecar) 的启发！🚗💨

---

🏠 **License:** MIT
