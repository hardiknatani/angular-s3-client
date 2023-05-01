import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { S3Service } from '../s3.service';

@Component({
  selector: 'app-share-modal',
  templateUrl: './share-modal.component.html',
  styleUrls: ['./share-modal.component.css']
})
export class ShareModalComponent implements OnInit {
urlList:any[]=[];
  constructor(@Inject(MAT_DIALOG_DATA) public data: {fileList:any[]},
    private dialogRef: MatDialogRef<ShareModalComponent>,private s3Service:S3Service) {
     this.urlList= data.fileList
     }
  ngOnInit(): void {
  }

  close(){
    this.dialogRef.close()
  }

}
