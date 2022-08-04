import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Actions, ofActionDispatched } from '@ngxs/store';
import { filter, takeUntil } from 'rxjs';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { Destroyable } from '@core/helpers';
import { GlobalWindow } from '@core/tokens';
import { FieldType, DialogAction } from '@core/enums';
import { ManualInvoiceDialogConfig } from '../../constants';
import { AddManInvoiceDialogConfig } from '../../interfaces';
import { Invoices } from '../../store/actions/invoices.actions';
import { AddInvoiceService } from '../../services';


@Component({
  selector: 'app-manual-invoice-dialog',
  templateUrl: './manual-invoice-dialog.component.html',
  styleUrls: ['./manual-invoice-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualInvoiceDialogComponent extends Destroyable implements OnInit {
  @ViewChild('manInvoiceDialog') protected manInvoiceDialog: DialogComponent;

  @ViewChild('uploadArea') protected uploadArea: ElementRef<HTMLDivElement>;

  @ViewChild('dropEl')
  public dropEl: HTMLDivElement;

  public readonly dialogConfig: AddManInvoiceDialogConfig = ManualInvoiceDialogConfig;

  public form: FormGroup;

  public targetElement: HTMLBodyElement;

  public readonly FieldTypes = FieldType;

  public readonly dropDownFieldsConfig = {
    text: 'text',
    value: 'value',
  };

  constructor(
    private addService: AddInvoiceService,
    private actions$: Actions,
    @Inject(GlobalWindow) private readonly globalWindow: WindowProxy & typeof globalThis,
  ) {
    super();
    this.form = this.addService.createManInvoiceForm();
    this.targetElement = this.globalWindow.document.body as HTMLBodyElement;
  }

  ngOnInit(): void {
    this.getDialogState();
  }

  public cancel(): void {
    this.form.reset();
    this.manInvoiceDialog.hide();
  }

  public trackByIndex(idx: number): number {
    return idx;
  }

  private getDialogState(): void {
    this.actions$
    .pipe(
      ofActionDispatched(Invoices.ToggleManulaInvoiceDialog),
      filter((payload: Invoices.ToggleManulaInvoiceDialog) => payload.action === DialogAction.Open),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      this.manInvoiceDialog.show();
    })
  }
}
