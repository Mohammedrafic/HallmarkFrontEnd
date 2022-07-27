import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReorderStatusDialogComponent } from './reorder-status-dialog.component';

describe('ReorderStatusDialogComponent', () => {
  let component: ReorderStatusDialogComponent;
  let fixture: ComponentFixture<ReorderStatusDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReorderStatusDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReorderStatusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
