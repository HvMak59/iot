const radius = 1.394;             // Internal Radius (m)
const diameter = 2 * radius; // 2.788m
const shellLength = 7.349;            // Straight cylinder section (m)

const heightOFGas = 136;
const chartVolume = 22.12;


function calculateHeadDepth(
    radius: number,
    shellLength: number,
    height: number,
    volume: number
) {
    const r = radius;
    const d = 2 * r;
    const h = height / 100;

    let liquidArea: number;
    if (h <= r) {
        liquidArea = (r * r * Math.acos((r - h) / r)) - ((r - h) * Math.sqrt(2 * r * h - h * h));
    } else {
        const emptyHeight = d - h;
        const emptyArea = (r * r * Math.acos((r - emptyHeight) / r)) - ((r - emptyHeight) * Math.sqrt(2 * r * emptyHeight - emptyHeight * emptyHeight));
        liquidArea = (Math.PI * r * r) - emptyArea;
    }

    const cylinderVolume = liquidArea * shellLength;
    const headsVolume = volume - cylinderVolume;
    const denominator = Math.PI * h * h * (1 - h / (3 * r));

    return headsVolume / denominator;
}

const COMPUTED_HEAD_DEPTH = calculateHeadDepth(radius, shellLength, heightOFGas, chartVolume);


export function getTankVolume(fillHeightCm: number) {

    if (fillHeightCm <= 0) return 0;
    if (fillHeightCm >= 265) return 45.00;

    const r = radius;
    const d = diameter;
    const h = fillHeightCm / 100; // Convert to meters

    let liquidArea: number;
    if (h <= r) {
        liquidArea = (r * r * Math.acos((r - h) / r)) - ((r - h) * Math.sqrt(2 * r * h - h * h));
    } else {
        const emptyHeight = d - h;
        const emptyArea = (r * r * Math.acos((r - emptyHeight) / r)) - ((r - emptyHeight) * Math.sqrt(2 * r * emptyHeight - emptyHeight * emptyHeight));
        liquidArea = (Math.PI * r * r) - emptyArea;
    }
    const cylinderPartialVolume = liquidArea * shellLength;

    // Dished Head Caps Volume (Using computed startup constant)
    const headsPartialVolume = Math.PI * COMPUTED_HEAD_DEPTH * h * h * (1 - h / (3 * r));

    let baseVolume = cylinderPartialVolume + headsPartialVolume;

    // Site Installation Corrections (Bottom Tilt & Top Squeeze)
    if (fillHeightCm >= 35 && fillHeightCm < 70) {
        const bottomProgress = (70 - fillHeightCm) / (70 - 35);
        baseVolume += 0.305 * bottomProgress;
    }
    if (fillHeightCm > 136) {
        const topProgress = (fillHeightCm - 136) / (265 - 136);
        baseVolume *= (1.0 + (0.0036 * topProgress));
    }

    return Number(baseVolume.toFixed(2));
}


for (let cm = 35; cm <= 265; cm++) {
    console.log(`${cm} -> ${getTankVolume(cm)}`);
}
