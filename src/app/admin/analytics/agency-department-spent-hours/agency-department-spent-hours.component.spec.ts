import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgencyDepartmentSpentHoursComponent } from './agency-department-spent-hours.component';

describe('AgencyDepartmentSpentHoursComponent', () => {
  let component: AgencyDepartmentSpentHoursComponent;
  let fixture: ComponentFixture<AgencyDepartmentSpentHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgencyDepartmentSpentHoursComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgencyDepartmentSpentHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
