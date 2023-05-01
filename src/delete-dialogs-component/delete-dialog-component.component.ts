import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'delete-dialog-component',
  templateUrl: './delete-dialog-component.component.html',
  styleUrls: ['./delete-dialog-component.component.scss']
})
export class DeleteDialogComponentComponent implements OnInit {
  title = "";
  body = "";
  fileList:any
  constructor(@Inject(MAT_DIALOG_DATA) public data: {fileList:[]},
    private dialogRef: MatDialogRef<DeleteDialogComponentComponent>,
    private cd: ChangeDetectorRef) {
this.fileList=data.fileList
     }

  ngOnInit(): void {

  }
  close(confirrmed: boolean) {
    this.dialogRef.close(confirrmed);
  }

}
