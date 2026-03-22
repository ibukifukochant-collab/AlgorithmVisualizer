// 正则表达式最长匹配长度算法实现 - 完全按照Java代码逻辑
class RegexMaxLengthAlgorithm {
    constructor() {
        this.steps = [];
        this.currentStepId = 0;
        this.line = '';
        this.index = -1;
    }

    // 生成唯一步骤ID
    generateStepId() {
        return this.currentStepId++;
    }

    // 计算正则表达式能接受的最长字符串长度和实际字符串
    calculateMaxLength(regex) {
        this.steps = [];
        this.currentStepId = 0;
        this.line = regex;
        this.index = -1;

        // 初始步骤：显示完整表达式
        this.steps.push({
            id: this.generateStepId(),
            type: 'initial',
            expression: regex,
            leftExpr: null,
            rightExpr: null,
            result: null,
            maxString: null,
            level: 0,
            position: 'center',
            description: `开始计算正则表达式: ${regex}`
        });

        // 使用深度优先搜索计算
        const resultLength = this.dfs(0);
        console.log(this.steps);
        const maxString = 'x'.repeat(resultLength);

        // 最终结果步骤
        this.steps.push({
            id: this.generateStepId(),
            type: 'final',
            expression: regex,
            leftExpr: null,
            rightExpr: null,
            result: resultLength,
            maxString: maxString,
            level: 0,
            position: 'center',
            description: `最终结果: 正则表达式 ${regex} 能接受的最长字符串为 ${maxString}，长度为 ${resultLength}`
        });

        return this.steps;
    }

    // 深度优先搜索，完全按照Java代码逻辑
    dfs(level) {
        let current = 0;
        let max = 0;

        while (this.index < this.line.length - 1) {
            this.index++;
            const char = this.line.charAt(this.index);

            if (char === '(') {
                let right = this.index;
                let deep = 0;
                for(let i = this.index; i < this.line.length; i++){
                    if(this.line.charAt(i) === '('){
                        deep++;
                    }else if(this.line.charAt(i) === ')'){
                        deep--;
                        if(deep === 0){
                            right = i;
                            break;
                        }
                    }   
                }
                // 遇到'('，递归调用
                this.steps.push({
                    id: this.generateStepId(),
                    type: 'char_process',
                    expression: this.steps[this.steps.length - 1].leftExpr || this.steps[this.steps.length - 1].expression,
                    leftExpr: this.line.substring(this.index + 1, right),   
                    rightExpr: this.line.substring(right + 1, this.line.length),
                    current: current,
                    max: max,
                    result: null,
                    maxString: null,
                    level: level,
                    position: 'center',
                    description: `遇到'('，准备递归调用，current=${current}, max=${max}`
                });

                const result = this.dfs(level + 1);
                current += result;

                this.steps.push({
                    id: this.generateStepId(),
                    type: 'bracket_result',
                    expression: this.steps[this.steps.length - 1].leftExpr || this.steps[this.steps.length - 1].expression,
                    leftExpr: null,
                    rightExpr: null,
                    current: current,
                    max: max,
                    result: result,
                    maxString: 'x'.repeat(result),
                    level: level,
                    position: 'center',
                    description: `递归返回，结果=${result}，current更新为${current}`
                });

            } else if (char === '|') {
                // 遇到'|'，更新max，重置current
                max = Math.max(max, current);
                current = 0;
                this.steps.push({
                    id: this.generateStepId(),
                    type: 'choice_process',
                    expression: this.steps[this.steps.length - 1].leftExpr || this.steps[this.steps.length - 1].expression,
                    leftExpr: null,
                    rightExpr: null,
                    current: current,
                    max: max,
                    result: null,
                    maxString: null,
                    level: level,
                    position: 'center',
                    description: `遇到'|'，更新max=${max}，重置current=0`
                });

            } else if (char === 'x') {
                // 遇到'x'，current++
                current++;
                continue;

            } else if (char === ')') {
                // 遇到')'，返回max(current)
                const result = Math.max(max, current);

                this.steps.push({
                    id: this.generateStepId(),
                    type: 'bracket_return',
                    expression: this.steps[this.steps.length - 1].leftExpr || this.steps[this.steps.length - 1].expression,
                    leftExpr: null,
                    rightExpr: null,
                    current: current,
                    max: max,
                    result: result,
                    maxString: 'x'.repeat(result),
                    level: level,
                    position: 'center',
                    description: `遇到')'，返回max(${max}, ${current})=${result}`
                });

                return result;
            }
        }

        // 循环结束，返回max(current)
        const result = Math.max(max, current);

        this.steps.push({
            id: this.generateStepId(),
            type: 'dfs_return',
            expression: '循环结束',
            leftExpr: null,
            rightExpr: null,
            current: current,
            max: max,
            result: result,
            maxString: 'x'.repeat(result),
            level: level,
            position: 'center',
            description: `循环结束，返回max(${max}, ${current})=${result}`
        });

        return result;
    }

    // 获取算法复杂度
    getComplexity() {
        return {
            time: 'O(n)',
            space: 'O(n)'
        };
    }

    // 获取算法描述
    getDescription() {
        return {
            name: '正则表达式最长匹配长度',
            description: '使用深度优先搜索计算由 x、()、| 组成的正则表达式能接受的最长字符串长度',
            steps: [
                '使用深度优先搜索遍历表达式',
                '遇到 ( 时递归处理括号内的表达式',
                '遇到 | 时保存当前最大值并重置计数器',
                '遇到 x 时长度加 1',
                '遇到 ) 时返回当前分支的最大值',
                '最终返回整个表达式的最长长度'
            ]
        };
    }
}

// 导出算法
export default new RegexMaxLengthAlgorithm();