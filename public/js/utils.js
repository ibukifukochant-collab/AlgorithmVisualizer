// 工具函数

// 生成随机颜色
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// 生成随机数组
function generateRandomArray(size, min = 0, max = 100) {
    const array = [];
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return array;
}

// 深拷贝
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

// 休眠函数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// DOM 工具函数
const DOM = {
    // 创建元素
    createElement(tag, className, attributes = {}) {
        const element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        
        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }
        
        return element;
    },
    
    // 添加事件监听器
    on(element, event, handler) {
        element.addEventListener(event, handler);
    },
    
    // 移除事件监听器
    off(element, event, handler) {
        element.removeEventListener(event, handler);
    },
    
    // 获取元素
    get(selector) {
        return document.querySelector(selector);
    },
    
    // 获取多个元素
    getAll(selector) {
        return document.querySelectorAll(selector);
    }
};

// 导出工具函数（如果需要模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getRandomColor,
        generateRandomArray,
        deepClone,
        sleep,
        debounce,
        throttle,
        DOM
    };
}