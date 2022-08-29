import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertsEmailTemplateFormComponent } from './alerts-email-template-form.component';

describe('AlertsEmailTemplateFormComponent', () => {
  let component: AlertsEmailTemplateFormComponent;
  let fixture: ComponentFixture<AlertsEmailTemplateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlertsEmailTemplateFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertsEmailTemplateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
