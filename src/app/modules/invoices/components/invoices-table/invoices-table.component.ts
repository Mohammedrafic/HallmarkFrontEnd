import { ChangeDetectionStrategy, Component, EventEmitter, Input, ViewChild } from '@angular/core';
import { PageOfCollections } from "@shared/models/page.model";
import { InvoiceRecord, InvoicesTableConfig } from "../../interfaces";
import {
  AbstractGridConfigurationComponent
} from "@shared/components/abstract-grid-configuration/abstract-grid-configuration.component";
import { GridComponent, SelectionSettingsModel } from "@syncfusion/ej2-angular-grids";
import { TextWrapSettingsModel } from "@syncfusion/ej2-grids/src/grid/base/grid-model";
import { ItemModel } from "@syncfusion/ej2-splitbuttons/src/common/common-model";
import { MoreMenuType } from "../../../timesheets/enums";
import { ITimesheet } from "../../../timesheets/interface";
import { ChangeEventArgs } from "@syncfusion/ej2-angular-dropdowns";

@Component({
  selector: 'app-invoices-table',
  templateUrl: './invoices-table.component.html',
  styleUrls: ['./invoices-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesTableComponent extends AbstractGridConfigurationComponent {
  @Input()
  public tableData: PageOfCollections<InvoiceRecord> | null;

  @Input()
  public config: InvoicesTableConfig;

  @ViewChild('grid')
  public grid: GridComponent;

  public override selectionSettings: SelectionSettingsModel = {
    type: 'Single',
    mode: 'Row',
    checkboxMode: 'ResetOnRowClick',
  };

  public readonly wrapSettings: TextWrapSettingsModel = {
    wrapMode: 'Content'
  };

  public readonly rowSelect: EventEmitter<any> = new EventEmitter<any>();
  public isLockMenuButtonsShown: boolean = false;
  public readonly moreMenuWithDelete: ItemModel[] = [
    {text: MoreMenuType.Edit, id: '0'},
    {text: MoreMenuType.Duplicate, id: '1'},
    {text: MoreMenuType.Delete, id: '3'}
  ];

  public readonly moreMenuWithClose: ItemModel[] = [
    {text: MoreMenuType.Edit, id: '0'},
    {text: MoreMenuType.Duplicate, id: '1'},
    {text: MoreMenuType.Close, id: '2'}
  ];

  constructor() {
    super();
  }

  public override rowSelected(event: any): void {
    if (!event.isInteracted) {
      this.rowSelect.emit(event.rowIndex);
    }
  }

  public menuOptionSelected(event: any, data: ITimesheet): void {
    switch (event.item.properties.text) {
      case MoreMenuType.Edit: {
        break;
      }
      case MoreMenuType.Duplicate: {
        break;
      }
      case MoreMenuType.Close: {
        break;
      }
      case MoreMenuType.Delete: {
        break;
      }
    }
  }

  public updatePageSize({value}: ChangeEventArgs): void {
    this.config.onPageSizeChange(this.pageSize = parseInt(value.toString()));
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  public updateCurrentPage({currentPage}: { currentPage?: number }): void {
    if (currentPage) {
      this.config.onPageChange(this.currentPage = currentPage);
      this.grid.pageSettings.currentPage = this.currentPage;
    }
  }

  public goToPage({value}: {value: number}): void {
    this.updateCurrentPage({currentPage: value});
  }
}
