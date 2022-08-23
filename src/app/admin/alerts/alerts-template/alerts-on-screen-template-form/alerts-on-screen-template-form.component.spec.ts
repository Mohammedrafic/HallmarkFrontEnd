import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertsOnScreenTemplateFormComponent } from './alerts-on-screen-template-form.component';

describe('AlertsOnScreenTemplateFormComponent', () => {
  let component: AlertsOnScreenTemplateFormComponent;
  let fixture: ComponentFixture<AlertsOnScreenTemplateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlertsOnScreenTemplateFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertsOnScreenTemplateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
