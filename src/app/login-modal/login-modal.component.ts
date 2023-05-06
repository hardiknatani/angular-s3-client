import { Component, OnInit,Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { S3Service } from '../s3.service';
import { Form, FormControl, FormGroup, Validators } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { SnackBarService } from '../snackBarService/snack-bar.service';
import { AWSError } from 'aws-sdk';
 
@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  form:FormGroup;
  error:boolean;
  errorMessage:string


  constructor(private dialogRef: MatDialogRef<LoginModalComponent>,private s3Service:S3Service, private snackBarService:SnackBarService) {
  this.form=new FormGroup({
    bucketName:new FormControl(null,Validators.required),
    accessKeyId:new FormControl(null,Validators.required),
    secretAccessKey:new FormControl(null,Validators.required),
    region:new FormControl(null,Validators.required),
  })   
  
  }
  ngOnInit(): void {
  }

  

  login() {
    this.error=false;
    this.blockUI.start()
    this.s3Service.bucketName = this.form.get('bucketName').value
    this.s3Service.accessKeyId = this.form.get('accessKeyId').value
    this.s3Service.secretAccessKey = this.form.get('secretAccessKey').value
    this.s3Service.region = this.form.get('region').value

    this.s3Service.validateCredentials().then((data) => {

      this.s3Service.validateBucket().then((data) => {
        this.blockUI.stop()
        this.dialogRef.close()
      }).catch((err: AWSError) => {
        this.blockUI.stop()
        this.error = true;
        this.errorMessage = "Invalid Bucket Name/Cors Policy. Contact your administrator.";
        this.snackBarService.open("Invalid Bucket Name/CORS Policy", "error", 1000)
      })

    }).catch((err: AWSError) => {
      this.blockUI.stop()
      this.error = true;
      this.errorMessage = "Invalid Credentials";
      this.snackBarService.open(err.statusCode.toString() + " Invalid Credentials" , "error", 1000)

})

    }

  close(){
    this.dialogRef.close()
  }

}
