/*function toggleMenu() {
    const menuContent = document.getElementById('menu-content');
    menuContent.style.display = menuContent.style.display === 'block' ? 'none' : 'block';
}

function loadPage(page) {
    fetch(page)
        .then(response => response.text())
        .then(html => {
            document.getElementById('content').innerHTML = html;
            toggleMenu();
        })
        .catch(error => console.error('Error loading page:', error));
}*/


function calculateOptics() {
    // 获取用户输入的分辨率宽度
    const resolutionWidth = parseFloat(document.getElementById('resolutionWidth').value);
    // 获取用户输入的分辨率高度
    const resolutionHeight = parseFloat(document.getElementById('resolutionHeight').value);
    // 获取用户输入的像素尺寸
    const pixelSize = parseFloat(document.getElementById('pixelSize').value);
    // 获取用户输入的焦距
    const focalLength = parseFloat(document.getElementById('focalLength').value);
    // 获取用户输入的光圈数
    const f_number = parseFloat(document.getElementById('f_number').value);
    // 获取用户输入的目标长度
    const targetLength = parseFloat(document.getElementById('targetLength').value);
    // 获取用户输入的目标宽度
    const targetWidth = parseFloat(document.getElementById('targetWidth').value);
    // 获取用户输入的目标距离
    const targetDistance = parseFloat(document.getElementById('targetDistance').value);

    // 检查输入是否为数字，如果有任何一个输入不是数字，则显示错误信息
    if (isNaN(resolutionWidth) || isNaN(resolutionHeight) || isNaN(pixelSize) ||
        isNaN(focalLength) || isNaN(targetLength) || isNaN(targetWidth) || isNaN(targetDistance)) {
        document.getElementById('result').innerHTML = "<p>请填写所有字段。</p>";
        return;
    }

    const ifovRad = (pixelSize / focalLength); // Instantaneous FOV in radians
    const ifovDeg = ifovRad * (180 / Math.PI)/1000; // Convert to degrees
    const fovHorizRad = ifovRad * resolutionWidth;
    const fovVertRad = ifovRad * resolutionHeight;
    const fovHorizDeg = fovHorizRad * (180 / Math.PI)/1000;
    const fovVertDeg = fovVertRad * (180 / Math.PI)/1000;
    const targetPixelsHoriz = targetLength / (ifovRad * targetDistance);
    const targetPixelsVert = targetWidth / (ifovRad * targetDistance);
    const spatialRes = ifovRad * targetDistance;
    const fieldSizeHoriz = fovHorizRad * targetDistance;
    const fieldSizeVert = fovVertRad * targetDistance;


    // 单位转换
    const focalLength_m = focalLength / 1000; // mm → m
    const pixelSize_m = pixelSize / 1000000; // μm → mm → m（弥散斑直径）
    const c = 2 * pixelSize_m; // 容许弥散斑直径（2倍像素尺寸）
    const targetDistance_m = targetDistance * 1000; // km → m

    // 计算超焦距
    //指当镜头对焦在某一特定距离时，从该距离的一半到无穷远 的所有景物都能保持清晰
    const hyperfocal = (focalLength_m ** 2) / (f_number * c) + focalLength_m;

    // 计算前景深和后景深
    let frontDepth=0; 
    let backDepth=0;


    if (targetDistance_m === Infinity|| targetDistance_m >= hyperfocal * 10) {
        // 对焦无限远的情况
        frontDepth = hyperfocal / 2;
        backDepth = Infinity;
    } else {
        const numerator = hyperfocal * (targetDistance_m - focalLength_m);
        frontDepth = numerator / (hyperfocal + targetDistance_m - 2 * focalLength_m);
        backDepth = numerator / (hyperfocal - targetDistance_m);
    }
    // frontDepth = f_number*c*targetDistance*targetDistance/(
    //     (focalLength_m*focalLength_m)+(f_number*c*targetDistance)
    // )
    // backDepth = f_number*c*focalLength_m*focalLength_m/(
    //     (focalLength_m*focalLength_m)-(f_number*c*targetDistance)
    // )


    // 目标尺寸（单位：米）
    const targetSize = Math.max(targetLength, targetWidth); // 使用目标的长度或宽度中的较大值
    // 约翰逊准则的像素要求
    const detectionPixels = 2; // 探测
    const recognitionPixels = 8; // 识别
    const identificationPixels = 12; // 辨认
    const detectionDistance = targetSize / (ifovRad * detectionPixels);
    const recognitionDistance = targetSize / (ifovRad * recognitionPixels);
    const identificationDistance = targetSize / (ifovRad * identificationPixels);

    if(backDepth == Infinity)
    {
        document.getElementById('result').innerHTML = `
        <h3>计算结果：</h3>
        <p>瞬时视场角：${ifovDeg.toFixed(4)}°   /   ${ifovRad.toFixed(4)} mrad</p>
        <p>视场角：${fovHorizDeg.toFixed(4)}° x ${fovVertDeg.toFixed(4)}° / ${fovHorizRad.toFixed(4)} mrad x ${fovVertRad.toFixed(4)} mrad</p>
        <p>目标占像素数：${targetPixelsHoriz.toFixed(4)} (水平) x ${targetPixelsVert.toFixed(4)} (垂直)</p>
        <p>分辨力（@${targetDistance}km）：${spatialRes.toFixed(4)} m</p>
        <p>视场范围（@${targetDistance}km）：${fieldSizeHoriz.toFixed(4)} m x ${fieldSizeVert.toFixed(4)} m</p>
        <p>景深（@${targetDistance}km）：${frontDepth.toFixed(2)} m(front) ←|${targetDistance}km|→ ∞(back)</p>
        <p>超焦距：${hyperfocal.toFixed(4)}m</p>
        <p>探测距离：${detectionDistance.toFixed(4)}km</p>
        <p>识别距离：${recognitionDistance.toFixed(4)}km</p>
        <p>辨认距离：${identificationDistance.toFixed(4)}km</p>
    `;
    }
    else
    {
        document.getElementById('result').innerHTML = `
        <h3>计算结果：</h3>
        <p>瞬时视场角：${ifovDeg.toFixed(4)}°   /   ${ifovRad.toFixed(4)} mrad</p>
        <p>视场角：${fovHorizDeg.toFixed(4)}° x ${fovVertDeg.toFixed(4)}° / ${fovHorizRad.toFixed(4)} mrad x ${fovVertRad.toFixed(4)} mrad</p>
        <p>目标占像素数：${targetPixelsHoriz.toFixed(4)} (水平) x ${targetPixelsVert.toFixed(4)} (垂直)</p>
        <p>分辨力（@${targetDistance}km）：${spatialRes.toFixed(4)} m</p>
        <p>视场范围（@${targetDistance}km）：${fieldSizeHoriz.toFixed(4)} m x ${fieldSizeVert.toFixed(4)} m</p>
        <p>景深（@${targetDistance}km）：${frontDepth.toFixed(2)} m(front) ←|${targetDistance}km|→ ${backDepth.toFixed(2)} m(back)</p>
        <p>超焦距：${hyperfocal.toFixed(4)}m</p>
        <p>探测距离：${detectionDistance.toFixed(4)}km</p>
        <p>识别距离：${recognitionDistance.toFixed(4)}km</p>
        <p>辨认距离：${identificationDistance.toFixed(4)}km</p>
    `;
    }
    
}


// script.js
// 现有代码...

// 度到毫弧度的转换
function convertDegreesToMilliradians() {
    const degrees = parseFloat(document.getElementById('degrees').value) || 0;
    const milliradians = degrees * 1000 * Math.PI / 180;
    document.getElementById('milliradians').value = milliradians.toFixed(4);
}

// 毫弧度到度的转换
function convertMilliradiansToDegrees() {
    const milliradians = parseFloat(document.getElementById('milliradians').value) || 0;
    const degrees = milliradians * 180 / (1000 * Math.PI);
    document.getElementById('degrees').value = degrees.toFixed(4);
}

// 波长 (μm) 到波数 (cm⁻¹) 的转换
function convertWavelengthToWavenumber() {
    const wavelength = parseFloat(document.getElementById('wavelength').value) || 0;
    const wavenumber = 10000 / wavelength; // 1 μm = 10⁻⁴ cm
    document.getElementById('wavenumber').value = wavenumber.toFixed(4);
}

// 波数 (cm⁻¹) 到波长 (μm) 的转换
function convertWavenumberToWavelength() {
    const wavenumber = parseFloat(document.getElementById('wavenumber').value) || 0;
    const wavelength = 10000 / wavenumber; // 1 μm = 10⁻⁴ cm
    document.getElementById('wavelength').value = wavelength.toFixed(4);
}

// 现有代码...



function calculateIsoscelesTriangleBase_Rad() {

    const apexAngleMrad = parseFloat(document.getElementById('apexAngleMrad').value);
    const heightKm = parseFloat(document.getElementById('heightKm').value);
    // 将顶角从毫弧度转换为弧度
    const apexAngleRad = apexAngleMrad * 0.001;

    // 使用正切函数计算底边边长的一半（单位：千米）
    const halfBaseKm = Math.tan(apexAngleRad / 2) * heightKm;

    // 计算完整的底边边长（单位：千米）
    const baseKm = 2 * halfBaseKm;

    if(baseKm>1){
        document.getElementById('result_L').innerHTML = `<p>L=：${baseKm.toFixed(4)}km</p>`;
    }
    else if(baseKm>0.001)
    {
        // 将结果转换为米（1千米 = 1,000米）
        const baseM = baseKm * 1000;
        document.getElementById('result_L').innerHTML = `<p>L=：${baseM.toFixed(4)}m</p>`;
    }
    else
    {
        // 将结果转换为毫米（1千米 = 1,000,000毫米）
        const baseMm = baseKm * 1000000;
        document.getElementById('result_L').innerHTML = `<p>L=：${baseMm.toFixed(4)}mm</p>`;
    }

    const milliradians = parseFloat(document.getElementById('apexAngleMrad').value) || 0;
    const degrees = milliradians * 180 / (1000 * Math.PI);
    document.getElementById('apexAngleDegrees').value = degrees.toFixed(4);
}


function calculateIsoscelesTriangleBase_Deg() {

    const apexAngleDegrees = parseFloat(document.getElementById('apexAngleDegrees').value);
    const heightKm = parseFloat(document.getElementById('heightKm').value);
    // 将顶角从毫弧度转换为弧度
    const apexAngleRad = apexAngleDegrees * Math.PI / 180;;

    // 使用正切函数计算底边边长的一半（单位：千米）
    const halfBaseKm = Math.tan(apexAngleRad / 2) * heightKm;

    // 计算完整的底边边长（单位：千米）
    const baseKm = 2 * halfBaseKm;

    if(baseKm>1){
        document.getElementById('result_L').innerHTML = `<p>L=：${baseKm.toFixed(4)}km</p>`;
    }
    else if(baseKm>0.001)
    {
        // 将结果转换为米（1千米 = 1,000米）
        const baseM = baseKm * 1000;
        document.getElementById('result_L').innerHTML = `<p>L=：${baseM.toFixed(4)}m</p>`;
    }
    else
    {
        // 将结果转换为毫米（1千米 = 1,000,000毫米）
        const baseMm = baseKm * 1000000;
        document.getElementById('result_L').innerHTML = `<p>L=：${baseMm.toFixed(4)}mm</p>`;
    }

    const degrees = parseFloat(document.getElementById('apexAngleDegrees').value) || 0;
    const milliradians = degrees * 1000 * Math.PI / 180;
    document.getElementById('apexAngleMrad').value = milliradians.toFixed(4);
}
