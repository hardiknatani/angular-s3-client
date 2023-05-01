import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { FlexLayoutModule, FlexModule } from '@angular/flex-layout';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { S3Service } from './s3.service';
import { DeleteDialogComponentComponent } from 'src/delete-dialogs-component/delete-dialog-component.component';
import { ShareModalComponent } from './share-modal/share-modal.component';

@NgModule({
  declarations: [
    AppComponent,DeleteDialogComponentComponent, ShareModalComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    FlexModule,
    FlexLayoutModule,
  ],
  providers: [S3Service],
  bootstrap: [AppComponent]
})
export class AppModule {}
