import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectMappingComponent } from './project-mapping.component';

describe('ProjectMappingComponent', () => {
  let component: ProjectMappingComponent;
  let fixture: ComponentFixture<ProjectMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectMappingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
