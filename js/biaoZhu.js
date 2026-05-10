 /**
 * 截图标注功能模块
 * 支持矩形、圆形、箭头、文字标注，以及撤销、取消、完成功能
 */

// 标注状态管理
var biaoZhuZhuangTai = {
    huaBu: null,              // 画布元素
    huaBuHuanJing: null,      // 画布 2D 上下文
    dangQianTuPian: null,     // 当前截图图片
    biaoZhuLiShi: [],         // 标注历史记录（用于撤销）
    dangQianGongJu: 'rect',   // 当前工具：'rect' | 'circle' | 'arrow' | 'text' | 'move'
    dangQianYanSe: '#ff0000', // 当前颜色
    xianTiaoKuanDu: 4,        // 线条宽度（默认中线）
    ziTiDaXiao: 24,           // 字体大小（默认中字体）
    kaiShiHuiZhi: false,      // 是否开始绘制
    qiDian: { x: 0, y: 0 },   // 绘制起点
    dangQianBiaoZhu: null,    // 当前正在绘制的标注
    // 移动功能相关状态
    kaiShiYiDong: false,      // 是否开始移动
    yiDongBiaoZhu: null,      // 当前正在移动的标注
    yiDongSuoYin: -1,         // 正在移动的标注在历史中的索引
    yiDongQiDian: { x: 0, y: 0 }  // 移动起点
};

// 放大镜配置
var fangDaJingPeiZhi = {
    zhiJing: 120,              // 放大镜直径（像素）
    anQuanBianJu: 8,           // 安全边距（像素）
    pianYiLiang: 80,           // 距离手指的偏移量（像素）
    bianKuangYanSe: '#1890ff', // 边框颜色
    bianKuangKuanDu: 3,        // 边框宽度
    xiaoShiYanChi: 300         // 消失延迟（毫秒）
};

/**
 * 初始化标注界面
 */
function chuShiHuaBiaoZhuJieMian() {
    // 获取画布元素
    biaoZhuZhuangTai.huaBu = document.getElementById('biaoZhuCanvas');
    biaoZhuZhuangTai.huaBuHuanJing = biaoZhuZhuangTai.huaBu.getContext('2d');

    // 绑定工具栏事件
    bangDingGongJuLanShiJian();

    // 绑定画布事件
    bangDingHuaBuShiJian();

    // 设置默认选中状态
    sheZhiMoRenXuanZhong();

    console.log('标注界面已初始化');
}

/**
 * 设置默认选中状态
 */
function sheZhiMoRenXuanZhong() {
    // 1. 设置默认工具（矩形）
    qieHuanGongJu(biaoZhuZhuangTai.dangQianGongJu);

    // 2. 设置默认颜色（红色）
    qieHuanYanSe(biaoZhuZhuangTai.dangQianYanSe);

    // 3. 设置默认线条粗细（中线 4px）
    qieHuanCuXi(biaoZhuZhuangTai.xianTiaoKuanDu);

    // 4. 设置默认字体大小（中 24px）
    qieHuanZiTiDaXiao(biaoZhuZhuangTai.ziTiDaXiao);
}

/**
 * 打开标注界面
 * @param {string} imageData - Base64 格式的图片数据
 */
function daKaiBiaoZhuJieMian(imageData) {
    // 创建图片对象
    var img = new Image();
    
    img.onload = function() {
        console.log('图片加载成功，尺寸：', img.width, 'x', img.height);
        
        // 保存当前图片
        biaoZhuZhuangTai.dangQianTuPian = img;

        // 显示标注界面（先显示，再设置画布尺寸）
        var jieMian = document.getElementById('biaoZhuJieMian');
        jieMian.classList.add('xianShi');
        
        // 检测屏幕方向并添加对应类名
        jianCePingMuFangXiang();
        
        // 等待一下让界面渲染完成
        setTimeout(function() {
            // 设置画布尺寸（根据图片比例调整）
            sheZhiHuaBuChiCun(img);

            // 在画布上绘制图片
            chongXinHuiZhiHuaBu();

            // 清空标注历史
            biaoZhuZhuangTai.biaoZhuLiShi = [];

            console.log('标注界面已打开');
        }, 100);
    };
    
    img.onerror = function() {
        console.error('图片加载失败');
        xianShiTiShi('❌ 图片加载失败');
    };
    
    img.src = imageData;
}

/**
 * 检测屏幕方向并添加对应类名
 */
function jianCePingMuFangXiang() {
    var jieMian = document.getElementById('biaoZhuJieMian');
    var kuanDu = window.innerWidth;
    var gaoDu = window.innerHeight;
    
    console.log('屏幕尺寸：', kuanDu, 'x', gaoDu);
    
    // 移除旧的方向类名
    jieMian.classList.remove('shuPing', 'hengPing');
    
    // 根据屏幕宽高比判断方向
    if (kuanDu < gaoDu) {
        // 竖屏：宽度 < 高度
        jieMian.classList.add('shuPing');
        console.log('检测到竖屏模式');
    } else {
        // 横屏：宽度 >= 高度
        jieMian.classList.add('hengPing');
        console.log('检测到横屏模式');
    }
    
    // 如果已经有图片，重新设置画布尺寸
    if (biaoZhuZhuangTai.dangQianTuPian) {
        setTimeout(function() {
            sheZhiHuaBuChiCun(biaoZhuZhuangTai.dangQianTuPian);
            chongXinHuiZhiHuaBu();
        }, 50);
    }
}

/**
 * 监听屏幕方向变化
 */
window.addEventListener('orientationchange', function() {
    console.log('屏幕方向变化');
    setTimeout(jianCePingMuFangXiang, 200);
});

window.addEventListener('resize', function() {
    // 防抖：延迟执行
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(jianCePingMuFangXiang, 300);
});

/**
 * 设置画布尺寸
 * @param {HTMLImageElement} img - 图片对象
 */
function sheZhiHuaBuChiCun(img) {
    var canvas = biaoZhuZhuangTai.huaBu;

    // 获取可用空间（留出工具栏的高度）
    var rongQi = document.querySelector('.biaoZhuHuaBuRongQi');
    
    if (!rongQi) {
        console.error('找不到画布容器');
        return;
    }
    
    // 获取容器的实际可用尺寸
    // 使用 window.innerHeight 而不是 clientHeight，以获取准确的可视高度（排除地址栏）
    var jieMian = document.getElementById('biaoZhuJieMian');
    var isHengPing = jieMian.classList.contains('hengPing');
    
    var rongQiKuanDu = rongQi.clientWidth;
    var rongQiGaoDu;
    
    if (isHengPing) {
        // 横屏模式下，使用 window.innerHeight 确保不包含地址栏高度
        // 减去少量边距确保滚动条不出现
        rongQiGaoDu = window.innerHeight - 4;
        // 同时更新容器的样式高度
        rongQi.style.height = rongQiGaoDu + 'px';
        console.log('横屏模式，设置容器高度为：', rongQiGaoDu);
    } else {
        rongQiGaoDu = rongQi.clientHeight;
    }
    
    console.log('容器尺寸：', rongQiKuanDu, 'x', rongQiGaoDu);
    console.log('原始图片尺寸：', img.width, 'x', img.height);

    // 计算缩放比例 - 让图片尽可能大，但必须完整显示
    var kuanDuBiLi = rongQiKuanDu / img.width;
    var gaoDuBiLi = rongQiGaoDu / img.height;
    
    // 使用较小的缩放比例，确保图片完全显示在容器内
    var suoFangBiLi = Math.min(kuanDuBiLi, gaoDuBiLi);
    
    console.log('宽度比例：', kuanDuBiLi.toFixed(3));
    console.log('高度比例：', gaoDuBiLi.toFixed(3));
    console.log('最终缩放比例：', suoFangBiLi.toFixed(3));

    // 设置画布尺寸（使用原始图片尺寸，保持最高清晰度）
    canvas.width = img.width;
    canvas.height = img.height;

    console.log('画布尺寸设置为（原始尺寸）：', canvas.width, 'x', canvas.height);
    
    // 设置画布的CSS样式，让浏览器自动缩放显示
    // 这样画布内部是高分辨率，显示时自动缩小，非常清晰
    // 计算缩放后的显示尺寸
    // 在横屏模式下，留出 2px 的边距防止贴边
    var bianJu = 2;
    var xianShiKuanDu = (img.width * suoFangBiLi) - (bianJu * 2);
    var xianShiGaoDu = (img.height * suoFangBiLi) - (bianJu * 2);
    
    canvas.style.width = xianShiKuanDu + 'px';
    canvas.style.height = xianShiGaoDu + 'px';
    canvas.style.maxWidth = 'none';
    canvas.style.maxHeight = 'none';
    
    console.log('画布显示尺寸：', xianShiKuanDu.toFixed(0), 'x', xianShiGaoDu.toFixed(0));
}

/**
 * 重新绘制画布（背景图 + 所有标注）
 */
function chongXinHuiZhiHuaBu() {
    var ctx = biaoZhuZhuangTai.huaBuHuanJing;
    var canvas = biaoZhuZhuangTai.huaBu;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景图片
    if (biaoZhuZhuangTai.dangQianTuPian) {
        ctx.drawImage(biaoZhuZhuangTai.dangQianTuPian, 0, 0, canvas.width, canvas.height);
    }

    // 绘制所有历史标注
    biaoZhuZhuangTai.biaoZhuLiShi.forEach(function(biaoZhu) {
        huiZhiBiaoZhu(ctx, biaoZhu);
    });

    // 绘制当前正在编辑的标注
    if (biaoZhuZhuangTai.dangQianBiaoZhu) {
        huiZhiBiaoZhu(ctx, biaoZhuZhuangTai.dangQianBiaoZhu);
    }
}

/**
 * 绘制单个标注
 * @param {CanvasRenderingContext2D} ctx - 画布上下文
 * @param {Object} biaoZhu - 标注对象
 */
function huiZhiBiaoZhu(ctx, biaoZhu) {
    ctx.strokeStyle = biaoZhu.yanSe;
    ctx.fillStyle = biaoZhu.yanSe;
    ctx.lineWidth = biaoZhu.kuanDu || 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (biaoZhu.leiXing) {
        case 'rect':
            // 矩形
            ctx.strokeRect(
                biaoZhu.x1,
                biaoZhu.y1,
                biaoZhu.x2 - biaoZhu.x1,
                biaoZhu.y2 - biaoZhu.y1
            );
            break;

        case 'circle':
            // 圆形
            var banJing = Math.sqrt(
                Math.pow(biaoZhu.x2 - biaoZhu.x1, 2) +
                Math.pow(biaoZhu.y2 - biaoZhu.y1, 2)
            );
            ctx.beginPath();
            ctx.arc(biaoZhu.x1, biaoZhu.y1, banJing, 0, Math.PI * 2);
            ctx.stroke();
            break;

        case 'arrow':
            // 箭头
            huiZhiJianTou(ctx, biaoZhu.x1, biaoZhu.y1, biaoZhu.x2, biaoZhu.y2);
            break;

        case 'text':
            // 文字
            ctx.font = 'bold ' + (biaoZhu.daXiao || 24) + 'px Arial';
            ctx.fillText(biaoZhu.wenBen, biaoZhu.x, biaoZhu.y);
            break;
    }
}

/**
 * 绘制箭头
 * @param {CanvasRenderingContext2D} ctx - 画布上下文
 * @param {number} x1 - 起点X
 * @param {number} y1 - 起点Y
 * @param {number} x2 - 终点X
 * @param {number} y2 - 终点Y
 */
function huiZhiJianTou(ctx, x1, y1, x2, y2) {
    var jianTouChangDu = 20; // 箭头长度
    var jianTouJiaoDu = Math.PI / 6; // 箭头角度（30度）

    // 绘制主线
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // 计算箭头两个点
    var jiaoDu = Math.atan2(y2 - y1, x2 - x1);
    var x3 = x2 - jianTouChangDu * Math.cos(jiaoDu - jianTouJiaoDu);
    var y3 = y2 - jianTouChangDu * Math.sin(jiaoDu - jianTouJiaoDu);
    var x4 = x2 - jianTouChangDu * Math.cos(jiaoDu + jianTouJiaoDu);
    var y4 = y2 - jianTouChangDu * Math.sin(jiaoDu + jianTouJiaoDu);

    // 绘制箭头
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.moveTo(x2, y2);
    ctx.lineTo(x4, y4);
    ctx.stroke();
}

/**
 * 绑定画布事件（鼠标/触摸）
 */
function bangDingHuaBuShiJian() {
    var canvas = biaoZhuZhuangTai.huaBu;

    // 鼠标按下
    canvas.addEventListener('mousedown', chuLiHuaBuAnXia);

    // 鼠标移动
    canvas.addEventListener('mousemove', chuLiHuaBuYiDong);

    // 鼠标释放
    canvas.addEventListener('mouseup', chuLiHuaBuShiFang);

    // 鼠标离开
    canvas.addEventListener('mouseleave', chuLiHuaBuLiKai);

    // 触摸事件（移动端）
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        var mouseEvent = new MouseEvent('mouseup', {});
        canvas.dispatchEvent(mouseEvent);
    });
}

/**
 * 处理画布按下事件
 * @param {MouseEvent} e - 鼠标事件
 */
function chuLiHuaBuAnXia(e) {
    // 如果是移动工具
    if (biaoZhuZhuangTai.dangQianGongJu === 'move') {
        chuLiYiDongAnXia(e);
        return;
    }

    if (biaoZhuZhuangTai.dangQianGongJu === 'text') {
        // 文字工具：弹出输入框
        chuangJianWenZiShuRuKuang(e);
        return;
    }

    var canvas = biaoZhuZhuangTai.huaBu;
    var rect = canvas.getBoundingClientRect();
    
    // 计算坐标缩放比例（CSS显示尺寸 -> Canvas内部尺寸）
    var suoFangBiLiX = canvas.width / rect.width;
    var suoFangBiLiY = canvas.height / rect.height;

    // 记录起点（转换为Canvas内部坐标）
    biaoZhuZhuangTai.kaiShiHuiZhi = true;
    biaoZhuZhuangTai.qiDian = {
        x: (e.clientX - rect.left) * suoFangBiLiX,
        y: (e.clientY - rect.top) * suoFangBiLiY
    };

    // 创建当前标注对象
    biaoZhuZhuangTai.dangQianBiaoZhu = {
        leiXing: biaoZhuZhuangTai.dangQianGongJu,
        x1: biaoZhuZhuangTai.qiDian.x,
        y1: biaoZhuZhuangTai.qiDian.y,
        x2: biaoZhuZhuangTai.qiDian.x,
        y2: biaoZhuZhuangTai.qiDian.y,
        yanSe: biaoZhuZhuangTai.dangQianYanSe,
        kuanDu: biaoZhuZhuangTai.xianTiaoKuanDu
    };
}

/**
 * 处理移动工具按下事件
 * @param {MouseEvent} e - 鼠标事件
 */
function chuLiYiDongAnXia(e) {
    var canvas = biaoZhuZhuangTai.huaBu;
    var rect = canvas.getBoundingClientRect();
    
    // 计算坐标缩放比例
    var suoFangBiLiX = canvas.width / rect.width;
    var suoFangBiLiY = canvas.height / rect.height;

    var x = (e.clientX - rect.left) * suoFangBiLiX;
    var y = (e.clientY - rect.top) * suoFangBiLiY;

    // 从后往前查找（后绘制的在上面，优先选中）
    for (var i = biaoZhuZhuangTai.biaoZhuLiShi.length - 1; i >= 0; i--) {
        var biaoZhu = biaoZhuZhuangTai.biaoZhuLiShi[i];
        
        // 检查点击位置是否在标注范围内
        if (panDuanBiaoZhuFanWei(biaoZhu, x, y)) {
            // 开始移动这个标注
            biaoZhuZhuangTai.kaiShiYiDong = true;
            biaoZhuZhuangTai.yiDongBiaoZhu = biaoZhu;
            biaoZhuZhuangTai.yiDongSuoYin = i;
            biaoZhuZhuangTai.yiDongQiDian = { x: x, y: y };
            
            // ✨ 创建并显示放大镜
            chuangJianFangDaJing();
            var fangDaJing = document.getElementById('fangDaJing');
            if (fangDaJing) {
                fangDaJing.classList.add('show');
                
                // 初始化放大镜内容
                gengXinFangDaJing(biaoZhu, x, y);
                gengXinFangDaJingWeiZhi(e.clientX, e.clientY);
            }
            
            console.log('开始移动标注：', biaoZhu.leiXing, '索引：', i);
            return;
        }
    }
    
    console.log('未点击到任何标注');
}

/**
 * 判断点击位置是否在标注范围内
 * @param {Object} biaoZhu - 标注对象
 * @param {number} x - 点击X坐标
 * @param {number} y - 点击Y坐标
 * @returns {boolean} 是否点击到标注
 */
function panDuanBiaoZhuFanWei(biaoZhu, x, y) {
    var panDuanJuLi = 20; // 判定距离（像素）
    
    switch (biaoZhu.leiXing) {
        case 'rect':
            // 矩形：判断是否在矩形边框附近
            var x1 = Math.min(biaoZhu.x1, biaoZhu.x2);
            var y1 = Math.min(biaoZhu.y1, biaoZhu.y2);
            var x2 = Math.max(biaoZhu.x1, biaoZhu.x2);
            var y2 = Math.max(biaoZhu.y1, biaoZhu.y2);
            
            // 判断是否在矩形内部或边框附近
            return x >= x1 - panDuanJuLi && x <= x2 + panDuanJuLi &&
                   y >= y1 - panDuanJuLi && y <= y2 + panDuanJuLi;
            
        case 'circle':
            // 圆形：判断是否在圆形范围内
            var banJing = Math.sqrt(
                Math.pow(biaoZhu.x2 - biaoZhu.x1, 2) +
                Math.pow(biaoZhu.y2 - biaoZhu.y1, 2)
            );
            var juLi = Math.sqrt(
                Math.pow(x - biaoZhu.x1, 2) +
                Math.pow(y - biaoZhu.y1, 2)
            );
            return juLi <= banJing + panDuanJuLi;
            
        case 'arrow':
            // 箭头：判断是否在箭头线段附近
            return panDuanDianDaoXianDuanJuLi(x, y, biaoZhu.x1, biaoZhu.y1, biaoZhu.x2, biaoZhu.y2) <= panDuanJuLi;
            
        case 'text':
            // 文字：使用更大的判定区域，与边界框逻辑一致
            // 测量文字实际尺寸
            var ctx = biaoZhuZhuangTai.huaBuHuanJing;
            ctx.font = 'bold ' + (biaoZhu.daXiao || 24) + 'px Arial';
            var ceLiang = ctx.measureText(biaoZhu.wenBen);
            var wenZiKuanDu = ceLiang.width;
            var wenZiGaoDu = biaoZhu.daXiao || 24;
            
            // 计算文字的边界框（与放大镜逻辑一致）
            var wenZiBianJieX = biaoZhu.x;
            var wenZiBianJieY = biaoZhu.y - wenZiGaoDu;
            
            // 扩大判定区域：文字本身 + 较大的判定边距
            var panDuanBianJu = 40;  // 增加判定距离，方便手指点击
            
            return x >= wenZiBianJieX - panDuanBianJu && 
                   x <= wenZiBianJieX + wenZiKuanDu + panDuanBianJu &&
                   y >= wenZiBianJieY - panDuanBianJu && 
                   y <= wenZiBianJieY + wenZiGaoDu + panDuanBianJu;
            
        default:
            return false;
    }
}

/**
 * 计算点到线段的距离
 * @param {number} px - 点X坐标
 * @param {number} py - 点Y坐标
 * @param {number} x1 - 线段起点X
 * @param {number} y1 - 线段起点Y
 * @param {number} x2 - 线段终点X
 * @param {number} y2 - 线段终点Y
 * @returns {number} 距离
 */
function panDuanDianDaoXianDuanJuLi(px, py, x1, y1, x2, y2) {
    var A = px - x1;
    var B = py - y1;
    var C = x2 - x1;
    var D = y2 - y1;

    var dot = A * C + B * D;
    var lenSq = C * C + D * D;
    var param = -1;
    
    if (lenSq !== 0) {
        param = dot / lenSq;
    }

    var xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    var dx = px - xx;
    var dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 处理画布移动事件
 * @param {MouseEvent} e - 鼠标事件
 */
function chuLiHuaBuYiDong(e) {
    // 如果是移动工具
    if (biaoZhuZhuangTai.dangQianGongJu === 'move') {
        chuLiYiDongYiDong(e);
        return;
    }

    if (!biaoZhuZhuangTai.kaiShiHuiZhi) {
        return;
    }

    var canvas = biaoZhuZhuangTai.huaBu;
    var rect = canvas.getBoundingClientRect();
    
    // 计算坐标缩放比例（CSS显示尺寸 -> Canvas内部尺寸）
    var suoFangBiLiX = canvas.width / rect.width;
    var suoFangBiLiY = canvas.height / rect.height;

    // 更新终点（转换为Canvas内部坐标）
    biaoZhuZhuangTai.dangQianBiaoZhu.x2 = (e.clientX - rect.left) * suoFangBiLiX;
    biaoZhuZhuangTai.dangQianBiaoZhu.y2 = (e.clientY - rect.top) * suoFangBiLiY;

    // 重新绘制
    chongXinHuiZhiHuaBu();
}

/**
 * 处理移动工具移动事件
 * @param {MouseEvent} e - 鼠标事件
 */
function chuLiYiDongYiDong(e) {
    if (!biaoZhuZhuangTai.kaiShiYiDong || !biaoZhuZhuangTai.yiDongBiaoZhu) {
        return;
    }

    var canvas = biaoZhuZhuangTai.huaBu;
    var rect = canvas.getBoundingClientRect();
    
    // 计算坐标缩放比例
    var suoFangBiLiX = canvas.width / rect.width;
    var suoFangBiLiY = canvas.height / rect.height;

    var x = (e.clientX - rect.left) * suoFangBiLiX;
    var y = (e.clientY - rect.top) * suoFangBiLiY;

    // 计算移动距离
    var juLiX = x - biaoZhuZhuangTai.yiDongQiDian.x;
    var juLiY = y - biaoZhuZhuangTai.yiDongQiDian.y;

    // 更新标注位置
    var biaoZhu = biaoZhuZhuangTai.yiDongBiaoZhu;
    
    switch (biaoZhu.leiXing) {
        case 'rect':
        case 'circle':
        case 'arrow':
            // 这些类型都有 x1, y1, x2, y2
            biaoZhu.x1 += juLiX;
            biaoZhu.y1 += juLiY;
            biaoZhu.x2 += juLiX;
            biaoZhu.y2 += juLiY;
            break;
            
        case 'text':
            // 文字类型有 x, y
            biaoZhu.x += juLiX;
            biaoZhu.y += juLiY;
            break;
    }

    // 更新移动起点
    biaoZhuZhuangTai.yiDongQiDian = { x: x, y: y };

    // 重新绘制
    chongXinHuiZhiHuaBu();
    
    // ✨ 更新放大镜内容和位置
    gengXinFangDaJing(biaoZhu, x, y);
    gengXinFangDaJingWeiZhi(e.clientX, e.clientY);
}

/**
 * 处理画布释放事件
 */
function chuLiHuaBuShiFang() {
    // 如果是移动工具
    if (biaoZhuZhuangTai.dangQianGongJu === 'move') {
        chuLiYiDongShiFang();
        return;
    }

    if (!biaoZhuZhuangTai.kaiShiHuiZhi) {
        return;
    }

    // 结束绘制
    biaoZhuZhuangTai.kaiShiHuiZhi = false;

    // 将当前标注添加到历史记录
    if (biaoZhuZhuangTai.dangQianBiaoZhu) {
        biaoZhuZhuangTai.biaoZhuLiShi.push(biaoZhuZhuangTai.dangQianBiaoZhu);
        biaoZhuZhuangTai.dangQianBiaoZhu = null;
    }

    // 重新绘制
    chongXinHuiZhiHuaBu();
}

/**
 * 处理移动工具释放事件
 */
function chuLiYiDongShiFang() {
    if (!biaoZhuZhuangTai.kaiShiYiDong) {
        return;
    }

    // 结束移动
    biaoZhuZhuangTai.kaiShiYiDong = false;
    biaoZhuZhuangTai.yiDongBiaoZhu = null;
    biaoZhuZhuangTai.yiDongSuoYin = -1;

    // ✨ 隐藏并销毁放大镜
    yinCangFangDaJing();

    console.log('标注移动完成');
}

/**
 * 处理画布离开事件
 */
function chuLiHuaBuLiKai() {
    // 如果正在绘制，取消当前标注
    if (biaoZhuZhuangTai.kaiShiHuiZhi) {
        biaoZhuZhuangTai.kaiShiHuiZhi = false;
        biaoZhuZhuangTai.dangQianBiaoZhu = null;
        chongXinHuiZhiHuaBu();
    }
}

/**
 * 创建文字输入框
 * @param {MouseEvent} e - 鼠标事件
 */
function chuangJianWenZiShuRuKuang(e) {
    var canvas = biaoZhuZhuangTai.huaBu;
    var rect = canvas.getBoundingClientRect();
    
    // 计算坐标缩放比例（CSS显示尺寸 -> Canvas内部尺寸）
    var suoFangBiLiX = canvas.width / rect.width;
    var suoFangBiLiY = canvas.height / rect.height;

    var x = (e.clientX - rect.left) * suoFangBiLiX;
    var y = (e.clientY - rect.top) * suoFangBiLiY;

    // 创建输入框
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'wenZiShuRuKuang';
    input.style.left = (rect.left + (e.clientX - rect.left)) + 'px';
    input.style.top = (rect.top + (e.clientY - rect.top) - 20) + 'px';
    input.style.display = 'block';

    document.body.appendChild(input);
    input.focus();

    // 监听回车键
    input.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && input.value.trim()) {
            // 添加文字标注
            biaoZhuZhuangTai.biaoZhuLiShi.push({
                leiXing: 'text',
                x: x,
                y: y,
                wenBen: input.value,
                yanSe: biaoZhuZhuangTai.dangQianYanSe,
                daXiao: biaoZhuZhuangTai.ziTiDaXiao
            });

            // 移除输入框
            document.body.removeChild(input);

            // 重新绘制
            chongXinHuiZhiHuaBu();
        }
    });

    // 监听失去焦点
    input.addEventListener('blur', function() {
        if (input.value.trim()) {
            biaoZhuZhuangTai.biaoZhuLiShi.push({
                leiXing: 'text',
                x: x,
                y: y,
                wenBen: input.value,
                yanSe: biaoZhuZhuangTai.dangQianYanSe,
                daXiao: biaoZhuZhuangTai.ziTiDaXiao
            });
        }
        if (input.parentNode) {
            document.body.removeChild(input);
        }
        chongXinHuiZhiHuaBu();
    });
}

/**
 * 绑定工具栏事件
 */
function bangDingGongJuLanShiJian() {
    // 工具选择按钮
    document.querySelectorAll('.gongJuAnNiu[data-gongJu]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var gongJu = this.getAttribute('data-gongJu');
            qieHuanGongJu(gongJu);
        });
    });

    // 颜色选择
    document.querySelectorAll('.yanSeDian').forEach(function(dian) {
        dian.addEventListener('click', function() {
            var yanSe = this.getAttribute('data-yanSe');
            qieHuanYanSe(yanSe);
        });
    });

    // 线条粗细选择
    document.querySelectorAll('.cuXiAnNiu').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var cuXi = parseInt(this.getAttribute('data-cuXi'));
            qieHuanCuXi(cuXi);
        });
    });

    // 字体大小选择
    document.querySelectorAll('.ziTiDaXiaoAnNiu').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var daXiao = parseInt(this.getAttribute('data-daXiao'));
            qieHuanZiTiDaXiao(daXiao);
        });
    });

    // 撤销按钮
    document.getElementById('btnCheXiao').addEventListener('click', cheXiaoBiaoZhu);

    // 取消按钮
    document.getElementById('btnQuXiaoBiaoZhu').addEventListener('click', quXiaoBiaoZhu);

    // 完成按钮
    document.getElementById('btnWanChengBiaoZhu').addEventListener('click', wanChengBiaoZhu);
}

/**
 * 切换工具
 * @param {string} gongJu - 工具名称
 */
function qieHuanGongJu(gongJu) {
    biaoZhuZhuangTai.dangQianGongJu = gongJu;

    // 更新按钮状态
    document.querySelectorAll('.gongJuAnNiu[data-gongJu]').forEach(function(btn) {
        btn.classList.remove('huoZhong');
    });
    document.querySelector('[data-gongJu="' + gongJu + '"]').classList.add('huoZhong');

    console.log('切换到工具：', gongJu);
}

/**
 * 切换颜色
 * @param {string} yanSe - 颜色值
 */
function qieHuanYanSe(yanSe) {
    biaoZhuZhuangTai.dangQianYanSe = yanSe;

    // 更新颜色点状态
    document.querySelectorAll('.yanSeDian').forEach(function(dian) {
        dian.classList.remove('huoZhong');
    });
    document.querySelector('[data-yanSe="' + yanSe + '"]').classList.add('huoZhong');

    console.log('切换到颜色：', yanSe);
}

/**
 * 切换线条粗细
 * @param {number} cuXi - 线条粗细
 */
function qieHuanCuXi(cuXi) {
    biaoZhuZhuangTai.xianTiaoKuanDu = cuXi;

    // 更新粗细按钮状态
    document.querySelectorAll('.cuXiAnNiu').forEach(function(btn) {
        btn.classList.remove('huoZhong');
    });
    document.querySelector('[data-cuXi="' + cuXi + '"]').classList.add('huoZhong');

    console.log('切换到线条粗细：', cuXi);
}

/**
 * 切换字体大小
 * @param {number} daXiao - 字体大小
 */
function qieHuanZiTiDaXiao(daXiao) {
    biaoZhuZhuangTai.ziTiDaXiao = daXiao;

    // 更新字体大小按钮状态
    document.querySelectorAll('.ziTiDaXiaoAnNiu').forEach(function(btn) {
        btn.classList.remove('huoZhong');
    });
    document.querySelector('[data-daXiao="' + daXiao + '"]').classList.add('huoZhong');

    console.log('切换到字体大小：', daXiao);
}

/**
 * 撤销标注（一步一步撤销）
 */
function cheXiaoBiaoZhu() {
    if (biaoZhuZhuangTai.biaoZhuLiShi.length === 0) {
        xianShiTiShi('⚠ 没有可撤销的操作');
        return;
    }

    // 移除最后一个标注
    biaoZhuZhuangTai.biaoZhuLiShi.pop();

    // 重新绘制
    chongXinHuiZhiHuaBu();

    xianShiTiShi('✓ 已撤销');
    console.log('撤销成功，剩余标注数：', biaoZhuZhuangTai.biaoZhuLiShi.length);
}

/**
 * 取消标注（放弃所有标注，关闭界面）
 */
function quXiaoBiaoZhu() {
    // 清空标注历史
    biaoZhuZhuangTai.biaoZhuLiShi = [];
    biaoZhuZhuangTai.dangQianBiaoZhu = null;

    // 关闭标注界面
    var jieMian = document.getElementById('biaoZhuJieMian');
    jieMian.classList.remove('xianShi');

    xianShiTiShi('✓ 已取消标注');
    console.log('取消标注');
}

/**
 * 完成标注（保存到 LocalStorage，关闭界面）
 */
function wanChengBiaoZhu() {
    var canvas = biaoZhuZhuangTai.huaBu;

    // 将画布转为 Base64 图片
    var imageData = canvas.toDataURL('image/png');

    // 保存到 LocalStorage（覆盖模式）
    var baoCunChengGong = baoCunJieTu(imageData);

    if (!baoCunChengGong) {
        return; // 保存失败，不继续
    }

    // 将画布转为 Blob 并复制到剪贴板
    canvas.toBlob(function(blob) {
        if (navigator.clipboard && navigator.clipboard.write) {
            // 现代浏览器 API
            var item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]).then(function() {
                xianShiTiShi('✓ 截图已保存，可点击“插入截图”按钮插入笔记');
                console.log('截图已保存并复制到剪贴板');
                
                // 清空标注历史
                biaoZhuZhuangTai.biaoZhuLiShi = [];
                biaoZhuZhuangTai.dangQianBiaoZhu = null;

                // 关闭标注界面
                var jieMian = document.getElementById('biaoZhuJieMian');
                jieMian.classList.remove('xianShi');
            }).catch(function(err) {
                console.error('复制到剪贴板失败：', err);
                xianShiTiShi('✓ 截图已保存，可点击“插入截图”按钮插入笔记');
                
                // 清空标注历史
                biaoZhuZhuangTai.biaoZhuLiShi = [];
                biaoZhuZhuangTai.dangQianBiaoZhu = null;

                // 关闭标注界面
                var jieMian = document.getElementById('biaoZhuJieMian');
                jieMian.classList.remove('xianShi');
            });
        } else {
            // 降级方案：只保存到 LocalStorage
            xianShiTiShi('✓ 截图已保存，可点击“插入截图”按钮插入笔记');
            
            // 清空标注历史
            biaoZhuZhuangTai.biaoZhuLiShi = [];
            biaoZhuZhuangTai.dangQianBiaoZhu = null;

            // 关闭标注界面
            var jieMian = document.getElementById('biaoZhuJieMian');
            jieMian.classList.remove('xianShi');
        }
    }, 'image/png');
}

/**
 * 获取标注的边界框
 * @param {Object} biaoZhu - 标注对象
 * @returns {Object} { x, y, width, height }
 */
function huoQuBiaoZhuBianJieKuang(biaoZhu) {
    var bianJie = {};
    
    switch (biaoZhu.leiXing) {
        case 'rect':
            // 矩形：直接使用坐标
            bianJie.x = Math.min(biaoZhu.x1, biaoZhu.x2);
            bianJie.y = Math.min(biaoZhu.y1, biaoZhu.y2);
            bianJie.width = Math.abs(biaoZhu.x2 - biaoZhu.x1);
            bianJie.height = Math.abs(biaoZhu.y2 - biaoZhu.y1);
            break;
            
        case 'circle':
            // 圆形：x1,y1是圆心，需要计算半径
            var banJing = Math.sqrt(
                Math.pow(biaoZhu.x2 - biaoZhu.x1, 2) +
                Math.pow(biaoZhu.y2 - biaoZhu.y1, 2)
            );
            
            // 圆形的边界框是外接正方形
            bianJie.x = biaoZhu.x1 - banJing;
            bianJie.y = biaoZhu.y1 - banJing;
            bianJie.width = banJing * 2;
            bianJie.height = banJing * 2;
            
            // 增加边距，确保圆形边框完整显示
            var yuanXingBianJu = 5;
            bianJie.x -= yuanXingBianJu;
            bianJie.y -= yuanXingBianJu;
            bianJie.width += yuanXingBianJu * 2;
            bianJie.height += yuanXingBianJu * 2;
            break;
            
        case 'arrow':
            // 箭头：终点偏置显示方案
            // 计算箭头长度和方向
            var dx = biaoZhu.x2 - biaoZhu.x1;
            var dy = biaoZhu.y2 - biaoZhu.y1;
            var arrowLength = Math.sqrt(dx * dx + dy * dy);
            
            // 归一化方向向量
            var dirX = dx / arrowLength;
            var dirY = dy / arrowLength;
            
            // 箭头终点（头部）坐标
            var endX = biaoZhu.x2;
            var endY = biaoZhu.y2;
            
            // 计算截取区域的基础尺寸（会根据实际缩放调整）
            var baseWidth = Math.max(arrowLength * 0.6, 80);  // 至少显示60%的箭头长度，最小80px
            var baseHeight = 100;  // 基础高度
            
            // 计算放大镜中心位置
            // 让箭头头部位于放大镜的下1/3处（offset = 高度的1/3）
            var offset = baseHeight * 0.33;
            var centerX = endX - dirX * offset;
            var centerY = endY - dirY * offset;
            
            // 设置边界框
            bianJie.x = centerX - baseWidth / 2;
            bianJie.y = centerY - baseHeight / 2;
            bianJie.width = baseWidth;
            bianJie.height = baseHeight;
            
            // 增加边距，确保箭头头部完整显示
            var jianTouBianJu = 15;
            bianJie.x -= jianTouBianJu;
            bianJie.y -= jianTouBianJu;
            bianJie.width += jianTouBianJu * 2;
            bianJie.height += jianTouBianJu * 2;
            
            console.log('箭头标注 - 长度:', arrowLength.toFixed(0), 
                       '方向: (' + dirX.toFixed(2) + ', ' + dirY.toFixed(2) + ')',
                       '边界框:', bianJie.width.toFixed(0), 'x', bianJie.height.toFixed(0));
            break;
            
        case 'text':
            // 文字标注：固定环境区域 + 文字偏置显示方案
            // 测量文字实际尺寸
            var ctx = biaoZhuZhuangTai.huaBuHuanJing;
            ctx.font = 'bold ' + (biaoZhu.daXiao || 24) + 'px Arial';
            var ceLiang = ctx.measureText(biaoZhu.wenBen);
            var wenZiKuanDu = ceLiang.width;
            var wenZiGaoDu = biaoZhu.daXiao || 24;
            
            // 固定环境区域（四周至少 60px 的环境）
            var huanJingBianJu = 60;
            
            // 计算截取区域的基础尺寸
            var baseWidth = Math.max(wenZiKuanDu + huanJingBianJu * 2, 150);  // 至少 150px 宽
            var baseHeight = 130;  // 固定高度，确保足够的环境空间
            
            // 让文字位于放大镜的上 1/3 处
            // 这样下方可以显示更多环境，用户拖动时能看到去向
            var offset = baseHeight * 0.33;
            var textCenterX = biaoZhu.x + wenZiKuanDu / 2;
            var textCenterY = biaoZhu.y - wenZiGaoDu / 2;  // 文字基线调整
            
            var centerX = textCenterX;
            var centerY = textCenterY + offset;  // 向下偏移，让文字在上方
            
            // 设置边界框
            bianJie.x = centerX - baseWidth / 2;
            bianJie.y = centerY - baseHeight / 2;
            bianJie.width = baseWidth;
            bianJie.height = baseHeight;
            
            console.log('文字标注 - 固定环境 60px + 文字偏置上 1/3',
                       '文字尺寸:', wenZiKuanDu.toFixed(0), 'x', wenZiGaoDu.toFixed(0),
                       '边界框:', bianJie.width.toFixed(0), 'x', bianJie.height.toFixed(0));
            break;
            
        default:
            // 默认情况
            bianJie.x = 0;
            bianJie.y = 0;
            bianJie.width = 50;
            bianJie.height = 50;
    }
    
    return bianJie;
}

/**
 * 计算动态缩放比例
 * @param {Object} bianJie - 标注边界框
 * @param {number} fangDaJingZhiJing - 放大镜直径
 * @param {number} anQuanBianJu - 安全边距
 * @returns {number} 缩放比例
 */
function jiSuanSuoFangBiLi(bianJie, fangDaJingZhiJing, anQuanBianJu) {
    // 可用显示区域（减去边距）
    var keYongKuanDu = fangDaJingZhiJing - (anQuanBianJu * 2);
    var keYongGaoDu = fangDaJingZhiJing - (anQuanBianJu * 2);
    
    // 防止除以0
    if (bianJie.width === 0 || bianJie.height === 0) {
        return 1;
    }
    
    // 计算宽度和高度的缩放比例
    var biLiKuan = keYongKuanDu / bianJie.width;
    var biLiGao = keYongGaoDu / bianJie.height;
    
    // 取较小值，确保标注完全显示
    var suoFangBiLi = Math.min(biLiKuan, biLiGao);
    
    console.log('标注尺寸:', bianJie.width.toFixed(0), 'x', bianJie.height.toFixed(0));
    console.log('可用区域:', keYongKuanDu.toFixed(0), 'x', keYongGaoDu.toFixed(0));
    console.log('缩放比例:', suoFangBiLi.toFixed(2), '倍');
    
    return suoFangBiLi;
}

/**
 * 创建放大镜元素
 */
function chuangJianFangDaJing() {
    // 检查是否已存在
    if (document.getElementById('fangDaJing')) {
        return;
    }
    
    // 创建容器
    var rongQi = document.createElement('div');
    rongQi.id = 'fangDaJing';
    rongQi.className = 'magnifier';
    
    // 创建画布
    var canvas = document.createElement('canvas');
    canvas.id = 'fangDaJingCanvas';
    
    rongQi.appendChild(canvas);
    document.body.appendChild(rongQi);
    
    console.log('放大镜已创建');
}

/**
 * 更新放大镜内容
 * @param {Object} biaoZhu - 当前移动的标注
 * @param {number} shouZhiX - 手指X坐标（Canvas内部坐标）
 * @param {number} shouZhiY - 手指Y坐标（Canvas内部坐标）
 */
function gengXinFangDaJing(biaoZhu, shouZhiX, shouZhiY) {
    var canvas = document.getElementById('fangDaJingCanvas');
    if (!canvas) {
        return;
    }
    
    var ctx = canvas.getContext('2d');
    
    // 设置画布实际尺寸（考虑高清屏）
    var devicePixelRatio = window.devicePixelRatio || 1;
    var zhiJing = fangDaJingPeiZhi.zhiJing;
    canvas.width = zhiJing * devicePixelRatio;
    canvas.height = zhiJing * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // 清空画布
    ctx.clearRect(0, 0, zhiJing, zhiJing);
    
    // 创建圆形裁剪区域
    ctx.save();
    ctx.beginPath();
    ctx.arc(zhiJing / 2, zhiJing / 2, zhiJing / 2, 0, Math.PI * 2);
    ctx.clip();
    
    // 获取标注边界框
    var bianJie = huoQuBiaoZhuBianJieKuang(biaoZhu);
    
    // 计算缩放比例
    var anQuanBianJu = fangDaJingPeiZhi.anQuanBianJu;
    var suoFangBiLi = jiSuanSuoFangBiLi(bianJie, zhiJing, anQuanBianJu);
    
    // 计算截取区域的中心点（以标注中心为准）
    var zhongDianX = bianJie.x + bianJie.width / 2;
    var zhongDianY = bianJie.y + bianJie.height / 2;
    
    // 计算截取区域的起始点和尺寸
    var jieQuKuanDu = zhiJing / suoFangBiLi;
    var jieQuGaoDu = zhiJing / suoFangBiLi;
    var jieQuQiDianX = zhongDianX - jieQuKuanDu / 2;
    var jieQuQiDianY = zhongDianY - jieQuGaoDu / 2;
    
    // 边界检查：确保不超出主画布
    var zhuHuaBu = biaoZhuZhuangTai.huaBu;
    jieQuQiDianX = Math.max(0, Math.min(jieQuQiDianX, zhuHuaBu.width - jieQuKuanDu));
    jieQuQiDianY = Math.max(0, Math.min(jieQuQiDianY, zhuHuaBu.height - jieQuGaoDu));
    
    // 绘制白色背景
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, zhiJing, zhiJing);
    
    // 绘制到放大镜
    ctx.drawImage(
        zhuHuaBu,
        jieQuQiDianX, jieQuQiDianY, jieQuKuanDu, jieQuGaoDu, // 源区域
        0, 0, zhiJing, zhiJing                               // 目标区域
    );
    
    ctx.restore();
}

/**
 * 更新放大镜位置
 * @param {number} keHuDuanX - 客户端X坐标（屏幕坐标）
 * @param {number} keHuDuanY - 客户端Y坐标（屏幕坐标）
 */
function gengXinFangDaJingWeiZhi(keHuDuanX, keHuDuanY) {
    var fangDaJing = document.getElementById('fangDaJing');
    
    if (!fangDaJing) {
        return;
    }
    
    var zhiJing = fangDaJingPeiZhi.zhiJing;
    var pianYiLiang = fangDaJingPeiZhi.pianYiLiang;
    
    // 检测屏幕方向
    var isHengPing = window.innerWidth > window.innerHeight;
    
    var weiZhiX, weiZhiY;
    
    if (isHengPing) {
        // 横屏：优先显示在右侧
        if (keHuDuanX + zhiJing + pianYiLiang < window.innerWidth) {
            // 右侧有空间
            weiZhiX = keHuDuanX + pianYiLiang;
        } else {
            // 显示在左侧
            weiZhiX = keHuDuanX - zhiJing - pianYiLiang;
        }
        // Y轴居中对齐
        weiZhiY = keHuDuanY - zhiJing / 2;
    } else {
        // 竖屏：显示在上方
        weiZhiX = keHuDuanX - zhiJing / 2;
        
        if (keHuDuanY - zhiJing - pianYiLiang > 0) {
            // 上方有空间
            weiZhiY = keHuDuanY - zhiJing - pianYiLiang;
        } else {
            // 显示在下方
            weiZhiY = keHuDuanY + pianYiLiang;
        }
    }
    
    // 边界保护：确保不超出屏幕
    weiZhiX = Math.max(10, Math.min(weiZhiX, window.innerWidth - zhiJing - 10));
    weiZhiY = Math.max(10, Math.min(weiZhiY, window.innerHeight - zhiJing - 10));
    
    // 应用位置
    fangDaJing.style.left = weiZhiX + 'px';
    fangDaJing.style.top = weiZhiY + 'px';
}

/**
 * 隐藏并销毁放大镜
 */
function yinCangFangDaJing() {
    var fangDaJing = document.getElementById('fangDaJing');
    if (fangDaJing) {
        fangDaJing.classList.remove('show');
        // 延迟销毁，避免频繁创建
        setTimeout(function() {
            if (fangDaJing.parentNode) {
                fangDaJing.parentNode.removeChild(fangDaJing);
            }
        }, fangDaJingPeiZhi.xiaoShiYanChi);
    }
}
