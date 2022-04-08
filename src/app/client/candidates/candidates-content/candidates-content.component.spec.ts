import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatesContentComponent } from './candidates-content.component';

describe('CandidatesContentComponent', () => {
  let component: CandidatesContentComponent;
  let fixture: ComponentFixture<CandidatesContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandidatesContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidatesContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
