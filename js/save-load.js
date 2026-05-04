/**
 * 保存/导入模块
 * 负责笔记的本地保存和导入恢复
 */

// 全局变量：笔记数据
var biJiShuJu = {
    videoName: "",      // 视频名称
    createTime: "",     // 创建时间
    lastEditTime: "",   // 最后编辑时间
    editorContent: ""   // 编辑器内容（HTML）
};

// 全局标志：是否已提示过笔记过大
window.yiTiShiDaXiao = false;

/**
 * 保存笔记到本地（下载JSON文件）
 */
function baoCunBiJi() {
    // 1. 获取编辑器内容
    var htmlNeiRong = huoQuBianJiQiNeiRong();

    // 检查内容是否为空
    if (!htmlNeiRong || htmlNeiRong.trim() === '') {
        xianShiTiShi('⚠ 笔记内容为空');
        return;
    }

    // 2. 构建笔记数据对象
    biJiShuJu.videoName = dangQianShiPin.mingCheng || "未命名视频";
    biJiShuJu.editorContent = htmlNeiRong;
    biJiShuJu.lastEditTime = new Date().toLocaleString();

    // 如果是第一次保存，记录创建时间
    if (!biJiShuJu.createTime) {
        biJiShuJu.createTime = biJiShuJu.lastEditTime;
    }

    // 3. 将数据转为JSON字符串（格式化，方便查看）
    var jsonStr = JSON.stringify(biJiShuJu, null, 2);

    // 4. 创建Blob对象（文件对象）
    var blob = new Blob([jsonStr], { type: 'application/json' });

    // 5. 创建下载链接
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;

    // 6. 生成文件名（包含视频名和时间戳）
    var shiJianChuo = new Date().getTime();
    var wenJianMing = '笔记_' +
        dangQianShiPin.mingCheng.substring(0, 10) + '_' +
        shiJianChuo + '.json';

    a.download = wenJianMing;

    // 7. 触发下载
    a.click();

    // 8. 释放URL对象（释放内存）
    URL.revokeObjectURL(url);

    console.log('笔记已保存：', wenJianMing);
    xianShiTiShi('✓ 笔记已保存');

    // 9. 清除自动保存的数据（因为已经手动保存了）
    qingChuZiDongBaoCun();
}

/**
 * 导入笔记（点击按钮触发文件选择）
 */
function daoRuBiJi() {
    // 触发JSON文件选择器的点击事件
    document.getElementById('jsonInput').click();
}

/**
 * 处理JSON文件选择
 * @param {Event} e - 文件选择事件
 */
function chuLiJsonXuanZe(e) {
    var file = e.target.files[0]; // 获取选择的文件

    if (!file) {
        return; // 如果没有选择文件，直接返回
    }

    // 检查文件类型
    if (!file.name.endsWith('.json')) {
        xianShiTiShi('❌ 请选择JSON文件');
        return;
    }

    // 创建FileReader对象读取文件
    var reader = new FileReader();

    // 文件读取完成后的回调
    reader.onload = function(event) {
        try {
            // 1. 解析JSON字符串
            var shuJu = JSON.parse(event.target.result);

            // 2. 验证数据格式
            if (!shuJu.editorContent) {
                throw new Error('文件格式不正确：缺少editorContent字段');
            }

            // 3. 恢复笔记数据
            biJiShuJu = shuJu;

            // 4. 恢复编辑器内容
            sheZhiBianJiQiNeiRong(shuJu.editorContent);

            // 5. 恢复视频信息（如果有）
            if (shuJu.videoName && shuJu.videoName !== "未命名视频") {
                console.log('原视频：', shuJu.videoName);
            }

            console.log('笔记恢复成功');
            xianShiTiShi('✓ 笔记恢复成功');

        } catch (error) {
            console.error('导入失败：', error);
            xianShiTiShi('❌ 导入失败：' + error.message);
        }
    };

    // 开始读取文件（以文本方式）
    reader.readAsText(file);
}

/**
 * 自动保存到 LocalStorage（每30秒）
 * 注意：这只是临时备份，不会生成文件
 */
function ziDongBaoCun() {
    // 获取编辑器内容
    var htmlNeiRong = huoQuBianJiQiNeiRong();

    // 如果内容为空，不保存
    if (!htmlNeiRong || htmlNeiRong.trim() === '') {
        return;
    }

    // 检查是否为 Quill 编辑器的空内容（<p><br></p>）
    var kongBaiNeiRong = ['<p><br></p>', '<p></p>', '<br>', ''];
    if (kongBaiNeiRong.indexOf(htmlNeiRong.trim()) !== -1) {
        console.log('编辑器为空，跳过自动保存');
        return;
    }

    // 提取纯文本检查是否真的没有内容
    var linShiDiv = document.createElement('div');
    linShiDiv.innerHTML = htmlNeiRong;
    var wenBenNeiRong = linShiDiv.textContent || linShiDiv.innerText || '';
    
    if (wenBenNeiRong.trim() === '') {
        console.log('编辑器只有空白内容，跳过自动保存');
        return;
    }

    // 构建备份数据
    var beiFenShuJu = {
        videoName: dangQianShiPin.mingCheng,
        editorContent: htmlNeiRong,
        saveTime: new Date().toLocaleString()
    };

    // 转为JSON字符串
    var jsonStr = JSON.stringify(beiFenShuJu);

    // 计算大小（单位：MB）
    var daXiaoMB = (jsonStr.length / 1024 / 1024).toFixed(2);

    console.log('自动备份大小：', daXiaoMB, 'MB');

    // 检查是否超过限制（LocalStorage 通常限制 5-10MB）
    // 保守估计，使用4MB作为阈值
    if (daXiaoMB > 4) {
        // 超过 4MB，提示用户
        console.warn('⚠ 笔记太大，无法自动保存');

        // 只在第一次提示时显示（避免频繁弹窗）
        if (!window.yiTiShiDaXiao) {
            window.yiTiShiDaXiao = true;
            xianShiTiShi('⚠ 笔记较大，建议手动保存');

            // 30秒后重置提示标志（从1分钟改为30秒）
            setTimeout(function() {
                window.yiTiShiDaXiao = false;
            }, 30000);
        }

        return; // 不保存到 LocalStorage
    }

    // 保存到 LocalStorage
    try {
        localStorage.setItem('videoNoteAutosave', jsonStr);
        console.log('自动保存成功：', beiFenShuJu.saveTime, '大小：', daXiaoMB, 'MB');
    } catch (error) {
        console.error('自动保存失败：', error);

        // 如果保存失败（可能是空间不足），提示用户
        if (!window.yiTiShiDaXiao) {
            window.yiTiShiDaXiao = true;
            xianShiTiShi('⚠ 存储空间不足，请手动保存');

            setTimeout(function() {
                window.yiTiShiDaXiao = false;
            }, 30000);
        }
    }
}

/**
 * 启动自动保存定时器
 */
function qiDongZiDongBaoCun() {
    // 每30秒执行一次自动保存
    setInterval(ziDongBaoCun, 30000);

    console.log('自动保存已启动（每30秒）');
}

/**
 * 检查是否有自动保存的数据
 */
function jianChaZiDongBaoCun() {
    var savedData = localStorage.getItem('videoNoteAutosave');

    if (savedData) {
        try {
            var shuJu = JSON.parse(savedData);

            console.log('发现自动保存的笔记：', shuJu.saveTime);

            // 询问用户是否恢复
            var huiFu = confirm(
                '检测到未保存的笔记\n' +
                '保存时间：' + shuJu.saveTime + '\n\n' +
                '是否恢复？'
            );

            if (huiFu) {
                // 用户选择确定：恢复编辑器内容
                sheZhiBianJiQiNeiRong(shuJu.editorContent);

                // 恢复视频信息
                if (shuJu.videoName) {
                    console.log('原视频：', shuJu.videoName);
                }

                xianShiTiShi('✓ 笔记已恢复');
                console.log('用户选择恢复笔记');
            } else {
                // 用户选择取消：清空自动保存的数据
                qingChuZiDongBaoCun();
                xianShiTiShi('✓ 已放弃恢复');
                console.log('用户选择放弃恢复，已清除自动保存数据');
            }

        } catch (error) {
            console.error('恢复失败：', error);
        }
    }
}

/**
 * 清除自动保存的数据（手动保存后调用）
 */
function qingChuZiDongBaoCun() {
    localStorage.removeItem('videoNoteAutosave');
    console.log('自动保存数据已清除');
}
