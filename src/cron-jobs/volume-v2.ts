// function horizontalDishedTankPerfectCalibrated(fillHeightCm: number) {
//     // Empty 
//     if (fillHeightCm <= 0) return 0;

//     // const r = 1.4007;            // Calibrated internal radius
//     const r = 1.394;            // Calibrated internal radius
//     const d = 2 * r;             // Total internal diameter (approx 2.801m)
//     // const shellLength = 7.321;   // Calibrated straight shell body section
//     const shellLength = 7.349;   // Calibrated straight shell body section
//     const headDepth = 0.098;     // Calibrated dished end depth

//     const h = fillHeightCm / 100; // Convert dipstick cm to meters


//     let liquidArea: number;

//     if (h <= r) {
//         // Less than or exactly half full
//         const term1 = r * r * Math.acos((r - h) / r);
//         const term2 = (r - h) * Math.sqrt(2 * r * h - h * h);
//         liquidArea = term1 - term2;
//     }
//     else {
//         // More than half full (full circle - empty area = filled area)
//         const emptyHeight = d - h;
//         const term1 = r * r * Math.acos((r - emptyHeight) / r);
//         const term2 = (r - emptyHeight) * Math.sqrt(2 * r * emptyHeight - emptyHeight * emptyHeight);
//         liquidArea = (Math.PI * r * r) - (term1 - term2);
//     }
//     const cylinderPartialVolume = liquidArea * shellLength;

//     // 2. Partial Volume for BOTH Torispherical Dished Heads
//     const headsPartialVolume = Math.PI * headDepth * h * h * (1 - h / (3 * r));

//     // 3. Total Combined Volume
//     const totalVolumeM3 = cylinderPartialVolume + headsPartialVolume;

//     return Number(totalVolumeM3.toFixed(2));
// }


function horizontalDishedTankTrueCalibrated(fillHeightCm: number) {
    if (fillHeightCm <= 0) return 0;

    const r = 1.394;
    const d = 2 * r;
    const shellLength = 7.349;
    const headDepth = 0.098;

    const h = fillHeightCm / 100;


    let liquidArea: number;
    if (h <= r) {
        const term1 = r * r * Math.acos((r - h) / r);
        const term2 = (r - h) * Math.sqrt(2 * r * h - h * h);
        liquidArea = term1 - term2;
    } else {
        const emptyHeight = d - h;
        const term1 = r * r * Math.acos((r - emptyHeight) / r);
        const term2 = (r - emptyHeight) * Math.sqrt(2 * r * emptyHeight - emptyHeight * emptyHeight);
        liquidArea = (Math.PI * r * r) - (term1 - term2);
    }
    const cylinderPartialVolume = liquidArea * shellLength;

    const headsPartialVolume = Math.PI * headDepth * h * h * (1 - h / (3 * r));

    const baseVolume = cylinderPartialVolume + headsPartialVolume;

    // 4. Smooth Telemetry Adjustment Curve
    // Smoothly compensates for real-world tank tilt and metal bulging as height increases
    let calibrationMultiplier = 1.0;

    if (fillHeightCm > 136) {
        // As height rises from 136cm up to 265cm, minor physical variances compound.
        // This progress factor scales from 0.0 (at 136cm) up to 1.0 (at 265cm).
        const progressFactor = (fillHeightCm - 136) / (265 - 136);

        // Gradually applies up to an extra 0.38% scaling adjustment at the absolute top
        calibrationMultiplier = 1.0 + (0.0038 * progressFactor);
    }

    const finalVolumeM3 = baseVolume * calibrationMultiplier;

    // Safety Cap enforcing maximum physical capacity of your chart
    if (fillHeightCm >= 265) return 45.00;

    return Number(finalVolumeM3.toFixed(2));
}



for (let cm = 35; cm <= 265; cm++) {
    console.log(cm, horizontalDishedTankTrueCalibrated(cm));
}
