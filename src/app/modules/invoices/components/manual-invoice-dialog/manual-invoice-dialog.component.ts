import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { ofActionDispatched } from '@ngxs/store';
import { filter, takeUntil, tap } from 'rxjs';

import { AddDialogHelper } from '@core/helpers';
import { CustomFormGroup } from '@core/interface';
import { DialogAction } from '@core/enums';
import { ManualInvoiceDialogConfig } from '../../constants';
import { AddManInvoiceDialogConfig, AddManInvoiceForm } from '../../interfaces';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoiceConfirmMessages } from '../../constants/messages.constant';

@Component({
  selector: 'app-manual-invoice-dialog',
  templateUrl: './manual-invoice-dialog.component.html',
  styleUrls: ['./manual-invoice-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualInvoiceDialogComponent extends AddDialogHelper<AddManInvoiceForm> implements OnInit {
  public readonly dialogConfig: AddManInvoiceDialogConfig = ManualInvoiceDialogConfig;

  ngOnInit(): void {
    this.getDialogState();
    this.confirmMessages = InvoiceConfirmMessages;
  }

  private getDialogState(): void {
    this.actions$
    .pipe(
      ofActionDispatched(Invoices.ToggleManulaInvoiceDialog),
      filter((payload: Invoices.ToggleManulaInvoiceDialog) => payload.action === DialogAction.Open),
      tap(() => {
        this.form = this.addService.createForm() as CustomFormGroup<AddManInvoiceForm>;
      }),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      this.sideAddDialog.show();
      this.cd.markForCheck();
    })
  }

  public override closeDialog(): void {
    super.closeDialog();
    // this.store.dispatch(new Timesheets.ToggleTimesheetAddDialog(DialogAction.Close, this.formType, ''));
  }

  private populateOptions(): void {
    /**
     * Commented for future implementation
     */
    // this.dialogConfig[this.formType].fields.forEach((item) => {
    //   if (item.optionsStateKey) {
    //     item.options = this.store.snapshot().timesheets[item.optionsStateKey];
    //   }
      
    //   if (item.optionsStateKey === 'billRateTypes') {
    //     item.options = item.options?.filter((rate) => rate.text !== 'Mileage' && rate.text !== 'Charge');
    //   }
    // })
  }
}
