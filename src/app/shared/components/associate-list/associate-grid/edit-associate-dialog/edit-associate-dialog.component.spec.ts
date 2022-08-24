import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAssociateDialogComponent } from './edit-associate-dialog.component';

describe('EditAssociateDialogComponent', () => {
  let component: EditAssociateDialogComponent;
  let fixture: ComponentFixture<EditAssociateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditAssociateDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAssociateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
