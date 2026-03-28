# Railway Track Recorder（铁路轨迹记录器）

一个面向“铁路乘车轨迹记录 / 展示 / 回顾”的本地 MVP 项目。

> 本项目不是导航软件，不提供起终点自动路径规划；重点是记录用户坐过哪些铁路区间。

## 技术选型

- 前端：React + Vite + Leaflet（react-leaflet）
- 后端：Node.js + Express
- 数据源：本地 JSON 文件（`backend/data/*.json`）

## 项目结构

```text
railway-track-recorder/
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
│  ├─ index.html
│  ├─ vite.config.js
│  └─ package.json
├─ package.json
└─ README.md
```

## MVP 功能

- ✅ 录入铁路旅程（手动 / 预置线路连续区段）
- ✅ 旅程列表展示（默认按日期降序）
- ✅ 旅程详情展示（含聚合后的站名、线路、区段）
- ✅ 地图展示当前选中旅程轨迹（polyline）
- ✅ 删除旅程
- ✅ 空状态 / 加载状态 / 错误状态
- ✅ 本地 mock 数据（11 个站点、3 条线路、10 个区段、3 条示例旅程）

## 核心数据对象

- `Station`
- `RailwayLine`
- `RailwaySegment`
- `RailwayTrip`
- `RailwayTripSegment`

数据字段定义可直接参考 `backend/data/*.json` 与 `POST /api/trips` 的入参结构。

## API 设计

统一响应格式：

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

或错误：

```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "...",
    "details": []
  }
}
```

### 已实现接口

- `GET /api/stations`
- `GET /api/lines`
- `GET /api/segments`
- `GET /api/trips?sort=desc|asc`
- `GET /api/trips/:id`（返回聚合详情：站名、线路名、segment 明细、完整 geometry）
- `POST /api/trips`
- `DELETE /api/trips/:id`

## 本地运行

### 1) 安装依赖

```bash
npm install
```

### 2) 启动前后端（推荐）

```bash
npm run dev
```

- 前端：http://localhost:5173
- 后端：http://localhost:4000

### 3) 单独启动

```bash
npm run dev:backend
npm run dev:frontend
```

## 使用说明

1. 左侧查看旅程列表并点击选择。
2. 地图仅展示当前选中旅程轨迹，并自动 fit bounds。
3. 右下详情面板可查看旅程区段详情并删除。
4. 左侧底部表单可新增旅程：
   - 手动录入单段
   - 选择预置线路上的起终点，自动生成连续区段 segmentIds

## 当前限制

- 仅本地 JSON 文件持久化（`backend/data/trips.json`）。
- 目前新增旅程一次仅提交一个 `RailwayTripSegment`（结构上已支持扩展为多段）。
- 坐标为演示用抽样点，不代表精确测绘线路。
- 无用户系统、无权限控制、无云端部署。

## 下一步建议

1. 支持单次旅程多段编辑（换乘/跨线路可视化拼接）。
2. 增加筛选与统计：按年份、按线路、总里程。
3. 将 JSON 存储升级为 SQLite（仍保持本地优先）。
4. 增加导入导出（JSON / GeoJSON）。
5. 支持地图底图切换与轨迹样式配置。
