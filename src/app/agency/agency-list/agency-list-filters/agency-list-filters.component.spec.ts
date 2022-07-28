import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgencyListFiltersComponent } from './agency-list-filters.component';

describe('AgencyListFiltersComponent', () => {
  let component: AgencyListFiltersComponent;
  let fixture: ComponentFixture<AgencyListFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgencyListFiltersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgencyListFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
