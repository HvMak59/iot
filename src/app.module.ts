import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
// import { RolesGuard } from './common';
import { JwtAuthGuard } from './auth/entities/jwt-auth-guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TelemetryPayloadModule } from './telemetry-payload/telemetry-payload.module';
import { CurrentTelemetryPayloadModule } from './current-telemetry-payload/current-telemetry-payload.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { VirtualDeviceModule } from './virtual-device/virtual.device.module';
import { DeviceTypeModule } from './device-type/device-type.module';
import { DeviceModelModule } from './device-model/device-model.module';
import { AlertModule } from './alert/alert.module';
import { CurrentOpenAlertModule } from './current-open-alert/current-open-alert.module';
import { DeviceModule } from './device/device.module';
import { DeviceManufacturerModule } from './device-manufacturer/device-manufacturer.module';
import { DeviceModelAlertModule } from './device-model-alert/device-model-alert.module';
import { MetricsModule } from './metrics/metrics.module';
import { MetricsAttributeModule } from './metrics-attribute/metrics-attribute.module';
import { UserModule } from './user/user.module';
import { UserRoleModule } from './user-role/user-role.module';
import { DeviceTypeMetricsAttributeModule } from './Asset Current Performance Source/device-type-metrics-attribute/device-type-metrics-attribute.module';
import { AssetModule } from './asset/asset.module';
import { WebsocketModule } from './websocket/websocket.module';
import { IotServerModule } from './iot-server/iot-server.module';
import { AlertMasterModule } from './alert-master/alert-master.module';
import { AlertMasterIdentifierModule } from './alert-master-identifier/alert-master-identifier.module';
import { MetricsAttributeAdaptorModule } from './metrics-attribute-adaptor/metrics-attribute-adaptor.module';
import { MetricsAttributeFormulaModule } from './metrics-attribute-formula/metrics-attribute-formula.module';
import { DeviceModelMetricsAttributeFormulaModule } from './device-model-metrics-attribute-formula/device-model-metrics-attribute-formula.module';
import { OrgUserModule } from './org-user/org-user.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { CronJobsModule } from './cron-jobs/cron-jobs.module';
// import { SmsModule } from './sms/sms.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', 'hiten1234'),
        database: config.get('DB_NAME', 'hermes'),
        autoLoadEntities: true,
        // synchronize: config.get('NODE_ENV') !== 'production',
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'your-secret'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    VirtualDeviceModule,
    DeviceTypeModule,
    TelemetryPayloadModule,
    CurrentTelemetryPayloadModule,
    DeviceModelModule,
    AlertModule,
    CurrentOpenAlertModule,
    CurrentTelemetryPayloadModule,
    DeviceModule,
    DeviceManufacturerModule,
    DeviceModelAlertModule,
    DeviceTypeModule,
    DeviceTypeMetricsAttributeModule,
    MetricsModule,
    MetricsAttributeModule,
    TelemetryPayloadModule,
    UserModule,
    UserRoleModule,
    VirtualDeviceModule,
    AssetModule,
    WebsocketModule,
    WhatsAppModule,
    IotServerModule,
    AlertMasterModule,
    AlertMasterIdentifierModule,
    MetricsAttributeAdaptorModule,
    MetricsAttributeModule,
    MetricsAttributeFormulaModule,
    DeviceModelMetricsAttributeFormulaModule,
    OrgUserModule,
    CronJobsModule
  ],
  // providers: [
  //   {
  //     provide: APP_GUARD,
  //     useClass: JwtAuthGuard, // authentication
  //   },
  //   {
  //     provide: APP_GUARD,
  //     useClass: RolesGuard, // authorization
  //   },
  // ]
})
export class AppModule { }




// Pgadmin pass: hiten1234

// For Andhra : 
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/LNGStrg/RtBn1/Andh1/inf -u hermes -P 4iHuC+=NL6R*t7=YU6Ew
// mosquitto_sub -h hermesmqtt.com -t test1234 -u hermes -P 4iHuC+=NL6R*t7=YU6Ew
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/DrRtvAttaV1/info/2026010016 -u hermes -P 4iHuC+=NL6R*t7=YU6Ew
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/DrRtvAttaV1/info/2026010016 -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" | jq 'select(.deviceId == "2026010016")'
// 

// punasan :
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/NwDrHuRtvSlrV1/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" | jq -c "select(.device_id == \"2025100002\")"
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/NwDrHuRtvSlrV2/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" | jq -c "select(.device_id == \"2025100002\")"
// mosquitto_sub -h hermesmqtt.com -t HermesIOT/DrRtvGrwtV1/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" | jq -c "select(.device_id == \"2026010016\")"
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/DrTvaVFDV1/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" | jq -c "select(.device_id == \"117125013474\")"

// mosquitto_sub -h hermesmqtt.com -t test1234 -u hermes -P "4iHuC+=NL6R*t7=YU6Ew"


// corona 
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/NwDrHuRtvSlrV2/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" | jq -c "select(.device_id == \"2025100002\")"

// 2025100002 - 1,2,3
// 2025100003 - 1,2,3,4  (2025100003 ma slave id 4 not coming)
// 2025100004 - 1,2,3    (2025100004 ma slave id 1,2 not coming)
// 2025100005 - 5,6,7    


// Twadartham 
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/DrTvaVFDV1/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" | jq -c "select(.DID == \"117126220818\")"
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/DrTvaVFDV1/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" | jq -c "select(.DID == \"117126220825\")"

// {"RID":1,"DID":"117125013481","IMEI":"866082073599459","PV":553.7,"PI":8.0,"MV":377.0,"MI":8.0,"MP":4.3,"MF":50.0,"MR":3000,"MRH":0.5,"TMRH":0.5,"LPM":296,"TKWH":2.1,"TLKWH":2.1,"TKL":8.4,"TKLH":8.4,"RUN":1,"FAULT":0,"TMP":41.4,"LAT":0.0,"LON":0.0,"INT":10,"SIG":80,"LGT":"2026-02-07 17:02:38"}

// {"RID":1,"DID":"117125013481","IMEI":"866082073599459","PV":539.3,"PI":8.2,"MV":377.0,"MI":8.0,"MP":4.3,"MF":50.0,"MR":3000,"MRH":0.6,"TMRH":0.6,"LPM":296,"TKWH":2.8,"TLKWH":2.8,"TKL":11.4,"TKLH":11.4,"RUN":1,"FAULT":0,"TMP":41.2,"LAT":0.0,"LON":0.0,"INT":10,"SIG":70,"LGT":"2026-02-07 17:12:53"}

// {"RID":1,"DID":"117125013480","IMEI":"866082073736127","PV":531.9,"PI":8.3,"MV":377.0,"MI":8.0,"MP":4.3,"MF":50.0,"MR":3000,"MRH":0.2,"TMRH":0.2,"LPM":296,"TKWH":0.7,"TLKWH":0.7,"TKL":3.0,"TKLH":3.0,"RUN":1,"FAULT":0,"TMP":40.2,"LAT":0.0,"LON":0.0,"INT":10,"SIG":64,"LGT":"2026-02-07 17:28:25"}

// {"RID":1,"DID":"117125013480","IMEI":"866082073736127","PV":532.0,"PI":8.3,"MV":377.0,"MI":8.0,"MP":4.3,"MF":50.0,"MR":3000,"MRH":0.3,"TMRH":0.3,"LPM":296,"TKWH":1.5,"TLKWH":1.5,"TKL":5.9,"TKLH":5.9,"RUN":1,"FAULT":0,"TMP":39.7,"LAT":0.0,"LON":0.0,"INT":10,"SIG":67,"LGT":"2026-02-07 17:38:40"}



// Talod : 
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/LNGStrg/AtrBrns/Tld1/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew"
// Wifi pass : Hardik@123 

// PSI : 
// GPRB/202526/1/76481
// confirmaion no : 97327152


// Ojas : 
// Regd : 37302843
// PSI (Wireless): GPRB/202526/2/4454
// confirmation no : 97789923

// ngrok installation : 
// choco install ngrok -y
// ngrok config add-authtoken your-auth-token(this will be from ngrok login account)


// to use sequence we need to create it : 
// CREATE SEQUENCE ticket_seq;


// for email : 
// npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs nodemailer
// npm install --save-dev @types/bcryptjs


// Election : 
// EPIC : NHJ2231512


// 1 - ivt,invt
// 2 - invt , sngr
// 3 - invt, invt, sngr
// 4 - grwt, grwt
// 5 - invt, invt
// 6 - sngrw 


// Gitlab 
// git clone https://gitlab.com .....
// cd apni-repo
// git pull origin main
// git checkout -b 'branch-name'
// now make changes in file 
// git status  ye command esa kuch dikhayega modified: config/prod.json
// git add .
// git commit -m "Update MQTT host in prod config"
// git push origin 'branch-name'


// For Login 
// Request
// → LocalAuthGuard
// → LocalStrategy.validate()
// → User returned
// → AuthService.login()
// → JWT generated
// → Response


// For Protected route 
// Request
// → JwtAuthGuard.canActivate()
// → Passport JWT verification
// → JwtStrategy.validate()
// → request.user set
// → RolesGuard.canActivate()
// → Role check
// → Controller method
// → Response

// sebi :
// 1401000207 
// 717051567


// License : 3185254025
// GJ02 /0023994/2025

// New License : 764000026

// cg (crompton grave) drive - check rmu with this drive 




// (node:1724) [DEP0190] DeprecationWarning: Passing args to a child process with shell option true can lead to security vulnerabilities, as the arguments are not escaped, only concatenated.
// (Use `node --trace-deprecation ...` to show where the warning was created)



// 117126220818  
// 117126220818

// {"RID":1,"DID":"117126220818","IMEI":"869833088405372","PV":409.0,"PI":0.3,"MV":318.0,"MI":0.2,
// "MP":0.1,"MF":46.0,"MR":1380,"MRH":0.5,"TMRH":0.0,"LPM":6,"TKWH":0.0,"TLKWH":0.2,"TKL":0.0,
// "TKLH":0.3,"RUN":1,"FAULT":0,"TMP":0.0,"LAT":23.251022,"LON":72.631867,"INT":10,"SIG":45,
// "LGT":"2026-02-16 10:15:06"}





// aa link upr jai windows mate exe file donwload kri install kri do 
// pchi ....chatgpt ma lkho ke how to install jq .....aa install kri do 

// bnne install thai jay etle  command prompt ma aa run kri do 

// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/DrTvaVFDV1/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" | jq -c "select(.DID == \"117126220825\")"




// PAN :
// DYCPM3929M
// Token : 0199651040
// Acknowledgement No: 881153215898561




// "start:dev": "nest start --watch",


// plc no photo 
// exiting modbus card ma kya kya devices lgela chhe   











// "id"	"alertId"	"alertType"	"message"	"possibleCause"	"proposedSolution"	"deviceModelId"	"rmuDeviceModelId"	"searchTerm"	"createdBy"	"updatedBy"	"deletedBy"	"auditDateTimeCreatedat"	"auditDateTimeUpdatedat"	"auditDateTimeDeletedat"
// "Hermes Technologies:Gan HSRP V1::HrmsHsrpDPO"	"HrmsHsrpDPO"	0	"Down pressure overshoot"			"Hermes Technologies:Gan HSRP V1"		"Hermes Technologies:Gan HSRP V1::HrmsHsrpDPO:Down pressure overshoot::"	"dsmaniar"			"2025-02-24 12:02:30.43652+05:30"	"2025-02-24 12:02:30.43652+05:30"




// http://localhost:3002/metrics-attribute-adaptor/findAllWithMetricsAttribute?
// dataModelAdaptorId=TvaV1&csvDeviceTypeIds=dt1&csvDeviceModelIds=mfg1%3Adt1%3Adm1


// assetID=Lift
// csvVirtualDeviceIDs=Lift:vd
// closeDateTime=1774241106000   




//           {
//             "id": "AryaIndustries:ElevatorController:Inno1000:12345678",
//             "ownerOrgId": "7f9a0c31-0985-4f0e-813d-d467e8a716c7",
//             "virtualDeviceId": "ElevatorTest1:Inno1000",
//             "serialNo": "12345678",
//             "clientDeviceId": "EC-23456789",
//             "deviceModelId": "AryaIndustries:ElevatorController:Inno1000",
//             "deviceModelStateId": null,
//             "deviceModelStateTime": null,
//             "iMEI": null,
//             "validateIMEI": true,
//             "phoneNumber": "",
//             "searchTerm": "ElevatorTest1:Inno1000:12345678:EC-23456789:AryaIndustries:ElevatorController:Inno1000::",
//             "createdBy": "dsmaniar",
//             "updatedBy": "dsmaniar",
//             "deletedBy": null,
//             "auditDateTime": {
//                 "createdAt": 1773662003121,
//                 "updatedAt": 1773662003121,
//                 "deletedAt": null
//             },
//             "entityState": {
//                 "hasTelemetry": false,
//                 "hasOpenAlerts": false,
//                 "warningCount": 0,
//                 "faultCount": 0,
//                 "entityStateValue": 2
//             }
//         },






// bhai simple language me btau to ......
//   jo excel hai usme se id column ki value hai vo db table me primary key hai  to hume
//   us id ke according uski metric measure update krni hai sirf metrics_atribute_id Daily_Energy 
//   ke liye hi ...uske alavaa kisi bhi metric ko update nahi krna hai .....and excel me jis metric 
//   attribute id ka measure non zero hai sirf usi metric attribute id ke measure ko update krna hai .......to iske liye humko
//   and ye updation database me krna hai to uske lie service ya script likhke do....you already know i uses typeorm nest js  ts postgres



// BeerensGas Compressor data sheet 
// pt-001 - 40001
// pt-100 - 40005
// pt-400 - 40023
// pt-201 - 40025
// tt-100 - 40003
// tt-400 - 40021
// tt-20  - 40007
// Avg Voltage(LL) - 40059
// Avg Current(A) - 40067
// kWh - 40075 
// Flow rate - 40033
// Suc. Total - 40035
// Total Hour - 40081
// Total Minute - 40083
// Total Second - 40085

// BeerensGas Compressor data sheet 
// pt-001 - 40001
// pt-100 - 40005
// pt-400 - 40023
// pt-201 - 40025
// tt-100 - 40003
// tt-400 - 40021
// tt-20  - 40007
// avgV - 40059
// avgC - 40067
// kWh - 40075 
// flwrt - 40033
// sctn_ttl - 40035
// ttl_hr - 40081
// ttl_mnt - 40083
// ttl_s - 40085


// Key mapping 
// pt-001 - pt-001
// pt-100 - pt-100 
// pt-400 - pt-400
// pt-201 - pt-201
// tt-100 - tt-100
// tt-400 - tt-400
// tt-20  - tt-20
// Avg Voltage(LL) - avgV
// Avg Current(A) - avgC
// kWh - kWh 
// Flow rate - flwrt
// Suction Total - sctn_ttl
// Total Hour - ttl_hr
// Total Minute - ttl_mnt
// Total Second - ttl_s


// Beerens Compressor 
// mosquitto_sub -h hermesmqtt.com -t test1234 -u hermes -P "4iHuC+=NL6R*t7=YU6Ew"
// mosquitto_sub -h hermesmqtt.com -t test1234 -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" | jq -c "select(.device_id == \"2026030006\")"
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/Cmprs/RtBn1/Hlsa/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew"


// {"device_type":"invtr","device_name":"invt","device_id":"2026030006","date":"26/03/2026",
// "time":"14:51:52","time_zone":"Asia/Kolkata","latitude":"0","longitude":"0",
// "software_ver":"SM-1.03.D20_4G","signal_strength":"3","valid":false,
// "data":{"slave_id":"1","pt-001":0,"pt-100":0,"pt-400":0,"pt-201":0,"tt-100":0,
// "tt-400":0,"tt-20":0,"avgV":0,"avgC":0,"kWh":0,"flwrt":0,"sctn_ttl":0,"ttl_hr":0,
// "ttl_mnt":0,"ttl_s":0}}

// Last latest 
// {"device_type":"invtr","device_name":"invt","device_id":"2026030006","date":"18/04/2026",
// "time":"17:45:55","time_zone":"Asia/Kolkata","latitude":"0","longitude":"0",
// "software_ver":"SM-1.03.2.D20_4G","signal_strength":"5","valid":false,"data":{"slave_id":"1",
// "InGasPrs":0,"1StgDscPrs":0,"2StgDscPrs":0,"PrtyLnPrs":0,"1StgDscTmp":0,"2StgDscTmp":0,
// "OilTnkTmp":0,"AvgVltLL":0,"AvgCrnt":0,"TtlKwh":0,"SctnFlwRt":0,"SctnFlwTtl":0,"TtlHr":0,
// "TtlMin":0,"TtlSec":0,"RdyToStrt":0,"CmpOn":0,"CmpOff":0,"InGsPrsHAl":0,"InGsPrsLAl":0,
// "InGsPrsHTrp":0,"InGsPrsLTrp":0,"1StgDscTmpHAl":0,"1StgDscTmpLAl":0,"1StgDscTmpHTrp":0,
// "1StgDscTmpLTrp":0,"1StgDscPrsHAl":0,"1StgDscPrsLAl":0,"1StgDscPrsHTrp":0,"1StgDscPrsLTrp":0,
// "OilTnkTmpHAl":0,"OilTnkTmpLAl":0,"OilTnkTmpHTrp":0,"OilTnkTmpLTrp":0,"GD1HAl":0,"GD1LAl":0,
// "GD1HTrp":0,"GD1LTrp":0,"FD1HAl":0,"FD1LAl":0,"FD1HTrp":0,"FD1LTrp":0,"2StgDscTmpHAl":0,
// "2StgDscTmpLAl":0,"2StgDscTmpHTrp":0,"2StgDscTmpLTrp":0,"2StgDscPrsHAl":0,"2StgDscPrsLAl":0,
// "2StgDscPrsHTrp":0,"2StgDscPrsLTrp":0,"PrtyMLnPrsHAl":0,"PrtyMLnPrsLAl":0,"PrtyMLnPrsHTrp":0,
// "PrtyMLnPrsLTrp":0}}

// 9328152924


// Standalone Script :
// npx ts-node -r tsconfig-paths/register src/telemetry-payload/update_telemetry_script.ts


// E:\Downloads\zz\mohammd_final\zip\genetiq-beta-feat-dt 


// Election reference : 
// NHJ1086842
// S06023O8C0404261200001

// Passport : 
// Id: SANTOSH.MAKWANA8592@GMAIL.COM
// Password : Senti.Mak1
// Adhar : 933197563481
// Reference Number : 26-0059357808



// good = beneficial,positive,
// develop = cultivate

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
  
// {"device_type":"invtr","device_name":"invt","device_id":"2026030006",
// "date":"08/04/2026","time":"17:32:51","time_zone":"Asia/Kolkata","latitude":"0",
// "longitude":"0","software_ver":"SM-1.03.D20_4G","signal_strength":"3","valid":true ,
// "data":{
//    "slave_id":"1","pt-001":178.500,"pt-100":248.500,"pt-400":666.000,"pt-201":111.900,
//   "tt-100":269.500,"tt-400":355.600,"tt-20":470.500,"avgV":877.500,"avgC":951.700,"kWh":399.600,
//   "flwrt":666.800,"sctn_ttl":177.900,"ttl_hr":127.500,"ttl_mnt":690.600,"ttl_s":336.000
// }}


// 00001 - > uint16ba , holding register 


// Jyotindra 
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/NwDrHuRtvSlrV2/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew"
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/NwDrHuRtvSlrV2/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" | jq -c "select(.device_id == \"2026010008\")"

// {"device_type":"invtr1","device_name":"huwai","device_id":"2026030003","date":"22/04/2026",
// "time":"09:40:28","time_zone":"Asia/Kolkata","latitude":"0","longitude":"0",
// "software_ver":"SM-1.03.1.D20_4G","signal_strength":"3","valid":true ,"data":{"slave_id":"2",
// "srNo":"2101076532WPR9057340","pv1":1082.800,"pc1":0.000,"pv2":1082.800,"pc2":9.850,
// "pv3":1081.500,"pc3":10.010,"pv4":1081.500,"pc4":10.080,"pv5":1075.600,"pc5":0.000,
// "pv6":1075.600,"pc6":0.000,"pv7":1075.600,"pc7":10.000,"pv8":1075.600,"pc8":10.140,
// "pv9":1073.300,"pc9":9.990,"pv10":1082.600,"pc10":10.140,"pv11":1082.600,"pc11":10.020,
// "pv12":1082.600,"pc12":9.990,"pv13":1082.600,"pc13":9.880,"pv14":1085.000,"pc14":0.000,
// "pv15":1086.100,"pc15":0.000,"pv16":1086.100,"pc16":10.070,"pv17":1086.100,"pc17":9.920,
// "pv18":1086.100,"pc18":9.960,"pv19":1080.400,"pc19":0.000,"pv20":1071.600,"pc20":10.170,
// "pv21":1071.600,"pc21":0.000,"pv22":1071.600,"pc22":0.000,"pv23":1071.600,"pc23":10.030,
// "pv24":1086.100,"pc24":0.000,"pv25":1086.900,"pc25":9.850,"pv26":1086.900,"pc26":9.980,
// "pv27":1086.900,"pc27":9.940,"pv28":1086.900,"pc28":10.050,"gdV1":480.900,"gdV2":477.800,
// "gdV3":482.200,"gdI1":142.322,"gdI2":142.505,"gdI3":142.254,"op":203.984,"pf":1.000,
// "frq":50.020,"invtTmp":45.500

// I will upload my resume. Act as an Al recruiter and Job hunting machine. Analyze my 
// resume in depth to identify the most suitable 2 year experienced or entry-level roles
// I should target in India. Find real companies currently hiring across startups, scale-ups, 
// MNCs, consulting firms, and both tech and non-tech sectors, and provide verified application 
// links for each opportunity. Match every job with my profile and give a fit score out of 100. 
// Create a prioritized job application list categorized into high-probability, 
// medium-probability, and stretch roles. Curate list of jobs with application links atleast 20 


// Moicrosoft CMT ( Research Paper) : 
// url : https://gcek.ac.in/SPICES2026/
// hiten.makwana7698@gmail.com 
// Hitu.Mak592002 


// reena_kumawat22





