// 正则表达式最长匹配长度可视化实现 - 彻底重构版本
class RegexVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.steps = [];
        this.currentStep = 0;
        this.animationSpeed = 500;
        this.isPlaying = false;
        this.animationId = null;
        
        // 递归栈状态
        this.recursionStack = [];
        this.currentRecursionLevel = 0;
        
        // 可视化布局参数
        this.layout = {
            leftPanelWidth: 600,      // 左侧递归栈面板宽度 (增加以容纳更宽的单元格)
            mainPanelWidth: 600,      // 主面板宽度
            rowHeight: 60,            // 每行高度
            cellSpacing: 15,          // 格子间距 (稍微增加以提高可读性)
            leftMargin: 20,           // 左侧边距
            topMargin: 20             // 顶部边距
        };
        
        // 动画状态
        this.fadeAnimation = {
            opacity: 1.0,
            targetOpacity: 1.0,
            animationTime: 0,
            duration: 300
        };
        
        // 初始化画布
        this.initCanvas();
        
        // 初始化鼠标交互功能
        this.initMouseInteraction();
    }
    
    // 初始化鼠标交互功能
    initMouseInteraction() {
        // 创建tooltip元素
        this.tooltip = document.createElement('div');
        this.tooltip.style.position = 'absolute';
        this.tooltip.style.padding = '8px 12px';
        this.tooltip.style.background = 'rgba(0, 0, 0, 0.8)';
        this.tooltip.style.color = 'white';
        this.tooltip.style.borderRadius = '4px';
        this.tooltip.style.fontSize = '12px';
        this.tooltip.style.pointerEvents = 'none';
        this.tooltip.style.zIndex = '1000';
        this.tooltip.style.display = 'none';
        this.tooltip.style.maxWidth = '300px';
        this.tooltip.style.wordWrap = 'break-word';
        document.body.appendChild(this.tooltip);
        
        // 添加鼠标移动事件监听
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.hideTooltip());
    }
    
    // 处理鼠标移动事件
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // 检查鼠标是否在某个单元格上方
        const cellInfo = this.getCellAtPosition(mouseX, mouseY);
        
        if (cellInfo) {
            // 显示完整字符串的tooltip
            this.showTooltip(cellInfo.fullText, event.clientX, event.clientY);
        } else {
            this.hideTooltip();
        }
    }
    
    // 获取指定位置的单元格信息
    getCellAtPosition(mouseX, mouseY) {
        if (this.steps.length === 0 || this.currentStep >= this.steps.length) return null;
        
        const step = this.steps[this.currentStep];
        
        // 检查递归栈中的每个行
        for (let rowIndex = 0; rowIndex < this.recursionStack.length; rowIndex++) {
            const stackItem = this.recursionStack[rowIndex];
            const y = this.layout.topMargin + 60 + rowIndex * this.layout.rowHeight;
            
            const totalWidth = this.layout.leftPanelWidth - this.layout.leftMargin * 2;
            const cellWidth = (totalWidth - this.layout.cellSpacing * 2) / 3;
            
            // 检查左子节点
            if (stackItem.leftChild) {
                const leftX = this.layout.leftMargin;
                if (this.isPointInRect(mouseX, mouseY, leftX, y - this.layout.rowHeight / 2, cellWidth, this.layout.rowHeight - 10)) {
                    return {
                        fullText: stackItem.leftChild.expression,
                        type: 'left_child'
                    };
                }
            }
            
            // 检查当前节点
            const centerX = this.layout.leftMargin + cellWidth + this.layout.cellSpacing;
            if (this.isPointInRect(mouseX, mouseY, centerX, y - this.layout.rowHeight / 2, cellWidth, this.layout.rowHeight - 10)) {
                return {
                    fullText: stackItem.expression,
                    type: 'current_node'
                };
            }
            
            // 检查右子节点
            if (stackItem.rightChild) {
                const rightX = this.layout.leftMargin + (cellWidth + this.layout.cellSpacing) * 2;
                if (this.isPointInRect(mouseX, mouseY, rightX, y - this.layout.rowHeight / 2, cellWidth, this.layout.rowHeight - 10)) {
                    return {
                        fullText: stackItem.rightChild.expression,
                        type: 'right_child'
                    };
                }
            }
        }
        
        return null;
    }
    
    // 检查点是否在矩形内
    isPointInRect(pointX, pointY, rectX, rectY, width, height) {
        return (
            pointX >= rectX &&
            pointX <= rectX + width &&
            pointY >= rectY &&
            pointY <= rectY + height
        );
    }
    
    // 显示tooltip
    showTooltip(text, clientX, clientY) {
        this.tooltip.textContent = text;
        this.tooltip.style.display = 'block';
        this.tooltip.style.left = clientX + 10 + 'px';
        this.tooltip.style.top = clientY + 10 + 'px';
    }
    
    // 隐藏tooltip
    hideTooltip() {
        this.tooltip.style.display = 'none';
    }
    
    // 初始化画布
    initCanvas() {
        this.canvas.width = 1400;
        this.canvas.height = 800;
        this.ctx.font = '14px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // 重置画布样式
        this.canvas.style.display = 'block';
        this.canvas.style.margin = '0 auto';
        this.canvas.style.border = '2px solid #e5e7eb';
        this.canvas.style.borderRadius = '8px';
        this.canvas.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.06)';
    }
    
    // 加载步骤
    loadSteps(steps) {
        this.steps = steps;
        this.currentStep = 0;
        this.recursionStack = [];
        // this.currentRecursionLevel = 0;
        this.draw();
    }
    
    // 绘制当前状态
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.steps.length === 0) return;
        
        const step = this.steps[this.currentStep];
        
        // 绘制背景分区
        this.drawBackground();
        
        // 应用动画效果
        this.applyAnimations();
        
        // 绘制递归栈
        this.drawRecursionStack(step);
        
        // 绘制主区域内容 - 显示当前处理的完整表达式
        this.drawMainArea(step);
        
        // 绘制当前步骤描述
        this.drawDescription(step);
        
        // 更新动画
        this.updateAnimations();
    }
    
    // 应用动画效果
    applyAnimations() {
        // 应用淡入动画
        this.ctx.globalAlpha = this.fadeAnimation.opacity;
    }
    
    // 更新所有动画
    updateAnimations() {
        let isAnimating = false;
        
        // 更新淡入动画
        if (this.fadeAnimation.opacity !== this.fadeAnimation.targetOpacity) {
            const delta = 0.1;
            if (this.fadeAnimation.opacity < this.fadeAnimation.targetOpacity) {
                this.fadeAnimation.opacity = Math.min(this.fadeAnimation.targetOpacity, this.fadeAnimation.opacity + delta);
            } else {
                this.fadeAnimation.opacity = Math.max(this.fadeAnimation.targetOpacity, this.fadeAnimation.opacity - delta);
            }
            isAnimating = true;
        }
        
        // 继续动画
        if (isAnimating) {
            requestAnimationFrame(() => this.draw());
        }
    }
    
    // 触发淡入动画
    triggerFadeIn() {
        this.fadeAnimation.opacity = 0.3;
        this.fadeAnimation.targetOpacity = 1.0;
        this.draw();
    }
    
    // 绘制主区域内容
    drawMainArea(step) {
        const x = this.layout.leftPanelWidth + this.layout.mainPanelWidth / 2;
        const y = this.canvas.height / 2;
        
        // 绘制当前步骤类型
        this.ctx.fillStyle = '#374151';
        this.ctx.font = 'bold 18px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`当前步骤: ${step.type}`, x, y - 100);
        
        // 绘制当前表达式
        this.ctx.fillStyle = '#1e293b';
        this.ctx.font = '24px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`表达式: ${step.expression}`, x, y - 50);
        
        // 绘制结果
        if (step.result !== null) {
            this.ctx.fillStyle = '#10b981';
            this.ctx.font = '20px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`结果: ${step.result}`, x, y + 20);
        }
        
        // 绘制最长字符串
        if (step.maxString !== null) {
            this.ctx.fillStyle = '#3b82f6';
            this.ctx.font = '16px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`最长字符串: ${step.maxString}`, x, y + 60);
        }
    }
    
    // 绘制背景分区
    drawBackground() {
        // 左侧递归栈区域
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.fillRect(0, 0, this.layout.leftPanelWidth, this.canvas.height);
        
        // 右侧分隔线
        this.ctx.strokeStyle = '#e5e7eb';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.layout.leftPanelWidth, 0);
        this.ctx.lineTo(this.layout.leftPanelWidth, this.canvas.height);
        this.ctx.stroke();
        
        // 主区域背景
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(this.layout.leftPanelWidth, 0, this.layout.mainPanelWidth, this.canvas.height);
    }
    
    // 绘制递归栈
    drawRecursionStack(step) {
        // 更新递归栈状态
        // this.updateRecursionStack(step);
        
        // 绘制栈标题
        this.ctx.fillStyle = '#374151';
        this.ctx.font = 'bold 16px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('递归处理栈', this.layout.leftPanelWidth / 2, 30);
        
        // 绘制栈中的每一行
        this.recursionStack.forEach((stackItem, index) => {
            this.drawStackRow(stackItem, index);
        });
    }
    
    // 更新递归栈状态
    updateRecursionStack(step) {
        console.log(step);
        switch (step.type) {
            case 'initial':
                // 初始化递归栈，添加根节点
                this.recursionStack = [{
                    expression: step.expression,
                    level: 0,
                    status: 'processing',
                    leftChild: null,
                    rightChild: null,
                    result: null,
                    maxString: null,
                    currentChild: null,
                    originalExpression: step.expression
                }];
                this.currentRecursionLevel = 0;
                break;
                
            case 'split_choice':
            case 'char_process':
            case 'choice_process':
                // 分解表达式，添加新的递归节点
                this.recursionStack.push({
                    expression: step.expression,
                    originalExpression: step.expression,
                    level: this.recursionStack.length,
                    status: 'processing',
                    leftChild: step.leftExpr ? {
                        expression: step.leftExpr,
                        status: 'pending',
                        result: null,
                        maxString: null
                    } : null,
                    rightChild: step.rightExpr ? {
                        expression: step.rightExpr,
                        status: 'pending',
                        result: null,
                        maxString: null
                    } : null,
                    result: null,
                    maxString: null,
                    currentChild: step.leftExpr ? 'left' : null
                });
                this.currentRecursionLevel++;
                console.log(this.currentRecursionLevel+"now?");
                break;
            case 'bracket_return':
                // 选择结果，标记当前节点完成
                if (this.recursionStack.length > 0) {
                    const currentItem = this.recursionStack[this.currentRecursionLevel];
                    if (currentItem) {
                        currentItem.status = 'completed';
                        currentItem.result = step.result;
                        currentItem.maxString = step.maxString;
                    }
                }
                // 弹出栈
                this.recursionStack.pop();
                this.currentRecursionLevel--;
                break;
                
            case 'concat_result':
                // 连接结果，标记当前节点完成
                if (this.recursionStack.length > 0) {
                    const currentItem = this.recursionStack[this.currentRecursionLevel];
                    if (currentItem) {
                        currentItem.status = 'completed';
                        currentItem.result = step.result;
                        currentItem.maxString = step.maxString;
                    }
                }
                // 弹出栈
                this.recursionStack.pop();
                this.currentRecursionLevel--;
                break;
                
            case 'basic_result':
                // 基础情况结果，标记当前节点完成
                if (this.recursionStack.length > 0) {
                    const currentItem = this.recursionStack[this.currentRecursionLevel];
                    if (currentItem) {
                        currentItem.status = 'completed';
                        currentItem.result = step.result;
                        currentItem.maxString = step.maxString;
                    }
                }
                break;
                
            case 'final':
                // 最终结果，清空栈，只显示最终结果
                this.recursionStack = [{
                    expression: step.expression,
                    originalExpression: step.expression,
                    level: 0,
                    status: 'completed',
                    leftChild: null,
                    rightChild: null,
                    result: step.result,
                    maxString: step.maxString,
                    currentChild: null
                }];
                break;
        }
    }
    
    // 绘制栈中的一行
    drawStackRow(stackItem, rowIndex) {
        const y = this.layout.topMargin + 60 + rowIndex * this.layout.rowHeight;
        
        // 绘制行背景
        this.ctx.fillStyle = this.getRowBackgroundColor(stackItem.status);
        this.ctx.fillRect(
            this.layout.leftMargin, 
            y - this.layout.rowHeight / 2, 
            this.layout.leftPanelWidth - this.layout.leftMargin * 2, 
            this.layout.rowHeight - 5
        );
        
        // 绘制三个格子：左子节点、当前节点、右子节点
        this.drawThreeCellsLayout(stackItem, rowIndex, y);
    }
    
    // 获取行背景颜色
    getRowBackgroundColor(status) {
        switch (status) {
            case 'processing':
                return '#dbeafe';
            case 'completed':
                return '#d1fae5';
            default:
                return '#f3f4f6';
        }
    }
    
    // 绘制三格布局
    drawThreeCellsLayout(stackItem, rowIndex, y) {
        const totalWidth = this.layout.leftPanelWidth - this.layout.leftMargin * 2;
        const cellWidth = (totalWidth - this.layout.cellSpacing * 2) / 3;
        
        // 左格子 - 显示左子节点
        this.drawChildCell(
            this.layout.leftMargin, 
            y, 
            cellWidth, 
            this.layout.rowHeight - 10, 
            stackItem.leftChild,
            'left',
            stackItem.currentChild === 'left'
        );
        
        // 中格子 - 显示当前节点
        this.drawCurrentCell(
            this.layout.leftMargin + cellWidth + this.layout.cellSpacing, 
            y, 
            cellWidth, 
            this.layout.rowHeight - 10, 
            stackItem
        );
        
        // 右格子 - 显示右子节点
        this.drawChildCell(
            this.layout.leftMargin + (cellWidth + this.layout.cellSpacing) * 2, 
            y, 
            cellWidth, 
            this.layout.rowHeight - 10, 
            stackItem.rightChild,
            'right',
            stackItem.currentChild === 'right'
        );
    }
    
    // 绘制当前节点格子
    drawCurrentCell(x, y, width, height, stackItem) {
        const { expression, status, result, maxString, originalExpression } = stackItem;
        
        let fillColor = '#ffffff';
        let strokeColor = '#64748b';
        
        switch (status) {
            case 'processing':
                fillColor = '#3b82f6';
                strokeColor = '#2563eb';
                break;
            case 'completed':
                fillColor = '#10b981';
                strokeColor = '#059669';
                break;
        }
        
        this.ctx.fillStyle = fillColor;
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = 2;
        this.drawRoundedRect(x, y - height / 2, width, height, 5);
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Inter';
        
        let displayText = expression;
        if (displayText.length > 20) {
            displayText = displayText.substring(0, 18) + '...';
        }
        
        this.ctx.fillText(displayText, x + width / 2, y);
        
        if (result !== null) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '10px Inter';
            this.ctx.fillText(result.toString(), x + width / 2, y + 15);
        }
    }
    
    // 绘制子节点格子
    drawChildCell(x, y, width, height, child, position, isProcessing) {
        if (!child) return;
        
        const { expression, status, result, maxString } = child;
        
        let fillColor = '#ffffff';
        let strokeColor = '#64748b';
        
        if (isProcessing) {
            fillColor = '#ef4444';
            strokeColor = '#dc2626';
        } else {
            switch (status) {
                case 'pending':
                    fillColor = '#f3f4f6';
                    strokeColor = '#d1d5db';
                    break;
                case 'completed':
                    fillColor = '#10b981';
                    strokeColor = '#059669';
                    break;
            }
        }
        
        this.ctx.fillStyle = fillColor;
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = 2;
        this.drawRoundedRect(x, y - height / 2, width, height, 5);
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.fillStyle = isProcessing ? '#ffffff' : (status === 'pending' ? '#6b7280' : '#ffffff');
        this.ctx.font = '12px Inter';
        
        let displayText = expression;
        if (displayText.length > 20) {
            displayText = displayText.substring(0, 18) + '...';
        }
        
        this.ctx.fillText(displayText, x + width / 2, y);
        
        if (result !== null) {
            this.ctx.fillStyle = isProcessing ? '#ffffff' : '#ffffff';
            this.ctx.font = '10px Inter';
            this.ctx.fillText(result.toString(), x + width / 2, y + 15);
        }
    }
    
    // 绘制圆角矩形
    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
    
    // 绘制描述
    drawDescription(step) {
        this.ctx.fillStyle = '#475569';
        this.ctx.font = '14px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(step.description, this.canvas.width / 2, this.canvas.height - 30);
    }
    
    // 设置动画速度
    setSpeed(speed) {
        this.animationSpeed = speed;
    }
    
    // 下一步
    nextStep() {
        console.log("?"+this.currentRecursionLevel);
        if (this.currentStep < this.steps.length - 1) {
            
            this.currentStep++;
            this.recursionStack = [];
            for (let i = 0; i <= this.currentStep; i++) {
                console.log(i+"insert?");
                this.updateRecursionStack(this.steps[i]);
            }
            this.triggerFadeIn();
            return true;
        }
        return false;
    }
    
    // 上一步
    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.recursionStack = [];

            for (let i = 0; i <= this.currentStep; i++) {
                this.updateRecursionStack(this.steps[i]);
            }
            this.triggerFadeIn();
            return true;
        }
        return false;
    }
    
    // 播放/暂停
    playPause() {
        this.isPlaying = !this.isPlaying;
        
        if (this.isPlaying) {
            this.playAnimation();
        } else {
            this.pause();
        }
    }
    
    // 播放动画
    playAnimation() {
        if (this.isPlaying) {
            if (this.currentStep < this.steps.length - 1) {
                if (this.nextStep()) {
                    this.animationId = setTimeout(() => this.playAnimation(), this.animationSpeed);
                } else {
                    this.isPlaying = false;
                }
            } else {
                this.isPlaying = false;
            }
        }
    }
    
    // 暂停
    pause() {
        this.isPlaying = false;
        if (this.animationId) {
            clearTimeout(this.animationId);
            this.animationId = null;
        }
    }
    
    // 重置
    reset() {
        this.pause();
        this.currentStep = 0;
        this.recursionStack = [];
        this.currentRecursionLevel = 0;
        this.draw();
    }
    
    // 销毁可视化实例
    destroy() {
        this.pause();
        this.steps = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 移除tooltip元素
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
        }
    }
}

// 导出可视化器
export default RegexVisualizer;