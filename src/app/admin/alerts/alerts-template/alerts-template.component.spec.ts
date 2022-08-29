import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertsTemplateComponent } from './alerts-template.component';

describe('AlertsTemplateComponent', () => {
  let component: AlertsTemplateComponent;
  let fixture: ComponentFixture<AlertsTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlertsTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertsTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
