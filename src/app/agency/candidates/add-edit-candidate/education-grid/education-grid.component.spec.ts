import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationGridComponent } from './education-grid.component';

describe('EducationGridComponent', () => {
  let component: EducationGridComponent;
  let fixture: ComponentFixture<EducationGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EducationGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EducationGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
