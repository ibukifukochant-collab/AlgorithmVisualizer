// 冒泡排序算法实现
class BubbleSort {
    constructor() {
        this.steps = [];
    }

    // 执行冒泡排序，记录每一步
    sort(array) {
        this.steps = [];
        const arr = [...array];
        const n = arr.length;

        // 记录初始状态
        this.steps.push({
            type: 'initial',
            array: [...arr],
            indices: [],
            description: '初始数组'
        });

        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                // 记录比较状态
                this.steps.push({
                    type: 'compare',
                    array: [...arr],
                    indices: [j, j + 1],
                    description: `比较元素 ${arr[j]} 和 ${arr[j + 1]}`
                });

                if (arr[j] > arr[j + 1]) {
                    // 交换元素
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    
                    // 记录交换状态
                    this.steps.push({
                        type: 'swap',
                        array: [...arr],
                        indices: [j, j + 1],
                        description: `交换元素 ${arr[j]} 和 ${arr[j + 1]}`
                    });
                }
            }
            
            // 记录每一轮结束状态
            this.steps.push({
                type: 'iteration',
                array: [...arr],
                indices: [n - i - 1],
                description: `第 ${i + 1} 轮排序完成，元素 ${arr[n - i - 1]} 已就位`
            });
        }

        // 记录最终状态
        this.steps.push({
            type: 'final',
            array: [...arr],
            indices: [],
            description: '排序完成'
        });

        return this.steps;
    }

    // 获取算法复杂度
    getComplexity() {
        return {
            time: 'O(n²)',
            space: 'O(1)'
        };
    }

    // 获取算法描述
    getDescription() {
        return {
            name: 'Bubble Sort',
            description: '冒泡排序是一种简单的排序算法，它重复地遍历要排序的列表，比较相邻的两个元素，如果它们的顺序错误就把它们交换过来。遍历列表的工作是重复地进行直到没有再需要交换的元素，也就是说该列表已经排序完成。',
            steps: [
                '比较相邻的元素。如果第一个比第二个大，就交换它们两个；',
                '对每一对相邻元素作同样的工作，从开始第一对到结尾的最后一对，这样在最后的元素应该会是最大的数；',
                '针对所有的元素重复以上的步骤，除了最后一个；',
                '重复步骤1~3，直到排序完成。'
            ]
        };
    }
}

// 导出算法
export default new BubbleSort();