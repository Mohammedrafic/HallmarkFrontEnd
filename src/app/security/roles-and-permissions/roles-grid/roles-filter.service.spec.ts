import { TestBed } from '@angular/core/testing';

import { RolesFilterService } from './roles-filter.service';

describe('RolesFilterService', () => {
  let service: RolesFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RolesFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
