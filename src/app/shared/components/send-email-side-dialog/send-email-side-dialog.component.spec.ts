import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendEmailSideDialogComponent } from './send-email-side-dialog.component';

describe('SendEmailSideDialogComponent', () => {
  let component: SendEmailSideDialogComponent;
  let fixture: ComponentFixture<SendEmailSideDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SendEmailSideDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SendEmailSideDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
