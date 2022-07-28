import { TestBed } from '@angular/core/testing';

import { AgencyListFilterService } from './agency-list-filter.service';

describe('AgencyListFilterService', () => {
  let service: AgencyListFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgencyListFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
