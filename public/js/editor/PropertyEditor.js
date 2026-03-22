export default class PropertyEditor {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentComponent = null;
    }

    edit(component) {
        this.currentComponent = component;
        this.render();
    }

    clear() {
        this.currentComponent = null;
        this.container.innerHTML = `
            <div class="no-selection">
                <p>请选择一个组件</p>
            </div>
        `;
    }

    render() {
        if (!this.currentComponent) {
            this.clear();
            return;
        }

        const schema = this.currentComponent.getPropertySchema();
        let html = '';

        html += this.renderSection('基本信息', schema.basic);
        html += this.renderSection('动画设置', schema.animation);
        html += this.renderDataSection(schema.data);
        html += this.renderAnimationButtons();
        html += this.renderAPICode();

        this.container.innerHTML = html;
        this.bindEvents();
    }

    renderSection(title, properties) {
        if (!properties || properties.length === 0) return '';

        let html = `
            <div class="property-group">
                <div class="property-group-title">${title}</div>
        `;

        properties.forEach(prop => {
            html += this.renderProperty(prop);
        });

        html += '</div>';
        return html;
    }

    renderProperty(prop) {
        const value = this.currentComponent.getProperty(prop.key);
        
        switch (prop.type) {
            case 'text':
                return `
                    <div class="property-item">
                        <label for="prop_${prop.key}">${prop.label}</label>
                        <input type="text" id="prop_${prop.key}" 
                               data-key="${prop.key}" 
                               value="${value || ''}">
                    </div>
                `;
            case 'number':
                return `
                    <div class="property-item">
                        <label for="prop_${prop.key}">${prop.label}</label>
                        <input type="number" id="prop_${prop.key}" 
                               data-key="${prop.key}" 
                               value="${value || 0}">
                    </div>
                `;
            case 'color':
                return `
                    <div class="property-item">
                        <label for="prop_${prop.key}">${prop.label}</label>
                        <input type="color" id="prop_${prop.key}" 
                               data-key="${prop.key}" 
                               value="${value || '#667eea'}">
                    </div>
                `;
            case 'boolean':
                return `
                    <div class="property-item">
                        <label>
                            <input type="checkbox" id="prop_${prop.key}" 
                                   data-key="${prop.key}" 
                                   ${value ? 'checked' : ''}>
                            ${prop.label}
                        </label>
                    </div>
                `;
            default:
                return '';
        }
    }

    renderDataSection(properties) {
        if (!properties || properties.length === 0) return '';

        let html = `
            <div class="property-group">
                <div class="property-group-title">数据设置</div>
        `;

        properties.forEach(prop => {
            if (prop.type === 'array') {
                html += this.renderArrayEditor(prop);
            }
        });

        html += '</div>';
        return html;
    }

    renderArrayEditor(prop) {
        const data = this.currentComponent.getProperty(prop.key) || [];
        
        let html = `
            <div class="property-item">
                <label>${prop.label}</label>
                <div class="data-editor" id="dataEditor">
        `;

        data.forEach((value, index) => {
            html += `
                <div class="data-row" data-index="${index}">
                    <input type="number" value="${value}" data-index="${index}">
                    <button class="delete-data-btn" data-index="${index}">×</button>
                </div>
            `;
        });

        html += `
                </div>
                <button class="add-data-btn" id="addDataBtn">+ 添加数据</button>
            </div>
        `;

        return html;
    }

    renderAnimationButtons() {
        if (this.currentComponent.type === 'stack') {
            return `
                <div class="property-group">
                    <div class="property-group-title">动画测试</div>
                    <div class="animation-buttons">
                        <button class="animation-btn" data-action="highlight">高亮测试</button>
                        <button class="animation-btn" data-action="push">入栈测试</button>
                        <button class="animation-btn" data-action="pop">出栈测试</button>
                        <button class="animation-btn" data-action="reset">重置状态</button>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="property-group">
                <div class="property-group-title">动画测试</div>
                <div class="animation-buttons">
                    <button class="animation-btn" data-action="highlight">高亮测试</button>
                    <button class="animation-btn" data-action="swap">交换测试</button>
                    <button class="animation-btn" data-action="insert">插入测试</button>
                    <button class="animation-btn" data-action="delete">删除测试</button>
                    <button class="animation-btn" data-action="reset">重置状态</button>
                </div>
            </div>
        `;
    }

    renderAPICode() {
        if (!this.currentComponent.getAnimationAPICode) return '';

        const code = this.currentComponent.getAnimationAPICode();
        
        return `
            <div class="property-group">
                <div class="property-group-title">API 代码示例</div>
                <pre style="background: #f8fafc; padding: 15px; border-radius: 8px; font-size: 12px; overflow-x: auto; white-space: pre-wrap;">${this.escapeHtml(code)}</pre>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    bindEvents() {
        this.container.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', (e) => {
                const key = e.target.dataset.key;
                let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                
                if (e.target.type === 'number') {
                    value = parseFloat(value);
                }
                
                if (this.currentComponent) {
                    this.currentComponent.setProperty(key, value);
                }
            });
        });

        const addDataBtn = document.getElementById('addDataBtn');
        if (addDataBtn) {
            addDataBtn.addEventListener('click', () => {
                if (this.currentComponent) {
                    const data = [...this.currentComponent.data, Math.floor(Math.random() * 10) + 1];
                    this.currentComponent.setData(data);
                    this.render();
                }
            });
        }

        this.container.querySelectorAll('.delete-data-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                if (this.currentComponent) {
                    const data = [...this.currentComponent.data];
                    data.splice(index, 1);
                    this.currentComponent.setData(data);
                    this.render();
                }
            });
        });

        this.container.querySelectorAll('.data-row input').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                const value = parseFloat(e.target.value);
                if (this.currentComponent && !isNaN(value)) {
                    const data = [...this.currentComponent.data];
                    data[index] = value;
                    this.currentComponent.setData(data);
                }
            });
        });

        this.container.querySelectorAll('.animation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.executeAnimationTest(action);
            });
        });
    }

    executeAnimationTest(action) {
        if (!this.currentComponent) return;

        const component = this.currentComponent;
        const dataLength = component.data.length;

        if (component.type === 'stack') {
            this.executeStackAnimationTest(action, component, dataLength);
        } else {
            this.executeBarChartAnimationTest(action, component, dataLength);
        }
    }

    executeStackAnimationTest(action, component, dataLength) {
        switch (action) {
            case 'highlight':
                if (dataLength > 0) {
                    const randomIndex = Math.floor(Math.random() * dataLength);
                    const colors = ['#f5576c', '#4facfe', '#43e97b', '#f093fb'];
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    component.highlight(randomIndex, randomColor);
                    this.render();
                }
                break;
            case 'push':
                const pushValue = Math.floor(Math.random() * 100) + 1;
                component.push(pushValue).then(() => {
                    this.render();
                });
                break;
            case 'pop':
                if (dataLength > 0) {
                    component.pop().then(() => {
                        this.render();
                    });
                }
                break;
            case 'reset':
                component.unhighlight();
                this.render();
                break;
        }
    }

    executeBarChartAnimationTest(action, component, dataLength) {
        switch (action) {
            case 'highlight':
                const randomIndex = Math.floor(Math.random() * dataLength);
                const colors = ['#f5576c', '#4facfe', '#43e97b', '#f093fb'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                component.highlight(randomIndex, randomColor);
                this.render();
                break;
            case 'swap':
                if (dataLength >= 2) {
                    const i = Math.floor(Math.random() * dataLength);
                    let j = Math.floor(Math.random() * dataLength);
                    while (j === i) {
                        j = Math.floor(Math.random() * dataLength);
                    }
                    component.swap(i, j).then(() => {
                        this.render();
                    });
                }
                break;
            case 'insert':
                const insertIndex = Math.floor(Math.random() * (dataLength + 1));
                const insertValue = Math.floor(Math.random() * 10) + 1;
                component.insert(insertIndex, insertValue).then(() => {
                    this.render();
                });
                break;
            case 'delete':
                if (dataLength > 0) {
                    const deleteIndex = Math.floor(Math.random() * dataLength);
                    component.delete(deleteIndex).then(() => {
                        this.render();
                    });
                }
                break;
            case 'reset':
                component.unhighlight();
                this.render();
                break;
        }
    }

    focusNameInput() {
        const nameInput = document.getElementById('prop_name');
        if (nameInput) {
            nameInput.focus();
            nameInput.select();
        }
    }
}