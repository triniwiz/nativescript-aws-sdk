import * as observable from 'tns-core-modules/data/observable';
import * as pages from 'tns-core-modules/ui/page';
import { HelloWorldModel } from './main-view-model';
import { S3 } from 'nativescript-aws-sdk/s3';
import { isIOS } from 'tns-core-modules/platform';
import * as fs from 'tns-core-modules/file-system';
import  * as imageSource from 'tns-core-modules/image-source';
import { Image } from 'tns-core-modules/ui/image';
// Event handler for Page 'loaded' event attached in main-page.xml
let page;
let model = new HelloWorldModel();
export function pageLoaded(args: observable.EventData) {
    const Cred = require('./cred.json');
    S3.init(<any>{
        endPoint: '',//Cred.ENDPOINT,
        accessKey: Cred.AWS_ACCESS_KEY,
        secretKey: Cred.AWS_ACCESS_SECRET,
        type: 'static'
    });
  page = <pages.Page>args.object;
  page.bindingContext = model;
}

let uploadingFileID;
let downloadingFileID;
export function uploadFile(args) {
  const s = new S3();
  uploadingFileID = s.createUpload({
    file: '~/assets/hulk_wolverine_x_men.jpg',
    bucketName: 'yaychat',
    key: `ns_${isIOS ? 'ios' : 'android'}_hulk_wolverine_x_men.jpg`,
    acl: 'public-read',
    completed: (error, success) => {
      if (error) {
        console.log(`Upload Failed :-> ${error.message}`);
      }
      if (success) {
        console.log(`Upload Complete :-> ${success.path}`);
        model.set('uploadCompleted',true);
      }
    },
    progress: progress => {
      console.log(`Upload Progress : ${progress.value}`);
        model.set('uploadProgress',progress.value);
    }
  });
}


export function downloadFile(args) {
  if(!model.get('uploadCompleted')) return;
    const s = new S3();
    const tempFile = fs.path.join(fs.knownFolders.temp().path,'hulk_wolverine_x_men.jpg');
    downloadingFileID = s.createDownload({
        file: tempFile,
        bucketName: 'yaychat',
        key: `ns_${isIOS ? 'ios' : 'android'}_hulk_wolverine_x_men.jpg`,
        completed: (error, success) => {
            if (error) {
                console.log(`Download Failed :-> ${error.message}`);
            }
            if (success) {
                console.log(`Download Complete :-> ${success.path}`);
                model.set('imageDownload',success.path);
              const image = page.getViewById('image') as Image;
              console.log(image);
              if(image){
                  image.imageSource = imageSource.fromFileOrResource(success.path);
              }
            }
        },
        progress: progress => {
            console.log(`Download Progress : ${progress.value}`);
            model.set('downloadProgress',progress.value);
        }
    });
}