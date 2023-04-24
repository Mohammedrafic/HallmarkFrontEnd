import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgencyReportsComponent } from './agency-reports.component';

describe('AgencyReportsComponent', () => {
  let component: AgencyReportsComponent;
  let fixture: ComponentFixture<AgencyReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgencyReportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgencyReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
