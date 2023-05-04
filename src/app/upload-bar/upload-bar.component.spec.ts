import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadBarComponent } from './upload-bar.component';

describe('UploadBarComponent', () => {
  let component: UploadBarComponent;
  let fixture: ComponentFixture<UploadBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
