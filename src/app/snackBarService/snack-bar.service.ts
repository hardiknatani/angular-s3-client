import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {

  constructor(private snackBar:MatSnackBar) { }

  open(message: string,type:string,duration?:number) { 
    this.snackBar.open(message, 'Close', { 
       duration: duration, 
       panelClass: [type],
    }); 
  } 
}
