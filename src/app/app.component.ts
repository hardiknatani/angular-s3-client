import { Component } from '@angular/core';
import moment from 'moment';
import isEqual from 'lodash-es/isEqual';
import orderBy from 'lodash-es/orderBy';
import { S3Service } from './s3.service';
import { environment } from 'src/environments/environment';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  listView:boolean = false;
  displayFileActions:boolean = false;
  switchingView:boolean = false;
  displayPath:any = [];
  fileList:any = [];
  displayList:any = [];
  bucket:string;
  selectedFile:any;
  fileUploadControl= new FormControl();
  isLoading=false;
  constructor( private s3Service: S3Service) {}

  ngOnInit() {
    this.isLoading=true;
    // get files from server and initialise display to root path
    this.loadFiles()
    .then(() =>{
      this.isLoading=false;
      this.setDisplay([])});


  }

  loadFiles() {
    function fileSizeFormatter(input) {
      if(input) {
        let sizeInMB = input / 1024 / 1024;
        if(sizeInMB.toFixed(2) === '0.00') return '0.01 MB';
        return `${sizeInMB.toFixed(2)} MB`
      }
    }

    return this.s3Service.getFiles()
    .then(res => {
      this.fileList = res;
      this.bucket =environment.S3authorization.bucket;
      
      this.fileList.forEach(file => {
        if(!file.isFolder) file.formattedSize = fileSizeFormatter(file.Size);
        file.formattedDate = moment(file.LastModified).format('YYYY-MM-DD HH:mm');
      })
    })
    .catch(console.log);
  }

  setDisplay(path) {
    let newDepth = path.length;
    console.log(this.fileList)
    this.displayList = this.fileList.filter(file => file.Path.length === newDepth && isEqual(file.Path.slice(0, newDepth), path));
    this.displayList = orderBy(this.displayList, ['isFolder', 'Name'], ['desc', 'asc']);
    this.displayPath = [this.bucket, ...path];
  }

  resetSelected() {
    this.displayList.forEach(item => {item.selected = false})
    this.displayFileActions = false;
  }

  fileClicked(file) {
    this.resetSelected()
    file.selected = true;
    if(!file.isFolder) this.displayFileActions = true;
    this.selectedFile=file
  }

  fileDoubleClicked(file) {
    if(file.isFolder) {
      this.resetSelected();
      let path = [...file.Path, file.Name];
      this.setDisplay(path);
    }
  }

  displayPathClicked(index) {
    this.resetSelected();
    let path = this.displayPath.slice(1,index+1);
    this.setDisplay(path);
  }

  download(){
    this.s3Service.download(this.selectedFile.Key)
  }

  onFileSelected($event){
    this.isLoading=true;
    const file = (event.target as HTMLInputElement).files[0];
    console.log(file);
    this.s3Service.putFileObject(" ",file,file.name).then(data=>{
      console.log(data);
      this.isLoading=false;
      this.loadFiles()
    }).catch((err)=>{
      console.log(err)
      this.isLoading=false;
    }).finally(()=>{
      this.isLoading=false;
    })
  }

  deleteObject(){
    this.s3Service.deleteFile(this.selectedFile.Key)
  }

}
