# 🚗💢 You Blocked Me!

A modern car-moving notification system built with **Effect-ts**, capable of running on **Aliyun ESA** and **Cloudflare** workers simultaneously. 🚀

[中文文档](./README_zh-CN.md) | [Live Preview](https://rolshen.xin/notify)

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/shlroland/you-blocked-me)

> **Note**: After deployment, please go to **Cloudflare Dashboard > Workers > Settings > Variables** to set:
> * `AMAP_SECURITY_KEY`: Your Amap (Gaode) API Key
> * `SERVER3_SEND_KEY`: Your ServerChan/Notification Key
> * `YOU_BLOCKED_ME`: Create a KV Namespace and bind it to variable name `YOU_BLOCKED_ME`

---

## 🌟 Key Highlights

### 1. ⚡️ Powered by Effect-ts
The core business logic is entirely built using [Effect-ts](https://effect.website/). Leveraging its powerful **Structured Concurrency**, **Dependency Injection**, and **Error Handling** mechanisms, we ensure the business logic is robust and maintainable. We are not just writing code with Effect; we are embracing a new paradigm for building high-reliability software.

### 2. ☁️ Multi-Cloud Serverless Architecture
This is not just a single-platform application. We designed a flexible Adaptor Pattern that allows the same business code to run on multiple edge computing platforms:
*   **Aliyun ESA (Edge Security Acceleration)**
*   **Cloudflare Workers**

The architecture is designed for extensibility, with support for more Serverless runtime environments coming in the future.

### 3. 🔥 Bleeding Edge Tech Stack
*   **Effect**: Core business logic and side-effect management
*   **Astro 5.0**: High-performance modern Web framework
*   **React 19 + Tailwind CSS 4**: Fast, beautiful UI construction


---

## 📖 Features

- ⚡️ **Instant Notifications:** Send moving requests with a simple form; owners receive notifications in seconds.
- 📍 **Precise Location:** Integrated with Amap (Gaode) API to automatically capture and send current location, helping owners find their cars easily.
- 🛡️ **Privacy First:** Communicate indirectly through encrypted channels without revealing phone numbers.
- 📱 **Mobile Optimized:** A UI experience designed specifically for mobile devices, easy for one-handed operation.
- 🔄 **Status Tracking:** Real-time polling of processing status to confirm if the owner has received the request and is on their way.

---

## 🛠️ Quick Start

### 1. Clone the project

```bash
git clone https://github.com/shlroland/you-blocked-me.git
cd you-blocked-me
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configuration

Copy `.env.example` to `.env` and fill in the necessary information:

```bash
AMAP_SECURITY_KEY=xxx
SERVER3_SEND_KEY=xxx
> * `YOU_BLOCKED_ME`: Create a KV Namespace and bind it to variable name `YOU_BLOCKED_ME`
```

### 4. Development

We provide development commands for different runtimes:

*   **Start Frontend Dev Server (Astro):**
    ```bash
    pnpm dev
    ```

*   **Start Cloudflare Workers Debugging:**
    ```bash
    pnpm worker:dev:wrangler
    ```

*   **Start Aliyun ESA Debugging:**
    ```bash
    pnpm worker:dev:esa
    ```

### 5. Build & Deploy

Choose the build command based on your target platform:

*   **Build for Aliyun ESA:**
    ```bash
    pnpm build:esa
    ```

*   **Build for Cloudflare:**
    ```bash
    pnpm build:cf
    ```

---

## 🤝 Contribution & Acknowledgements

💡 **Inspiration:** Thanks to [lesnolie/movecar](https://github.com/lesnolie/movecar) for the excellent idea! ❤️

Issues and Pull Requests are welcome, especially if you are interested in adapting Effect-ts for more Serverless platforms!

---

🏠 **License:** MIT
