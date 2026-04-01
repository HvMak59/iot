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
    IotServerModule,
    AlertMasterModule,
    AlertMasterIdentifierModule,
    MetricsAttributeAdaptorModule,
    MetricsAttributeModule,
    MetricsAttributeFormulaModule,
    DeviceModelMetricsAttributeFormulaModule
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
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/NwDrHuRtvSlrV1/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" | jq -c "select(.device_id == \"2026010016\")"
// mosquitto_sub -h hermesmqtt.com -t HermesIOT/DrRtvGrwtV1/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" | jq -c "select(.device_id == \"2026010016\")"
// mosquitto_sub -h hermesmqtt.com -t HrmsIOT/DrTvaVFDV1/info -u hermes -P "4iHuC+=NL6R*t7=YU6Ew" | jq -c "select(.device_id == \"117125013474\")"

// mosquitto_sub -h hermesmqtt.com -t test1234 -u hermes -P "4iHuC+=NL6R*t7=YU6Ew"


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


// Beerens Compressor 
// mosquitto_sub -h hermesmqtt.com -t test1234 -u hermes -P "4iHuC+=NL6R*t7=YU6Ew"

// {"device_type":"invtr","device_name":"invt","device_id":"2026030006","date":"26/03/2026",
// "time":"14:51:52","time_zone":"Asia/Kolkata","latitude":"0","longitude":"0",
// "software_ver":"SM-1.03.D20_4G","signal_strength":"3","valid":false,
// "data":{"slave_id":"1","pt-001":0,"pt-100":0,"pt-400":0,"pt-201":0,"tt-100":0,
// "tt-400":0,"tt-20":0,"avgV":0,"avgC":0,"kWh":0,"flwrt":0,"sctn_ttl":0,"ttl_hr":0,
// "ttl_mnt":0,"ttl_s":0}}



// Standalone Script :
// npx ts-node -r tsconfig-paths/register src/telemetry-payload/update_telemetry_script.ts


// E:\Downloads\zz\mohammd_final\zip\genetiq-beta-feat-dt 



// Correct file : E:\Downloads\zz\mohammd_final\zip
// @use "@/App/Styles/_mixins" as mixins;

// .Tabs-container {
// 	display: flex;
// 	flex-direction: row;
// 	background-color: #e4ebf9;

// 	&-blue {
// 		background-color: #ffffff;

// 		.active {
// 			svg {
// 				path {
// 					fill: rgb(228, 235, 248);
// 				}
// 			}

// 			.Tabs-tab {
// 				background: rgb(228, 235, 248);
// 			}

// 			&.Tabs-tab-container:last-child .Tabs-tab::after {
// 				background-color: rgb(228, 235, 248);
// 			}
// 		}

// 		.Tabs-tab-container {
// 			&:last-child {
// 				.Tabs-tab::after {
// 					background-color: #ffffff;
// 				}
// 			}
// 		}
// 	}
// }

// .Tabs-tab-container {
// 	display: flex;
// 	position: relative;
// 	height: 40px;
// 	cursor: pointer;

// 	// This negative margin allows the NEXT tab's SVG Left Slope to seamlessly carve out the active shape on top!
// 	&:not(:first-child) {
// 		margin-left: -40px;
// 	}

// 	&:first-child {
// 		.Tabs-tab {
// 			border-top-left-radius: 8px;
// 			margin-left: 1px;
// 			padding-left: 20px;
// 		}

// 		.Tabs-slope-container {
// 			display: none;
// 		}
// 	}

// 	// Provide a slope for the rightmost edge of the final tab
// 	&:last-child {
// 		.Tabs-tab::after {
// 			content: "";
// 			width: 53px;
// 			height: 40px;
// 			top: -1px;
// 			right: 0;
// 			rotate: (180deg);
// 			background-color: #e4ebf9;
// 			position: absolute;
// 			clip-path: path("M29.65 31.2362L14.5656 7.92407C11.3686 2.98327 5.88493 0 0 0V40H45.7592C39.2507 40 33.1858 36.7006 29.65 31.2362Z");
// 			transition: background-color 0.2s ease;
// 		}
// 	}

// 	&:not(.active):hover {
// 		.Tabs-tab {
// 			background: rgb(223, 229, 248);
// 		}

// 		svg {
// 			path {
// 				fill: rgb(223, 229, 248);
// 			}
// 		}

// 		&:last-child .Tabs-tab::after {
// 			background-color: rgb(223, 229, 248);
// 		}
// 	}
// }

// .active {
// 	svg {
// 		path {
// 			fill: white;
// 		}
// 	}

// 	.Tabs-tab {
// 		background: #ffffff;
// 	}

// 	&.Tabs-tab-container:last-child .Tabs-tab::after {
// 		background-color: #ffffff;
// 	}
// }

// .Tabs-tab {
// 	display: flex;
// 	align-items: center;

// 	padding: 6px 50px 3px 20px;
// 	margin-left: -1px;
// 	font-size: 16px;
// 	font-weight: 500;
// 	line-height: 24px;
// 	color: #0b101a;
// 	position: relative;
// 	overflow: hidden;
// 	background: #f5f7fc;
// 	transition: all 0.2s ease;

// 	@include mixins.media_1536 {
// 		padding: 6px 35px 3px 0px;
// 		font-size: 14px;
// 	}

// 	@include mixins.media_1248 {
// 		line-height: 14px;
// 		text-align: center;
// 	}
// }

// .Tabs-slope-container {
// 	rotate: (180deg);

// 	svg {
// 		display: block; // Prevents slight inline spacing rendering issues

// 		path {
// 			transition: all 0.2s ease;
// 		}
// 	}
// }

// :global(body.dark-theme) {
// 	.Tabs-container {
// 		background-color: transparent !important;

// 		&-blue {
// 			background-color: transparent !important;

// 			.Tabs-tab-container:last-child .Tabs-tab::after {
// 				background-color: transparent !important;
// 				opacity: 0;
// 			}

// 			.active {
// 				svg path {
// 					fill: #1e293b !important;
// 				}

// 				.Tabs-tab {
// 					background: #1e293b !important;
// 				}

// 				&.Tabs-tab-container:last-child .Tabs-tab::after {
// 					background-color: #1e293b !important;
// 					opacity: 1 !important;
// 				}
// 			}
// 		}
// 	}

// 	// Default Dark Mode styles (MUST BE ABOVE OVERRIDES TO AVOID SPECIFICITY ISSUES)
// 	.Tabs-tab {
// 		background: #0f172a !important;
// 		color: #94a3b8;
// 		border-color: rgba(255, 255, 255, 0.05);
// 	}

// 	.Tabs-slope-container svg path {
// 		fill: #0f172a !important;
// 	}

// 	// State Overrides
// 	.Tabs-tab-container {
// 		// Default Right Slope Color on Final Tab in Dark Mode
// 		&:last-child .Tabs-tab::after {
// 			background-color: #0f172a !important;
// 			opacity: 1 !important;
// 		}

// 		&:not(.active):hover {
// 			.Tabs-tab {
// 				background: #334155 !important;
// 			}

// 			svg path {
// 				fill: #334155 !important;
// 			}

// 			&:last-child .Tabs-tab::after {
// 				background-color: #334155 !important;
// 				opacity: 1 !important;
// 			}
// 		}
// 	}

// 	.active {
// 		svg path {
// 			fill: #1e293b !important;
// 		}

// 		.Tabs-tab {
// 			background: #1e293b !important;
// 			color: #ffffff;
// 		}

// 		&.Tabs-tab-container:last-child .Tabs-tab::after {
// 			background-color: #1e293b !important;
// 			opacity: 1 !important;
// 		}
// 	}
// }








// 2nd change 
// @use "@/App/Styles/_mixins" as mixins;

// .Tabs-container {
// 	display: flex;
// 	flex-direction: row;
// 	background-color: #e4ebf9;
// 	overflow-x: auto;
// 	overflow-y: hidden;
// 	scrollbar-width: none;
// 	-ms-overflow-style: none;
// 	&::-webkit-scrollbar {
// 		display: none;
// 	}

// 	&-blue {
// 		background-color: #ffffff;

// 		.active {
// 			svg {
// 				path {
// 					fill: rgb(228, 235, 248);
// 				}
// 			}

// 			.Tabs-tab {
// 				background: rgb(228, 235, 248);
// 			}

// 			&.Tabs-tab-container:last-child .Tabs-tab::after {
// 				background-color: rgb(228, 235, 248);
// 			}
// 		}

// 		.Tabs-tab-container {
// 			&:last-child {
// 				.Tabs-tab::after {
// 					background-color: #ffffff;
// 				}
// 			}
// 		}
// 	}
// }

// .Tabs-tab-container {
// 	display: flex;
// 	position: relative;
// 	height: 40px;
// 	cursor: pointer;
// 	flex-shrink: 0;

// 	// This negative margin allows the NEXT tab's SVG Left Slope to seamlessly carve out the active shape on top!
// 	&:not(:first-child) {
// 		margin-left: -40px;
// 	}

// 	&:first-child {
// 		.Tabs-tab {
// 			border-top-left-radius: 8px;
// 			margin-left: 1px;
// 			padding-left: 20px;
// 		}

// 		.Tabs-slope-container {
// 			display: none;
// 		}
// 	}

// 	// Provide a slope for the rightmost edge of the final tab
// 	&:last-child {
// 		.Tabs-tab::after {
// 			content: "";
// 			width: 53px;
// 			height: 40px;
// 			top: -1px;
// 			right: 0;
// 			rotate: (180deg);
// 			background-color: #e4ebf9;
// 			position: absolute;
// 			clip-path: path("M29.65 31.2362L14.5656 7.92407C11.3686 2.98327 5.88493 0 0 0V40H45.7592C39.2507 40 33.1858 36.7006 29.65 31.2362Z");
// 			transition: background-color 0.2s ease;
// 		}
// 	}

// 	&:not(.active):hover {
// 		.Tabs-tab {
// 			background: rgb(223, 229, 248);
// 		}

// 		svg {
// 			path {
// 				fill: rgb(223, 229, 248);
// 			}
// 		}

// 		&:last-child .Tabs-tab::after {
// 			background-color: rgb(223, 229, 248);
// 		}
// 	}
// }

// .active {
// 	svg {
// 		path {
// 			fill: white;
// 		}
// 	}

// 	.Tabs-tab {
// 		background: #ffffff;
// 	}

// 	&.Tabs-tab-container:last-child .Tabs-tab::after {
// 		background-color: #ffffff;
// 	}
// }

// .Tabs-tab {
// 	display: flex;
// 	align-items: center;

// 	padding: 6px 50px 3px 20px;
// 	margin-left: -1px;
// 	font-size: 16px;
// 	font-weight: 500;
// 	line-height: 24px;
// 	color: #0b101a;
// 	position: relative;
// 	overflow: hidden;
// 	white-space: nowrap;
// 	text-overflow: ellipsis;
// 	background: #f5f7fc;
// 	transition: all 0.2s ease;

// 	@include mixins.media_1536 {
// 		padding: 6px 35px 3px 0px;
// 		font-size: 14px;
// 	}

// 	@include mixins.media_1248 {
// 		line-height: 1.2;
// 		text-align: center;
// 		white-space: normal;
// 	}
// }

// .Tabs-slope-container {
// 	rotate: (180deg);

// 	svg {
// 		display: block; // Prevents slight inline spacing rendering issues

// 		path {
// 			transition: all 0.2s ease;
// 		}
// 	}
// }

// :global(body.dark-theme) {
// 	.Tabs-container {
// 		background-color: transparent !important;

// 		&-blue {
// 			background-color: transparent !important;

// 			.Tabs-tab-container:last-child .Tabs-tab::after {
// 				background-color: transparent !important;
// 				opacity: 0;
// 			}

// 			.active {
// 				svg path {
// 					fill: #1e293b !important;
// 				}

// 				.Tabs-tab {
// 					background: #1e293b !important;
// 				}

// 				&.Tabs-tab-container:last-child .Tabs-tab::after {
// 					background-color: #1e293b !important;
// 					opacity: 1 !important;
// 				}
// 			}
// 		}
// 	}

// 	// Default Dark Mode styles (MUST BE ABOVE OVERRIDES TO AVOID SPECIFICITY ISSUES)
// 	.Tabs-tab {
// 		background: #0f172a !important;
// 		color: #94a3b8;
// 		border-color: rgba(255, 255, 255, 0.05);
// 	}

// 	.Tabs-slope-container svg path {
// 		fill: #0f172a !important;
// 	}

// 	// State Overrides
// 	.Tabs-tab-container {
// 		// Default Right Slope Color on Final Tab in Dark Mode
// 		&:last-child .Tabs-tab::after {
// 			background-color: #0f172a !important;
// 			opacity: 1 !important;
// 		}

// 		&:not(.active):hover {
// 			.Tabs-tab {
// 				background: #334155 !important;
// 			}

// 			svg path {
// 				fill: #334155 !important;
// 			}

// 			&:last-child .Tabs-tab::after {
// 				background-color: #334155 !important;
// 				opacity: 1 !important;
// 			}
// 		}
// 	}

// 	.active {
// 		svg path {
// 			fill: #1e293b !important;
// 		}

// 		.Tabs-tab {
// 			background: #1e293b !important;
// 			color: #ffffff;
// 		}

// 		&.Tabs-tab-container:last-child .Tabs-tab::after {
// 			background-color: #1e293b !important;
// 			opacity: 1 !important;
// 		}
// 	}
// }












