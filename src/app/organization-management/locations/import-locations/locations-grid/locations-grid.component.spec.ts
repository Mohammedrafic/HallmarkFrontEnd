import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationsGridComponent } from './locations-grid.component';

describe('LocationsGridComponent', () => {
  let component: LocationsGridComponent;
  let fixture: ComponentFixture<LocationsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocationsGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
