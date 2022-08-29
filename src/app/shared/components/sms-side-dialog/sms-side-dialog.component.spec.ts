import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsSideDialogComponent } from './sms-side-dialog.component';

describe('SmsSideDialogComponent', () => {
  let component: SmsSideDialogComponent;
  let fixture: ComponentFixture<SmsSideDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmsSideDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmsSideDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
