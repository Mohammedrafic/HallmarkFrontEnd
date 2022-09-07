import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportDepartmentsComponent } from './import-departments.component';

describe('ImportDepartmentsComponent', () => {
  let component: ImportDepartmentsComponent;
  let fixture: ComponentFixture<ImportDepartmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportDepartmentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportDepartmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
