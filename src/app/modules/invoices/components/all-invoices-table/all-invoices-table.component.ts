import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { Invoice, InvoicesTable } from '../../interfaces';
import { ITimesheet } from '../../../timesheets/interface';
import { MoreMenuType } from '../../../timesheets/enums';
import { AllInvoicesTableConfig } from '../../constants/invoices.constant';
import { DetailRowService, GridComponent } from '@syncfusion/ej2-angular-grids';

@Component({
  selector: 'app-all-invoices-table',
  templateUrl: './all-invoices-table.component.html',
  styleUrls: ['./all-invoices-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DetailRowService]
})
export class AllInvoicesTableComponent extends InvoicesTable<Invoice> {
  @ViewChild('grid') override gridWithChildRow: GridComponent;

  @Output() rowSelectedData: EventEmitter<any> = new EventEmitter<any>();

  public readonly tableConfig = AllInvoicesTableConfig;

  constructor() {
    super();
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

  public handleRowSelected(event: any): void {
    this.rowSelectedData.emit(event);
  }

  public selectRow(index: number): void {
    this.grid.selectRow(index);
  }
}
