import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportLocationsComponent } from './import-locations.component';

describe('ImportLocationsComponent', () => {
  let component: ImportLocationsComponent;
  let fixture: ComponentFixture<ImportLocationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportLocationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
