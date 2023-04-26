import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeleteDialogComponentComponent } from './delete-dialog-component.component'
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [DeleteDialogComponentComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatTabsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
  ],
  exports: [DeleteDialogComponentComponent],
  entryComponents: [DeleteDialogComponentComponent]
})
export class DeleteDialogsComponentModule { }
