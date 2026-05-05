/**
 * 视频管理模块
 * 处理视频加载、播放、截图等功能
 */

// 全局变量：当前视频信息
var dangQianShiPin = {
    mingCheng: "",  // 视频名称
    luJing: "",     // 视频路径
    oldUrl: null    // 旧的URL对象，用于释放内存
};

/**
 * 选择视频文件
 */
function xuanZeShiPin() {
    // 触发文件选择器的点击事件
    document.getElementById('videoInput').click();
}

/**
 * 处理视频文件选择
 * @param {Event} e - 文件选择事件
 */
function chuLiShiPinXuanZe(e) {
    var file = e.target.files[0]; // 获取选择的文件

    if (!file) {
        return; // 如果没有选择文件，直接返回
    }

    // 检查是否为视频文件
    if (!file.type.startsWith('video/')) {
        xianShiTiShi('❌ 请选择视频文件');
        return;
    }

    // 创建视频URL
    var videoUrl = URL.createObjectURL(file);

    // 释放旧的URL对象，防止内存泄漏
    if (dangQianShiPin.oldUrl) {
        URL.revokeObjectURL(dangQianShiPin.oldUrl);
        console.log('已释放旧的视频URL');
    }

    // 设置到视频播放器
    var videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.src = videoUrl;

    // 保存视频信息
    dangQianShiPin.mingCheng = file.name;
    dangQianShiPin.luJing = videoUrl;
    dangQianShiPin.oldUrl = videoUrl;  // 保存当前URL用于下次释放

    // 启用截图和时间按钮
    document.getElementById('btnJieTu').disabled = false;
    document.getElementById('btnJieTuBiaoZhu').disabled = false;
    document.getElementById('btnShiJian').disabled = false;
    document.getElementById('btnKuaiTui').disabled = false;
    document.getElementById('btnKuaiJin').disabled = false;

    // 显示提示
    xianShiTiShi('✓ 视频已加载');

    console.log('视频加载成功：', file.name);
}

/**
 * 视频截图功能 - 复制到剪贴板并保存到 LocalStorage
 */
function jieTu() {
    var video = document.getElementById('videoPlayer');

    // 检查是否有视频
    if (!video.src || video.src === '') {
        xianShiTiShi(' 请先选择视频');
        return;
    }
    
    // 检查视频是否已加载
    if (video.videoWidth === 0 || video.videoHeight === 0) {
        xianShiTiShi('⚠ 视频还未加载完成，请稍后再试');
        return;
    }

    // 先暂停视频播放
    if (!video.paused) {
        video.pause();
        console.log('截图前已暂停视频');
    }

    try {
        // 创建画布元素
        var canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // 获取画布上下文
        var ctx = canvas.getContext('2d');

        // 将视频当前帧绘制到画布上
        ctx.drawImage(video, 0, 0);

        // 将画布转为 Base64 图片
        var imageData = canvas.toDataURL('image/png');

        // 保存到 LocalStorage（覆盖模式）
        baoCunJieTu(imageData);

        // 将画布转为 Blob 并复制到剪贴板
        canvas.toBlob(function(blob) {
            if (navigator.clipboard && navigator.clipboard.write) {
                // 现代浏览器 API
                var item = new ClipboardItem({ 'image/png': blob });
                navigator.clipboard.write([item]).then(function() {
                    xianShiTiShi('✓ 截图已保存，可点击“插入截图”按钮插入笔记');
                    console.log('截图已保存并复制到剪贴板');
                }).catch(function(err) {
                    console.error('复制到剪贴板失败：', err);
                    xianShiTiShi('✓ 截图已保存，可点击“插入截图”按钮插入笔记');
                });
            } else {
                // 降级方案：只保存到 LocalStorage
                xianShiTiShi('✓ 截图已保存，可点击“插入截图”按钮插入笔记');
            }
        }, 'image/png');

        // 清理 canvas
        canvas = null;

    } catch (error) {
        console.error('截图失败：', error);
        xianShiTiShi('❌ 截图失败：' + error.message);
    }
}

/**
 * 截图并标注功能 - 打开标注界面
 */
function jieTuBiaoZhu() {
    var video = document.getElementById('videoPlayer');

    // 检查是否有视频
    if (!video.src || video.src === '') {
        xianShiTiShi('⚠ 请先选择视频');
        return;
    }
    
    // 检查视频是否已加载
    if (video.videoWidth === 0 || video.videoHeight === 0) {
        xianShiTiShi('⚠ 视频还未加载完成，请稍后再试');
        return;
    }

    // 先暂停视频播放
    if (!video.paused) {
        video.pause();
        console.log('标注前已暂停视频');
    }

    try {
        // 创建画布元素
        var canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // 获取画布上下文
        var ctx = canvas.getContext('2d');

        // 将视频当前帧绘制到画布上
        ctx.drawImage(video, 0, 0);

        // 将画布转为 Base64 图片
        var imageData = canvas.toDataURL('image/png');

        // 打开标注界面
        daKaiBiaoZhuJieMian(imageData);

    } catch (error) {
        console.error('截图失败：', error);
        xianShiTiShi('❌ 截图失败：' + error.message);
    }
}

/**
 * 暂停视频播放（全局函数）
 */
function zanTingShiPin() {
    var video = document.getElementById('videoPlayer');
    
    if (!video.src || video.src === '') {
        return; // 没有视频，直接返回
    }
    
    if (!video.paused) {
        video.pause();
        console.log('视频已暂停');
    }
}

/**
 * 快退5秒
 */
function kuaiTui5Miao() {
    var video = document.getElementById('videoPlayer');

    if (!video.src || video.src === '') {
        xianShiTiShi('⚠ 请先选择视频');
        return;
    }

    // 快退5秒
    video.currentTime = Math.max(0, video.currentTime - 5);
    
    console.log('快退5秒，当前时间：', video.currentTime);
    xianShiTiShi('⏪ 快退5秒');
}

/**
 * 快进5秒
 */
function kuaiJin5Miao() {
    var video = document.getElementById('videoPlayer');

    if (!video.src || video.src === '') {
        xianShiTiShi('⚠ 请先选择视频');
        return;
    }

    // 快进5秒
    video.currentTime = Math.min(video.duration, video.currentTime + 5);
    
    console.log('快进5秒，当前时间：', video.currentTime);
    xianShiTiShi('⏩ 快进5秒');
}

/**
 * 插入当前时间戳
 */
function chaRuShiJianChuo() {
    var video = document.getElementById('videoPlayer');

    if (!video.src || video.src === '') {
        xianShiTiShi('⚠ 请先选择视频');
        return;
    }

    // 获取当前时间并格式化
    var shiJian = geShiHuaShiJian(video.currentTime);

    console.log('当前时间：', shiJian);

    // 将时间戳插入到编辑器
    chaRuShiJianDaoBianJiQi(shiJian);

    return shiJian;
}

/**
 * 页面卸载时清理资源
 */
window.addEventListener('beforeunload', function() {
    // 释放视频URL
    if (dangQianShiPin.oldUrl) {
        URL.revokeObjectURL(dangQianShiPin.oldUrl);
        console.log('页面卸载：已释放视频URL');
    }
});
