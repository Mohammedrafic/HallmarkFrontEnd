import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { Store } from '@ngxs/store';
import { RowNode } from '@ag-grid-community/core';

import { InvoicePaymentData } from '../interfaces';
import { InvoicesApiService } from './invoices-api.service';
import { InvoicesService } from './invoices.service';

describe('InvoicesService', () => {
  let service: InvoicesService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        FormBuilder,
        { provide: Store, useValue: {} },
        { provide: InvoicesApiService, useValue: {} },
        InvoicesService,
      ],
    });

    service = TestBed.inject(InvoicesService);
  });

  it('should create InvoicesService', () => {
    expect(service).toBeTruthy();
  });

  it('createPaymentRecords should return filtered and correct payment records', () => {
    const nodes = [
      {
        data: {
          invoiceState: 2,
          invoiceId: 11,
          formattedInvoiceId: '21',
          amountToPay: 31,
          agencySuffix: 41,
        },
      },
      {
        data: {
          invoiceState: 3,
          invoiceId: 12,
          formattedInvoiceId: '22',
          amountToPay: 32,
          agencySuffix: 42,
        },
      },
      {
        data: {
          invoiceState: 2,
          invoiceId: 13,
          formattedInvoiceId: '23',
          amountToPay: 33,
          agencySuffix: 43,
        },
      },
    ] as RowNode[];
    const expectedResult: InvoicePaymentData[] = [
      {
        invoiceId: 11,
        invoiceNumber: '21',
        amount: 31,
        agencySuffix: 41,
      },
      {
        invoiceId: 13,
        invoiceNumber: '23',
        amount: 33,
        agencySuffix: 43,
      },
    ];

    expect(service.createPaymentRecords(nodes)).toEqual(expectedResult);
  });
});
