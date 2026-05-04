/**
 * 工具函数模块
 * 包含各种辅助函数
 */

/**
 * 格式化时间（秒 → HH:MM:SS）
 * @param {number} miaoShu - 秒数
 * @returns {string} 格式化后的时间字符串
 */
function geShiHuaShiJian(miaoShu) {
    var shi = Math.floor(miaoShu / 3600);
    var fen = Math.floor((miaoShu % 3600) / 60);
    var miao = Math.floor(miaoShu % 60);

    return padZero(shi) + ':' + padZero(fen) + ':' + padZero(miao);
}

/**
 * 补零函数（9 → 09）
 * @param {number} num - 数字
 * @returns {string} 补零后的字符串
 */
function padZero(num) {
    return num < 10 ? '0' + num : '' + num;
}

/**
 * 显示提示信息（2秒后自动消失）
 * @param {string} xiaoXi - 提示消息
 */
function xianShiTiShi(xiaoXi) {
    // 检查是否已存在提示框
    var toast = document.getElementById('toast');

    // 如果不存在，创建一个
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    // 显示消息
    toast.textContent = xiaoXi;
    toast.classList.add('show');

    // 2秒后隐藏
    setTimeout(function() {
        toast.classList.remove('show');
    }, 2000);
}

/**
 * 显示加载状态
 * @param {boolean} show - 是否显示加载状态
 * @param {string} message - 加载消息
 */
function xianShiJiaZai(show, message) {
    var loading = document.getElementById('loading');
    
    if (show) {
        if (!loading) {
            loading = document.createElement('div');
            loading.id = 'loading';
            loading.className = 'loading';
            loading.innerHTML = '<div class="loading-spinner"></div><div class="loading-text">' + (message || '加载中...') + '</div>';
            document.body.appendChild(loading);
        }
        loading.style.display = 'flex';
    } else {
        if (loading) {
            loading.style.display = 'none';
        }
    }
}

/**
 * LocalStorage 存储键名常量
 */
var STORAGE_KEYS = {
    JIE_TU: 'videoNoteScreenshot',      // 截图数据
    JIE_TU_SHI_JIAN: 'videoNoteScreenshotTime'  // 截图保存时间
};

/**
 * 保存截图到 LocalStorage
 * @param {string} base64Image - Base64 格式的图片
 * @returns {boolean} 是否保存成功
 */
function baoCunJieTu(base64Image) {
    try {
        localStorage.setItem(STORAGE_KEYS.JIE_TU, base64Image);
        localStorage.setItem(STORAGE_KEYS.JIE_TU_SHI_JIAN, Date.now().toString());
        console.log('截图已保存到本地存储');
        return true;
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            console.error('存储空间不足：', error);
            // 尝试清除旧截图后再次保存
            qingChuJieTu();
            try {
                localStorage.setItem(STORAGE_KEYS.JIE_TU, base64Image);
                localStorage.setItem(STORAGE_KEYS.JIE_TU_SHI_JIAN, Date.now().toString());
                console.log('清除旧截图后保存成功');
                xianShiTiShi('⚠ 已清除旧截图并保存新截图');
                return true;
            } catch (retryError) {
                console.error('即使清除旧截图后仍无法保存：', retryError);
                xianShiTiShi('⚠ 存储空间不足，请先插入之前的截图');
                return false;
            }
        } else {
            console.error('保存失败：', error);
            xianShiTiShi('❌ 保存截图失败');
        }
        return false;
    }
}

/**
 * 从 LocalStorage 读取截图
 * @returns {string|null} Base64 格式的图片，如果没有则返回 null
 */
function duQuJieTu() {
    return localStorage.getItem(STORAGE_KEYS.JIE_TU);
}

/**
 * 清除 LocalStorage 中的截图
 */
function qingChuJieTu() {
    localStorage.removeItem(STORAGE_KEYS.JIE_TU);
    localStorage.removeItem(STORAGE_KEYS.JIE_TU_SHI_JIAN);
    console.log('截图已从本地存储清除');
}

/**
 * 检查截图是否过期（超过1小时）
 * @returns {boolean} 是否过期
 */
function jianChaJieTuShiXiao() {
    var shiJian = localStorage.getItem(STORAGE_KEYS.JIE_TU_SHI_JIAN);
    
    if (!shiJian) {
        return true; // 没有时间戳，视为过期
    }
    
    var yiGuoQuShiJian = Date.now() - parseInt(shiJian);
    var yiXiaoShi = 60 * 60 * 1000; // 1小时的毫秒数
    
    return yiGuoQuShiJian > yiXiaoShi;
}

/**
 * 清理过期的截图（页面加载时调用）
 */
function qingLiGuoQiJieTu() {
    if (jianChaJieTuShiXiao()) {
        qingChuJieTu();
        console.log('已清理过期截图');
    }
}
