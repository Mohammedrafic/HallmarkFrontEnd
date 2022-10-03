import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportRegionsComponent } from './import-regions.component';

describe('ImportRegionsComponent', () => {
  let component: ImportRegionsComponent;
  let fixture: ComponentFixture<ImportRegionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportRegionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportRegionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
