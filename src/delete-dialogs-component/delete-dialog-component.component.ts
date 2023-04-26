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
  constructor(@Inject(MAT_DIALOG_DATA) public defaults: any,
    private dialogRef: MatDialogRef<DeleteDialogComponentComponent>,
    private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.title = this.defaults.title;
    this.body = this.defaults.body;
  }
  close(answer: string) {
    this.dialogRef.close(answer);
  }

}
