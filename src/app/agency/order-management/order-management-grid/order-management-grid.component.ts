import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';

import { CheckBoxChangeEventArgs, GridComponent, PagerComponent, SelectionSettingsModel, SortDirection, TextWrapSettingsModel } from '@syncfusion/ej2-angular-grids';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { STATUS_COLOR_GROUP } from '@shared/enums/status';
import { GRID_CONFIG } from '@shared/constants';
import { ROW_HEIGHT } from './order-management-grid.constants';
import { filter, of, Subject } from 'rxjs';
import { data } from './datasource';
import { CheckBoxComponent } from '@syncfusion/ej2-angular-buttons';
import { Store } from '@ngxs/store';

enum AllCheckedStatus {
  None,
  Indeterminate,
  All,
}

@Component({
  selector: 'app-order-management-grid',
  templateUrl: './order-management-grid.component.html',
  styleUrls: ['./order-management-grid.component.scss']
})
export class OrderManagementGridComponent extends AbstractGridConfigurationComponent implements OnInit {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;

  @ViewChildren('rowCheckbox') rowCheckboxes: QueryList<CheckBoxComponent>;

  public data$ = of(data);
  public wrapSettings: TextWrapSettingsModel = GRID_CONFIG.wordWrapSettings;
  public allowWrap = GRID_CONFIG.isWordWrappingEnabled;
  public selectionOptions: SelectionSettingsModel = { type: 'Single', mode: 'Row' };
  public allCheckedStatus = AllCheckedStatus;
  public previewData: unknown;
  public openPreview = new Subject<boolean>();
  private statusSortDerection: SortDirection = "Ascending";

  get checkedStatus(): AllCheckedStatus {
    const itemsLength = this.rowCheckboxes.length;
    const checked = this.rowCheckboxes.filter((item) => item.checked);
    if (itemsLength > 0 && !!checked.length) {
      return checked.length < itemsLength ? AllCheckedStatus.Indeterminate : AllCheckedStatus.All
    }
    return AllCheckedStatus.None;
  }

  constructor(private store: Store) {
    super();
   }

   ngOnInit(): void {
     this.openPreview.pipe(filter((open) => !open)).subscribe(() => {
       console.log('clear')
       this.grid.clearRowSelection();
     })
   }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      // this.data.subscribe(data => {
      //   this.gridDataSource = this.getRowsPerPage(data, event.currentPage || event.value);
      //   this.currentPagerPage = event.currentPage || event.value;
      // });
    }
  }

  public onSortStatus(): void {
    const direction: SortDirection = this.statusSortDerection === 'Ascending' ? 'Descending' : 'Ascending';
    this.grid.sortColumn('status', direction);
    this.statusSortDerection = direction;
  }

  public onRowClick({data}: {data: any}): void {
    this.previewData = data;
    this.openPreview.next(true);
  }

  public onCheckAll(event: CheckBoxChangeEventArgs): void {
    this.rowCheckboxes.forEach((item) => {
      item.writeValue(event.checked);
    });
  }

  public setRowHighlight(args: any): void {
    if (Object.values(STATUS_COLOR_GROUP)[0].includes(args.data['status'])) {
      args.row.classList.add('e-success-row');
    }
  }

  public onRowsDropDownChanged(): void {
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  public onRowScaleUpClick(): void {
    this.rowHeight = ROW_HEIGHT.SCALE_UP_HEIGHT;
  }

  public onRowScaleDownClick(): void {
    this.rowHeight = ROW_HEIGHT.SCALE_DOWN_HEIGHT;
  }

  public getChipCssClass(status: string): string {
    const found = Object.entries(STATUS_COLOR_GROUP).find(item => item[1].includes(status));
    return found ? found[0] : 'e-default';
  }

  private getActiveRowsPerPage(): number {
    return parseInt(this.activeRowsPerPageDropDown);
  }
}
