import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildOrderDialogComponent } from './child-order-dialog.component';

describe('ChildOrderDialogComponent', () => {
  let component: ChildOrderDialogComponent;
  let fixture: ComponentFixture<ChildOrderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChildOrderDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
