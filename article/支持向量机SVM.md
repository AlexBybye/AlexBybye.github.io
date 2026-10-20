---
title: "支持向量机（SVM）"
date: 2025-04-03
category: 机器学习
tags: [机器学习, 分类算法, SVM]
description: "介绍支持向量机如何寻找最大间隔超平面，以及它处理分类问题的基本思路。"
---
## SVM
### 适合小数据集
### 抽象且需要训练
### 但是适用于非线性分类，高维，较为准确

### 基本理念
- **基于超平面的分类算法**：通过寻找最优超平面将不同类别的数据分开。
- **超平面方程**：对于线性可分数据，超平面方程为 \(w^T x + b = 0\)。
- **支持向量**：距离超平面最近的样本点。
- **软间隔**：允许一些样本点位于错误的一侧，以提高模型的泛化能力。

### 适合的应用场景
- 文本分类。
- 图像识别。
- 生物信息学。

### 优点
- 对高维数据表现良好，适合小样本数据。
- 鲁棒性强，对噪声有一定容忍度。
- 适用于非线性分类问题（通过核技巧）。

### 缺点
- 训练时间长，对大规模数据不友好。
- 模型解释性差。
- 需要选择合适的核函数和参数。

### 代码示例
```python
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# 加载数据
X, y = load_data()

# 划分训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 创建SVM分类器
clf = SVC(kernel='rbf', C=1.0, gamma='scale')

# 训练模型
clf.fit(X_train, y_train)

# 预测
y_pred = clf.predict(X_test)

# 评估
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy}")
```

### 参数选择
- **kernel**：核函数类型，如线性核（linear）、多项式核（poly）、径向基函数核（RBF）。
- **C**：正则化参数，控制模型复杂度。
- **gamma**：RBF核的宽度参数，影响模型的复杂度。

## 总结

- **SVM**：对高维数据和小样本数据表现良好，鲁棒性强，但训练时间长，模型解释性差。