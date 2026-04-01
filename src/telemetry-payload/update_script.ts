import 'reflect-metadata';
import * as fs from 'fs';
import { parse } from 'csv-parse';
import { DataSource } from 'typeorm';
import { TelemetryPayload } from './entities/telemetry-payload.entity';
import * as path from 'path';


const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'hiten1234',
    database: 'iot',
    synchronize: false,
    logging: false,
});

type CsvRow = {
    id: string;
    metricMetricsattributeid?: string;
    metricMeasure?: string;
};

const FILE_PATH = path.join(__dirname, 'tm.csv');
const METRIC_ATTRIBUTE_ID = 'floor';


// const telemetryPayloadRepo = AppDataSource.getRepository(TelemetryPayload);

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
            .on('data', (row) => {
                rows.push(row);
            })
            .on('end', () => resolve(rows))
            .on('error', (err) => reject(err));
    });
}

// function getMeasureFromRow(row: CsvRow): number | null {
//     const rawValue =
//         row.metricMeasure ??
//         row.metric_measure ??
//         row.Daily_Energy;

//     if (rawValue === undefined || rawValue === null || rawValue === '') {
//         return null;
//     }

//     const num = Number(rawValue);
//     if (Number.isNaN(num)) return null;

//     return num;
// }

async function runUpdate() {
    // const filePath = ''; //filepath 
    console.log("connected and in runupdate");
    // const filePath = path.join(__dirname, 'tm.csv');

    const rows = await readCsv(FILE_PATH);

    const validRows = rows
        .map((row) => ({
            id: row.id?.trim(),
            measure: Number(row.metricMeasure),
        }))
        .filter((r) => r.id && !isNaN(r.measure) && r.measure !== 0);

    // console.log(`Rows to update: ${validRows.length}`);

    let updated = 0;

    for (const row of validRows) {
        // AND "metricMetricsAttributeId" = 'Daily_Energy' use this instead of floor
        const res = await AppDataSource.query(
            `
                UPDATE telemetry_payload
                SET "metricMeasure" = $2
                WHERE id = $1
                AND "metricMetricsattributeid" = $3
            `,
            [row.id, row.measure, METRIC_ATTRIBUTE_ID],
        );

        // console.log(`Updated ${row.id}`);
    }

    // for (const row of validRows) {
    //     const mergedPayload = await telemetryPayloadRepo.preload({
    //         id: row.id,
    //         metric: {
    //             measure: String(row.measure),
    //         },
    //     });

    //     if (!mergedPayload) {
    //         console.log(`Skipped ${row.id} - record not found`);
    //         continue;
    //     }

    //     await telemetryPayloadRepo.save(mergedPayload);
    //     console.log(`Updated ${row.id} -> ${row.measure}`);
    // }
    const r = 2;
    // console.log(`Updated rows: ${updated}`);
}

// async function runUpdate() {
//     const filePath =
//         '/mnt/data/FILLED_SORTED_virtual_device_i_ds_with_zero_daily_energy-2026-03-11_123110 - _FILLED_SORTED_virtual_device_i_ds_with_zero_daily_energy-2026-03-11_123110.csv';

//     const csvRows = await readCsv(filePath);

//     console.log(`Total rows in CSV: ${csvRows.length}`);

//     const validRows = csvRows
//         .map((row) => {
//             const measure = getMeasureFromRow(row);

//             return {
//                 id: row.id?.trim(),
//                 measure,
//             };
//         })
//         .filter((row) => row.id)
//         .filter((row) => row.measure !== null)
//         .filter((row) => row.measure !== 0) as { id: string; measure: number }[];

//     console.log(`Non-zero rows found in CSV: ${validRows.length}`);

//     if (!validRows.length) {
//         console.log('No non-zero Daily_Energy rows found. Nothing to update.');
//         return;
//     }

//     let totalUpdated = 0;
//     let totalSkipped = 0;

//     const batchSize = 500;

//     for (let i = 0; i < validRows.length; i += batchSize) {
//         const batch = validRows.slice(i, i + batchSize);

//         const valuesSql: string[] = [];
//         const params: (string | number)[] = [];

//         batch.forEach((row, index) => {
//             const idParam = index * 2 + 1;
//             const measureParam = index * 2 + 2;

//             valuesSql.push(`($${idParam}::uuid, $${measureParam}::numeric)`);
//             params.push(row.id, row.measure);
//         });

//         /**
//          * IMPORTANT:
//          * Neeche wali query me table/column names apne DB ke actual names ke hisab se verify kar lena.
//          *
//          * Assumption:
//          * - table name = telemetry_payload
//          * - primary key column = id
//          * - metric attribute id column = "metricMetricsattributeid"
//          * - metric measure column = "metricMeasure"
//          *
//          * Agar actual names alag hain, sirf neeche query me replace kar dena.
//          */
//         const result = await AppDataSource.query(
//             `
//       UPDATE telemetry_payload tp
//       SET "metricMeasure" = v.measure
//       FROM (
//         VALUES ${valuesSql.join(', ')}
//       ) AS v(id, measure)
//       WHERE tp.id = v.id
//         AND tp."metricMetricsattributeid" = 'Daily_Energy'
//       `,
//             params,
//         );

//         totalUpdated += batch.length;

//         console.log(
//             `Processed batch ${Math.floor(i / batchSize) + 1} / ${Math.ceil(validRows.length / batchSize)}`,
//         );
//     }

//     console.log({
//         totalCsvRows: csvRows.length,
//         totalEligibleNonZeroRows: validRows.length,
//         updatedCount: totalUpdated,
//         skippedCount: totalSkipped,
//     });
// }


async function main() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected');

        await runUpdate();
    } catch (error) {
        console.error('Error while updating Daily_Energy:', error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('Database connection closed');
        }
    }
}

main();


// AppDataSource.initialize()
//     .then(runUpdate)
//     .then(async () => {
//         await AppDataSource.destroy();
//         process.exit(0);
//     })
//     .catch(async (err) => {
//         console.error('Error while updating Daily_Energy:', err);
//         await AppDataSource.destroy();
//         process.exit(1);
//     });