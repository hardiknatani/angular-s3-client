import { Component, OnInit,Inject,ViewEncapsulation } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { S3Service } from '../s3.service';


@Component({
  selector: 'app-upload-bar',
  templateUrl: './upload-bar.component.html',
  styleUrls: ['./upload-bar.component.css'],
})
export class UploadBarComponent implements OnInit {

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: {fileList:any[]},
  private dialogRef: MatBottomSheetRef<UploadBarComponent>,private s3Service:S3Service) { 
    console.log(data)
  }

  ngOnInit(): void {
  }

}
