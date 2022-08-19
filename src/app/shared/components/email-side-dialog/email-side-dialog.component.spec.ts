import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailSideDialogComponent } from './email-side-dialog.component';

describe('EmailSideDialogComponent', () => {
  let component: EmailSideDialogComponent;
  let fixture: ComponentFixture<EmailSideDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmailSideDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailSideDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
