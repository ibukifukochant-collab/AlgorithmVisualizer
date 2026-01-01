// 迷宫深度优先搜索算法实现
class MazeDFS {
    constructor() {
        this.steps = [];
        this.maze = null;
        this.visited = null;
        this.stack = [];
    }

    // 生成随机迷宫
    generateMaze(width, height, wallDensity = 0.3, algorithm = 'recursive-backtracker') {
        let maze;
        
        // 根据选择的算法生成迷宫
        if (algorithm === 'prim') {
            maze = this.generateMazePrim(width, height);
        } else {
            // 默认使用递归回溯算法
            maze = this.generateMazeRecursiveBacktracker(width, height);
        }
        
        return maze;
    }
    
    // 使用递归回溯算法生成迷宫
    generateMazeRecursiveBacktracker(width, height) {
        // 创建迷宫，1表示墙壁，0表示通路
        // 注意：我们使用2x2的网格来表示墙壁和通路，实际迷宫大小会是2*width+1 x 2*height+1
        const mazeWidth = 2 * width + 1;
        const mazeHeight = 2 * height + 1;
        const maze = Array(mazeHeight).fill().map(() => Array(mazeWidth).fill(1));
        
        // 访问标记
        const visited = Array(height).fill().map(() => Array(width).fill(false));
        
        // 方向：上、右、下、左
        const directions = [
            { dx: 0, dy: -1, wallDx: 0, wallDy: -1 }, // 上
            { dx: 1, dy: 0, wallDx: 1, wallDy: 0 },   // 右
            { dx: 0, dy: 1, wallDx: 0, wallDy: 1 },   // 下
            { dx: -1, dy: 0, wallDx: -1, wallDy: 0 }  // 左
        ];
        
        const stack = [];
        
        // 从起点开始
        let currentX = 0;
        let currentY = 0;
        visited[currentY][currentX] = true;
        maze[2 * currentY + 1][2 * currentX + 1] = 0;
        stack.push({ x: currentX, y: currentY });
        
        while (stack.length > 0) {
            // 获取当前位置
            const current = stack[stack.length - 1];
            
            // 寻找未访问的邻居
            const unvisitedNeighbors = [];
            for (const dir of directions) {
                const newX = current.x + dir.dx;
                const newY = current.y + dir.dy;
                
                if (newX >= 0 && newX < width && newY >= 0 && newY < height && !visited[newY][newX]) {
                    unvisitedNeighbors.push({ x: newX, y: newY, dir: dir });
                }
            }
            
            if (unvisitedNeighbors.length > 0) {
                // 随机选择一个未访问的邻居
                const randomIndex = Math.floor(Math.random() * unvisitedNeighbors.length);
                const neighbor = unvisitedNeighbors[randomIndex];
                
                // 标记为已访问
                visited[neighbor.y][neighbor.x] = true;
                
                // 打通当前位置到邻居的墙壁
                const currentMazeX = 2 * current.x + 1;
                const currentMazeY = 2 * current.y + 1;
                const neighborMazeX = 2 * neighbor.x + 1;
                const neighborMazeY = 2 * neighbor.y + 1;
                
                // 设置当前位置和邻居位置为通路
                maze[currentMazeY][currentMazeX] = 0;
                maze[neighborMazeY][neighborMazeX] = 0;
                
                // 打通中间的墙壁
                const wallX = currentMazeX + neighbor.dir.wallDx;
                const wallY = currentMazeY + neighbor.dir.wallDy;
                maze[wallY][wallX] = 0;
                
                // 将邻居压入堆栈
                stack.push({ x: neighbor.x, y: neighbor.y });
            } else {
                // 回溯
                stack.pop();
            }
        }
        
        // 确保起点(0,0)及其邻居是通路
        maze[1][1] = 0;
        maze[1][2] = 0; // 起点右侧
        maze[2][1] = 0; // 起点下方
        
        // 确保终点及其邻居是通路
        maze[mazeHeight - 2][mazeWidth - 2] = 0;
        maze[mazeHeight - 2][mazeWidth - 3] = 0; // 终点左侧
        maze[mazeHeight - 3][mazeWidth - 2] = 0; // 终点上方
        
        return maze;
    }
    
    // 使用随机Prim算法生成迷宫
    generateMazePrim(width, height) {
        // 创建迷宫，1表示墙壁，0表示通路
        const mazeWidth = 2 * width + 1;
        const mazeHeight = 2 * height + 1;
        const maze = Array(mazeHeight).fill().map(() => Array(mazeWidth).fill(1));
        
        // 访问标记
        const visited = Array(height).fill().map(() => Array(width).fill(false));
        
        // 方向：上、右、下、左
        const directions = [
            { dx: 0, dy: -1, wallDx: 0, wallDy: -1 }, // 上
            { dx: 1, dy: 0, wallDx: 1, wallDy: 0 },   // 右
            { dx: 0, dy: 1, wallDx: 0, wallDy: 1 },   // 下
            { dx: -1, dy: 0, wallDx: -1, wallDy: 0 }  // 左
        ];
        
        // 墙壁列表
        const walls = [];
        
        // 从起点开始
        let startX = 0;
        let startY = 0;
        visited[startY][startX] = true;
        maze[2 * startY + 1][2 * startX + 1] = 0;
        
        // 添加起点的墙壁到列表
        for (const dir of directions) {
            const newX = startX + dir.dx;
            const newY = startY + dir.dy;
            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                walls.push({
                    x: startX,
                    y: startY,
                    neighborX: newX,
                    neighborY: newY,
                    dir: dir
                });
            }
        }
        
        while (walls.length > 0) {
            // 随机选择一个墙壁
            const randomIndex = Math.floor(Math.random() * walls.length);
            const wall = walls[randomIndex];
            
            // 移除选择的墙壁
            walls.splice(randomIndex, 1);
            
            // 检查邻居是否已访问
            if (!visited[wall.neighborY][wall.neighborX]) {
                // 标记邻居为已访问
                visited[wall.neighborY][wall.neighborX] = true;
                
                // 打通墙壁
                const currentMazeX = 2 * wall.x + 1;
                const currentMazeY = 2 * wall.y + 1;
                const neighborMazeX = 2 * wall.neighborX + 1;
                const neighborMazeY = 2 * wall.neighborY + 1;
                
                // 设置邻居位置为通路
                maze[neighborMazeY][neighborMazeX] = 0;
                
                // 打通中间的墙壁
                const wallX = currentMazeX + wall.dir.wallDx;
                const wallY = currentMazeY + wall.dir.wallDy;
                maze[wallY][wallX] = 0;
                
                // 添加邻居的墙壁到列表
                for (const dir of directions) {
                    const newX = wall.neighborX + dir.dx;
                    const newY = wall.neighborY + dir.dy;
                    if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                        walls.push({
                            x: wall.neighborX,
                            y: wall.neighborY,
                            neighborX: newX,
                            neighborY: newY,
                            dir: dir
                        });
                    }
                }
            }
        }
        
        // 确保起点(0,0)及其邻居是通路
        maze[1][1] = 0;
        maze[1][2] = 0; // 起点右侧
        maze[2][1] = 0; // 起点下方
        
        // 确保终点及其邻居是通路
        maze[mazeHeight - 2][mazeWidth - 2] = 0;
        maze[mazeHeight - 2][mazeWidth - 3] = 0; // 终点左侧
        maze[mazeHeight - 3][mazeWidth - 2] = 0; // 终点上方
        
        return maze;
    }

    // 深度优先搜索
    search(maze) {
        const steps = [];
        const height = maze.length;
        const width = maze[0].length;
        const visited = Array(height).fill().map(() => Array(width).fill(false));
        const stack = [];
        const directions = [
            { dx: 0, dy: -1, name: '上' },  // 上
            { dx: 1, dy: 0, name: '右' },   // 右
            { dx: 0, dy: 1, name: '下' },   // 下
            { dx: -1, dy: 0, name: '左' }   // 左
        ];
        
        // 使用正确的起点和终点坐标（避开边界墙壁）
        const startX = 1;
        const startY = 1;
        const endX = width - 2;
        const endY = height - 2;
        
        // 初始化
        stack.push({ x: startX, y: startY });
        visited[startY][startX] = true;
        
        // 记录初始状态
        steps.push({
            type: 'initial',
            current: { x: startX, y: startY },
            visited: [...visited.map(row => [...row])],
            stack: [...stack],
            direction: null,
            description: '开始深度优先搜索，起点位于(0,0)'
        });
        
        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            
            // 如果到达终点
            if (current.x === endX && current.y === endY) {
                steps.push({
                    type: 'success',
                    current: { ...current },
                    visited: [...visited.map(row => [...row])],
                    stack: [...stack],
                    direction: null,
                    description: '到达终点！深度优先搜索完成'
                });
                break;
            }
            
            // 寻找未访问的相邻单元格
            let found = false;
            for (const dir of directions) {
                const newX = current.x + dir.dx;
                const newY = current.y + dir.dy;
                
                // 检查边界和是否可通行
                if (newX >= 0 && newX < width && newY >= 0 && newY < height && 
                    maze[newY][newX] === 0 && !visited[newY][newX]) {
                    
                    // 访问新单元格
                    stack.push({ x: newX, y: newY });
                    visited[newY][newX] = true;
                    
                    // 记录压栈操作
                    steps.push({
                        type: 'push',
                        current: { x: newX, y: newY },
                        visited: [...visited.map(row => [...row])],
                        stack: [...stack],
                        direction: dir,
                        description: `向${dir.name}移动到(${newX},${newY})，执行压栈操作`
                    });
                    
                    found = true;
                    break;
                }
            }
            
            // 如果没有未访问的相邻单元格，回溯
            if (!found) {
                const popped = stack.pop();
                
                // 记录弹栈操作
                steps.push({
                    type: 'pop',
                    current: stack.length > 0 ? { ...stack[stack.length - 1] } : { x: startX, y: startY },
                    visited: [...visited.map(row => [...row])],
                    stack: [...stack],
                    direction: null,
                    description: `从(${popped.x},${popped.y})回溯，执行弹栈操作`
                });
            }
        }
        
        // 如果栈为空且未找到终点
        if (stack.length === 0 && !(steps[steps.length - 1]?.type === 'success')) {
            steps.push({
                type: 'fail',
                current: { x: startX, y: startY },
                visited: [...visited.map(row => [...row])],
                stack: [],
                direction: null,
                description: '未找到从起点到终点的路径'
            });
        }
        
        return steps;
    }

    // 获取算法复杂度
    getComplexity() {
        return {
            time: 'O(V+E)',
            space: 'O(V)'
        };
    }

    // 获取算法描述
    getDescription() {
        return {
            name: 'Maze Depth-First Search',
            description: '深度优先搜索 (DFS) 是一种用于遍历或搜索树或图的算法。在迷宫探索中，DFS 会沿着一条路径尽可能深入地探索，直到无法继续，然后回溯并尝试其他路径。',
            steps: [
                '从起点开始，选择一个方向探索',
                '尽可能深入探索该方向，直到无法继续',
                '如果无法继续，回溯到上一个分支点',
                '尝试其他未探索的方向',
                '重复上述过程，直到找到终点或遍历所有可能路径'
            ]
        };
    }
}

// 导出算法
export default new MazeDFS();