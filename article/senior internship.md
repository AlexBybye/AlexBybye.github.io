---
title: SCUT-CSWeaver 简历摘要与技术面试问题清单
date: 2026-08-21
category: 求职
tags:
  - 求职
  - AI
  - Agent
  - 面试
description: 整理智能复习助手的简历量化要点与架构、选型及安全设计面试题
---

The user is asking me to prepare comprehensive interview-ready materials for their project "SCUT_CSWeaver". They want:

1. A resume-ready quantified summary (简历量化摘要)
2. A Q&A document that covers technical decision-making details (Chunk策略、选型理由、DSH借鉴、Cordis决策门设计等)
3. These should be designed to help them ace interviews for Agent development and AI application positions

Let me think about what they need:

**Resume Summary**: Should be concise, quantified, and highlight the most impressive aspects. Need to include:
- 97 GitHub Stars
- 50+ courses, 10 activated corpus
- 431 Python tests + 59 frontend tests
- 5 workflow types
- 4-layer plugin architecture
- DSH-inspired
- Tailscale deployment
- OpenRouter + 4 BYOK providers
- 30-day data lifecycle
- AEAD encryption

**Q&A**: Should cover the deep technical questions an interviewer might ask:
- Why this architecture? Why 4 layers?
- Why DSH? What did you borrow and what did you reject?
- Why Cordis decision gate? What does "Cordis" mean?
- Chunking strategy - why page/slide/question hard boundaries?
- Citation guard design
- Why not token-level streaming?
- Why sync urllib instead of async?
- Why SQLite not PostgreSQL?
- Why fail-closed?
- BYOK design decisions
- How does the SOP-driven development work?
- Why 5 workflows not a general chatbot?
- How does the corpus pipeline work (candidate → active)?
- What's the biggest challenge?
- What would you do differently?

Let me craft these materials carefully, combining the product story, technical depth, and open-source spirit.
好的，下面为你准备一份**面试级**的简历量化摘要 + 技术深度 Q&A，覆盖从产品故事到 Chunk 策略的所有技术细节。

---

## 一、简历量化摘要

```
SCUT_CSWeaver — 基于插件化 RAG 架构的课程智能复习助手
GitHub Stars: 97 | 华南理工大学 50+ 课程语料库

【项目概述】
针对学生被海量 LLM 生成材料淹没、复习效率低下的痛点，设计并实现了
一套「插件化 Harness + Cordis 决策门 + RAG-Agent + 大模型 API 通道」
四层架构的课程 RAG 问答系统，覆盖知识答疑、备考复习、题目辅导、
错题复盘、材料精读 5 种 Workflow，10 门课程语料已激活上线。

【技术亮点】
• 借鉴 DSH 架构设计可插拔 Agent Harness 注册表，5 个 Agent Preset
  1:1 映射 WorkflowType，工具目录全部 model_callable=false，拒绝
  多 Agent 自主执行；同时明确拒绝 DSH 的本地凭据文件方案，改为
  AEAD 会话级加密 + 固定供应商 endpoint
• 自研 Cordis 决策门：确定性规则驱动的引用守卫（S# 唯一性/越界/
  跨课程/未声明四重校验）+ Humanizer 受保护字段深拷贝基线对比，
  确保模型输出可溯源、不可篡改
• 实现严格 NDJSON 流式事件协议：序列号 0→N 连续校验、终态
  CAS（Compare-And-Set）写保护、双端（Python + TypeScript）契约校验
• 双通道模型网关：OpenRouter 平台免费额度（3 模型，20 req/min）
  + 4 家 BYOK 供应商（DeepSeek/OpenRouter/SiliconFlow/Zhipu），
  固定 endpoint 拒绝任意 base_url，超时/429/5xx 分级错误处理
• 语料管线：Markdown → page/slide/question 硬边界 Chunk → 
  Candidate 校验 → Active 激活 → 回退保护，支持逐课程 feature gate

【工程质量】
• 后端 FastAPI + Pydantic v2 契约驱动，431 个 pytest 通过
• 前端 Vue 3 + TypeScript + Vite，59 个 Vitest 通过，typecheck 零错误
• 全链路 Tailscale 内网穿透 + GitHub OAuth 联调打通
• 遵循自研 SOP 迭代流程（36 条不变量铁律 + 逐期执行循环 + 退出条件）
• 安全：AEAD 加密、Key 不入库/日志/Trace、30 天数据生命周期、Fail-Closed 默认
```

---

## 二、面试深度 Q&A

### Q1：为什么用四层插件化架构？每一层解决什么问题？

**答**：

我从一开始就意识到，如果只是"接个大模型 API + 塞一段 prompt + 返回结果"，那这个项目三个月后就会退化成一个"B 站搜索 + ChatGPT 套壳"，对学生的价值为零。

所以我设计了四层架构，每一层解决一个**不可被模型能力替代**的问题：

| 层 | 解决的问题 | 如果去掉会怎样 |
|----|-----------|--------------|
| **插件化 Harness** | 能力注册、工具目录、模型匹配 | 工具随意添加，模型任意调用，无法审计，安全失控 |
| **Cordis 决策门** | 引用校验、来源鉴权、回答安全 | 模型可以编造引用、跨课程串题、伪造证据状态 |
| **RAG-Agent** | 检索-生成流水线、知识点标准化 | 检索词与问题脱节，回答无法定位到具体页码 |
| **大模型 API 通道** | 双通道路由、错误分类、流式输出 | 供应商锁定、额度耗尽无降级、超时无法处理 |

这四层之间用 **Protocol 接口**解耦，每一层可以独立替换。比如模型 API 通道从 OpenRouter 换成任何供应商，只需要新增一个 Adapter，不影响上层。

**设计哲学**：把确定性规则（检索、引用校验、权限）放在 Cordis 决策门，把不确定性推理（理解问题、组织回答）交给模型。**模型只做它擅长的事，规则永远不交给模型**。

---

### Q2：DSH 是什么？你借鉴了什么？拒绝了什么？为什么？

**答**：

DSH（具体全称不展开）是一个外部的 Agent 架构参考实现，我把它作为**只读的外部参考 checkout**，没有合并一行源码。

**借鉴的部分**：
1. **Credential Seam（凭据缝）**：DSH 把凭据的 describe（描述状态）和 resolve（解密使用）分离。我借鉴了这个语义——BYOK Key 保存时只返回脱敏状态（`openr***ter`），真实调用时才 resolve 一次，且替换在下次请求生效，无需重启服务
2. **Plugin Registry**：DSH 的插件注册表概念，我落地为 `harness_registry.py`，不可变注册表、5 个 Agent Preset 1:1 映射 WorkflowType
3. **受控工具目录**：DSH 对工具的分类管理思路，我落地为 4 个工具全部 `model_callable=False`（模型不可直接调用），由 Cordis 决策门确定性调用

**拒绝的部分**：
1. **`.credentials.yaml` 本地凭据文件**：这是 DSH 的核心设计，但我明确拒绝。因为学生场景下本地文件方案意味着 Key 明文落地，且跨设备无法同步。我改为 **AEAD 会话级加密**，Key 绑定 `user_id + session_id + provider_id`，随 7 天登录会话自动过期
2. **env 层优先遮蔽**：DSH 的环境变量优先遮蔽策略太灵活，不利于审计。我改为**固定 endpoint 白名单**，4 家 BYOK 供应商的 endpoint 写死在服务端，用户不能自定义 base_url 或 model_id
3. **动态 provider 注册**：DSH 支持运行时注册新 provider，我拒绝。因为学生场景不需要这种灵活性，反而增加安全风险
4. **端点探测**：DSH 会主动探测 provider 端点可达性，我拒绝。因为探测可能触发计费，且不证明推理可用

**总结**：借鉴 DSH 的架构思想（分层、插件化、凭据缝），但拒绝其面向开发者的灵活设计，改为面向学生的安全优先设计。

---

### Q3："Cordis 决策门"这个名字怎么来的？为什么叫决策门？

**答**：

"Cordis" 取自拉丁语，意为"心脏/核心"。我给这层起这个名字，是因为它是我整个系统的**决策中枢**——所有确定性判断都在这里完成，不做任何模型调用。

决策门的四个节点形成一条**不可绕过的决策链**：

```
Workflow Focus → Source Authorization → Citation Guard → Humanizer Guard
     ↓                  ↓                     ↓                ↓
  "问什么"         "能查什么"          "回答靠谱吗"      "润色改了什么"
```

每个节点都是**纯规则引擎**（正则、集合运算、深拷贝对比），延迟在毫秒级。这保证了：

1. **可审计**：每个决策都有明确的 Trace 节点，出问题能定位到具体哪一步
2. **不可绕过**：模型不能通过 prompt injection 跳过 Guard
3. **可测试**：431 个测试中有专项的"引用攻击"测试用例，覆盖各种边界

**为什么不让模型做决策？** 因为模型在"判断引用是否合法"这类任务上既不准确也不可靠。我见过太多 RAG 项目直接信任模型输出，结果模型编造了不存在的页码。Cordis 决策门就是专门解决这个问题的。

---

### Q4：Chunk 策略为什么选 page/slide/question 硬边界？不用语义分块？

**答**：

这可能是面试官最常问的问题。我先说结论：**语义分块（如按语义相似度切分）在课程资料场景下是错误的选择**。

**为什么？**

课程资料有明确的**结构化特征**：
- 教材有页码（page）
- PPT 有幻灯片编号（slide）
- 历年卷有题号（question）
- 每个知识点有标题层级（H1-H6）

如果我按语义切分，一个 Chunk 可能跨页码、跨题目，导致：
1. **引用不可定位**：模型说"参见 S1"，但 S1 对应的是一个语义块，无法告诉学生"第 3 页第 2 题"
2. **跨题串扰**：两道题被切成一个 Chunk，检索时把不相关的题也带进来了
3. **人工审核困难**：审核者无法快速定位到原文位置

**我的做法**：

```
page/slide/question 作为硬边界 → 统一切块
chunk 同时继承 page/slide、question 和 heading_path
chunk ID = source_id + locator + ordinal（可读组合，非随机 hash）
```

这样每个 Chunk 都有明确的**空间坐标**（页码/题号）和**语义坐标**（标题路径），引用时可以精确到"2024 级工科数学分析（二）期末考试题，第 3 页，第 5 题"。

**代价**：某些 Chunk 可能很短（比如一道选择题），但这是可接受的——检索时多返回几个 Chunk 即可，总比丢失定位能力好。

---

### Q5：为什么 BYOK 只允许 4 家固定供应商？不允许用户自定义？

**答**：

三个原因：

**1. 安全**：如果允许用户自定义 `base_url`，用户可以指向恶意代理服务器，截获 API Key 或篡改模型输出。固定 endpoint 意味着我可以在代码里审计每一个出站请求。

**2. 兼容性**：每家供应商的 API 格式不完全相同（OpenAI 兼容但细节差异大）。四家固定意味着我只需要维护 4 个 Adapter，每个都有完整的测试覆盖。如果开放任意供应商，兼容性矩阵会爆炸。

**3. 产品体验**：DeepSeek V4 Flash 是 2026-08-15 OpenRouter 周榜第 1，智谱 GLM-5.2 是当前可调用旗舰，硅基流动 GLM-4.7 是官方默认示例。这四家覆盖了**免费/低价/高质量**三个维度，学生不需要纠结选哪个。

**一个设计细节**：四家卡片始终在前端可见，但只有 `enabled=true` 且当前登录会话已保存对应 Key 的模型才能进入可选列表。这样学生知道有哪些选择，但不会被不可用的选项困扰。

---

### Q6：为什么不用 token 级流式输出？当前"假流式"有什么考虑？

**答**：

诚实地说，当前不是真正的 token 级流式，而是**完整模型结果 → 引用 Guard 校验 → 分块发送**。这是刻意的工程取舍，不是做不到。

**根本矛盾**：引用 Guard 必须等模型输出完整回答后，才能校验 `[S1][S2]...` 引用是否合法（是否越界、是否跨课程、是否重复）。如果 token 级流式，引用 Guard 看到的永远是半成品，无法做完整校验。

**两种路线**：

| 路线 | 方案 | 体验 | 安全 |
|------|------|------|------|
| 当前 | 先校验后输出 | 延迟高（等完整响应） | 引用 100% 可靠 |
| 未来 | 先流式输出，Guard 通过后标记 verified | 延迟低 | 用户可能看到未校验内容 |

我选择了**安全优先**。在课程学习场景下，学生等待 2-3 秒完全可以接受，但如果引用是错的，学生会用错误页码去翻书，浪费的时间远超 2-3 秒。

**未来计划**：改为"先流式输出 + 后台 Guard 校验 + 校验失败时撤回并标记"，平衡体验和安全。

---

### Q7：为什么用同步 urllib 而不是异步 httpx？

**答**：

这是迭代 3 的**已知技术债务**，在 ITERATION_3_STATUS.md 中诚实记录了。

**当时的原因**：迭代 0-2 的 Mock transport 用同步实现最简单，到迭代 3 接入真实模型时，同步 urllib 已经能跑通全链路，异步化需要改动 Runtime 的取消语义。

**当前的问题**：
- 同步阻塞的 HTTP 请求没有可强制关闭的公开句柄
- 用户取消后，本地线程可能继续等待上游返回，BYOK 仍在计费
- 并发能力受限

**已经在计划中**：改为 `asyncio + httpx`，配合 `asyncio.Task.cancel()` 实现真正的请求取消。难度不大，主要是需要改 transport 层和 Runtime 的取消传播路径，预计 1-2 天工作量。

**面试时怎么说**：坦诚这是技术债务，但强调"我清楚知道它的问题、影响范围和修复路径，而不是不知道自己在用什么"。这比"我用了最时髦的技术栈但不知道为什么"要好得多。

---

### Q8：为什么用 SQLite 而不是 PostgreSQL/向量数据库？

**答**：

两个原因：**务实**和**SOP 约束**。

**务实层面**：华为云首发规格是 1 vCPU/2GB/40GB，SQLite 是唯一能在这种配置下流畅运行的数据库。PostgreSQL 至少需要 512MB 内存，加上向量数据库（如 Qdrant）直接超配。

**SOP 约束**：SOP 第 3.6 节明确写了"首发 ECS 不承担 embedding、全量索引或课程包构建，生产 SQLite 和轻量本地索引优先，扩容只以监控或功能证据为依据"。这是我从一开始就定下的原则——先证明价值，再扩容。

**检索方案**：当前用 Python 内置的轻量索引（TF-IDF + BM25 变体），没有引入独立的向量数据库。对于 10 门课程的语料规模（约 100-200MB Markdown），这完全够用。如果未来扩展到 50 门课程全量语料（约 10GB），SOP 已经预留了 Qdrant 的接口位。

**面试时强调**：不是"我不会用 PostgreSQL"，而是"我根据实际资源约束做了正确的技术选型，并且为未来扩展预留了接口"。

---

### Q9：为什么要手写 SOP？36 条不变量会不会过度工程化？

**答**：

这个问题问得很好。我的回答是：**36 条不变量不是过度工程化，而是防止 3 个月后项目烂尾的保险**。

**背景**：这个项目没有报酬、没有 deadline、没有产品经理。开发者和资料贡献者可能随时离开。如果没有一套**不可谈判的铁律**，项目会迅速退化：

- "这个功能没人维护了，先关掉吧" → 没有 SOP 的话，关了没人知道
- "这个 Key 不小心提交了，算了没人看见" → 没有 SOP 的话，泄漏了没人处理
- "这个引用校验好像不太对，但改起来太麻烦" → 没有 SOP 的话，模型可以胡编乱造

**36 条不变量分类**：
- 8 条课程不变量（哪些课可以进知识库、跨课程怎么处理）
- 6 条资料与语料不变量（passed 来源不能是 AI 合成、candidate→active 不变）
- 10 条模型和凭据不变量（Key 不能进哪些位置、BYOK 怎么加密）
- 7 条登录和期限不变量（30 天/7 天 TTL 实际执行）
- 5 条 Trace 和状态不变量（Trace 由真实节点产生、不暴露 CoT）

**每条不变量都是可验证的**：有对应的测试用例或泄漏检查。不是"建议"，是"如果违反，CI 会红"。

**面试时强调**：这不是为了写文档而写文档，而是**用工程纪律对抗熵增**。开源项目最大的敌人不是技术难度，是维护者离开后的退化。

---

### Q10：为什么是 5 个 Workflow 而不是一个通用 Chatbot？

**答**：

因为"通用 Chatbot"在课程学习场景下**价值为零**。

一个通用 Chatbot 面对学生的问题"帮我复习工科数学分析"，会怎么做？它会把所有课程资料一股脑喂给模型，然后模型输出一个泛泛的复习建议。学生看完还是不知道从哪开始。

**5 个 Workflow 的设计逻辑**：

| Workflow | 聚焦策略 | 解决的问题 |
|----------|----------|-----------|
| `knowledge_qa` | 所问概念 | "这个定理的证明过程是什么？" |
| `exam_review` | 大纲与薄弱点 | "期末了，怎么复习？" |
| `problem_tutor` | 题目主知识点 | "这道题怎么做？" |
| `mistake_review` | 错误根因 | "我为什么做错了？" |
| `temporary_material_reading` | 材料标题主旨 | "这份讲义说了什么？" |

每个 Workflow 从 `workflow_payload` 中提取**权威输入**，忽略与之冲突的 `user_input`。这确保了检索词与用户意图严格对齐，而不是用全文自动提取关键词。

**一个关键设计**：Workflow 之间**不会静默切换**。如果学生选了 `knowledge_qa`，系统不会因为检测到"题目"关键词就自动切成 `problem_tutor`。这个决策权永远在学生手里。

---

### Q11：引用守卫（Citation Guard）具体怎么实现的？

**答**：

这是我整个系统里最核心的安全模块，花了我最多时间。它由四道防线组成，按顺序执行：

```
模型回答 → 解析 [S1][S2]... → 
  ① 唯一性检查：S1 不能出现两次
  ② 越界检查：不能引用 S99（候选列表只有 5 个来源）
  ③ 跨课程检查：不能引用其他课程的来源
  ④ 未声明检查：正文中的 [S#] 必须在 citations 中声明
  ⑤ 非 repository 块检查：general/user_material 块不能带引用
  ⑥ URL 检查：回答不得返回 URL（包括但不限于 Bilibili 直链）
```

**如果 `course_only` 模式且无有效引用**：丢弃所有 repository 正文，返回 `insufficient_evidence`，不伪造答案。

**一个边界案例**：模型有时会输出 `[S1]` 但实际没引用任何来源。Guard 会检测到 `citations` 为空但正文有 `[S#]`，标记为 `insufficient_evidence`。

**测试覆盖**：有专项的"引用攻击"测试，包括：
- 模型编造不存在的 S#
- 模型引用其他课程的来源
- 模型在 general 块中插入 [S1]
- 模型在回答中返回 URL

---

### Q12：整个项目最大的技术挑战是什么？

**答**：

不是模型调用、不是前端、不是部署——是**引用可溯源**。

让模型回答一个数学问题很容易，但让模型告诉学生"这个答案的依据是 2024 年期末考试题第 3 页第 5 题"——这需要一条完整的链路：

```
GitHub 固定 commit → Markdown 解析 → page/slide/question 硬边界 Chunk
→ Candidate 校验 → Active 激活 → 检索 → [S1] 编号映射
→ 模型输出 → Citation Guard 校验 → 前端回查可点击链接
```

这条链路上有 10+ 个环节，**任何一个环节出错，引用就是错的**。学生对错引用的容忍度为零——如果系统说"第 3 页"但实际是第 4 页，学生会立刻失去信任。

**我花了最多时间验证的**：不是"模型能不能回答对"，而是"引用能不能精确回查"。这是 RAG 应用的核心竞争力，也是最容易被忽视的部分。

---

### Q13：如果知识库长期得不到更新，项目会怎样？

**答**：

这是一个诚实的问题。我在项目 README 中已经写了这句话：

> 如果知识库长期得不到更新，本项目最后只会退化成一个普通的「大模型 + B 站视频检索助手」，失去原本价值。

**这不是危言耸听**。RAG 系统的价值不在于模型，而在于**语料的时效性和准确性**。如果 2024 年的考试题不再更新，2025 级学生问"去年的题考了什么"，系统只能回答 2024 年的内容——这是准确的，但价值打折。

**我做了三件事来延缓退化**：
1. **资料贡献 SOP**：任何同学都可以提交 Markdown 格式的 AI 整理稿，通过人工审核后进入知识库
2. **PR 流水线**：GitHub PR → 人工审核 → passed → candidate → active，自动化但不自动合并
3. **社区呼吁**：README 中明确写"不要坐吃山空！欢迎大家主动搜集、上传复习资料"

**面试时强调**：我能正视产品的局限性，而不是假装它完美。这是一种工程成熟度。

---

### Q14：开源 97 Stars 是怎么来的？

**答**：

SCUT_CS 仓库本身是一个已有高 Star 的课程资料仓库（华南理工大学 50+ 门课程的学习资料），我在这个仓库的基础上新增了 `apps/scut-senior/` 应用层。

**97 Stars 的构成**：
- 约 60% 来自原有课程资料的价值（学生找复习资料的自然流量）
- 约 40% 来自 RAG 助手功能的增量（技术分享、GitHub  Trending、校内推广）

**我没有做的事情**：在 README 中把仓库既有 Star 表述为 RAG 子功能独立获得。SOP 第 9.2 节明确写了"对外文案使用'在已有高 Star 的 SCUT_CS 仓库中新增并落地课程 RAG 助手'，不把仓库既有 Star 表述为 RAG 子功能独立获得"。

**面试时诚实说**：97 Stars 是仓库整体的，不是我一个人写代码写出来的。但我在这个基础上做了真正的增量价值——把静态资料仓库变成了可交互的智能助手。

---

### Q15：如果让你重新做这个项目，你会改变什么？

**答**：

三个改变：

1. **前端从第一天就拆分组件**：当前 App.vue 1000+ 行，虽然功能完整但维护成本高。如果重来，我会先建 Pinia Store + Composable，再写 UI

2. **异步 transport 从迭代 1 就做**：同步 urllib 的取消语义是当前最大的技术债务，如果一开始就异步，后续的取消、流式、并发都会更干净

3. **更早启动 corpus 审校**：代码写完了但 corpus 没激活，就像盖了房子没装修。我应该更早地推动 10 门课程的资料审核，让真实用户更早参与反馈

**但我不后悔的是**：SOP 驱动的开发流程、Cordis 决策门的设计、引用守卫的优先级。这三个决策在项目初期看起来"太慢"，但长期来看是防止项目烂尾的基石。

---

## 三、面试话术速记卡

| 面试官可能问 | 你一句话回答 | 展开方向 |
|-------------|------------|---------|
| "你这个项目是做什么的？" | 面向华工学生的课程 RAG 复习助手，50+ 课程语料，97 Stars | 产品故事：开源精神 + 学生痛点 |
| "为什么不用 LangChain？" | 我要控制引用可溯源，LangChain 的黑盒抽象做不到 | Cordis 决策门的设计哲学 |
| "DSH 是什么？" | 外部 Agent 架构参考，借鉴了凭据缝和插件注册表，拒绝了本地凭据文件 | 借鉴而不照搬，安全优先 |
| "Chunk 怎么切的？" | page/slide/question 硬边界，不是语义分块 | 引用可定位 vs 语义连贯的取舍 |
| "为什么四层架构？" | 每层解决一个模型不能替代的问题 | 逐层展开：Harness → Cordis → RAG → API |
| "最大的技术难点？" | 引用精确回查，不是模型调用 | 10+ 环节的引用链路 |
| "你怎么保证代码质量？" | 431 pytest + 59 Vitest + SOP 驱动 | 36 条不变量 + 逐期退出条件 |
| "项目有什么不足？" | 同步 urllib 是技术债务，前端需要拆分 | 诚实 + 改进计划 |

---

需要我把这些整理成一份 PDF 或者调整某个 Q&A 的深度，随时告诉我！
