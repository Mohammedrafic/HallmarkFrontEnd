import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateCancellationDialogComponent } from './candidate-cancellation-dialog.component';

describe('CandidateCancellationDialogComponent', () => {
  let component: CandidateCancellationDialogComponent;
  let fixture: ComponentFixture<CandidateCancellationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandidateCancellationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidateCancellationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
