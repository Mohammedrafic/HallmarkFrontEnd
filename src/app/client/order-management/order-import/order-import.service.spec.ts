import { TestBed } from '@angular/core/testing';

import { OrderImportService } from './order-import.service';

describe('OrderImportService', () => {
  let service: OrderImportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderImportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
