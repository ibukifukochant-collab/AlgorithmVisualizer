import componentRegistry from '../components/ComponentRegistry.js';
import PropertyEditor from './PropertyEditor.js';
import TemplateGenerator from './TemplateGenerator.js';

export default class VisualEditor {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.slots = [];
        this.selectedSlot = null;
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        this.propertyEditor = null;
        this.templateGenerator = null;

        this.init();
    }

    init() {
        this.propertyEditor = new PropertyEditor('propertyContent');
        this.templateGenerator = new TemplateGenerator();
        this.setupDragAndDrop();
        this.addEmptySlot();
        this.render();
    }

    setupDragAndDrop() {
        const componentList = document.getElementById('componentList');
        
        componentList.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('component-item')) {
                e.dataTransfer.setData('componentType', e.target.dataset.type);
                e.dataTransfer.effectAllowed = 'copy';
            }
        });
    }

    addEmptySlot() {
        const slotIndex = this.slots.length;
        const slotElement = this.createSlotElement(slotIndex);
        this.container.appendChild(slotElement);
        this.slots.push({
            element: slotElement,
            component: null,
            index: slotIndex
        });
    }

    createSlotElement(index) {
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.dataset.index = index;

        slot.innerHTML = `
            <span class="slot-placeholder-text">拖拽组件到此处</span>
        `;

        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            slot.classList.add('drag-over');
        });

        slot.addEventListener('dragleave', () => {
            slot.classList.remove('drag-over');
        });

        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.classList.remove('drag-over');
            const type = e.dataTransfer.getData('componentType');
            if (type) {
                this.addComponentToSlot(type, parseInt(slot.dataset.index));
            }
        });

        slot.addEventListener('click', (e) => {
            if (!e.target.closest('.slot-action-btn')) {
                this.selectSlot(parseInt(slot.dataset.index));
            }
        });

        return slot;
    }

    addComponentToSlot(type, slotIndex) {
        const slotData = this.slots[slotIndex];
        if (!slotData || slotData.component) return;

        const component = componentRegistry.createComponent(type, {
            x: 0,
            y: 0
        });

        component.onPropertyChange = () => {
            this.updateSlotContent(slotIndex);
            if (this.selectedSlot === slotIndex) {
                this.propertyEditor.edit(component);
            }
        };

        component.setExternalRender(() => {
            this.updateSlotContent(slotIndex);
        });

        slotData.component = component;
        this.updateSlotElement(slotIndex);
        this.selectSlot(slotIndex);

        const isLastSlot = slotIndex === this.slots.length - 1;
        if (isLastSlot) {
            this.addEmptySlot();
        }

        this.saveHistory();
    }

    updateSlotElement(slotIndex) {
        const slotData = this.slots[slotIndex];
        if (!slotData) return;

        const slot = slotData.element;
        const component = slotData.component;

        if (component) {
            slot.classList.add('filled');
            slot.innerHTML = `
                <div class="slot-header">
                    <div class="slot-title">
                        <span class="slot-icon">${this.getComponentIcon(component.type)}</span>
                        <span class="slot-name">${component.name}</span>
                        <span class="slot-id">${component.id}</span>
                    </div>
                    <div class="slot-actions">
                        <button class="slot-action-btn move-up" title="上移" data-action="move-up">↑</button>
                        <button class="slot-action-btn move-down" title="下移" data-action="move-down">↓</button>
                        <button class="slot-action-btn delete" title="删除" data-action="delete">×</button>
                    </div>
                </div>
                <div class="slot-content">
                    <canvas class="slot-canvas" id="slotCanvas_${slotIndex}"></canvas>
                </div>
            `;

            const canvas = slot.querySelector('.slot-canvas');
            this.setupSlotCanvas(canvas, component, slotIndex);

            slot.querySelector('.move-up').addEventListener('click', (e) => {
                e.stopPropagation();
                this.moveSlot(slotIndex, -1);
            });

            slot.querySelector('.move-down').addEventListener('click', (e) => {
                e.stopPropagation();
                this.moveSlot(slotIndex, 1);
            });

            slot.querySelector('.delete').addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeSlot(slotIndex);
            });
        } else {
            slot.classList.remove('filled');
            slot.innerHTML = `<span class="slot-placeholder-text">拖拽组件到此处</span>`;
        }

        slot.dataset.index = slotIndex;
    }

    setupSlotCanvas(canvas, component, slotIndex) {
        const fixedWidth = 760;
        let canvasHeight;

        if (component.type === 'stack') {
            canvasHeight = 120;
        } else {
            const minBarWidth = 25;
            const maxBarWidth = 60;
            const barGap = 5;
            
            const dataLength = component.data.length;
            const totalBarWidth = fixedWidth - 40;
            const idealBarWidth = (totalBarWidth - (dataLength - 1) * barGap) / dataLength;
            const barWidth = Math.max(minBarWidth, Math.min(maxBarWidth, idealBarWidth));
            
            const totalBarsWidth = dataLength * barWidth + (dataLength - 1) * barGap;
            const scaleRatio = totalBarsWidth / fixedWidth;
            canvasHeight = Math.round(fixedWidth * scaleRatio);
        }
        
        canvas.width = fixedWidth;
        canvas.height = canvasHeight;

        component.x = 0;
        component.y = 0;
        component.width = fixedWidth;
        component.height = canvasHeight;

        const ctx = canvas.getContext('2d');
        component.render(ctx);

        component.setExternalRender(() => {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            component.render(ctx);
        });
    }

    getComponentIcon(type) {
        const icons = {
            'bar-chart': '📊',
            'stack': '📚',
            'array': '📋',
            'tree': '🌳',
            'graph': '🔗'
        };
        return icons[type] || '📦';
    }

    renderComponentPreview(component) {
        if (component.type === 'bar-chart') {
            const fixedWidth = 760;
            const baseHeight = 150;
            const maxValue = Math.max(...component.data, 1);
            const barCount = component.data.length;
            const barWidth = Math.max(20, Math.min(60, (fixedWidth - 40) / barCount - 5));
            const actualWidth = barCount * (barWidth + 5) + 40;
            const heightRatio = actualWidth / fixedWidth;
            const previewHeight = Math.round(baseHeight * heightRatio);
            
            return `
                <div class="bar-chart-preview" style="height: ${previewHeight}px;">
                    ${component.data.map((value, i) => `
                        <div class="bar-preview-item" style="height: ${(value / maxValue) * 100}%; max-width: ${barWidth}px;">
                            ${value}
                        </div>
                    `).join('')}
                </div>
            `;
        }
        return `<div style="padding: 20px; color: #64748b;">组件预览</div>`;
    }

    updateSlotContent(slotIndex) {
        const slotData = this.slots[slotIndex];
        if (!slotData || !slotData.component) return;

        const canvas = slotData.element.querySelector('.slot-canvas');
        if (canvas) {
            const component = slotData.component;
            const fixedWidth = 760;
            let canvasHeight;

            if (component.type === 'stack') {
                canvasHeight = 120;
            } else {
                const minBarWidth = 25;
                const maxBarWidth = 60;
                const barGap = 5;
                
                const dataLength = component.data.length;
                const totalBarWidth = fixedWidth - 40;
                const idealBarWidth = (totalBarWidth - (dataLength - 1) * barGap) / dataLength;
                const barWidth = Math.max(minBarWidth, Math.min(maxBarWidth, idealBarWidth));
                
                const totalBarsWidth = dataLength * barWidth + (dataLength - 1) * barGap;
                const scaleRatio = totalBarsWidth / fixedWidth;
                canvasHeight = Math.round(fixedWidth * scaleRatio);
            }
            
            canvas.width = fixedWidth;
            canvas.height = canvasHeight;

            component.x = 0;
            component.y = 0;
            component.width = fixedWidth;
            component.height = canvasHeight;

            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            component.render(ctx);
        }

        const nameEl = slotData.element.querySelector('.slot-name');
        if (nameEl) {
            nameEl.textContent = slotData.component.name;
        }
    }

    selectSlot(slotIndex) {
        if (this.selectedSlot !== null && this.slots[this.selectedSlot]) {
            this.slots[this.selectedSlot].element.classList.remove('selected');
        }

        this.selectedSlot = slotIndex;

        if (slotIndex !== null && this.slots[slotIndex]) {
            const slotData = this.slots[slotIndex];
            slotData.element.classList.add('selected');
            
            if (slotData.component) {
                this.propertyEditor.edit(slotData.component);
            } else {
                this.propertyEditor.clear();
            }
        } else {
            this.propertyEditor.clear();
        }
    }

    moveSlot(slotIndex, direction) {
        const newIndex = slotIndex + direction;
        
        const filledSlots = this.slots.filter(s => s.component !== null);
        const currentFilledIndex = filledSlots.findIndex(s => s.index === slotIndex);
        
        if (direction === -1 && currentFilledIndex === 0) return;
        if (direction === 1 && currentFilledIndex === filledSlots.length - 1) return;

        const targetFilledSlot = filledSlots[currentFilledIndex + direction];
        if (!targetFilledSlot) return;

        const tempComponent = this.slots[slotIndex].component;
        this.slots[slotIndex].component = targetFilledSlot.component;
        targetFilledSlot.component = tempComponent;

        this.updateSlotElement(slotIndex);
        this.updateSlotElement(targetFilledSlot.index);

        if (this.slots[slotIndex].component) {
            this.slots[slotIndex].component.onPropertyChange = () => {
                this.updateSlotContent(slotIndex);
                if (this.selectedSlot === slotIndex) {
                    this.propertyEditor.edit(this.slots[slotIndex].component);
                }
            };
        }

        if (targetFilledSlot.component) {
            targetFilledSlot.component.onPropertyChange = () => {
                this.updateSlotContent(targetFilledSlot.index);
                if (this.selectedSlot === targetFilledSlot.index) {
                    this.propertyEditor.edit(targetFilledSlot.component);
                }
            };
        }

        this.selectSlot(targetFilledSlot.index);
        this.saveHistory();
    }

    removeSlot(slotIndex) {
        const slotData = this.slots[slotIndex];
        if (!slotData || !slotData.component) return;

        slotData.component.destroy();
        slotData.component = null;
        this.updateSlotElement(slotIndex);

        if (this.selectedSlot === slotIndex) {
            this.selectSlot(null);
        }

        this.saveHistory();
    }

    clearAll() {
        this.slots.forEach((slotData, index) => {
            if (slotData.component) {
                slotData.component.destroy();
                slotData.component = null;
                this.updateSlotElement(index);
            }
        });

        while (this.slots.length > 1) {
            const lastSlot = this.slots.pop();
            lastSlot.element.remove();
        }

        this.selectSlot(null);
        this.saveHistory();
    }

    render() {
    }

    saveHistory() {
        const state = this.slots.map(s => ({
            component: s.component ? s.component.serialize() : null
        }));

        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(state);

        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }

        this.historyIndex = this.history.length - 1;
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState(this.history[this.historyIndex]);
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState(this.history[this.historyIndex]);
        }
    }

    restoreState(state) {
        const neededSlots = state.length;
        
        while (this.slots.length < neededSlots) {
            this.addEmptySlot();
        }

        state.forEach((data, index) => {
            const slotData = this.slots[index];
            
            if (slotData.component) {
                slotData.component.destroy();
            }

            if (data.component) {
                slotData.component = componentRegistry.deserializeComponent(data.component);
                slotData.component.onPropertyChange = () => {
                    this.updateSlotContent(index);
                    if (this.selectedSlot === index) {
                        this.propertyEditor.edit(slotData.component);
                    }
                };
                slotData.component.setExternalRender(() => {
                    this.updateSlotContent(index);
                });
            } else {
                slotData.component = null;
            }

            this.updateSlotElement(index);
        });

        while (this.slots.length > neededSlots) {
            const lastSlot = this.slots.pop();
            if (lastSlot.component) {
                lastSlot.component.destroy();
            }
            lastSlot.element.remove();
        }

        this.selectedSlot = null;
        this.propertyEditor.clear();
    }

    getComponents() {
        return this.slots
            .filter(s => s.component !== null)
            .map(s => s.component);
    }

    getSelectedComponent() {
        if (this.selectedSlot !== null && this.slots[this.selectedSlot]) {
            return this.slots[this.selectedSlot].component;
        }
        return null;
    }

    generatePlugin(options) {
        const components = this.getComponents();
        return this.templateGenerator.generate(components, options);
    }
}
