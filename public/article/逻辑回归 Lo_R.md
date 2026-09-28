---
title: "逻辑回归：从线性组合到分类概率"
date: "2025-04-03"
category: "机器学习"
tags: ["机器学习", "分类算法", "逻辑回归"]
description: "介绍逻辑回归如何将线性模型输出映射为类别概率，并用于二分类预测。"
---
## 逻辑回归Logistic Regression
### 适合线性可分数据和需要解释模型的场景
### 基本理念
![[逻辑回归-Lo-R-295f115da0.webp]]

### 适合的应用场景
- 二分类问题（如广告点击预测）。
### 优点
- 模型简单，易于解释。
- 输出概率值，便于决策。
- 对小规模数据表现良好。
### 缺点
- 假设特征与类别之间呈线性关系。
- 对多重共线性敏感。

### 代码示例
```python
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# 加载数据
X, y = load_data()

# 划分训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 创建逻辑回归分类器
clf = LogisticRegression(penalty='l2', C=1.0, max_iter=100)

# 训练模型
clf.fit(X_train, y_train)

# 预测
y_pred = clf.predict(X_test)

# 评估
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy}")
```

### 参数选择
- **C**：正则化强度，控制模型复杂度。较大的C值表示较弱的正则化。
    
- **penalty**：正则化类型，如L1（Lasso）或L2（Ridge）。
    
- **max_iter**：最大迭代次数，用于控制模型训练的迭代次数。

## 总结
- **朴素贝叶斯**：适用于高维数据和特征独立性假设成立的场景，计算效率高。
- **逻辑回归**：适用于线性可分数据，输出概率值，易于解释。