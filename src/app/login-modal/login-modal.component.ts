import { Component, OnInit,Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { S3Service } from '../s3.service';
import { Form, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent implements OnInit {

  form:FormGroup;

  constructor(private dialogRef: MatDialogRef<LoginModalComponent>,private s3Service:S3Service) {
  this.form=new FormGroup({
    bucketName:new FormControl(null,Validators.required),
    accessKeyId:new FormControl(null,Validators.required),
    secretAccessKey:new FormControl(null,Validators.required),
    region:new FormControl(null,Validators.required),
  })   
  
  }
  ngOnInit(): void {
  }

  

  login(){
    this.s3Service.bucketName=this.form.get('bucketName').value
    this.s3Service.accessKeyId= this.form.get('accessKeyId').value
    this.s3Service.secretAccessKey= this.form.get('secretAccessKey').value
    this.s3Service.region= this.form.get('region').value

this.s3Service.validateBucket().then((data)=>{
  // console.log(data)
  this.dialogRef.close()
}).catch(err=>{
  // console.log(err)
})

  }

  close(){
    this.dialogRef.close()
  }

}
