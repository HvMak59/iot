import { CalcFrequency, MathOperator, MetricsFrequency } from "src/utils/enums";
import { Metric } from "./metric.entity";

export class Metrics {

    metrics: Metric[];
    //stripValues: boolean = false;


    constructor(metrics: Metric[]) {
        this.metrics = metrics;
    }

    aggregate(mathOperator: MathOperator) {
        const values: number[] = [];
        try {
            for (const metric of this.metrics) {
                values.push(Number(metric.measure));
            }
        } catch (error: any) {
            throw new Error(error.toString());
        }
        let aggregatedValue = 0;
        switch (mathOperator) {
            case MathOperator.sum:
                aggregatedValue = values.reduce((a, b) => a + b, 0);
                break;

            case MathOperator.avg:
                const useValues = values.length > 0 ? values : [0];
                aggregatedValue = useValues.reduce((a, b) => a + b, 0) / useValues.length;
                break;
            case MathOperator.nonZeroAvg:
                const nonZeroValues = values.length > 0 ? values.filter(v => v !== 0) : [0];
                aggregatedValue = nonZeroValues.length > 0 ? nonZeroValues.reduce((a, b) => a + b, 0) / nonZeroValues.length : 0;
                break;

            case MathOperator.max:
                aggregatedValue = Math.max(...values);
                break;

            case MathOperator.min:
                aggregatedValue = Math.min(...values);
                break;

            case MathOperator.count:
                aggregatedValue = values.length;
                break;

            default:
                throw new Error(`Unsupported math operator: ${mathOperator}`);
        }
        return aggregatedValue;
    }
}