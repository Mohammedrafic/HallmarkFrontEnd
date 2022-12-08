import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { AbstractImport } from '@shared/classes/abstract-import';
import { FieldSettingsModel } from '@syncfusion/ej2-dropdowns/src/drop-down-base/drop-down-base-model';
import { orderImportConfig, recordsListField, selectionSettings } from './order-import.config';
import { ListBox, ListBoxChangeEventArgs, SelectionSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { UploadOrderImportFileSucceeded } from '@client/store/order-managment-content.actions';
import { OrderImportService } from '@client/order-management/order-import/order-import.service';
import { getInstance } from '@syncfusion/ej2-base';
import { DOCUMENT } from '@angular/common';
import { ImportedOrder, ImportedOrderGrid, ListBoxItem, OrderGrid } from '@shared/models/imported-order.model';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-order-import',
  templateUrl: './order-import.component.html',
  styleUrls: ['./order-import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderImportComponent extends AbstractImport implements OnInit {

  public readonly titleImport = 'Import';
  public readonly recordsListField: FieldSettingsModel = recordsListField;
  public readonly selectionSettings: SelectionSettingsModel = selectionSettings;
  public successListBox: ListBoxItem[];
  public errorListBox: ListBoxItem[];
  public errorGridList: ImportedOrderGrid[] = [];
  public successGridList: ImportedOrderGrid[] = [];
  public selectedIndex = 0;
  public dataSource: ImportedOrderGrid[] = [];
  public activeErrorTab: boolean;

  constructor(
    protected override actions$: Actions,
    protected override store: Store,
    protected override cdr: ChangeDetectorRef,
    private orderImportService: OrderImportService,
    @Inject(DOCUMENT) private document: Document
  ) {
    super(actions$, store, orderImportConfig, cdr);
  }

  public override ngOnInit() {
    super.ngOnInit();
    this.listenOrderImportParser();
  }

  public tabChange(errorTabSelected: boolean): void {
    this.activeErrorTab = errorTabSelected;
    this.dataSource = this.activeErrorTab ? this.errorGridList : this.successGridList;
  }

  public selectFirstItemFactory(): void {
    if (this.activeErrorTab || this.errorListBox.length) {
      this.selectFirstItem('error-record-list', this.errorListBox);
    } else {
      this.selectFirstItem('success-record-list', this.successListBox);
    }
  }

  public selectFirstItem(elementId: string, recordList: ListBoxItem[]): void {
    const instance = this.document.getElementById(elementId) as HTMLElement;

    if (instance) {
      const [firstItem] = recordList;
      const list = getInstance(instance, ListBox) as ListBox;
      list.selectItems([firstItem.name]);
    }
  }

  public selectItem(event: ListBoxChangeEventArgs): void {
    const [item] = event.items as ListBoxItem[];
    this.selectedIndex = this.dataSource.findIndex((record: ImportedOrderGrid) => item.id === record.tempOrderId);
  }

  public trackByErrorHandler(index: number, grid: OrderGrid): string {
    return `error${grid.gridName ?? ''}${index}`;
  }

  public trackBySuccessHandler(index: number, grid: OrderGrid): string {
    return `success${grid.gridName ?? ''}${index}`;
  }

  private listenOrderImportParser(): void {
    this.actions$.pipe(ofActionSuccessful(UploadOrderImportFileSucceeded))
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const { succesfullRecords, errorRecords } = this.importResponse || {};
        this.successListBox = this.orderImportService.getListBoxData(succesfullRecords as ImportedOrder[]);
        this.successGridList = this.orderImportService.buildOrderGrids(succesfullRecords as ImportedOrder[]);
        this.errorListBox = this.orderImportService.getListBoxData(errorRecords as ImportedOrder[]);
        this.errorGridList = this.orderImportService.buildOrderGrids(errorRecords as ImportedOrder[]);
    });
  }
}
