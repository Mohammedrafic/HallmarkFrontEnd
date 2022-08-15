import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';

import { Observable, of } from 'rxjs';
import { Store } from '@ngxs/store';

import { BaseObservable } from '@core/helpers';
import { CustomFormGroup, DataSourceItem } from '@core/interface';
import { PageOfCollections } from '@shared/models/page.model';
import { OrganizationRegion } from '@shared/models/organization.model';

import { GetInvoicesData, InvoiceRecord } from '../interfaces';
import { generateInvoiceRecords } from '../helpers/generate-invoices-mock.helper';
import { InvoiceFilterForm } from '../interfaces/form.interface';
import { InvoicesTableFiltersColumns } from '../enums/invoices.enum';
import { Invoices } from '../store/actions/invoices.actions';

const mockedRecords: InvoiceRecord[] = generateInvoiceRecords(10);

@Injectable()
export class InvoicesService {
  private currentSelectedTableRowIndex: BaseObservable<number> = new BaseObservable<number>(null as any);

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private store: Store
  ) {
  }

  public createForm(): CustomFormGroup<InvoiceFilterForm> {
    return this.fb.group({
      orderIds: [''],
      regionsIds: [''],
      locationIds: [''],
      departmentIds: [''],
      agencyIds: [''],
      skillIds: [''],
    }) as CustomFormGroup<InvoiceFilterForm>;
  }

  public setDataSourceByFormKey(
    key: InvoicesTableFiltersColumns,
    source: DataSourceItem[] | OrganizationRegion[]
  ): void {
    this.store.dispatch(new Invoices.SetFiltersDataSource(key, source));
  }

  public getInvoices({pageSize, page}: GetInvoicesData): Observable<PageOfCollections<InvoiceRecord>> {
    const totalPages = Math.ceil(100 / pageSize);
    const currentPage = page;

    return of({
      items: mockedRecords,
      totalCount: 100,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      pageNumber: page,
      totalPages: totalPages,
    } as PageOfCollections<InvoiceRecord>);
  }

  public getCurrentTableIdxStream(): Observable<number> {
    return this.currentSelectedTableRowIndex.getStream();
  }

  public setNextValue(next: boolean): void {
    this.currentSelectedTableRowIndex.set(next ?
      this.currentSelectedTableRowIndex.get() + 1 :
      this.currentSelectedTableRowIndex.get() - 1);
  }

  public setCurrentSelectedIndexValue(value: number): void {
    this.currentSelectedTableRowIndex.set(value);
  }

  public getNextIndex(): number {
    return this.currentSelectedTableRowIndex.get();
  }
}
