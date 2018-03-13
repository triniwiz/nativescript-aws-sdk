import {
    S3Base, S3AuthOptions, S3AuthTypes, S3Regions, S3UploadOptions, StatusCode, UploadEventData, S3EventError,
    ProgressEventData
} from './s3-common';
import * as app from 'tns-core-modules/application';
import * as utils from 'tns-core-modules/utils/utils';
import * as fs from 'tns-core-modules/file-system';
import { isIOS } from 'tns-core-modules/platform';
const main_queue = dispatch_get_current_queue();

// const logger = utils.ios.getter(AWSDDLog,AWSDDLog.sharedInstance);
// logger.logLevel = AWSDDLogLevelVerbose;

export class S3 extends S3Base{
    private static Options: S3AuthOptions;
    private static Operations:Map<number,AWSS3TransferUtilityDownloadTask> = new Map();
    private static OperationsData:Map<number,any> = new Map();
    public static init(options:S3AuthOptions){
    app.on('launch',args => {
       if(isIOS){
           if(!options) return;
           if(options  && !options.type){
               throw new Error('S3AuthType missing');
           }
           S3.Options = options;
           let credentialsProvider;
           let config;
           let serviceRegion;
           let credentialsRegion;
           switch(options.type) {
               case S3AuthTypes.static:
                   let endPoint ;
                   if(!options.endPoint){
                       endPoint = AWSEndpoint.alloc().initWithURLString('https://s3.amazonaws.com');
                   }else{
                       endPoint = AWSEndpoint.alloc().initWithURLString(options.endPoint);
                   }
                   credentialsProvider = AWSStaticCredentialsProvider.alloc().initWithAccessKeySecretKey(options.accessKey,options.secretKey);
                  switch (options.region){
                      case S3Regions.US_WEST_1:
                          serviceRegion = AWSRegionType.USWest1;
                          break;
                      case S3Regions.US_WEST_2:
                          serviceRegion = AWSRegionType.USWest2;
                          break;
                      case S3Regions.US_EAST_1:
                          serviceRegion = AWSRegionType.USEast1;
                          break;
                      case S3Regions.US_EAST_2:
                          serviceRegion = AWSRegionType.USEast2;
                          break;
                      case S3Regions.AP_SOUTH_1:
                          serviceRegion = AWSRegionType.APSouth1;
                          break;
                      case S3Regions.AP_NORTHEAST_1:
                          serviceRegion = AWSRegionType.APNortheast1;
                          break;
                      case S3Regions.AP_NORTHEAST_2:
                          serviceRegion = AWSRegionType.APNortheast2;
                          break;
                      case S3Regions.AP_NORTHEAST_3:
                         // TODO serviceRegion = AWSRegionType.APNorth;
                          serviceRegion = AWSRegionType.Unknown;
                          break;
                      case S3Regions.AP_SOUTHEAST_1:
                          serviceRegion = AWSRegionType.APSoutheast1;
                          break;
                      case S3Regions.AP_SOUTHEAST_2:
                          serviceRegion = AWSRegionType.APSoutheast2;
                          break;
                      case S3Regions.CA_CENTRAL_1:
                          serviceRegion = AWSRegionType.CACentral1;
                          break;
                      case S3Regions.CN_NORTH_1:
                          serviceRegion = AWSRegionType.CNNorth1;
                          break;
                      case S3Regions.CN_NORTHWEST_1:
                          serviceRegion = AWSRegionType.CNNorthWest1;
                          break;
                      case S3Regions.EU_CENTRAL_1:
                          serviceRegion = AWSRegionType.EUCentral1;
                          break;
                      case S3Regions.EU_WEST_1:
                          serviceRegion = AWSRegionType.EUWest1;
                          break;
                      case S3Regions.EU_WEST_2:
                          serviceRegion = AWSRegionType.EUWest2;
                          break;
                      case S3Regions.EU_WEST_3:
                          serviceRegion = AWSRegionType.EUWest3;
                          break;
                      case S3Regions.SA_EAST_1:
                          serviceRegion = AWSRegionType.SAEast1;
                          break;
                      default:
                          serviceRegion = AWSRegionType.Unknown;
                          break;
                  }
                   config =  AWSServiceConfiguration.alloc().initWithRegionEndpointCredentialsProvider(AWSRegionType.USEast1, endPoint,credentialsProvider);
                   break;
               case S3AuthTypes.cognito:
                 //  =  AWSCognitoCredentialsProvider.alloc().ini

                   break;
               default:
                   throw new Error('Invalid S3AuthType');
           }
           const manager = utils.ios.getter(AWSServiceManager,AWSServiceManager.defaultServiceManager);
           config.maxRetryCount = 5;
           config.timeoutIntervalForRequest = 30;
           manager.defaultServiceConfiguration = config;
       }
    });
    }
    public createUpload(options:S3UploadOptions): number{
        const transferUtility = utils.ios.getter(AWSS3TransferUtility,AWSS3TransferUtility.defaultS3TransferUtility);
        const appRoot = fs.knownFolders.currentApp().path;
        let file;
        if(options.file && options.file.startsWith('~/')){
          file  = fs.File.fromPath(fs.path.join(appRoot,options.file.replace('~/','')));
        }else if(options.file && options.file.startsWith('/')){
           file = fs.File.fromPath(options.file);
        }else if(options.file && options.file.startsWith('file:')){
            file = fs.File.fromPath(NSURL.URLWithString(options.file).path)
        }
        const nativeFile = NSURL.fileURLWithPath(file.path);
        const UTIRef = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension,  nativeFile.pathExtension, null);
        const UTI = UTIRef.takeUnretainedValue();
        let mimeType = options && options.mimeType ?  options.mimeType : UTTypeCopyPreferredTagWithClass (<any>UTI, kUTTagClassMIMEType);
        if(typeof mimeType != 'string'){
            mimeType = mimeType.takeUnretainedValue();
        }
        if (!mimeType) {
            mimeType = "application/octet-stream";
        }
        const expression = AWSS3TransferUtilityUploadExpression.new();

        if(options.acl){
            expression.setValueForRequestHeader(options.acl,'x-amz-acl');
        }
        expression.progressBlock = (task,progress)=>{
            const sessionTask = task.sessionTask;
            dispatch_async(main_queue,()=> {
                if ( sessionTask.state === NSURLSessionTaskState.Running ) {
                    const current = Math.floor ( Math.round ( progress.fractionCompleted * 100 ) );
                    if ( S3.Operations.has ( task.taskIdentifier ) ) {
                        const data = S3.OperationsData.get ( task.taskIdentifier );
                        if ( data ) {
                            if ( data.status && data.status !== StatusCode.DOWNLOADING ) {
                                S3.OperationsData.set ( task.taskIdentifier, Object.assign ( {}, data, {
                                    status: StatusCode.DOWNLOADING
                                } ) );
                            }
                            if ( data.progress ) {
                                data.progress ( <ProgressEventData>{
                                    value: current,
                                    currentSize: sessionTask.countOfBytesReceived,
                                    totalSize: progress.totalUnitCount,
                                    speed: 0
                                } )
                            }
                        }
                    }
                } else if ( sessionTask.state === NSURLSessionTaskState.Suspended ) {
                    if ( S3.Operations.has ( task.taskIdentifier ) ) {
                        const data = S3.OperationsData.get ( task.taskIdentifier );
                        if ( data ) {
                            S3.OperationsData.set ( id, Object.assign ( {}, data, {
                                status: StatusCode.PAUSED
                            } ) );
                        }
                    }
                } else if ( sessionTask.state === NSURLSessionTaskState.Canceling ) {
                }
            });

        };
        let id;
      const uploadTask = transferUtility.uploadFileBucketKeyContentTypeExpressionCompletionHandler  (
            NSURL.fileURLWithPath(file.path),
            options.bucketName,
            options.key,
            mimeType,
            expression,
            (task,error)=>{
                if(error){
                    dispatch_async(main_queue,()=>{
                        if(S3.OperationsData.has(task.taskIdentifier)){
                            const currentData = S3.OperationsData.get(task.taskIdentifier);
                            if(currentData && currentData.completed){
                                currentData.completed(<S3EventError>{
                                    status: StatusCode.ERROR,
                                    message: error.localizedDescription
                                }
                            ,null)
                }
            }
    });
                    return null;
                }


                dispatch_async(main_queue,()=>{
                    if(S3.OperationsData.has(task.taskIdentifier)){
                        const currentData = S3.OperationsData.get(task.taskIdentifier);
                        if(currentData && currentData.completed){
                            currentData.completed(null,<UploadEventData>{
                                status: StatusCode.COMPLETED,
                                path : `${currentData.endPoint}/${currentData.bucketName}/${currentData.key}`,
                            })
                        }
                    }
                });


                return null;

            }
        );

      uploadTask.continueWithBlock((awsTask)=>{
          if(awsTask.error){
              console.log(awsTask.error.localizedDescription);
              return null;
          }

         if(awsTask.result){
             id = awsTask.result.taskIdentifier;
             S3.Operations.set(id,awsTask.result);
         }
         return null;
      });
        const manager = utils.ios.getter(AWSServiceManager,AWSServiceManager.defaultServiceManager);
        S3.OperationsData.set(id, {
            status: StatusCode.PENDING,
            path: file.path,
            completed: options.completed,
            progress: options.progress,
            bucketName: options.bucketName,
            key: options.key,
            endPoint: manager.defaultServiceConfiguration.endpoint.URL.absoluteString
        });
      return id;
    }
    public createDownload():number{
        return 0;
    }
    public resume(id:number){
        if(id && S3.Operations.has(id)){
            const task = S3.Operations.get(id);
            task.resume();
        }
    }
    public pause(id:number){
        if(id && S3.Operations.has(id)){
            const task = S3.Operations.get(id);
            task.suspend();
        }
    }
    public cancel(id:number){
        if(id && S3.Operations.has(id)){
            const task = S3.Operations.get(id);
            task.cancel();
        }
    }
}