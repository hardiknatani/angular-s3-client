import { Injectable } from '@angular/core';
import * as aws from 'aws-sdk'
import * as _ from 'lodash'
import { Buffer } from 'buffer/';

import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class S3Service {

  constructor() { }
  public getS3Bucket(): any {
    const bucket = new aws.S3(
      {
        accessKeyId: environment.S3authorization.accessKeyId,
        secretAccessKey: environment.S3authorization.secretAccessKey,
        region: environment.S3authorization.region
      }
    );
    return bucket;
  }
  deleteFile(filepath) {
    const params = {
      Bucket: environment.S3authorization.bucket,
      Key: filepath
    };
    return new Promise((resolve, reject) => {
      this.getS3Bucket().deleteObject(params, function (err, data) {
        if (err) {
          reject(false);
        }
        resolve(data);

      });
    });
  }

  getFileObject(filepath) {
    const params = {
      Bucket: environment.S3authorization.bucket,
      Key: filepath
    };
    return new Promise((resolve, reject) => {
      this.getS3Bucket().getObject(params, function (err, data) {
        if (err) {
          reject(false);
        }
        resolve(data);

      });
    });
  }
  putFileObject(folder, file,fileName) {
    const params = {
      Bucket: environment.S3authorization.bucket,
      Key: folder + fileName,
      Body: file
    };
    var options = {
      partSize: 10 * 1024 * 1024,
      queueSize: 1,
      ACL: 'bucket-owner-full-control'
    };
    return new Promise((resolve, reject) => {
      const that = this
      this.getS3Bucket().upload(params, options).send(function (err, data) {
        if (err) {
          reject(false);
        }
        resolve(data);
      });
    });
  }

  download(filePath) {
    const params = {
      Bucket: environment.S3authorization.bucket,
      Key: filePath,
      Expires: 60 * 5,
      ResponseContentDisposition: "attachment"
    };
    var url = this.getS3Bucket().getSignedUrl('getObject', params);
    window.open(url, "_blank");
  }


  async getSingleImageUrl(key) {
    const params = {
      Bucket: environment.S3authorization.bucket,
      Key: key
    };
    return await this.getS3Bucket().getSignedUrl('getObject', params);
  }

  getFiles(){

    let s3 = this.getS3Bucket()      

        async function getAllObjects() {
          var params = {
              Bucket: environment.S3authorization.bucket
          }
          return s3.listObjectsV2(params).promise();
      }

      function processNode(object) {
        let isFolder = _.endsWith(object.Key, '/');
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
            Bucket: environment.S3authorization.bucket
        }; 

          return getAllObjects()
          .then(res => {
              let objects = res.Contents;
              let result = [];
              for(let object of objects) {
                  let node = processNode(object);
                  result.push(node);
              }
              return result;
          })
  }

}
