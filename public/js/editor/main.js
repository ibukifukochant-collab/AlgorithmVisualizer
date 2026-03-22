import VisualEditor from './VisualEditor.js';

let editor = null;

document.addEventListener('DOMContentLoaded', () => {
    editor = new VisualEditor('slotsContainer');
    
    setupToolbarButtons();
    setupHeaderButtons();
    setupModal();
});

function setupToolbarButtons() {
    document.getElementById('undoBtn').addEventListener('click', () => {
        editor.undo();
    });

    document.getElementById('redoBtn').addEventListener('click', () => {
        editor.redo();
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
        if (confirm('确定要清空所有组件吗？')) {
            editor.clearAll();
        }
    });
}

function setupHeaderButtons() {
    const pluginNameInput = document.getElementById('pluginName');
    const generateBtn = document.getElementById('generateBtn');

    generateBtn.addEventListener('click', () => {
        const modal = document.getElementById('generateModal');
        const genPluginName = document.getElementById('genPluginName');
        
        genPluginName.value = pluginNameInput.value || 'MyAlgorithm';
        modal.classList.add('active');
    });
}

function setupModal() {
    const modal = document.getElementById('generateModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelGenerate');
    const confirmBtn = document.getElementById('confirmGenerate');

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    confirmBtn.addEventListener('click', async () => {
        const name = document.getElementById('genPluginName').value.trim();
        const description = document.getElementById('genPluginDesc').value.trim();
        const author = document.getElementById('genPluginAuthor').value.trim();
        const category = document.getElementById('genPluginCategory').value;

        if (!name) {
            alert('请输入插件名称');
            return;
        }

        const components = editor.getComponents();
        if (components.length === 0) {
            alert('请至少添加一个组件');
            return;
        }

        try {
            const pluginData = editor.generatePlugin({
                name,
                description,
                author,
                category
            });

            const result = await editor.templateGenerator.savePlugin(pluginData);
            
            alert(`插件 "${name}" 生成成功！\n位置: plugins/${pluginData.pluginDirName}/`);
            modal.classList.remove('active');
            
            if (confirm('是否立即查看生成的插件？')) {
                window.location.href = `/plugins/${pluginData.pluginDirName}/index.html`;
            }
        } catch (error) {
            alert('生成插件失败：' + error.message);
        }
    });
}

window.editor = editor;
