/**
 * 编辑器管理模块
 * 负责 Quill 富文本编辑器的初始化和操作
 */

// 全局变量：Quill 编辑器实例
var bianJiQi = null;

/**
 * 初始化 Quill 编辑器
 */
function chuShiHuaBianJiQi() {
    // 创建 Quill 编辑器实例
    bianJiQi = new Quill('#editor-container', {
        theme: 'snow', // 使用 snow 主题

        // 占位提示文字
        placeholder: '在这里写笔记...\n\n💡 使用指南：\n 视频 - 选择本地视频文件\n📸 截图 - 截取视频当前画面\n✏️ 标注 - 截图并添加标注\n📋 贴图 - 插入截图到笔记\n 时间 - 插入当前播放时间\n💾 保存 - 导出笔记为JSON文件\n📂 导入 - 恢复已保存的笔记\n\n✨ 支持富文本格式（粗体、斜体、列表等）',

        // 工具栏配置
        modules: {
            toolbar: [
                // 第一行：文字格式
                ['bold', 'italic', 'underline', 'strike'],        // 粗体、斜体、下划线、删除线

                // 第二行：标题和列表
                [{ 'header': [1, 2, 3, false] }],                 // 标题1、标题2、标题3、正文
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],    // 有序列表、无序列表

                // 第三行：图片和清除格式
                ['image', 'clean']                                // 插入图片、清除格式
            ]
        }
    });

    console.log('Quill 编辑器初始化成功');
}

/**
 * 插入截图到编辑器
 * @param {Object} jieTuShuJu - 截图数据对象
 * @param {string} jieTuShuJu.tuPian - Base64图片数据
 * @param {string} jieTuShuJu.shiJian - 格式化后的时间
 */
function chaRuJieTu(jieTuShuJu) {
    if (!bianJiQi) {
        xianShiTiShi('❌ 编辑器未初始化');
        return;
    }

    // 获取当前光标位置
    var range = bianJiQi.getSelection(true);

    // 在图片前插入换行（确保截图独占一行）
    bianJiQi.insertText(range.index, '\n');

    // 插入图片
    bianJiQi.insertEmbed(range.index + 1, 'image', jieTuShuJu.tuPian);

    // 在图片后插入换行和时间戳（时间戳也独占一行）
    bianJiQi.insertText(range.index + 2, '\n[' + jieTuShuJu.shiJian + ']\n\n');

    // 将光标移动到时间戳后面
    bianJiQi.setSelection(range.index + jieTuShuJu.shiJian.length + 5);


    console.log('截图已插入：', jieTuShuJu.shiJian);
    xianShiTiShi('✓ 截图已插入笔记');
}

/**
 * 插入时间戳到编辑器
 * @param {string} shiJian - 格式化后的时间
 */
function chaRuShiJianDaoBianJiQi(shiJian) {
    if (!bianJiQi) {
        xianShiTiShi('❌ 编辑器未初始化');
        return;
    }

    // 获取当前光标位置
    var range = bianJiQi.getSelection(true);

    // 插入时间戳文本
    var wenBen = '[' + shiJian + '] ';
    bianJiQi.insertText(range.index, wenBen);

    // 将光标移动到时间戳后面
    bianJiQi.setSelection(range.index + wenBen.length);

    console.log('时间戳已插入：', shiJian);
    xianShiTiShi('✓ 时间戳已插入');
}

/**
 * 获取编辑器内容（HTML格式）
 * @returns {string} HTML字符串
 */
function huoQuBianJiQiNeiRong() {
    if (!bianJiQi) {
        return '';
    }

    return bianJiQi.root.innerHTML;
}

/**
 * 设置编辑器内容
 * @param {string} html - HTML字符串
 */
function sheZhiBianJiQiNeiRong(html) {
    if (!bianJiQi) {
        return;
    }

    bianJiQi.root.innerHTML = html;
}

/**
 * 清空编辑器内容
 */
function qingKongBianJiQi() {
    if (!bianJiQi) {
        return;
    }

    bianJiQi.setText('');
}

/**
 * 从 LocalStorage 插入截图到编辑器
 */
function chaRuJianTieBanTuPian() {
    // 检查编辑器是否初始化
    if (!bianJiQi) {
        xianShiTiShi('❌ 编辑器未初始化');
        return;
    }

    // 从 LocalStorage 读取截图
    var base64Image = duQuJieTu();

    // 如果没有截图，给出友好提示
    if (!base64Image) {
        xianShiTiShi('💡 还没有截图，请先点击“截图”或“截图标注”按钮');
        console.log('LocalStorage 中没有找到截图');
        return;
    }

    // 获取当前光标位置
    var range = bianJiQi.getSelection();

    // 如果没有找到光标位置，给出友好提示
    if (!range || range.length > 0) {
        xianShiTiShi('💡 请先在笔记中点击要插入图片的位置');
        console.log('未找到光标位置或选中了文本');
        return;
    }

    console.log('开始插入截图到位置：', range.index);

    // 插入图片到编辑器
    chaRuTuPianDaoBianJiQi(base64Image, range.index);

    // 插入后清除 LocalStorage 中的截图
    qingChuJieTu();
}

/**
 * 插入图片到编辑器（内部函数）
 * @param {string} base64Image - Base64 格式的图片
 * @param {number} position - 插入位置
 */
function chaRuTuPianDaoBianJiQi(base64Image, position) {
    if (!bianJiQi) {
        xianShiTiShi('❌ 编辑器未初始化');
        return;
    }

    try {
        // 在图片前插入换行（确保图片独占一行）
        bianJiQi.insertText(position, '\n');

        // 插入图片
        bianJiQi.insertEmbed(position + 1, 'image', base64Image);

        // 在图片后插入换行
        bianJiQi.insertText(position + 2, '\n');

        // 将光标移动到图片后面
        bianJiQi.setSelection(position + 3);

        console.log('图片已插入到位置：', position);
        xianShiTiShi('✓ 截图已插入笔记');

    } catch (error) {
        console.error('插入图片失败：', error);
        xianShiTiShi('❌ 插入图片失败：' + error.message);
    }
}
