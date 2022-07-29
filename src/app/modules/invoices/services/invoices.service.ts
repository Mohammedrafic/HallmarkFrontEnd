import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { PageOfCollections } from "@shared/models/page.model";
import { GetInvoicesData, InvoiceRecord } from "../interfaces";
import { BaseObservable } from '@core/helpers';
import { generateInvoiceRecords } from '../helpers/generate-invoices-mock.helper';

const mockedRecords: InvoiceRecord[] = generateInvoiceRecords(10);

@Injectable()
export class InvoicesService {
  private currentSelectedTableRowIndex: BaseObservable<number> = new BaseObservable<number>(null as any);

  constructor(
    private http: HttpClient,
  ) {
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
