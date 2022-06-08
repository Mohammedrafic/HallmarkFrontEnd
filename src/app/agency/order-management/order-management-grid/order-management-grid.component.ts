import { Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Observable, of, Subject, takeWhile } from 'rxjs';
import { Select, Store } from '@ngxs/store';

import {
  CheckBoxChangeEventArgs,
  GridComponent,
  PagerComponent,
  RowDataBoundEventArgs,
  SelectionSettingsModel,
  SortDirection,
  TextWrapSettingsModel,
} from '@syncfusion/ej2-angular-grids';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { STATUS_COLOR_GROUP } from '@shared/enums/status';
import { GRID_CONFIG } from '@shared/constants';
import { ROW_HEIGHT, typeValueAccess } from './order-management-grid.constants';
import { CheckBoxComponent } from '@syncfusion/ej2-angular-buttons';
import { GetAgencyOrdersPage } from '@agency/store/order-management.actions';
import { OrderManagementState } from '@agency/store/order-management.state';
import { AgencyOrderManagement, AgencyOrderManagementPage } from '@shared/models/order-management.model';
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';

enum AllCheckedStatus {
  None,
  Indeterminate,
  All,
}

@Component({
  selector: 'app-order-management-grid',
  templateUrl: './order-management-grid.component.html',
  styleUrls: ['./order-management-grid.component.scss'],
  providers: [ChipsCssClass]
})
export class OrderManagementGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;

  @ViewChildren('rowCheckbox') rowCheckboxes: QueryList<CheckBoxComponent>;

  @Select(OrderManagementState.ordersPage)
  public ordersPage$: Observable<AgencyOrderManagementPage>;

  public wrapSettings: TextWrapSettingsModel = GRID_CONFIG.wordWrapSettings;
  public allowWrap = GRID_CONFIG.isWordWrappingEnabled;
  public selectionOptions: SelectionSettingsModel = { type: 'Single', mode: 'Row' };
  public allCheckedStatus = AllCheckedStatus;
  public selectedOrder: AgencyOrderManagement;
  public openPreview = new Subject<boolean>();
  public openCandidat = new Subject<boolean>();
  public typeValueAccess = typeValueAccess;

  get checkedStatus(): AllCheckedStatus {
    const itemsLength = this.rowCheckboxes.length;
    const checked = this.rowCheckboxes.filter((item) => item.checked);
    if (itemsLength > 0 && !!checked.length) {
      return checked.length < itemsLength ? AllCheckedStatus.Indeterminate : AllCheckedStatus.All;
    }
    return AllCheckedStatus.None;
  }

  private statusSortDerection: SortDirection = 'Ascending';
  private isAlive = true;

  constructor(private store: Store) {
    super();
  }

  ngOnInit(): void {
    this.onOrderPreviewChange();
    this.dispatchNewPage();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.dispatchNewPage();
    }
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
    this.dispatchNewPage();
  }

  private dispatchNewPage(): void {
    this.store.dispatch(new GetAgencyOrdersPage(this.currentPage, this.pageSize));
  }

  public onCompare(): void {
    this.openCandidat.next(true);
  }

  public onSortStatus(): void {
    const direction: SortDirection = this.statusSortDerection === 'Ascending' ? 'Descending' : 'Ascending';
    this.grid.sortColumn('status', direction);
    this.statusSortDerection = direction;
  }

  public onRowClick({ data }: { data: AgencyOrderManagement }): void {
    this.selectedOrder = data;
    this.openPreview.next(true);
  }

  public onCheckAll(event: CheckBoxChangeEventArgs): void {
    this.rowCheckboxes.forEach((item) => {
      item.writeValue(event.checked);
    });
  }

  public setRowHighlight(args: RowDataBoundEventArgs & { data: AgencyOrderManagement }): void {
    this.grid.selectRow(0);
    const [colors] = Object.values(STATUS_COLOR_GROUP);
    if (colors.includes(args.data.statusText)) {
      args.row?.classList.add('e-success-row');
    }
  }

  public onRowScaleUpClick(): void {
    this.rowHeight = ROW_HEIGHT.SCALE_UP_HEIGHT;
  }

  public onRowScaleDownClick(): void {
    this.rowHeight = ROW_HEIGHT.SCALE_DOWN_HEIGHT;
  }

  private onOrderPreviewChange(): void {
    this.openPreview.pipe(takeWhile(() => this.isAlive)).subscribe((isOpen) => {
      if (!isOpen) {
        this.openCandidat.next(false);
        this.grid.clearRowSelection();
      }
    });
  }
}
