import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentsGridComponent } from './departments-grid.component';

describe('DepartmentsGridComponent', () => {
  let component: DepartmentsGridComponent;
  let fixture: ComponentFixture<DepartmentsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DepartmentsGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmentsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
