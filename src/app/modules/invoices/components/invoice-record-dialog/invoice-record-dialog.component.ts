import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { DialogComponent } from "@syncfusion/ej2-angular-popups";
import { DropdownOption } from "@core/interface";

@Component({
  selector: 'app-invoice-record-dialog',
  templateUrl: './invoice-record-dialog.component.html',
  styleUrls: ['./invoice-record-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceRecordDialogComponent {
  @ViewChild('createInvoiceDialog')
  public createInvoiceDialog: DialogComponent;

  public costCenterOptions = [{ text: 'Regular', value: 1}, { text: 'On-Call', value: 2}, { text: 'Temporary', value: 3}] as DropdownOption[];
  public categoryOptions = [{ text: 'FAV-871000', value: 1}, { text: 'DAS-965', value: 2}, { text: 'LES-1000', value: 3}] as DropdownOption[];

  public show(): void {
    this.createInvoiceDialog?.show();
  }

  public hide(): void {
    this.createInvoiceDialog.hide();
  }
}
