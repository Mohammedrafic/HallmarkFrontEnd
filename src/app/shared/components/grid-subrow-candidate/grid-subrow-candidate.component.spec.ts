import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridSubrowCandidateComponent } from './grid-subrow-candidate.component';

describe('GridSubrowCandidateComponent', () => {
  let component: GridSubrowCandidateComponent;
  let fixture: ComponentFixture<GridSubrowCandidateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GridSubrowCandidateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GridSubrowCandidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
