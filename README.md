# Railway Track Recorder（铁路轨迹记录器）

一个本地可运行的铁路乘车轨迹记录 / 展示 / 回顾 MVP 项目。

> 当前阶段是 **MVP**：重点验证旅程录入、列表展示、详情查看、地图轨迹联动、删除流程闭环。

## 功能简介

- 录入铁路旅程（线路、起点站、终点站、车次/日期/备注可选）
- 旅程列表展示（按日期/创建时间倒序）
- 单条旅程详情展示（线路、站点、区段、备注）
- 地图展示当前选中旅程轨迹（Polyline，高亮，自动 fit）
- 删除旅程并同步更新列表 / 详情 / 地图状态

## 技术结构

- **前端**：React + Vite + React Leaflet
- **后端**：Node.js + Express
- **数据来源**：本地 JSON mock 数据（`backend/data/*.json`）
- **数据模式定义**：`shared/models/railway.ts`

## 项目结构

```text
.
├─ backend/
│  ├─ data/
│  │  ├─ stations.json
│  │  ├─ lines.json
│  │  ├─ segments.json
│  │  └─ trips.json
│  ├─ src/
│  │  ├─ dataStore.js
│  │  └─ server.js
│  └─ package.json
├─ frontend/
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ MapPanel.jsx
│  │  │  ├─ TripDetail.jsx
│  │  │  ├─ TripForm.jsx
│  │  │  └─ TripList.jsx
│  │  ├─ api.js
│  │  ├─ App.jsx
│  │  ├─ main.jsx
│  │  └─ styles.css
│  └─ package.json
├─ shared/models/railway.ts
├─ package.json
└─ README.md
```

## 安装与启动

### 1) 安装依赖

```bash
npm install
```

### 2) 启动后端（单独）

```bash
npm run dev:backend
```

默认地址：`http://localhost:4000`

### 3) 启动前端（单独）

```bash
npm run dev:frontend
```

默认地址：`http://localhost:5173`

### 4) 一键并行启动（可选）

```bash
npm run dev
```

## API 概览

- `GET /healthz` 健康检查
- `GET /api/stations` 全部站点
- `GET /api/lines` 全部线路
- `GET /api/segments?lineId=...` 全部区段（可按线路筛选）
- `GET /api/trips` 旅程列表（聚合基础展示字段，按日期倒序）
- `GET /api/trips/:id` 旅程详情（聚合线路、站点、区段、地图坐标）
- `POST /api/trips` 新增旅程（自动计算 `segmentIds`）
- `DELETE /api/trips/:id` 删除旅程

统一返回格式：

```json
{
  "success": true,
  "data": {}
}
```

错误时：

```json
{
  "success": false,
  "error": {
    "message": "错误信息"
  }
}
```

## 使用说明

1. 左侧表单选择线路后，起终点站将自动按线路过滤。
2. 提交后后端校验线路与站点关系，自动生成连续区段并创建旅程。
3. 左侧旅程列表点击任意项，可在右侧查看详情和地图轨迹。
4. 删除旅程时会进行二次确认，删除后列表 / 详情 / 地图同步更新。

## 当前限制

- 当前使用本地 mock JSON 数据，不包含实时铁路数据。
- 不包含铁路导航算法、实时车次查询、登录鉴权、多用户系统。
- 地图轨迹为演示性质简化折线，不保证 GIS 精度。

## 后续扩展建议

- 导入更多线路与站点数据
- 已乘区间点亮与覆盖统计
- 旅程里程、频次、城市维度统计
- 多段旅程组合（同一天多段）
- 地图样式增强（站点 marker、线路图层切换）
- 将 trips 持久化为轻量数据库（SQLite / Postgres）
