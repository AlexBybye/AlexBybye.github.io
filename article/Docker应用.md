---
title: "Docker 应用与云端部署"
date: 2025-12-14
category: 后端
tags: [Docker, 后端]
description: "概述 Docker 容器在部署中的作用，以及如何借助容器保持应用运行环境一致。"
---

### 一、Docker在云服务器部署中的核心优势

#### 1. **环境一致性**

- **解决"本地运行正常，部署后出错"的问题**：Docker容器包含应用程序及其所有依赖（库、框架、配置等）
- **确保开发、测试、生产环境完全一致**：避免因环境差异导致的部署失败

#### 2. **简化部署流程**

- **一键部署**：只需在云服务器上运行`docker-compose up -d`即可启动整个应用栈
- **减少配置复杂度**：无需在云服务器上手动安装和配置Node.js、Java、Tomcat、MySQL等环境

#### 3. **资源隔离与优化**

- **容器级隔离**：前后端和数据库运行在独立容器中，互不影响
- **资源限制**：可以为每个容器分配CPU、内存等资源，避免单个服务占用过多资源

#### 4. **快速扩展与回滚**

- **水平扩展**：支持快速复制容器实例以应对高流量
- **版本管理**：Docker镜像版本控制，可快速回滚到之前的稳定版本

#### 5. **便于监控和维护**

- **统一管理**：使用Docker命令或可视化工具管理所有服务
- **日志集中**：通过Docker日志功能集中查看所有服务日志

### 二、针对您的项目的云服务器部署流程

#### 1. **云服务器准备**

- 选择任何支持Docker的云服务器（阿里云、腾讯云、AWS等）
- 推荐配置：2核4G以上，CentOS 7/8或Ubuntu 20.04/22.04

#### 2. **Docker环境安装**

![](https://file+.vscode-resource.vscode-cdn.net/c%3A/Users/24441/.vscode/extensions/marscode.marscode-extension-1.4.18/resource/images/languageIcon/plaintext.svg)

bash

```
# CentOS系统
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y
sudo systemctl start docker
sudo systemctl enable docker

# Ubuntu系统
sudo apt-get update
sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y
```

#### 3. **项目部署**

![](https://file+.vscode-resource.vscode-cdn.net/c%3A/Users/24441/.vscode/extensions/marscode.marscode-extension-1.4.18/resource/images/languageIcon/plaintext.svg)

bash

```
# 1. 将项目文件上传到云服务器（使用scp或git）
scp -r d:\JavaMall root@your-server-ip:/home/

# 2. 登录云服务器
ssh root@your-server-ip

# 3. 进入项目目录
cd /home/JavaMall

# 4. 启动服务
docker-compose up -d
```

#### 4. **访问应用**

- 前端：`http://your-server-ip`
- 后端API：`http://your-server-ip:8080`
- 数据库：可通过云服务器IP和3306端口访问