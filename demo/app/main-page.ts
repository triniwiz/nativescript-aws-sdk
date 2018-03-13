import * as observable from 'tns-core-modules/data/observable';
import * as pages from 'tns-core-modules/ui/page';
import { HelloWorldModel } from './main-view-model';
import { S3 } from 'nativescript-aws-sdk/s3';
import {isIOS} from 'tns-core-modules/platform'
// Event handler for Page 'loaded' event attached in main-page.xml
export function pageLoaded ( args: observable.EventData ) {
    // Get the event sender
    let page = <pages.Page>args.object;
    page.bindingContext = new HelloWorldModel ();
}

let uploadingFileID;
export function uploadFile ( args ) {
     const s = new S3();
          uploadingFileID =  s.createUpload({
                file:'~/assets/hulk_wolverine_x_men.jpg',
                bucketName :'yaychat',
                key:`ns_${isIOS ? 'ios' : 'android'}_hulk_wolverine_x_men.jpg`,
                acl: 'public-read',
                completed:(error,success) => {
                    if(error){
                        console.log(`Download Failed :-> ${error.message}`);
                    }
                    if(success){
                        console.log(`Download Complete :-> ${success.path}`)
                    }
                },
              progress:(progress)=>{
                    console.log(`Progress : ${progress.value}`);
              }
            });
          console.log(uploadingFileID);
}