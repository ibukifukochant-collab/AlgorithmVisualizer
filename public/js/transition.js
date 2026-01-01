// 通用页面切换动画
class PageTransition {
  constructor() {
    this.overlay = null;
    this.initOverlay();
  }

  // 初始化覆盖层
  initOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'page-transition-overlay';
    document.body.appendChild(this.overlay);
  }

  // 开始页面切换动画（从当前页面到目标页面）
  startTransition() {
    if (!this.overlay) return;
    
    // 显示覆盖层并开始动画
    this.overlay.classList.add('active');
    
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 300); // 等待动画开始
    });
  }

  // 完成页面切换动画（在目标页面中调用）
  completeTransition() {
    if (!this.overlay) return;
    
    // 开始淡出覆盖层
    this.overlay.classList.add('fade-out');
    
    // 等待覆盖层完全消失后移除
    setTimeout(() => {
      this.overlay.classList.remove('active', 'fade-out');
    }, 300);
  }

  // 页面加载完成后显示内容
  showPageContent() {
    // 为当前页面添加loaded类以显示内容
    const currentPage = document.querySelector('.plugin-page, .main-page');
    if (currentPage) {
      currentPage.classList.add('loaded');
    }
  }

  // 通用页面跳转函数
  async navigateTo(url) {
    // 添加淡出效果到当前页面
    const mainPage = document.querySelector('.main-page');
    if (mainPage) {
      mainPage.classList.add('fading-out');
    }

    // 开始过渡动画
    await this.startTransition();
    
    // 跳转到目标页面
    window.location.href = url;
  }

  // 为主页面首次加载添加进入动画
  async initMainPage() {
    // 主页面直接显示，不需要复杂的动画控制
    // 只在页面切换时使用动画
    
    // 等待页面内容加载完成后，如果有覆盖层则完成动画
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.completeTransition();
      });
    } else {
      this.completeTransition();
    }
  }

  // 在页面加载完成后初始化内容显示
  initPage() {
    // 等待页面内容加载完成后显示
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.showPageContent();
        this.completeTransition();
      });
    } else {
      this.showPageContent();
      this.completeTransition();
    }
  }
}

// 创建全局实例
const pageTransition = new PageTransition();

// 如果是主页面，初始化页面并添加进入动画
if (document.querySelector('.main-page')) {
  document.addEventListener('DOMContentLoaded', () => {
    // 为主页面添加进入动画
    pageTransition.initMainPage();
  });
}

// 如果是插件页面，完成过渡动画
if (document.querySelector('.plugin-page')) {
  document.addEventListener('DOMContentLoaded', () => {
    pageTransition.initPage();
  });
}

// 修改所有链接点击事件以使用动画
document.addEventListener('click', function(e) {
  const link = e.target.closest('a');
  if (link && link.href && !link.target && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:')) {
    // 检查是否是内部链接
    const isInternalLink = link.href.startsWith(window.location.origin);
    if (isInternalLink && link.href !== window.location.href) {
      e.preventDefault();
      pageTransition.navigateTo(link.href);
    }
  }
});