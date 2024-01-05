import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';

import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { debounceTime, Subject, takeUntil } from 'rxjs';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { BillRate, BillRateCategory, BillRateOption, BillRateType } from '@shared/models/bill-rate.model';

export type BillRatesGridEvent = BillRate & { index: string };

@Component({
  selector: 'app-bill-rates-grid',
  templateUrl: './bill-rates-grid.component.html',
  styleUrls: ['./bill-rates-grid.component.scss']
})
export class BillRatesGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;

  @Input() set readOnlyMode(value: boolean) {
    this.readOnly = value;
    setTimeout(() => {
      this.grid.contentModule && this.grid.refreshColumns();
    });
  }
  public readOnly: boolean = false;
  @Input() disabledActionMode: boolean;
  @Input() canDeletePredefinedBillRates = true;
  @Input() billRatesData: BillRate[];
  @Input() billRateOptions: BillRateOption[];

  @Output() add: EventEmitter<void> = new EventEmitter();
  @Output() edit: EventEmitter<BillRatesGridEvent> = new EventEmitter();
  @Output() remove: EventEmitter<BillRatesGridEvent> = new EventEmitter();

  public BillRateCategory = BillRateCategory;
  public BillRateType = BillRateType;

  public initialSort = {
    columns: [{ field: 'title', direction: 'Ascending' }],
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

  public onEdit(event: MouseEvent, data: BillRatesGridEvent): void {
    this.edit.emit(data);
  }

  public onRemove(event: MouseEvent, data: BillRatesGridEvent): void {
    this.remove.emit(data);
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }
}
