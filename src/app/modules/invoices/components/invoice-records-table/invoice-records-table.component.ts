import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InvoiceRecord } from "../../interfaces";
import { ItemModel } from "@syncfusion/ej2-splitbuttons/src/common/common-model";
import { MoreMenuType } from "../../../timesheets/enums";
import { ITimesheet } from "../../../timesheets/interface";
import { InvoicesTable } from "../../interfaces/invoices-table.class";

@Component({
  selector: 'app-invoice-records-table',
  templateUrl: './invoice-records-table.component.html',
  styleUrls: ['./invoice-records-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceRecordsTableComponent extends InvoicesTable<InvoiceRecord> {
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
}
