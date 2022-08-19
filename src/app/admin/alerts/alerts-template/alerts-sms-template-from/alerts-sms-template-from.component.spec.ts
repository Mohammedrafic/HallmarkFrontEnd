import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertsSmsTemplateFromComponent } from './alerts-sms-template-from.component';

describe('AlertsSmsTemplateFromComponent', () => {
  let component: AlertsSmsTemplateFromComponent;
  let fixture: ComponentFixture<AlertsSmsTemplateFromComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlertsSmsTemplateFromComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertsSmsTemplateFromComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
