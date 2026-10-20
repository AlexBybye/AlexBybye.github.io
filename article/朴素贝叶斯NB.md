---
title: "朴素贝叶斯分类器"
date: 2025-04-03
category: 机器学习
tags: [机器学习, 分类算法, 朴素贝叶斯]
description: "整理朴素贝叶斯的基本假设、分类过程与适用场景。"
---
## Naive Bayes Classifier
### 适合高维数据和特征独立性假设成立的场景
### 应用适应前提：每个参数产生的机率互不影响（即特征独立，但实际上不独立效果依然良好）
### 基本理念
#### - **贝叶斯定理**：基于先验概率和似然概率计算后验概率，公式为：
   #### P(Y|X) = P(X|Y) / ( P(Y)\*{P(X) )
  #### - \(P(Y|X)\)：后验概率（给定特征 \(X\) 的类别 \(Y\) 的概率）。
  #### - \(P(X|Y)\)：似然概率（给定类别 \(Y\) 的特征 \(X\) 的概率）。
  #### - \(P(Y)\)：先验概率（类别 \(Y\) 的概率）。
  #### - \(P(X)\)：证据（特征 \(X\) 的概率）。
#### - **朴素假设**：特征之间相互独立
### 适合的应用场景
#### 二分类（如垃圾邮件检测）或多分类（如文本分类、情感分析）问题

### 优点
- 计算效率高，适合高维数据。
- 对小规模数据表现良好。
- 易于实现和理解。
### 缺点
- 特征独立性假设在实际中往往不成立。
- 对数据分布敏感，可能需要平滑处理（如拉普拉斯平滑）。

### 代码示例
```python
from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# 加载数据
X, y = load_data()

# 划分训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 创建朴素贝叶斯分类器
clf = GaussianNB(
var_smoothing=1e-9)

# 训练模型
clf.fit(X_train, y_train)

# 预测
y_pred = clf.predict(X_test)

# 评估
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy}")
```

### 参数选择
#### - smoothing**平滑参数**：用于处理零概率问题，如拉普拉斯平滑。
#### - **分布假设**：根据数据类型选择不同的变体（如高斯分布、多项式分布）。

