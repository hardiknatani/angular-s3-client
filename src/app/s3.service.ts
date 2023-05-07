import { Injectable } from '@angular/core';
import * as aws from 'aws-sdk'
import * as _ from 'lodash'
import { DeleteObjectsRequest} from 'aws-sdk/clients/s3';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { UploadBarComponent } from './upload-bar/upload-bar.component';
import { ReplaySubject } from 'rxjs';
import { SnackBarService } from './snackBarService/snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class S3Service {
  bucketName;
  accessKeyId;
  secretAccessKey;
  region;

  // bucketName =environment.S3authorization.bucket ;
  // accessKeyId =environment.S3authorization.accessKeyId ;
  // secretAccessKey = environment.S3authorization.secretAccessKey ;
  // region =environment.S3authorization.region ;
  uploadProgressSubject= new ReplaySubject<Number>(0)

validateCredentials(){
aws.config.update({
  accessKeyId:this.accessKeyId,
  secretAccessKey:this.secretAccessKey
})

 let identity = new aws.STS().getCallerIdentity();

return new Promise((resolve,reject)=>{
  identity.send((err,data)=>{
    if(err){
      reject(err)
    }else{
      resolve(data)
    }
   })
})
}


  constructor(private http:HttpClient,private _bottomSheet:MatBottomSheet,private snackBarService:SnackBarService) { }
  public getS3Bucket(): aws.S3 {
    const bucket = new aws.S3(
      {
        
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
        region: this.region
      }
    );
    return bucket;
  }
  deleteFiles(files:any[]) {
    const params:DeleteObjectsRequest = {
      Bucket: this.bucketName,
      Delete:{
        Objects: files.map(file=>{
          return {
            Key:file.Key
          }
        })
      }
    };
    return new Promise((resolve, reject) => {
      this.getS3Bucket().deleteObjects(params, function (err, data) {
        if (err) {
          reject(false);
        }
        else{
          resolve(data);
        }
      });
    });
  }


  putFileObject(folder, file,fileName) {
    this._bottomSheet.open(UploadBarComponent,{
      data:{
      name:fileName
      },
      disableClose:true,
      panelClass:"upload-bar-bottom-sheet",
      hasBackdrop: false,
      closeOnNavigation: true,
      
      });

    const params = {
      Bucket: this.bucketName,
      Key: folder + fileName,
      Body: file
    };

    var options = {
      partSize: 10 * 1024 * 1024,
      queueSize: 1,
    };

      let upload = this.getS3Bucket().upload(params, options);
      upload.on("httpUploadProgress",(progress)=>{
      let progressPercentage = Math.round(progress.loaded / progress.total * 100);
      this.uploadProgressSubject.next(progressPercentage)
    })

    return new Promise((resolve, reject) => {
      const that = this
      upload.send(function (err, data) {
        if (err) {
          reject(false);
          that.uploadProgressSubject.error(err)
          that.snackBarService.open("Upload Failed",'error',1000);
          
        }else{
          resolve(data);
          that.uploadProgressSubject.complete()
          that.snackBarService.open("Upload Successful",'success',1000);

          window.removeEventListener("beforeunload", function (e) {
            var confirmationMessage = "\o/";
           window.alert("Upload in progress, Please do not close this window.");
            (e || window.event).returnValue = confirmationMessage; 
            return confirmationMessage;                            
          });
        }
      });
    });
  }

  download(fileList) {

     let urls =  fileList.map(file=>{
        const params = {
          Bucket: this.bucketName,
          Key: file.Key,
          Expires: 60 * 5,
          ResponseContentDisposition: "attachment"
        };
        return this.getS3Bucket().getSignedUrl('getObject', params);
      })

      urls.forEach(url=>{
        window.open(url, "_blank");
      })
      this.snackBarService.open("Download Started",'success',1000)


  }


  async getSingleFileUrl(key) {
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Expires: 60 * 5,
      ResponseContentDisposition: "attachment"
    };
    return await this.getS3Bucket().getSignedUrl('getObject', params)
  }

  getFiles(){

    let s3 = this.getS3Bucket()      

      let that = this;
      async function getAllObjects() {
        let objects = [];
      
        let params:any = {
          Bucket: that.bucketName,
        };
      
        while (true) {
          const response = await s3.listObjectsV2(params).promise();
        response.Contents.forEach(c=>objects.push(c));
          if (!response.IsTruncated) {
            break;
          }  
          params.ContinuationToken = response.NextContinuationToken;
        }
      
        return objects;
    
      }

      function processNode(object) {
        let isFolder = _.endsWith(object.Key, '/') || object.Size==0;
        let name = getNameFromKey(object.Key);
        let path = getPathFromKey(object.Key);

        let node = {
            ...object,
            Name: name,
            Path: path,
            isFolder: isFolder
        };

        return node;
      }

      function getNameFromKey(key) {
        let t = _.trimEnd(key, '/');
        let i = _.findLastIndex( t, x => x === '/' );
        return _.trim( t.substring(i), '/' );
      }

      function getPathFromKey(key) {
        let t = _.trimEnd(key, '/');
        let i = _.findLastIndex( t, x => x === '/' );
        t = t.substring(0, i);
        let path = _.split(t, '/');
        if(path[0] === '') path = [];
        return path;
      }

          var params = {
            Bucket: this.bucketName
        }; 

          return getAllObjects()
          .then(res => {
            let objects = res;
            let result = [];
            for(let object of objects) {
                let node = processNode(object);
                result.push(node);
            }
            return result;
          })
  }

  validateBucket(){

    const params = {
      Bucket: this.bucketName,
    };

    let check = this.getS3Bucket().headBucket(params)
    return new Promise((resolve, reject) => {
      const that = this
      check.send(function (err, data) {
        if (err) {
          reject(err);
        }
        else{
          resolve(data);
        }
      });
    });
  }


  

}
