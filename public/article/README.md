---
title: Skill Optimizer：面向 Agent Skills 的自动构建与全生命周期优化框架
date: 2026-07-24
category: AI
tags:
  - AI
  - Agent
  - Skill
  - 开源项目
description: 介绍 Skill Optimizer 的设计目标、评测流程、跨宿主适配与迭代机制
---

# Skill Optimizer (Skill for Skills)
![[6ef7f0fd-fa66-4dae-a326-df534858ca93.png]]
> **严谨、可验证、面向多宿主的 LLM Skill 自动化创建与全生命周期工程优化系统 | LLM Agent Skill 量化调优、可溯源评测、跨大模型适配工具**
![[e32a162e-64ed-4948-9d83-ddc71d85134b.png]]
<!-- KEYWORDS: LLM skill optimizer, agent skill automation, LLM skill evaluation baseline, dual-plane skill test, routing plane execution plane, immutable baseline A/B test for prompt skill, multi-host LLM skill adapter, Claude Codex GLM skill deployment, agent skill lifecycle management, prompt engineering quantitative optimization, anti-overfitting skill benchmark, SkillsBench implementation, SkillGenBench, sandbox skill verification, LLM agent tool skill risk control, Compare-and-Swap skill iteration, agent skill no-skill judgment, prompt reliability evaluation --> <!-- ALT TEXT SUMMARY: Open-source engineering framework to build, test, iterate LLM agent skills with data-driven metrics, cross-model compatible, built on SkillsBench research, with strict safety budget control and dual-plane evaluation system -->
---
---
## 目录

- [项目简介](#%E9%A1%B9%E7%9B%AE%E7%AE%80%E4%BB%8B)
- [项目定位](#%E9%A1%B9%E7%9B%AE%E5%AE%9A%E4%BD%8D)
- [核心痛点](#%E6%A0%B8%E5%BF%83%E7%97%9B%E7%82%B9)
- [核心特性](#%E6%A0%B8%E5%BF%83%E7%89%B9%E6%80%A7)
- [核心工作流](#%E6%A0%B8%E5%BF%83%E5%B7%A5%E4%BD%9C%E6%B5%81)
- [项目架构](#%E9%A1%B9%E7%9B%AE%E6%9E%B6%E6%9E%84)
- [路线图与当前状态](#%E8%B7%AF%E7%BA%BF%E5%9B%BE%E4%B8%8E%E5%BD%93%E5%89%8D%E7%8A%B6%E6%80%81)
- [参考文献](#%E5%8F%82%E8%80%83%E6%96%87%E7%8C%AE)
- [参与贡献](#%E5%8F%82%E4%B8%8E%E8%B4%A1%E7%8C%AE)
- [开源协议](#%E5%BC%80%E6%BA%90%E5%8D%8F%E8%AE%AE)

---
## 项目简介

Skill Optimizer 是一套严谨、可验证的 LLM Agent 技能自动化构建与全生命周期优化框架。它基于 SkillsBench、SkillGenBench 等学术研究结论，以**不可变基线对照、双平面隔离评测、数据驱动决策**为核心设计，解决传统 Skill 开发依赖人工经验、优化效果不可复现、误触发率不可控等行业痛点，实现 Agent 技能从创建、评测到迭代的全流程工程化管控。

**适用场景**：企业级 LLM 定制技能迭代、Agent 工具技能规模化开发、跨平台 Skill 批量运维、Prompt 工程化体系落地、Agent 评测基准建设。

---

## 项目定位

> SkillsBench 实证表明：人工筛选优化的 Agent 技能收益明确，无管控自动生成的技能普遍无效。
> 
> 本项目遵循该工程结论：**不追求全无人监督的黑盒自动生成，重心放在可量化自动化校验、基线对照增量优化、无收益则拒绝生成**，走严谨可控的 Agent 技能工程化路线。

---

## 核心痛点

传统 LLM Agent Skill 开发与 Prompt 调试高度依赖人工主观经验，普遍存在以下问题：

- 缺少标准化量化指标，无法精准统计召回率、误触发率、工具执行准确率，优化效果不可复现
- 容易将话术润色等同于能力提升，形成 “优化幻觉”
- 路由召回与执行质量耦合，难以定位问题根因
- 跨大模型平台适配成本高，技能资产无法复用
- 无差别自动生成技能，导致技能冗余膨胀、误判率持续上升

Skill Optimizer 以有限状态机管控全流程，通过不可变基线 A/B 测试、双平面隔离评测、正交额度风控等工程化手段，确保每一次技能迭代都具备可验证的真实收益，全程可控可审计。

---

## 核心特性

### 1. 证据驱动的量化决策

- **不可变基线配对 A/B 测试**：所有技能优化强制绑定历史版本基线 / 空白基线，同一测试用例、同一环境下对照运行，由量化指标差值判定优化收益，拒绝主观感受判断
- **防冗余诚实机制**：若基础大模型原生能力、现有技能已满足业务标准，系统自动返回 `NO_SKILL` / `KEEP_BASELINE`，不为完成任务强行生成多余技能，避免 Agent 技能冗余与误判上涨

### 2. 双平面隔离评测体系

拆分两大互不干扰的评测维度，精准解决 “能召回但执行差”“执行正常但乱触发” 的典型 Agent 问题：

- **路由平面（Routing Plane）**：专项统计技能描述召回准确率、负样本误触发概率、多技能间边界区分度，管控 “什么时候该调用技能”
- **执行平面（Execution Plane）**：沙箱隔离环境下运行技能，完全剥离路由逻辑干扰，精准校验指令遵循度、工具调用链路、最终输出正确性，管控 “技能执行质量”

### 3. 抗锚定的结构化裁决

- **抗锚定设计**：在独立上下文中生成优化方案，不受初始 Prompt、旧 Skill 逻辑的思路限制，避免迭代越改越固化
- **多维度批量对比**：自动横向对比多套方案，从架构复杂度、安全风险、长期维护成本、运行耗时逐项量化打分
- **分歧点结构化管理**：方案差异点编号罗列，支持一键采纳推荐方案 / 逐条手动审批

### 4. 算力与风险正交管控

算力成本与安全风险双层独立管控，安全红线绝不因算力配置让步：

- **分级算力额度 Q1-Q3**：Q1 轻量极速交付、Q2 均衡评测、Q3 深度全量实验；Q3 支持边际收益衰减自动提前终止，不做无意义冗余计算
- **硬性安全分级 R0-R3**：风险等级仅由实际操作权限（文件写入、敏感信息读写、网络高危调用）决定。即使选择最低算力 Q1，高风险操作也强制要求 Dry-run 试运行、权限校验、回滚方案

### 5. 宿主无关的架构设计

彻底解耦业务逻辑与大模型厂商，一次开发、多平台部署：

- **标准化数据契约**：统一 `skill-spec` 技能规范、`eval-suite` 评测套件、运行日志、评估报告、决策记录；配套 `workflow-events.jsonl` 全链路事件日志，支持故障断点续跑、全流程审计溯源
- **可插拔适配器**：核心代码无平台绑定，通过 Adapter 层适配 OpenAI Codex、Anthropic Claude、智谱 GLM 等主流 LLM
- **白名单打包机制**：打包流程使用白名单过滤，开发测试文件不会泄露污染线上生产环境
---

## 🔄 核心工作流

Skill Optimizer 全链路受固定 5 阶段有限状态机管控，流程可回溯、节点可日志化，无自由散漫执行：

```text
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  TRIAGE  │ ──> │  DEFINE  │ ──> │  BUILD   │ ──> │  VERIFY  │ ──> │ ITERATE  │
│ 评估分流  │     │  规格冻结 │      │ 沙箱构建 │      │ 证据收集 │      │ 单点收敛 │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
```

1. **TRIAGE 评估分流**：只读扫描本地 Skill 目录、项目配置，优先判断是否复用旧技能、完全不需要新增技能，前置拦截无效开发。
    
2. **DEFINE 规格冻结**：系统独立推演优化方案，和用户需求做差异对比，人工裁决锁定最终技能设计规范，后续开发不能随意改动。
    
3. **BUILD 沙箱构建**：在隔离候选文件夹编写 / 修改 Skill，全程不动不可变基线代码，保证基线永久纯净。
    
4. **VERIFY 证据收集**：批量执行结构校验、安全扫描、路由双平面评测、执行校验、资源成本统计，完整留存量化证据。
    
5. **ITERATE 单点收敛**：单次迭代只验证单一修改因果，提交使用 CAS（Compare-and-Swap）并发保护，多线程迭代不会覆盖冲突；指标达标即停止，不重复无效迭代。
    

---

## 📂 项目架构与目录结构

严格隔离**线上可运行代码**、**开发评测代码**、**研究文档**，生产环境极简干净，开发侧完整可复现：

```Plain
.
├── runtime/               # 纯净可部署运行时包（状态机引擎、执行脚本、通用模板，可直接打包上线）
│   └── skill-optimizer/
├── dist/                  # 编译打包产物，按大模型宿主区分 dist/codex/ dist/claude/ 宿主专属安装包
├── dev/                   # 开发配套：评测套件、Schema格式校验、测试用例Fixtures、调试工具
└── research/              # 理论文档、论文推导、架构演进图、实验复盘记录
```

---

## 📌 当前状态与发布计划

|   |   |   |
|---|---|---|
|**阶段**|**状态**|**内容描述**|
|**当前状态**|🟢 已发布|中英文 README 完整落地，整体架构、评测逻辑可查阅|
|**后续计划**|🟡 建设中|Q1/Q2/Q3 全流程 Agent 自动化跑通，针对架构、评测、适配层现存问题迭代修复|

---

## 现阶段工作

项目当前拒绝无意义功能堆叠，聚焦**版本解耦 + 轻量化重构**，针对上一轮评审总结五大核心缺陷定向攻坚：架构臃肿、算力成本不可控、跨宿主兼容性脆弱、评测过拟合、LLM 评审闭环偏差。四大主线改造并行落地：

### 一、架构降重：从 “硬状态机” 到 “可配置流程解释器”

旧版硬编码 30 + 固定状态节点，简单任务也要走完全量链路，耗时冗余。 改造方案：状态流转改为配置化 Profile（Q1/Q2/Q3 三套流程模板），底层状态机变成配置解释器。 Q1 轻量化路径完成原型验证：格式校验 + 两条基础用例达标即可提前输出，跳过冗余方案比对步骤，最低化常态运行开销。

### 二、评测闭环修正：对抗过拟合与循环偏差

评测集过拟合、大模型主观评审出错互相拖累，导致评测满分、真实业务翻车。三大改造并行落地：

1. **用例加权打分**：所有测试用例新增覆盖维度、难度、真实业务来源标签，高可信度用例权重更高，避免靠小众用例刷指标。
    
2. **确定性规则优先校验**：格式、文件存在性、接口返回码等可代码硬校验项全部交给脚本，不再让 LLM 参与判断，减少模型主观误差。
    
3. **双模型交叉复核**：必须依靠 LLM 打分的环节，采用主评 + 复核双模型，双方置信度同时达标才算有效；结果矛盾 / 置信度不足直接标记人工审核，杜绝错误迭代自我强化。
    

### 三、宿主适配层解耦：能力协商而非通用抽象

旧版强行统一全平台 Skill 语法，牺牲各大模型原生高级能力（沙箱隔离、环境重置、指标采集）。 新适配逻辑：双向能力协商。读取目标 LLM 真实支持能力，动态裁剪评测规则、技能能力边界；模型不支持的功能不会静默降级糊弄，主动阻断并给出替代方案。当前以 OpenAI Codex 作为首个落地宿主全量验证。

### 四、核心认知落地：将 “停止决策” 提升为一等公民

依托 SkillsBench 公开结论重构顶层逻辑：纯全自动生成 Skill 收益极低，有效的技能来自人工约束 + 量化增量优化。 工程侧把`NO_SKILL_CONFIRMED`、`KEEP_BASELINE`和技能创建成功设为同级核心流程，系统优先判断 “该不该做技能”，其次才是 “怎么做技能”。基线保护、CAS 锁、版本回退优先级高于新增功能开发。

---
## 参考文献（借鉴思想来源）

### 核心学术论文

1. **SkillsBench: Benchmarking How Well Agent Skills Work Across Diverse Tasks**
    
    Xiangyi Li et al., arXiv:2602.12670 (2026)
    
    关键实证：人工精选 Agent 技能将任务通过率从 33.9% 提升至 50.5%；无约束全自动生成 Skill 整体几乎无正向收益，为本项目核心设计理念提供学术依据。
    
2. **SkillGenBench: Benchmarking Skill Generation Pipelines for LLM Agents**
    
    Yifan Zhou et al., arXiv:2605.18693 (2026)
    
    支撑本项目「创建新技能 / 存量技能优化」双路径架构设计。
    

### 官方规范与文档

- Anthropic Claude Skills API 官方文档与开源实现
- OpenAI Codex 官方平台文档与代码能力开发指南
- 智谱 GLM 开放平台 LLM 技能 API 开发文档
- Agent Skills Open Standard：[agentskills.io](https://link.wtturl.cn/?target=https%3A%2F%2Fagentskills.io&scene=im&aid=497858&lang=zh) 通用 Agent 技能开放规范

### 社区参考项目

本项目在同类工具基础上，重点补齐量化评测、基线管控、跨宿主适配与安全风控能力：

- FrancyJGLisboa/agent-skill-creator
- sandiiarov/skill-creator
- AGI-comming/functional-skill-creator
- okjpg/skill-creator
- bilibili插件市场（闭源）：skill评估&生成部分思想
---

## 参与贡献

欢迎通过 Issue 反馈问题与建议，或提交 Pull Request 参与代码贡献。

---

## 开源协议

本项目采用 MIT-NC 开源协议，详见 `LICENSE` 文件。
