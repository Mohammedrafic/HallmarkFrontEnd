import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowMappingComponent } from './workflow-mapping.component';

describe('WorkflowMappingComponent', () => {
  let component: WorkflowMappingComponent;
  let fixture: ComponentFixture<WorkflowMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowMappingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
