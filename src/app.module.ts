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
// import { DeviceTypeMetricsAttributeModule } from './Asset Current Performance Source/device-type-metrics-attribute/device-type-metrics-attribute.module';
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
import { PeriodTelemetryPayloadAuditModule } from './period-telemetry-payload-audit/period-telemetry-payload-audit.module';
import { GroupModule } from './group/group.module';
import { MetricsAttributeAggregationModule } from './metrics-attribute-aggregation/metrics-attribute-aggregation.module';
import { GroupMetricsAttributeAggregationModule } from './group-metrics-attribute-aggregation/group-metrics-attribute-aggregation.module';
import { VirtualDeviceGroupModule } from './virtual-device-group/virtual-device-group.module';
import { FcmModule } from './fcm/fcm.module';
import { FirebaseModule } from './firebase/firebase.module';
import { SseModule } from './sse/sse.module';
import { DeviceTypeMetricsAttributeModule } from './device-type-metrics-attribute/device-type-metrics-attribute.module';
import { AssetCurrentPerformanceSourceModule } from './asset-current-performance-source/asset-current-performance-source.module';
import { AssetTypeCurrentPerformanceSourceModule } from './asset-type-current-performance-source/asset-type-current-performance-source.module';
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
        // synchronize: true, // for my db use this 
        synchronize: false, // to connect with sir database use these 2 
        migrationsRun: false,
        // logging: true
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
    CronJobsModule,
    PeriodTelemetryPayloadAuditModule,
    GroupModule,
    MetricsAttributeAggregationModule,
    GroupMetricsAttributeAggregationModule,
    VirtualDeviceGroupModule,
    FcmModule,
    FirebaseModule,
    SseModule,

    AssetCurrentPerformanceSourceModule,
    AssetTypeCurrentPerformanceSourceModule
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


// punasan:
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/NwDrHuRtvSlrV1/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" | jq -c "select(.device_id == \"2025100002\")"
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/NwDrHuRtvSlrV2/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" | jq -c "select(.device_id == \"2025100002\")"
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/NwDrHuRtvSlrV2/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" | jq -c "select(.device_id == \"2025050010\")"
// mosquitto_sub -h hermesmqtt.com -t HermesIOT/DrRtvGrwtV1/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" | jq -c "select(.device_id == \"2026010016\")"
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/DrTvaVFDV1/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" | jq -c "select(.device_id == \"117125013474\")"

// mosquitto_sub -h hermesmqtt.com -t test1234 -u hermes -P "4iHuC+=NL6R*t7=YU6Ew"







// {"device_type":"invtr1","device_name":"huwai","device_id":"2025050010","date":"07/05/2026","time":"10:12:31","time_zone":"Asia/Kolkata","latitude":"0","longitude":"0","software_ver":"SM-1.03.D20_4G","signal_strength":"4","valid":true,"data":{"slave_id":"7","srNo":"2101076532WPQ4014326","pv1":1129.000,"pc1":16.960,"pv2":1129.000,"pc2":16.950,"pv3":1129.000,"pc3":0.000,"pv4":1137.900,"pc4":0.000,"pv5":1119.400,"pc5":17.140,"pv6":1119.400,"pc6":0.000,"pv7":1119.400,"pc7":17.390,"pv8":1119.400,"pc8":0.000,"pv9":1113.400,"pc9":0.000,"pv10":1121.600,"pc10":17.440,"pv11":1121.600,"pc11":0.000,"pv12":1121.600,"pc12":17.140,"pv13":1121.600,"pc13":0.000,"pv14":1129.700,"pc14":0.000,"pv15":1118.300,"pc15":17.710,"pv16":1118.300,"pc16":17.450,"pv17":1118.300,"pc17":0.000,"pv18":1118.300,"pc18":0.000,"pv19":1127.700,"pc19":17.620,"pv20":1122.500,"pc20":0.000,"pv21":1122.500,"pc21":8.530,"pv22":1122.500,"pc22":0.000,"pv23":1122.500,"pc23":0.000,"pv24":1120.600,"pc24":8.940,"pv25":1123.200,"pc25":0.000,"pv26":1123.200,"pc26":0.000,"pv27":1123.200,"pc27":0.000,"pv28":1123.200,"pc28":0.000,"gdV1":478.500,"gdV2":476.900,"gdV3":481.700,"gdI1":134.009,"gdI2":133.900,"gdI3":134.574,"op":192.405,"pf":1.000,"frq":49.980,"invtTmp":55.000,"state":512,"al1":0,"al2":0,"al3":0,"al4":0,"al5":0,"ttlE":503566.729,"yE":204651.305,"mE":9747.970,"tdyE":353.690}}
// problem = 1,2,5 inv 




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
// S06023G8C1206261200012


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
// GJ02 /0005273/2026  - new 
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


// Lift 
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/TvaV1/Arya/Lift/InnoV1/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew"

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

// for publish : 
// mosquitto_pub -h hermesmqtt.com -t HrmsIOT/Cmprs/RtBn1/Hlsa/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" -m '{"device_type":"invtr"}'

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
// resume in depth to identify the most suitable 2 year experienced roles
// You should target in India,Europe. Find real companies currently hiring across startups, scale-ups, 
// MNCs and tech sectors, and provide verified application 
// links for each opportunity. Match every job with my profile and give a fit score out of 100. 
// Create a prioritized job application list categorized into high-probability, 
// medium-probability, and stretch roles. Curate list of jobs with application links atleast 20 
// providing yearly package >= 8 LPA


// Moicrosoft CMT ( Research Paper) : 
// url : https://gcek.ac.in/SPICES2026/
// hiten.makwana7698@gmail.com 
// Hitu.Mak592002 





// 96677 lxm  42084 
//  9278664414


// Payal madm car service 


// A single continuous 15-second cinematic long shot inside a sterile, dimly lit public restroom. White subway tiles, large wall mirror, white ceramic sink, flickering fluorescent overhead lights, wet reflective floor.[0:00–0:02] Medium shot. A sophisticated man in a tailored matte black suit and navy silk tie washes his hands at the sink, calm and composed, eyes locked on his reflection in the mirror.[0:02–0:04] In the mirror’s reflection, a broad-shouldered assassin in a dark charcoal tactical suit bursts from a stall and locks a chokehold around the hero from behind. Camera subtly pushes in. Both men slam into the tiled wall. Strained expressions, desperate struggle.[0:04–0:06] The hero drives his elbow back hard, breaks free, spins and seizes the assassin — camera pans fluidly — executing a powerful judo shoulder throw that launches the attacker into a metal stall door with crushing impact. Debris and shadows scatter under flickering lights.[0:06–0:09] Camera drops low, tracks laterally through the brawl — rapid punches, parries, blocks — the hero slips a strike and counters with a devastating blow. Realistic motion blur, gritty handheld energy, sharp focus on determined eyes and gritted teeth.[0:09–0:11] Camera swings wide then CRASHES close — the hero seizes the assassin’s head and drives it into the mirror with full force. Ultra slow-motion: thousands of glass shards explode toward the lens, a massive spiderweb crack blooms across the mirror surface. High contrast, visceral impact, dramatic light burst.[0:11–0:13] Slow camera pull-back. The hero stands tall over the unconscious assassin on the wet restroom floor. He coolly adjusts his silk tie, straightens his blazer. His fractured reflection multiplied across broken mirror shards. Cool-toned cinematic grade.[0:13–0:15] Extreme close-up profile. The hero produces a white handkerchief, wipes a single drop of blood from his lip, takes one final look at his distorted cracked reflection — then walks out of frame. Camera lingers on the shattered mirror. Fade to black.Style: Photorealistic, 4K cinematic, John Wick-inspired gritty elegance, cool blue-grey color grade, shallow depth of field, motivated practical lighting from flickering fluorescents, continuous fluid camera movement throughout, realistic motion blur, high contrast, visceral action choreography, dramatic reflections, handheld cinematic intensity.




// SELECT *
// FROM period_telemetry_payload_audit
// WHERE "metricFrequency" = '1'
//   AND "metricTxncaptureperiod" < CURRENT_DATE
//   AND DATE("auditDateTimeCreatedat") = CURRENT_DATE;


// SELECT *
// FROM period_telemetry_payload_audit
// WHERE "metricFrequency" = '1'
//   AND "metricTxncaptureperiod" < DATE '2026-04-27'
//   AND DATE("auditDateTimeCreatedat") = DATE '2026-04-27';



// SELECT *
// FROM telemetry_payload
// WHERE "metricFrequency" = '1'
//   AND "metricTxncaptureperiod" < DATE '2026-05-07'
//   AND DATE("auditDateTimeCreatedat") = DATE '2026-05-07'
//   AND "virtualDeviceId" = 'Super Specialist Technocrats LLP:SST Inverters'





// VFD onboarding 
// org->asset->device-> asset..virtualdevice-create-rmu1,vfd1 -> 

// create org 
// create asset 


// Raju Gupta : 
//   userid: raaju
//   pasword : raaju123 

// JaiPrakash Keshri :
//   userid: jaiprakash
//   pasword : jaiprakash123

// Manoj Kumar Singh :
//   userid: manojsingh
//   pasword : manojsingh123

// Balkrishna Kushwaha :
//   userid: balkrishna
//   pasword : balkrishna123  

// Shailesh Kushwaha :
//   userid: shaileshkushwaha  
//   pasword : shailesh123


// Summarize this entire project context for continuing in a new chat.
// Include:
// - architecture
// - decisions
// - bugs fixed
// - pending tasks
// - important code


// Post tracking number : EG962447172IN



// firebase admin sdk 


// set GOOGLE_APPLICATION_CREDENTIALS = E: \Downloads\Hiten\iot2\src\firebase




// License No : GJ02 20260005824
// Navy :
// hvmak.59@gmail.com 
// #Money@59$


// Halisa number : 5755042035318


// Digital Instrumental : 
// RequestID :252600000003985727 
// Application No 3985727





// Data Annotation : https://app.dataannotation.tech/workers/inbox?message_type=all

// async function printGrid(url) {
//     const response = await fetch(url);
//     const html = await response.text();

//     const characters = {};
//     let maxX = 0;
//     let maxY = 0;

//     const rowMatches = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
    
//     rowMatches.forEach(row => {
//         const cells = [];
//         const cellMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
//         cellMatches.forEach(cell => {
//             const text = cell.replace(/<[^>]+>/g, '').trim();
//             cells.push(text);
//         });

//         if (cells.length === 3) {
//             const x = parseInt(cells[0]);
//             const char = cells[1];
//             const y = parseInt(cells[2]);
//             if (!isNaN(x) && !isNaN(y) && char) {
//                 characters[`${x},${y}`] = char;
//                 maxX = Math.max(maxX, x);
//                 maxY = Math.max(maxY, y);
//             }
//         }
//     });

//     console.log(`Grid size: ${maxX+1} x ${maxY+1}, Characters found: ${Object.keys(characters).length}`);

//     for (let y = 0; y <= maxY; y++) {
//         let row = '';
//         for (let x = 0; x <= maxX; x++) {
//             row += characters[`${x},${y}`] || ' ';
//         }
//         console.log(row);
//     }
// }

// printGrid("https://docs.google.com/document/d/e/2PACX-1vSvM5gDlNvt7npYHhp_XfsJvuntUhq184By5xO_pA4b_gCWeXb6dM6ZxwN8rE6S4ghUsCj2VKR21oEP/pub");





// To test SSE Events 
// in cmd 
// curl -N "http://localhost:3002/sse/stream?virtualDeviceId=Lift:vd&metricsAttributeId=floor"
// curl -N "http://localhost:3002/sse/stream?virtualDeviceId=Lift:vd&metricsAttributeId=floor&startTime=1777314600000&endTime=1780597800000"
// curl -N "http://localhost:3002/sse/stream?virtualDeviceId=ChitraFilterPlant:ChitraWS1&metricsAttributeId=SolarIrradiance"
// new one 
// curl -N "http://localhost:3002/sse/stream?assetId=ChitraFilterPlant"








// technource : applied.... 9624770438 
// verve systems : applied .... 7069016868
// rysyth technologies : applied.....6356663508
// eximium next : applied
// Hidden Brains Infotechs : applied .... 9898021433


// sejda.com - pdf editing 





// su-prabhat good morning.... ghana time thi content nakhvno plan bnavi ryo to aaj nakhu 
// kal nakhu karta karta 2 year thai gya pan have lage chhe jo even whole week ma 1 vdo post 
// karyo hot to y ghana bdha thai jot ...so dwarkadhish nu name lai ne vlog start kri nakhie..
// so ame loko savare 4 vage mehsana thi nikdya ta mehsana-ahmd-rjkot-jmngr and last ma dwarka
// we apde 11 vgya nu checkin htu to chekcck in kari lidhu....now chakachk room hta ...lemme show you 
// pachi hotel this 36 km dur nageshwar mahadev nu mandir che tya java nikdya....tya sara eva darshan 
// kri ne we went towards ruxmani temple ....etlo mst mahol hato....now journey begins to dwarika
// mandir....tya video shooting allowed nathi so....9.30 sudhi j darshan allowed che ena thi late 
// na javu....one more thing...according to my personal experience nana badako lai ne jvu avoid krvu
// next day moring we went to sudarshan setu.....bhai kharekh jbbr jas mahol hto ahiya .... aa to must
// visit spot che shivraj pur beach javanu htu but bandh htu to e experience rai gyo...and then we 
// went back. 
 



// TelemetryPayloadV3DTO 'src/iot-server/dto/telemetry-payload-v3.dto';
// MetricWithDisplayProperty  dto  'src/iot-server/dto/metric_with_display_property.dto';




// https://pmaymis.gov.in/PMAYMIS2_2024/PMAY_SURVEY/EligiblityCheck.aspx


// theversatilegurl__


// Claude insta :
// You are a content strategist for my Instagram account @[YOUR_INSTAGRAM_HANDLE]. Before giving any strategy, open my Instagram profile tab and analyze the following:


// My last 12 posts (format, topic, estimated engagement)

// Which content styles I use most (Reels vs Carousels vs Static)

// Recurring themes and hooks I already use

// What seems to be working vs underperforming

// My current bio and how well it converts

// Once you have analyzed my profile, use that data to inform everything below. Do not give generic advice every recommendation must be based on what you actually see on my profile.

// My profile context:

// [YOUR AGE]-year-old [FOUNDER / FREELANCER / CREATOR / EMPLOYEE pick one]

// Content niche: [YOUR NICHE e.g. fitness, coding, finance, travel]

// - Target audience: [WHO YOU WANT TO REACH - e.g. beginner developers, gym beginners, startup founders]

// [ANY OTHER PLATFORM OR COMMUNITY - e.g. I also run a newsletter / YouTube / Discord]

// - Current follower count: [X]

// My goals:

// - [GOAL 1 - e.g. grow followers in my niche

// [GOAL 2 - e.g. drive leads for my service/ product]

// [GOAL 3 e.g. grow my community/ newsletter]

// [GOAL 4 e.g. build personal brand around X]

// Now give me:

// **Step 1 - Profile Audit**

// Based on what you see: what's working, what's not, and 3 quick fixes for my bio/ highlights/profile.

// *Step 2 - Content Pillars**

// 1)

// 4-5 pillars with % of weekly distribution and goal of each (attract / nurture / convert / authority). Based on my existing content gaps.

// **Step 3 – Weekly Format Mix**

// Ideal Reels vs Carousels vs Stories vs Posts breakdown per week based on what already performs for me.

// **Step 4 – 1-Week Content Calendar**

// 7 post ideas with: title, format, opening hook (first 3 seconds for Reels or first slide for carousels), and CTA. Make hooks scroll- stopping for [YOUR AUDIENCE].

// **Step 5 - 5 Viral Hook Templates**

// Adapted to [YOUR NICHE] content. Based on hook styles that already work on my page.

// ****Step 6 - Conversion Funnel**

// How my content should flow from cold audience → [YOUR END GOAL e.g. newsletter subscriber / client inquiry / community member].

// **Step 7

// 3 Weekly KPIs**

// Metrics I should track every week to measure

