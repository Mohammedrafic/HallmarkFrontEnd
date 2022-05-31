import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';

import { FreezeService, GridComponent } from '@syncfusion/ej2-angular-grids';
import { debounceTime, Subject, takeUntil } from 'rxjs';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';

interface IBillRate {
  items: IBillRateItem[];
  totalPages: number;
  totalCount: number;
}

interface IBillRateItem {
  title: string;
  category: string;
  payRateType: string;
  ratesHours: string;
  intervalMin: string;
  intervalMax: string;
  effectiveDate: string;
}

@Component({
  selector: 'app-bill-rates-grid',
  templateUrl: './bill-rates-grid.component.html',
  styleUrls: ['./bill-rates-grid.component.scss'],
  providers: [FreezeService]
})
export class BillRatesGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;

  @Output() add: EventEmitter<void> = new EventEmitter();
  @Output() edit: EventEmitter<IBillRateItem> = new EventEmitter();
  @Output() remove: EventEmitter<IBillRateItem> = new EventEmitter();

  public billRates: IBillRate = {
    items: [
      {
        title: 'On Call',
        category: 'On Call',
        payRateType: 'Fixed',
        ratesHours: '14:00',
        intervalMin: '00:00',
        intervalMax: '00:00',
        effectiveDate: '03/09/2022'
      },
      {
        title: 'Charge',
        category: 'Charge',
        payRateType: 'Fixed',
        ratesHours: '15:00',
        intervalMin: '00:00',
        intervalMax: '00:00',
        effectiveDate: '03/09/2022'
      },
      {
        title: 'Daily OT',
        category: 'Daily OT',
        payRateType: 'Times',
        ratesHours: '00:00',
        intervalMin: '00:00',
        intervalMax: '00:00',
        effectiveDate: '03/09/2022'
      },
      {
        title: 'Daily Premium OT',
        category: 'Daily Premium OT',
        payRateType: 'Times',
        ratesHours: '00:00',
        intervalMin: '00:00',
        intervalMax: '00:00',
        effectiveDate: '03/09/2022'
      },
      {
        title: '7th Con Reg. OT',
        category: 'Daily Premium OT',
        payRateType: 'Times',
        ratesHours: '00:00',
        intervalMin: '00:00',
        intervalMax: '00:00',
        effectiveDate: '03/09/2022'
      },
      {
        title: '7th Con Premium OT',
        category: 'Daily Premium OT',
        payRateType: 'Times',
        ratesHours: '00:00',
        intervalMin: '00:00',
        intervalMax: '00:00',
        effectiveDate: '03/09/2022'
      },
      {
        title: 'Callback',
        category: 'Callback',
        payRateType: 'Times',
        ratesHours: '00:00',
        intervalMin: '00:00',
        intervalMax: '00:00',
        effectiveDate: '03/09/2022'
      },
      {
        title: 'OT',
        category: 'OT',
        payRateType: 'Times',
        ratesHours: '13:00',
        intervalMin: '00:00',
        intervalMax: '00:00',
        effectiveDate: '03/09/2022'
      }
    ],
    totalPages: 1,
    totalCount: 8
  } ;

  public initialSort = {
    columns: [
      { field: 'title', direction: 'Ascending' }
    ]
  };

  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public dataBound(): void {
    this.grid.hideScroll();
  }

  public addNew(): void {
    this.add.emit();
  }

  public onEdit(event: MouseEvent, data: IBillRateItem): void {
    this.edit.emit(data);
  }

  public onRemove(event: MouseEvent, data: IBillRateItem): void {
    this.remove.emit(data);
  }

  public onRowsDropDownChanged(): void {
    this.pageSize  = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

}
