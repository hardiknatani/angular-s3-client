import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './material.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { S3Service } from './s3.service';
import { DeleteDialogComponentComponent } from 'src/delete-dialogs-component/delete-dialog-component.component';
import { ShareModalComponent } from './share-modal/share-modal.component';
import { LoginModalComponent } from './login-modal/login-modal.component';
import { UploadBarComponent } from './upload-bar/upload-bar.component';
import { BlockUIModule } from 'ng-block-ui';
import { SnackBarService } from './snackBarService/snack-bar.service';

@NgModule({
  declarations: [
    AppComponent,
    DeleteDialogComponentComponent,
    ShareModalComponent,
    LoginModalComponent,
    UploadBarComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    BlockUIModule.forRoot()
  ],
  providers: [S3Service,SnackBarService],
  bootstrap: [AppComponent]
})
export class AppModule {}
