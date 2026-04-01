import 'reflect-metadata';
import * as fs from 'fs';
import { parse } from 'csv-parse';  // npm install csv-parse
import * as path from 'path';


// run command : npx ts-node -r tsconfig-paths/register src/telemetry-payload/update_telemetry_script.ts 


type CsvRow = {
    id: string;
    metricMetricsattributeid?: string;
    metricMeasure?: string;
};

const FILE_PATH = path.join(__dirname, 'tm.csv');
const METRIC_ATTRIBUTE_ID = 'Daily_Energy';

// project url
const BASE_URL = 'http://localhost:3002/telemetry-payload';

// login token
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImhpdGVuIiwic3ViIjoiaGl0ZW4iLCJyb2xlIjpbeyJpZCI6ImhpdGVuOmFkbWluIiwidXNlcklkIjoiaGl0ZW4iLCJyb2xlSWQiOiJhZG1pbiIsImNyZWF0ZWRCeSI6ImhpdGVuIiwidXBkYXRlZEJ5IjpudWxsLCJkZWxldGVkQnkiOm51bGwsImRlbGV0ZWRBdCI6bnVsbH1dLCJpYXQiOjE3NzA0MzkzNTUsImV4cCI6MTc3MDUyNTc1NX0.qjp1P9QHMt5z8vuQzkfVq66EbGbq3aBU3750wZcgu9Q';

async function readCsv(filePath: string): Promise<CsvRow[]> {
    return new Promise((resolve, reject) => {
        const rows: CsvRow[] = [];

        fs.createReadStream(filePath)
            .pipe(
                parse({
                    columns: true,
                    skip_empty_lines: true,
                    trim: true,
                }),
            )
            .on('data', (row: CsvRow) => {
                rows.push(row);
            })
            .on('end', () => resolve(rows))
            .on('error', (err) => reject(err));
    });
}

async function updateTelemetryPayload(
    id: string,
    metricId: string,
    measure: number,
) {
    const url = new URL(BASE_URL);
    url.searchParams.append('id', id);

    const body = {
        id,
        metric: {
            metricsAttributeId: metricId,
            measure,
        },
    };

    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `HTTP ${response.status} ${response.statusText} - ${errorText}`,
        );
    }
}

async function runUpdate() {
    console.log('connected and in runupdate');

    const rows = await readCsv(FILE_PATH);

    const validRows = rows
        .map((row) => ({
            id: row.id?.trim(),
            measure: Number(row.metricMeasure),
            metricId: row.metricMetricsattributeid?.trim()
        }))
        .filter((r) => r.id && r.measure !== 0 && r.metricId == METRIC_ATTRIBUTE_ID);

    console.log(`Total rows in CSV: ${rows.length}`);
    console.log(`Valid rows to update: ${validRows.length}`);

    let successCount = 0;
    let failCount = 0;

    for (const row of validRows) {
        try {
            await updateTelemetryPayload(row.id!, row.metricId!, row.measure);

            successCount++;
            console.log(
                `Updated: id=${row.id}, metricId=${row.metricId}, measure=${row.measure}`,
            );
        } catch (error) {
            failCount++;
            console.error(
                `Failed: id=${row.id}, metricId=${row.metricId}, measure=${row.measure}`,
                error,
            );
        }
    }

    console.log('Update completed');
    console.log(`Success count: ${successCount}`);
    console.log(`Fail count: ${failCount}`);
}

async function main() {
    try {
        await runUpdate();
    } catch (error) {
        console.error('Error while updating telemetry payload:', error);
    }
}

main();