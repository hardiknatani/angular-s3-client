import { Component, OnInit,Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { S3Service } from '../s3.service';
import { Form, FormControl, FormGroup, Validators } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { SnackBarService } from '../snackBarService/snack-bar.service';
import { AWSError } from 'aws-sdk';
import { Observable } from 'rxjs';
import { startWith,map } from 'rxjs/operators';
import { OverlayContainer } from '@angular/cdk/overlay';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss']
})
export class LoginModalComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  form:FormGroup;
  error:boolean;
  errorMessage:string
  awsRegionList=['us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'ca-central-1', 'eu-west-1', 'eu-central-1', 'eu-west-2', 'eu-west-3', 'eu-north-1', 'ap-northeast-1', 'ap-northeast-2', 'ap-southeast-1', 'ap-southeast-2', 'ap-south-1', 'sa-east-1', 'us-gov-west-1', 'us-gov-east-1'];
  filteredOptions: Observable<string[]>;


  constructor(private dialogRef: MatDialogRef<LoginModalComponent>,private s3Service:S3Service, private snackBarService:SnackBarService) {
  this.form=new FormGroup({
    bucketName:new FormControl(null,Validators.required),
    accessKeyId:new FormControl(null,Validators.required),
    secretAccessKey:new FormControl(null,Validators.required),
    region:new FormControl(null,Validators.required),
  })   
  
  }
  ngOnInit(): void {
    this.filteredOptions = this.form.get('region').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.awsRegionList.filter(option => option.toLowerCase().includes(filterValue));
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
