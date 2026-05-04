/**
 * 导出功能模块
 * 负责将笔记导出为 Word 或 PDF 格式
 */

/**
 * 导出为 Word 文档
 */
function daoChuWord() {
    // 1. 获取编辑器内容
    var htmlNeiRong = huoQuBianJiQiNeiRong();

    // 检查内容是否为空
    if (!htmlNeiRong || htmlNeiRong.trim() === '') {
        xianShiTiShi('⚠ 笔记内容为空');
        return;
    }

    console.log('开始导出 Word...');
    xianShiTiShi('⏳ 正在生成 Word...');

    // 2. 处理 HTML 内容（限制图片尺寸）
    var chuLiHouNeiRong = chuLiTuPianChiCun(htmlNeiRong);

    // 3. 构建完整的 HTML 文档
    var wanZhengHtml = gouJianWanZhengHtml(chuLiHouNeiRong);

    try {
        // 4. 使用 html-docx-js 将 HTML 转为 Word
        var wordBlob = htmlDocx.asBlob(wanZhengHtml, {
            orientation: 'portrait', // 纵向
            margins: {
                top: 720,    // 上边距
                right: 720,
                bottom: 720,
                left: 720
            }
        });

        // 5. 生成文件名
        var shiJianChuo = new Date().getTime();
        var wenJianMing = '笔记_' +
            dangQianShiPin.mingCheng.substring(0, 10) + '_' +
            shiJianChuo + '.docx';

        // 6. 使用 FileSaver 保存文件
        saveAs(wordBlob, wenJianMing);

        console.log('Word 导出成功：', wenJianMing);
        xianShiTiShi('✓ Word 已导出');

    } catch (error) {
        console.error('Word 导出失败：', error);
        // 更详细的错误提示
        if (error.message && error.message.includes('memory')) {
            xianShiTiShi('❌ 导出失败：内存不足，请减少图片数量后重试');
        } else {
            xianShiTiShi('❌ 导出失败：' + error.message);
        }
    }
}

/**
 * 处理 HTML 中的图片尺寸
 * 给所有图片添加宽度限制，防止在 Word 中超出页面
 * @param {string} html - 原始 HTML 内容
 * @returns {string} 处理后的 HTML 内容
 */
function chuLiTuPianChiCun(html) {
    // 创建一个临时 div 来操作 HTML
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // 获取所有图片
    var images = tempDiv.getElementsByTagName('img');

    // 检查图片数量，给出警告
    if (images.length > 20) {
        console.warn('⚠ 检测到 ' + images.length + ' 张图片，导出可能较慢');
        xianShiTiShi('⚠ 图片较多（' + images.length + '张），导出可能需要较长时间');
    }

    // 遍历所有图片，添加宽度限制
    for (var i = 0; i < images.length; i++) {
        var img = images[i];

        // 设置宽度为 590 像素（A4纸宽度的90%，约590px）
        img.setAttribute('width', '590');

        // 同时设置样式，确保在Word中正确显示
        img.style.maxWidth = '590px';
        img.style.width = '590px';
        img.style.height = 'auto';
        img.style.display = 'block';
        img.style.margin = '15px auto';

        console.log('处理图片 ' + (i + 1) + '：设置宽度为 590px');
    }

    console.log('共处理了 ' + images.length + ' 张图片');

    // 返回处理后的 HTML
    return tempDiv.innerHTML;
}

/**
 * 构建完整的 HTML 文档（包含样式）
 * @param {string} neiRong - 编辑器内容
 * @returns {string} 完整的 HTML 文档
 */
function gouJianWanZhengHtml(neiRong) {
    // 获取当前日期
    var dangQianRiQi = new Date().toLocaleString();

    // 获取视频名称
    var shiPinMingCheng = dangQianShiPin.mingCheng || "未命名视频";

    // 构建 HTML 模板
    var html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: "Microsoft YaHei", Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            padding: 20px;
        }
        
        h1 {
            color: #1890ff;
            border-bottom: 2px solid #1890ff;
            padding-bottom: 10px;
            font-size: 24px;
        }
        
        .info {
            background: #f5f5f5;
            padding: 10px 15px;
            margin: 15px 0;
            border-left: 4px solid #1890ff;
            font-size: 12px;
            color: #666;
        }
        
        .info p {
            margin: 5px 0;
        }
        
        hr {
            border: none;
            border-top: 1px solid #e8e8e8;
            margin: 20px 0;
        }
        
        img {
            display: block;
            margin: 15px auto;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        p {
            margin: 10px 0;
        }
        
        ul, ol {
            margin: 10px 0;
            padding-left: 30px;
        }
        
        li {
            margin: 5px 0;
        }
        
        strong {
            color: #000;
            font-weight: bold;
        }
        
        em {
            font-style: italic;
        }
        
        h2, h3 {
            color: #333;
            margin: 15px 0 10px 0;
        }
        
        h2 {
            font-size: 18px;
        }
        
        h3 {
            font-size: 16px;
        }
    </style>
</head>
<body>
    <h1>📝 视频学习笔记</h1>
    
    <div class="info">
        <p><strong>视频名称：</strong>${shiPinMingCheng}</p>
        <p><strong>导出时间：</strong>${dangQianRiQi}</p>
    </div>
    
    <hr>
    
    ${neiRong}
    
    <hr>
    
    <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
        <p>— 由"视频笔记工具"生成 —</p>
    </div>
</body>
</html>
    `;

    return html;
}
