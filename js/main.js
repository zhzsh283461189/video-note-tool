/**
 * 应用主入口
 * 负责初始化和协调各模块
 */

/**
 * 页面加载完成后执行
 */
window.onload = function() {
    console.log('=== 视频笔记工具启动 ===');

    // 1. 清理过期的截图
    qingLiGuoQiJieTu();

    // 2. 初始化编辑器
    chuShiHuaBianJiQi();

    // 3. 初始化标注界面
    chuShiHuaBiaoZhuJieMian();

    // 4. 绑定文件选择事件
    bangDingShiJian();

    // 5. 检查是否有自动保存的数据
    jianChaZiDongBaoCun();

    // 6. 启动自动保存（每30秒）
    qiDongZiDongBaoCun();

    console.log('初始化完成！');
};



/**
 * 绑定事件监听器
 */
function bangDingShiJian() {
    // 1. 视频文件选择监听
    var videoInput = document.getElementById('videoInput');

    if (videoInput) {
        videoInput.addEventListener('change', chuLiShiPinXuanZe);
        console.log('视频选择事件已绑定');
    }

    // 2. JSON文件选择监听
    var jsonInput = document.getElementById('jsonInput');

    if (jsonInput) {
        jsonInput.addEventListener('change', chuLiJsonXuanZe);
        console.log('JSON导入事件已绑定');
    }

    // 3. 键盘快捷键监听
    document.addEventListener('keydown', chuLiJianPanAnJian);

    // 4. 监听视频播放/暂停事件，智能管理编辑器焦点
    bangDingShiPinBoFangShiJian();
}

/**
 * 处理键盘按键
 * @param {KeyboardEvent} e - 键盘事件
 */
function chuLiJianPanAnJian(e) {
    // 只在标注界面显示时响应快捷键
    var biaoZhuJieMian = document.getElementById('biaoZhuJieMian');
    if (!biaoZhuJieMian.classList.contains('xianShi')) {
        return;
    }

    // Esc键：取消标注
    if (e.key === 'Escape') {
        quXiaoBiaoZhu();
    }

    // Enter键：完成标注
    if (e.key === 'Enter') {
        wanChengBiaoZhu();
    }

    // Ctrl+Z 或 Cmd+Z：撤销
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        cheXiaoBiaoZhu();
    }
}

/**
 * 绑定视频播放事件
 */
function bangDingShiPinBoFangShiJian() {
    var video = document.getElementById('videoPlayer');

    // 视频开始播放时：收起软键盘并让编辑器失焦
    video.addEventListener('play', function() {
        console.log('视频开始播放，收起软键盘');
        
        // 1. 让编辑器失去焦点（收起软键盘）
        if (bianJiQi) {
            bianJiQi.blur();
        }
        
        // 2. 主动触发输入框失焦（兼容移动端）
        var activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === 'INPUT') {
            activeElement.blur();
        }
        
        // 3. 对于某些浏览器，需要额外处理
        if (typeof document.activeElement !== 'undefined') {
            document.activeElement.blur();
        }
        
        // 4. 移动端特殊处理：滚动一下页面确保键盘收起
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            window.scrollTo(0, window.scrollY);
        }
        
        // 5. 更新播放按钮状态
        gengXinBoFangAnNiu(true);
        
        console.log('软键盘已收起');
    });

    // 视频暂停时：不做特殊处理，用户可以继续编辑
    video.addEventListener('pause', function() {
        console.log('视频已暂停');
        
        // 更新播放按钮状态
        gengXinBoFangAnNiu(false);
    });
}
