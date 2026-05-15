import 'reflect-metadata';
import * as dotenv from 'dotenv';

import {
    getAuthToken,
    getBaseURL,
} from 'src/utils/others';

import { HttpStatus } from '@nestjs/common';

import { winstonStandAloneLogger } from 'src/app_config/serverWinston.config';
import { MetricsFrequency } from 'src/common';

// run command :
// npx ts-node -r tsconfig-paths/register src/stand-alone-scripts/processMaxTelemetryAggregation.ts

const logger = winstonStandAloneLogger('process-max-telemetry-aggregation');

async function processMaxTelemetryAggregation(
    inputDate: string,
    metricsFrequency: MetricsFrequency,
    isCalculationForced: boolean,
    baseUrl: string,
    token: string,
) {

    const fnName = processMaxTelemetryAggregation.name;

    logger.debug(
        `${fnName} : inputDate=${inputDate}, metricsFrequency=${metricsFrequency}, isCalculationForced=${isCalculationForced}`,
    );

    const aggregationURL = new URL(
        'iot-server/max-telemetry-aggregation',
        baseUrl,
    );

    aggregationURL.searchParams.append(
        'inputDate',
        inputDate,
    );

    aggregationURL.searchParams.append(
        'metricsFrequency',
        String(metricsFrequency),
    );

    aggregationURL.searchParams.append(
        'isCalculationForced',
        String(isCalculationForced),
    );

    console.log(`Aggregation URL: ${aggregationURL.toString()}`);
    const response = await fetch(
        aggregationURL,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        },
    );

    if (response.status !== HttpStatus.CREATED && response.status !== HttpStatus.OK) {
        const errorText = await response.text();

        throw new Error(
            `Failed aggregation. Status=${response.status}, Response=${errorText}`,
        );
    }

    return response.json();
}

async function aggregatePeriodicTelemetry() {

    const fnName = aggregatePeriodicTelemetry.name;

    logger.debug(`${fnName} : Start`);

    dotenv.config();

    const scheme = process.env.SCHEMA;
    const appServer = process.env.APP_SERVER;
    const appPort = process.env.APP_PORT;
    const systemUser = process.env.SYSTEM_USER;
    const systemPassword = process.env.SYSTEM_PWD;

    const baseUrl = getBaseURL(scheme, appServer, appPort,);

    logger.debug(`Base URL: ${baseUrl}`);
    console.log(`Base URL: ${baseUrl}`);

    const token = await getAuthToken(baseUrl, systemUser, systemPassword!,);

    console.log(token)
    logger.debug(
        `Authentication token obtained`,
    );

    const response =
        await processMaxTelemetryAggregation(
            '1778818448039',
            1,
            false,
            baseUrl,
            token,
        );

    logger.debug(
        `${fnName} : response=${JSON.stringify(response)}`,
    );

    logger.debug(
        `${fnName} : Completed`,
    );
}

async function main() {

    try {

        await aggregatePeriodicTelemetry();

    } catch (error) {

        logger.error(
            'Error : ',
            error,
        );

    }
}

main();