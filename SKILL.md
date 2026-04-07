---
name: report-comments
description: 给 HTML 报告添加点评/评论功能，支持局域网共享
---

# 报表点评服务 Skill

## 功能概述

快速给任意 HTML 报告添加点评功能，支持本机和局域网共享。

## 使用场景

- 团队内部共享报告并讨论
- 收集多方对报告的反馈
- 需要集中管理报告评论

## 快速开始

### 1. 启动服务

```
python review_server.py
```

或双击 `start.bat`（Windows）

### 2. 添加点评功能到报告

运行自动添加工具：
```
python add_tags.py 报告.html
```

或手动添加两行代码：

```html
<!-- 在 <head> 中添加 -->
<meta name="report-id" content="你的唯一ID">

<!-- 在 </body> 前添加 -->
<script src="http://localhost:5001/inject.js"></script>
```

### 3. 打开报告

访问 `http://localhost:5001/` 点击报告链接打开。

## 局域网共享

服务启动后，局域网内其他设备访问：
```
http://你的IP:5001/
```

然后点击报告链接即可使用点评功能，所有评论数据共享。

## 文件说明

| 文件 | 说明 |
|------|------|
| review_server.py | Flask 后端服务（端口 5001） |
| inject.js | 前端点评面板代码 |
| add_tags.py | 自动添加标签工具 |
| start.bat | Windows 启动脚本 |

## 依赖

```
pip install flask
```
