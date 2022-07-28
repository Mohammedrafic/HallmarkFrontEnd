import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesFiltersComponent } from './roles-filters.component';

describe('RolesFiltersComponent', () => {
  let component: RolesFiltersComponent;
  let fixture: ComponentFixture<RolesFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RolesFiltersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RolesFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
