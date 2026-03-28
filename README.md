# Railway Track Recorder

Railway Track Recorder（铁路轨迹记录器）项目骨架。

本轮只完成基础工程搭建：前后端初始化、启动脚本、类型定义、mock 数据目录与最小占位页面。

## 目录结构

```text
railway-track-recorder/
├─ backend/
│  ├─ data/
│  │  └─ mock/
│  │     └─ README.md
│  ├─ src/
│  │  └─ server.js
│  └─ package.json
├─ frontend/
│  ├─ src/
│  │  ├─ App.jsx
│  │  ├─ main.jsx
│  │  └─ styles.css
│  ├─ index.html
│  ├─ vite.config.js
│  └─ package.json
├─ shared/
│  └─ models/
│     └─ railway.ts
├─ package.json
└─ README.md
```

## 已完成（Skeleton）

- 前端与后端目录初始化
- 根目录与子项目启动脚本
- 后端健康检查接口：`GET /healthz`
- 前端最小页面（显示标题 `Railway Track Recorder`）
- mock 数据目录占位
- 铁路领域模型类型定义（`shared/models/railway.ts`）

## 启动方式

### 1) 安装依赖

```bash
npm install
```

### 2) 启动后端

```bash
npm run dev:backend
```

后端默认地址：`http://localhost:4000`  
健康检查：`http://localhost:4000/healthz`

### 3) 启动前端

```bash
npm run dev:frontend
```

前端默认地址：`http://localhost:5173`

## 下一轮建议

优先实现后端基础资源 API（`/api/stations`、`/api/lines`、`/api/segments`）并接入一份最小 mock 数据。
