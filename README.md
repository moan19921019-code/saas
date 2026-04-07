# 报表点评服务

给 HTML 报告添加点评/评论功能，支持局域网共享。

## 快速开始

### 1. 安装依赖

```bash
pip install flask
```

### 2. 启动服务

```bash
python review_server.py
```

或双击 `start.bat`（Windows）

### 3. 打开报告

访问 http://localhost:5001/ 查看报告列表并打开报告。

### 4. 添加点评

点击右下角 💬 按钮打开点评面板，输入内容发布。

## 给报告添加点评功能

### 自动添加

```bash
python add_tags.py 报告.html
```

### 手动添加

在报告 HTML 文件中添加：

```html
<!-- 在 <head> 中添加 -->
<meta name="report-id" content="你的唯一ID">

<!-- 在 </body> 前添加 -->
<script src="http://localhost:5001/inject.js"></script>
```

## 局域网共享

服务启动后，局域网内其他设备访问：

```
http://你的IP:5001/
```

评论数据自动共享。

## 文件说明

| 文件 | 说明 |
|------|------|
| review_server.py | Flask 后端服务 |
| inject.js | 前端点评面板 |
| add_tags.py | 自动添加标签工具 |
| start.bat | Windows 启动脚本 |

## 依赖

- Python 3.7+
- Flask
