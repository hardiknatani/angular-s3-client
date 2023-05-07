import { Component, OnInit,Inject,ViewEncapsulation } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { S3Service } from '../s3.service';
import {finalize} from 'rxjs/operators';


@Component({
  selector: 'app-upload-bar',
  templateUrl: './upload-bar.component.html',
  styleUrls: ['./upload-bar.component.scss'],
})
export class UploadBarComponent implements OnInit {

  uploadProgressPercentage:Number=0
  uploadError:boolean=false
  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: {name:string},
  public bottomSheetRef: MatBottomSheetRef<UploadBarComponent>,private s3Service:S3Service) { 
  }

  ngOnInit(): void {


    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
     window.alert("Upload in progress, Please do not close this window.");
      (e || window.event).returnValue = confirmationMessage; 
      return confirmationMessage;                            
    });

    this.s3Service.uploadProgressSubject.pipe(
      finalize(() => {
      })).subscribe(data=>{
      this.uploadProgressPercentage=data;
    }, error => {
      this.uploadError=true;
      let elem:HTMLElement = document.querySelector('.upload-bar-bottom-sheet');
      elem.style.setProperty('box-shadow','0px 8px 10px -5px rgb(255 0 0 / 20%), 0px 16px 24px 2px rgb(255 20 20 / 14%), 0px 6px 30px 5px rgb(255 0 0 / 32%); background: #fff; color: rgba(0,0,0,.87)');      
      window.removeEventListener("beforeunload", function (e) {
        var confirmationMessage = "\o/";
       window.alert("Upload in progress, Please do not close this window.");
        (e || window.event).returnValue = confirmationMessage; 
        return confirmationMessage;                            
      });
    })
  }

}
