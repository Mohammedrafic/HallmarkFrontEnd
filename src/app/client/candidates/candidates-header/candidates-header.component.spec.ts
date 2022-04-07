import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatesHeaderComponent } from './candidates-header.component';

describe('CandidatesHeaderComponent', () => {
  let component: CandidatesHeaderComponent;
  let fixture: ComponentFixture<CandidatesHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandidatesHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidatesHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
