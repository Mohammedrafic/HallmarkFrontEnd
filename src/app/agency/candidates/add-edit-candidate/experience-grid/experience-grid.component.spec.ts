import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperienceGridComponent } from './experience-grid.component';

describe('ExperienceGridComponent', () => {
  let component: ExperienceGridComponent;
  let fixture: ComponentFixture<ExperienceGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExperienceGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperienceGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
