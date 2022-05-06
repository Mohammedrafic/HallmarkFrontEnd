import { TestBed } from '@angular/core/testing';

import { ClearAgencyGuard } from './clear-agency.guard';

describe('ClearAgencyGuard', () => {
  let guard: ClearAgencyGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ClearAgencyGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
