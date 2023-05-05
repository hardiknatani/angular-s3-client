import { Component, OnInit,Inject,ViewEncapsulation } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { S3Service } from '../s3.service';
import {pipe,} from 'rxjs'
import {startWith, map,filter,finalize} from 'rxjs/operators';


@Component({
  selector: 'app-upload-bar',
  templateUrl: './upload-bar.component.html',
  styleUrls: ['./upload-bar.component.css'],
})
export class UploadBarComponent implements OnInit {

  uploadProgressPercentage:Number=0
  uploadError:boolean=false
  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: {name:string},
  private dialogRef: MatBottomSheetRef<UploadBarComponent>,private s3Service:S3Service) { 
    console.log(data)
  }

  ngOnInit(): void {


    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
     window.alert("Do you really want to close");
      (e || window.event).returnValue = confirmationMessage; //Gecko + IE
      return confirmationMessage;                            //Webkit, Safari, Chrome
    });

    this.s3Service.uploadProgressSubject.pipe(
      finalize(() => {
        // this.blockUI.stop();
      })).subscribe(data=>{
        console.log(data)
      this.uploadProgressPercentage=data
    }, error => {
      // this.notificationService.open(error, 'error', 1000);
      // this.uploadProgressPercentage=-1
      this.uploadError=true;
      return error;
    })
  }

}
