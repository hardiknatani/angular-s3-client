import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteDialogComponentComponent } from './delete-dialog-component.component';

describe('DeleteDialogComponentComponent', () => {
  let component: DeleteDialogComponentComponent;
  let fixture: ComponentFixture<DeleteDialogComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteDialogComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteDialogComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
