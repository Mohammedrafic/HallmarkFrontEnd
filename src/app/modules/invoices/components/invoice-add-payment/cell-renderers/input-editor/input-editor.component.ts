import { FormGroup } from '@angular/forms';
import { ChangeDetectionStrategy, Component, ChangeDetectorRef } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

import { InvoiceAddPaymentComponent } from '../../invoice-add-payment.component';

@Component({
  selector: 'app-input-editor',
  templateUrl: './input-editor.component.html',
  styleUrls: ['./input-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputEditorComponent implements ICellRendererAngularComp {
  group: FormGroup;

  controlName = 'amount';

  private componentParent: InvoiceAddPaymentComponent;

  constructor(
    private cd: ChangeDetectorRef,
  ) {}

  agInit(params: ICellRendererParams): void {
    this.componentParent = params.context.componentParent;
    this.setData(params);
  }

  refresh(params: ICellRendererParams): boolean {
    this.setData(params);
    return true;
  }

  changePayment(): void {
    this.componentParent.calcCheckAmount();
  }

  private setData(params: ICellRendererParams): void {
    this.setFormControl(params);
  }

  private setFormControl(params: ICellRendererParams): void {
    this.group = params.data.group as FormGroup;

    this.cd.detectChanges();
  }
}
