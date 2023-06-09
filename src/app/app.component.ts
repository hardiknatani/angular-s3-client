import { AfterViewInit, Component, OnInit, ViewChild,HostBinding } from '@angular/core';
import moment from 'moment';
import isEqual from 'lodash-es/isEqual';
import orderBy from 'lodash-es/orderBy';
import { S3Service } from './s3.service';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import {DeleteDialogComponentComponent} from '../delete-dialogs-component/delete-dialog-component.component'
import { ShareModalComponent } from './share-modal/share-modal.component';
import { Observable } from 'rxjs';
import { startWith,map } from 'rxjs/operators';
import { LoginModalComponent } from './login-modal/login-modal.component';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { SnackBarService } from './snackBarService/snack-bar.service';
import { OverlayContainer } from '@angular/cdk/overlay';

export interface TableColumn<T> {
  label: string;
  property: keyof T | string;
  type: 'text' | 'image' | 'badge' | 'progress' | 'checkbox' | 'button' | 'date' | 'custom' | 'number';
  visible?: boolean;
  cssClasses?: string[];
  options?: string[];
  modelValue?: '' | '',
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit,AfterViewInit {
  @BlockUI() blockUI: NgBlockUI;
  toggleControl = new FormControl(false);
  @HostBinding('class') className = '';

  listView:boolean = false;
  displayFileActions:boolean = false;
  switchingView:boolean = false;
  displayPath:any = [];
  fileList:any = [];
  displayList:any = [];
  bucket:string;
  selectedFiles:any;
  fileUploadControl= new FormControl();
  leftSideFlag = true;
  rightSide = 0;
  leftSide = 100;
  dataSource = new MatTableDataSource();
  tableColumns: TableColumn<any>[] = [
    { label: 'Checkbox', property: 'checkbox', type: 'checkbox', visible: true },
    { label: 'Type', property: 'isFolder', type: 'custom', visible: true },
    { label: 'Name', property: 'Name', type: 'text', visible: true },
    { label: 'Last Modified', property: 'LastModified', type: 'date', visible: true },
    { label: 'Size', property: 'formattedSize', type: 'text', visible: true },

  ];  
  selection = new SelectionModel<any>(true, []);
  searchCtrl = new FormControl(null);
  filteredFiles: Observable<string[]>;
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
      // this.selection.isSelected("")?this.selection.
  } 

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.filter((row:any)=>!row.isFolder).length;
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
  constructor(
     private s3Service: S3Service,
     private dialog: MatDialog,
     private snackBarService:SnackBarService,
     private overlay: OverlayContainer
    ) {}

  ngOnInit() {
    this.toggleControl.valueChanges.subscribe((darkMode) => {
      const darkClassName = 'darkMode';
      this.className = darkMode ? darkClassName : '';
      if (darkMode) {
        this.overlay.getContainerElement().classList.add(darkClassName);
      } else {
        this.overlay.getContainerElement().classList.remove(darkClassName);
      }
    });

    if(!this.s3Service.secretAccessKey || !this.s3Service.accessKeyId || ! this.s3Service.region || !this.s3Service.bucketName ){
      this.dialog.open(LoginModalComponent,{
        disableClose:true
      }).afterClosed().subscribe(()=>{
        this.blockUI.start()
        this.ngOnInit()
      })
    }
    else{
    this.blockUI.stop()
    this.loadFiles()
    }

    this.filteredFiles = this.searchCtrl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.Name;
        return name ? this._filter(name as string) : this.fileList.slice();
      }),    );
  }

  ngAfterViewInit(){
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.selection.changed.subscribe(selected=>{
      this.resetSelected()

      this.selectedFiles = this.selection.selected.filter(file=>!file.isFolder)
      if(this.selectedFiles.length>0){
        this.displayFileActions=true;
        if(this.leftSideFlag){
          this.leftSide=70;
          this.rightSide=30;
          this.leftSideFlag=false
        }
      }else{
        this.leftSide=100;
        this.rightSide=0;
        this.leftSideFlag=true
      }
    });


  }

  onSearchEnter(){
    let file = this.searchCtrl.value;
    this.setDisplayPath(file.Path);
    this.selection.clear();
    if(!file.isFolder) this.selection.select(file)
  }

  loadFiles() {
    this.blockUI.start()
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
      this.bucket =this.s3Service.bucketName;
      this.fileList.forEach(file => {
        if(!file.isFolder) file.formattedSize = fileSizeFormatter(file.Size);
        file.formattedDate = moment(file.LastModified).format('YYYY-MM-DD HH:mm');
        });
        this.setDisplayPath([]); 
        this.blockUI.stop()
    })
    .catch((err)=>{
      this.snackBarService.open("Error loading Files",'error',1000)
    });
  }

  setDisplayPath(path) {
    let newDepth = path.length;

    this.displayList = this.fileList.filter(file => file.Path.length === newDepth && isEqual(file.Path.slice(0, newDepth), path));
    this.displayList = orderBy(this.displayList, ['isFolder', 'Name'], ['desc', 'asc']);
    this.displayPath = [this.bucket, ...path];
    this.dataSource.data=this.displayList

  }

  resetSelected() {
    this.displayList.forEach(item => {item.selected = false})
    this.displayFileActions = false;
  }


  fileDoubleClicked(file) {
    if(file.isFolder) {
      this.resetSelected();
      let path = [...file.Path, file.Name];
      this.setDisplayPath(path);
    }
  }

  displayPathClicked(index) {
    this.resetSelected();
    let path = this.displayPath.slice(1,index+1);
    this.setDisplayPath(path);
  }

  download(){
    this.s3Service.download(this.selectedFiles)
  }

  upload(e){
    let folderName = this.displayPath.filter(path=>path!=this.bucket)
    if(folderName.length<1){
      folderName=""
    }else{
      folderName=folderName.join('/')+"/";
    }
    const file = (e.target as HTMLInputElement).files[0];
    this.s3Service.putFileObject(folderName,file,file.name)    
    .then(data=>{
      this.loadFiles()
    })
  }

  deleteObject(){
    this.dialog.open(DeleteDialogComponentComponent,{
      data:{
        fileList:this.selectedFiles
      }
    }).afterClosed().subscribe(confirmed=>{
      if(confirmed){
        this.s3Service.deleteFiles(this.selectedFiles)
      }
    })
    
  }

  async share() {
    this.blockUI.start()
    let urlList = []
    Promise.all(this.selectedFiles.map(async (file) => {
      await this.s3Service.getSingleFileUrl(file.Key).then(url => {
        urlList.push({ name: file.Name, url });
      })
    })).then(() => {
      this.blockUI.stop()

      this.dialog.open(ShareModalComponent, {
        data: {
          fileList: urlList
        },
        autoFocus:false,

      });
    })
  }

  closeDetailsSidebar(){
    this.leftSideFlag=!this.leftSideFlag
    this.leftSide=100
  }


  private _filter(fileName: string): any[] {
    const filterValue = fileName.toLowerCase();

    return this.fileList.filter(file => file.Name.toLowerCase().includes(filterValue));
  }

  displayFn(file: any): string {
    return file && file.Name ? file.Name : '';
  }

}
