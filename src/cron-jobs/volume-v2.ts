// function horizontalDishedTankTrueCalibrated(fillHeightCm: number) {
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


const a = 'Not working from 35 to 66'
// function horizontalDishedTankTrueCalibrated(fillHeightCm: number) {
//     if (fillHeightCm <= 0) return 0;

//     const r = 1.394;
//     const d = 2 * r;
//     const shellLength = 7.349;
//     const headDepth = 0.098;

//     const h = fillHeightCm / 100;


//     let liquidArea: number;
//     if (h <= r) {
//         const term1 = r * r * Math.acos((r - h) / r);
//         const term2 = (r - h) * Math.sqrt(2 * r * h - h * h);
//         liquidArea = term1 - term2;
//     } else {
//         const emptyHeight = d - h;
//         const term1 = r * r * Math.acos((r - emptyHeight) / r);
//         const term2 = (r - emptyHeight) * Math.sqrt(2 * r * emptyHeight - emptyHeight * emptyHeight);
//         liquidArea = (Math.PI * r * r) - (term1 - term2);
//     }
//     const cylinderPartialVolume = liquidArea * shellLength;

//     const headsPartialVolume = Math.PI * headDepth * h * h * (1 - h / (3 * r));

//     const baseVolume = cylinderPartialVolume + headsPartialVolume;

//     // 4. Smooth Telemetry Adjustment Curve
//     // Smoothly compensates for real-world tank tilt and metal bulging as height increases
//     let calibrationMultiplier = 1.0;

//     if (fillHeightCm > 136) {
//         // As height rises from 136cm up to 265cm, minor physical variances compound.
//         // This progress factor scales from 0.0 (at 136cm) up to 1.0 (at 265cm).
//         const progressFactor = (fillHeightCm - 136) / (265 - 136);

//         // Gradually applies up to an extra 0.38% scaling adjustment at the absolute top
//         calibrationMultiplier = 1.0 + (0.0038 * progressFactor);
//     }

//     const finalVolumeM3 = baseVolume * calibrationMultiplier;

//     // Safety Cap enforcing maximum physical capacity of your chart
//     if (fillHeightCm >= 265) return 45.00;

//     return Number(finalVolumeM3.toFixed(2));
// }


function horizontalDishedTankTrueCalibrated(fillHeightCm: number) {

    if (fillHeightCm <= 0) return 0;
    if (fillHeightCm >= 265) return 45.00;


    const r = 1.394;
    const d = 2 * r;
    const shellLength = 7.349;
    // const headDepth = 0.098;
    const headDepth = calculateHeadDepth(r, shellLength, 136, 22.12);

    const h = fillHeightCm / 100; // Convert dipstick cm to meters


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

    // 3. TORISPHERICAL END CAPS MATH
    const headsPartialVolume = Math.PI * headDepth * h * h * (1 - h / (3 * r));

    // 4. THE COMPINED GEOMETRIC BASELINE
    let baseVolume = cylinderPartialVolume + headsPartialVolume;

    // 5. ZONE A: BOTTOM HEEL OFFSET CALIBRATION (35cm to 70cm)
    // Smoothly dissolves the +0.30 m3 installation heel error as the tank fills up to 70cm
    if (fillHeightCm >= 35 && fillHeightCm < 70) {
        const bottomProgress = (70 - fillHeightCm) / (70 - 35);
        const bottomCorrection = 0.305 * bottomProgress;
        baseVolume += bottomCorrection;
    }

    // 6. ZONE B: TOP TILT MULTIPLIER CALIBRATION (136cm to 265cm)
    // Smoothly applies the +0.36% expansion correction factor up to the safety limit
    if (fillHeightCm > 136) {
        const topProgress = (fillHeightCm - 136) / (265 - 136);
        const calibrationMultiplier = 1.0 + (0.0036 * topProgress);
        baseVolume *= calibrationMultiplier;
    }

    return Number(baseVolume.toFixed(2));
}

const r = 1.394;
const shellLength = 7.349;
console.log(`Dynamically Calculated Head Depth: ${calculateHeadDepth(r, shellLength, 136, 22.12).toFixed(4)} meters`);
// OUTPUT: Dynamically Calculated Head Depth: 0.0981 meters


function calculateHeadDepth(
    radius: number,
    shellLength: number,
    checkpointHeightCm: number,
    checkpointVolumeM3: number
): number {
    const r = radius;
    const d = 2 * r;
    const h = checkpointHeightCm / 100; // Convert to meters

    // 1. Calculate Cylinder Liquid Area at the checkpoint height
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

    // 2. Volume of the straight cylinder body alone
    const cylinderVolume = liquidArea * shellLength;

    // 3. The volume that must belong to the curved heads combined
    const headsVolume = checkpointVolumeM3 - cylinderVolume;

    // 4. Backwards-solve the integrated heads formula for headDepth (a)
    // Formula: V_heads = Math.PI * a * h^2 * (1 - h / (3 * r))
    // Therefore: a = V_heads / (Math.PI * h^2 * (1 - h / (3 * r)))
    const denominator = Math.PI * h * h * (1 - h / (3 * r));
    const computedHeadDepth = headsVolume / denominator;

    return computedHeadDepth; // Returns the exact un-rounded meter value
}


for (let cm = 35; cm <= 265; cm++) {
    console.log(cm, horizontalDishedTankTrueCalibrated(cm));
}
