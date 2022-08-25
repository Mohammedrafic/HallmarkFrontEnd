import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewFeeDialogComponent } from './add-new-fee-dialog.component';

describe('AddNewFeeDialogComponent', () => {
  let component: AddNewFeeDialogComponent;
  let fixture: ComponentFixture<AddNewFeeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddNewFeeDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewFeeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
