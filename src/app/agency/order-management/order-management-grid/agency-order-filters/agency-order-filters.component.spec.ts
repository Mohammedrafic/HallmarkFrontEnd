import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgencyOrderFiltersComponent } from './agency-order-filters.component';

describe('AgencyOrderFiltersComponent', () => {
  let component: AgencyOrderFiltersComponent;
  let fixture: ComponentFixture<AgencyOrderFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgencyOrderFiltersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgencyOrderFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
