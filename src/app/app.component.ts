import { AfterContentInit, AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import isEqual from 'lodash-es/isEqual';
import orderBy from 'lodash-es/orderBy';
import { S3Service } from './s3.service';
import { environment } from 'src/environments/environment';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

export interface TableColumn<T> {
  label: string;
  property: keyof T | string;
  type: 'text' | 'image' | 'badge' | 'progress' | 'checkbox' | 'button' | 'date' | 'custom' | 'number';
  visible?: boolean;
  cssClasses?: string[];
  options?: string[];
  modelValue?: '' | '',
  hasPropertyInside?: boolean,
  propertyInside?: string,
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit,AfterViewInit {
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
  leftSideFlag = true;
  rightSide = 0;
  leftSide = 100;
  dataSource = new MatTableDataSource();
  tableColumns: TableColumn<any>[] = [
    { label: 'Checkbox', property: 'checkbox', type: 'checkbox', visible: true },
    { label: 'Name', property: 'Name', type: 'text', visible: true },
    { label: 'Last Modified', property: 'LastModified', type: 'date', visible: true },
    { label: 'Size', property: 'formattedSize', type: 'text', visible: true },
    { label: 'Type', property: 'isFolder', type: 'custom', visible: true },

  ];  
  selection = new SelectionModel<any>(true, []);
  searchCtrl = new FormControl();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  pageSize = 10;
  currentPage=0;
  totalRows = this.dataSource.data.length;
  get visibleColumns() {
    return this.tableColumns.filter(column => column.visible).map(column => column.property);
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach((row:any) => !row.isFolder && this.selection.select(row));

      console.log(this.selection.selected)
  } 

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  } 

  trackByProperty<T>(index: number, column: TableColumn<T>) {
    return column.property;
  }

  onFilterChange(value: string) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  pageChanged(e:PageEvent){
    this.pageSize = e.pageSize;
    this.currentPage = e.pageIndex;
}
  constructor( private s3Service: S3Service) {}

  ngOnInit() {
    this.isLoading=true;
    // get files from server and initialise display to root path
    this.loadFiles()
    .then(() =>{
      this.isLoading=false;
      this.setDisplay([])});


  }

  ngAfterViewInit(){
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.selection.changed.subscribe(selected=>{
      if(this.selection.selected.length==1){
        this.fileClicked(this.selection.selected[0])
      }
    })
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
    .then((res:any) => {
      this.fileList = res;
      this.dataSource.data=res
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
    if(this.leftSideFlag){
      this.leftSide=70;
      this.rightSide=30;
      this.leftSideFlag=false
    }

    this.resetSelected()
    file.selected = true;
    if(!file.isFolder) this.displayFileActions = true;
    this.selectedFile=file
    this.selection.select(file)
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
    console.log(this.displayPath)
    // this.isLoading=true;
    // const file = (event.target as HTMLInputElement).files[0];
    // console.log(file);
    // this.s3Service.putFileObject(" ",file,file.name).then(data=>{
    //   console.log(data);
    //   this.isLoading=false;
    //   this.loadFiles()
    // }).catch((err)=>{
    //   console.log(err)
    //   this.isLoading=false;
    // }).finally(()=>{
    //   this.isLoading=false;
    // })
  }

  deleteObject(){
    this.s3Service.deleteFile(this.selectedFile.Key)
  }

}
