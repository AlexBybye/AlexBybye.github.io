#### 1. 防抖 / 节流（背熟，能口述 + 手写）
```javascript
// 防抖（重点记：清定时器+重置）
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 节流（重点记：时间差判断）
function throttle(fn, delay) {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn.apply(this, args);
    }
  };
}
```

- 口述要点：防抖「延迟执行，重复触发重置」，节流「固定间隔执行，控制频率」。

#### 2. 浅拷贝 / 深拷贝（记核心逻辑，JSON 版 + 手写版区别）

```javascript
// 浅拷贝（必写）
function shallowClone(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  const res = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) res[key] = obj[key];
  }
  return res;
}

// 深拷贝（记JSON版+缺陷，手写版记核心思路）
function deepCloneJSON(obj) {
  return JSON.parse(JSON.stringify(obj));
}
```

- 口述要点：浅拷贝只复制引用，深拷贝 JSON 版不支持函数 / 循环引用 / Date/RegExp，手写版需递归 + 处理循环引用（没时间写递归版，至少说清思路）。

#### 3. 两个有序数组合并（双指针法，无脑写）

```javascript
function mergeSortedArrays(arr1, arr2) {
  let i = 0, j = 0, res = [];
  while (i < arr1.length && j < arr2.length) {
    arr1[i] < arr2[j] ? res.push(arr1[i++]) : res.push(arr2[j++]);
  }
  // 补全剩余元素（必写，不然会漏）
  while (i < arr1.length) res.push(arr1[i++]);
  while (j < arr2.length) res.push(arr2[j++]);
  return res;
}
```

- 口述要点：双指针遍历，谁小放谁，最后补全剩余元素。

### 第二步：记「核心思路」，不用写全代码（能口述逻辑）

#### 1. 并发限制调度器（Scheduler）
- 核心思路：
    - 用`queue`存待执行的任务，`running`记录当前执行数，`limit`控制并发数；
    - `add`方法把任务包装成 Promise 入队，调用`next`；
    - `next`方法判断：若运行数 < 限制，就从队列取任务执行，执行完`running--`并递归`next`。
#### 2. 图片懒加载（Promise+IntersectionObserver）
- 核心思路：
    - 用 IntersectionObserver 监听图片是否进入视口；
    - 进入后取`data-src`赋值给`src`；
    - 监听`onload/onerror`，完成后取消监听，resolve/reject。
#### 3. 虚拟列表
- 核心思路：
    - 只渲染「可视区域」的元素，不是全部；
    - 用`startIndex/endIndex`计算可视范围，滚动时更新；
    - 用`paddingTop/paddingBottom`占位，保持滚动条正常。
#### 4. 动态规划类（零钱兑换 / 爬楼梯）
- 核心思路（记「状态定义 + 转移方程」）：
    - 零钱兑换：`dp[i]`表示凑 i 金额的最少硬币数，`dp[i] = min(dp[i], dp[i-coin]+1)`；
    - 爬楼梯：`dp[i] = dp[i-1] + dp[i-2]`（边界`dp[0]=1, dp[1]=1`）。
### 第三步：面试应急技巧（关键）

1. **写代码时先讲思路**：哪怕没写完，先跟面试官说「我先梳理下思路，再写代码」，比如 “防抖的话，我会用定时器，每次触发清掉之前的，重新计时，这样能保证最后一次触发才执行”—— 思路对了，哪怕代码有小瑕疵，分也不会低；
2. **遇到忘代码的情况**：说核心逻辑，比如 “深拷贝我记得 JSON 版有缺陷，比如函数会丢，循环引用会报错，手写的话需要递归，还要处理对象 / 数组的判断，以及循环引用的问题（比如用 WeakMap 存已拷贝的对象）”；
3. **优先写「核心逻辑」，不用追求完美**：比如写调度器，先把`constructor`、`add`里的入队、`next`里的判断逻辑写出来，细节（比如 finally）忘了可以补一句 “这里要在 finally 里减 running 数，然后调 next”。

### 最后：花 1 小时过一遍

把上面的「必背代码」手写 1 遍（不用抄，凭记忆写），「思路类」考点口述 1 遍，确保：

- 防抖 / 节流 / 浅拷贝 / 数组合并：能直接写出来；
- 调度器 / 懒加载 / 虚拟列表：能说清核心步骤；
- 深拷贝 / 动态规划：能说清 “状态定义 / 核心缺陷”。