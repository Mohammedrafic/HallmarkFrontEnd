import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatesStatusModalComponent } from './candidates-status-modal.component';

describe('CandidatesStatusModalComponent', () => {
  let component: CandidatesStatusModalComponent;
  let fixture: ComponentFixture<CandidatesStatusModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandidatesStatusModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidatesStatusModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
