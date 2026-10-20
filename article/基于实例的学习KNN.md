---
title: "K 最近邻算法（KNN）"
date: 2025-04-03
category: 机器学习
tags: [机器学习, 分类算法, KNN]
description: "介绍 KNN 如何根据样本距离寻找近邻，并通过邻居投票完成分类。"
---
## KNN

### 适合低维度小数据集，
### 不需要训练，
### 但也对噪声敏感
### 基本理念
- **基于实例的学习算法**：通过计算新样本与训练样本的距离，找到最近的 k 个邻居，通过投票决定类别。
- **距离度量**：常用欧氏距离、曼哈顿距离等。
- **分类规则**：多数表决法（Majority Voting）。

### 适合的应用场景
- 推荐系统。
- 图像识别。
- 异常检测。

### 优点
- 简单直观，易于理解和实现。
- 对非线性数据适应性强。
- 不需要训练过程，适合小数据集。
### 缺点
- 计算复杂度高，对大规模数据不友好。
- 对**高维数据**不友好，容易受到“维度灾难”的影响。
- 对噪声敏感。

### 代码示例
```python
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# 加载数据
X, y = load_data()

# 划分训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 创建KNN分类器
clf = KNeighborsClassifier(n_neighbors=3,weights='uniform', metric='euclidean')

# 训练模型
clf.fit(X_train, y_train)

# 预测
y_pred = clf.predict(X_test)

# 评估
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy}")
```

### 参数选择
- **n_neighbors**：邻居数，选择最近的邻居数量。
- **metric**：距离度量方法，如欧氏距离（euclidean）或曼哈顿距离（manhattan）。
- **weights**：投票方式，如均匀加权（uniform）或距离加权（distance）。
## 总结
- **KNN**：简单直观，适合小数据集和非线性数据，但计算复杂度高。