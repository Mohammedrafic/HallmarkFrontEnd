import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReorderCandidatesListComponent } from './reorder-candidates-list.component';

describe('ReorderCandidatesListComponent', () => {
  let component: ReorderCandidatesListComponent;
  let fixture: ComponentFixture<ReorderCandidatesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReorderCandidatesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReorderCandidatesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
