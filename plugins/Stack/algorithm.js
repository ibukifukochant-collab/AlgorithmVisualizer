// 栈操作与动态规划算法实现
class StackAlgorithm {
    constructor() {
        this.steps = [];
        this.dp = [];
    }

    // 计算由操作数序列 1,2,…,n 经过栈操作可能得到的输出序列总数
    calculateOutputSequences(n) {
        this.steps = [];
        this.dp = [];
        
        // 初始化动态规划二维数组
        // dp[i][j] 表示：还有i个元素可以压栈，栈中有j个元素时的可能输出序列数
        // i: 剩余可以压栈的元素个数 (0 <= i <= n)
        // j: 当前栈中的元素个数 (0 <= j <= n)
        for (let i = 0; i <= n; i++) {
            this.dp[i] = new Array(n + 1).fill(0);
        }
        
        // 记录初始状态（从(n,0)开始）
        this.steps.push({
            type: 'initial',
            n: n,
            dp: this.deepCopy(this.dp),
            currentI: n,
            currentJ: 0,
            description: `初始化动态规划数组，n = ${n}，从状态(n,0)开始`
        });
        
        // 边界条件：当栈为空且没有元素可以压栈时，只有一种输出方式（不操作）
        // dp[0][0] = 1 表示：没有元素需要压栈且栈为空时，只有一种输出方式
        this.dp[0][0] = 1;
        this.steps.push({
            type: 'boundary',
            n: n,
            dp: this.deepCopy(this.dp),
            currentI: 0,
            currentJ: 0,
            value: 1,
            description: `边界条件：dp[0][0] = 1（没有元素需要压栈且栈为空时，只有一种输出方式）`
        });
        
        // 填充动态规划数组
        // 遍历顺序：从i=0到n，j=0到i（阶梯状数组）
        for (let i = 0; i <= n; i++) {
            for (let j = 0; j <= i; j++) {
                // 跳过边界条件
                if (i === 0 && j === 0) continue;
                
                // 状态转移方程：dp[i][j] = dp[i-1][j+1] + dp[i][j-1]
                // 解释：
                // dp[i-1][j+1]：表示压入一个元素（i减少1，j增加1）
                // dp[i][j-1]：表示弹出一个元素（j减少1）
                const prev1 = (i > 0 && j + 1 <= i - 1) ? this.dp[i-1][j+1] || 0 : 0;
                const prev2 = (j > 0) ? this.dp[i][j-1] || 0 : 0;
                this.dp[i][j] = prev1 + prev2;
                
                this.steps.push({
                    type: 'calculate',
                    n: n,
                    dp: this.deepCopy(this.dp),
                    currentI: i,
                    currentJ: j,
                    value: this.dp[i][j],
                    prev1: prev1,
                    prev2: prev2,
                    equation: `dp[${i}][${j}] = dp[${i-1}][${j+1}] + dp[${i}][${j-1}] = ${prev1} + ${prev2} = ${this.dp[i][j]}`,
                    description: `计算 dp[${i}][${j}] = ${this.dp[i][j]}`
                });
            }
        }
        
        // 记录最终结果
        // 最终结果是dp[n][0]，表示所有n个元素都压入并弹出的情况
        this.steps.push({
            type: 'result',
            n: n,
            dp: this.deepCopy(this.dp),
            result: this.dp[n][0],
            description: `最终结果：由操作数序列 1,2,…,${n} 经过栈操作可能得到的输出序列总数为 ${this.dp[n][0]}`
        });
        
        return this.steps;
    }
    
    // 获取算法复杂度
    getComplexity() {
        return {
            time: 'O(n²)',
            space: 'O(n²)'
        };
    }
    
    // 获取算法描述
    getDescription() {
        return {
            name: '栈操作与动态规划',
            description: '使用动态规划计算由操作数序列经过栈操作可能得到的输出序列总数',
            steps: [
                '将一个数从操作数序列头端移到栈头端（push操作）',
                '将一个数从栈头端移到输出序列尾端（pop操作）',
                '使用动态规划二维数组 f[i][j] 表示还有i个元素可以压栈，栈中有j个元素时的可能输出序列数',
                '注意：数组索引i和j从0开始，表示元素个数，不是数组位置',
                '状态转移方程：f[i][j] = f[i-1][j+1] + f[i][j-1]',
                '边界条件：f[0][0] = 1（没有元素需要压栈且栈为空时，只有一种输出方式）'
            ]
        };
    }
    
    // 深拷贝二维数组
    deepCopy(arr) {
        return arr.map(row => [...row]);
    }
}

// 导出算法
export default new StackAlgorithm();