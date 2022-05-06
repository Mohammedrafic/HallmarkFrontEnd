import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAssociatedDialogComponent } from './edit-associated-dialog.component';

describe('EditAssociatedDialogComponent', () => {
  let component: EditAssociatedDialogComponent;
  let fixture: ComponentFixture<EditAssociatedDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditAssociatedDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAssociatedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
