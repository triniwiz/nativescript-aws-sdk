import "./bundle-config";
import * as application from 'tns-core-modules/application';
import  { S3 } from 'nativescript-aws-sdk/s3';
const Cred = require('./cred.json');
S3.init(<any>{endPoint:Cred.ENDPOINT, accessKey:Cred.ACCESS_KEY,secretKey:Cred.ACCESS_SECRET,type:'static',});
application.start({ moduleName: "main-page" });
