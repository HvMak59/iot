// // import { AppDataSource } from '../data-source'; // apne project ke hisab se path change kar
// import { UpdateDailyEnergyFromCsvService } from './update_script';
// // import { UpdateDailyEnergyFromCsvService } from './update-daily-energy-from-csv';

// async function bootstrap() {
//   const filePath =
//     '/absolute/path/to/your/file.csv';

//   await AppDataSource.initialize();

//   try {
//     const service = new UpdateDailyEnergyFromCsvService(AppDataSource);
//     await service.run(filePath);
//   } catch (error) {
//     console.error('Error while updating Daily_Energy:', error);
//   } finally {
//     await AppDataSource.destroy();
//   }
// }

// bootstrap();