import { Component, OnInit } from '@angular/core';

import { Store } from '@ngxs/store';

import { filter, take } from 'rxjs';

import { ConfirmService } from '@shared/services/confirm.service';

import { ShowSideDialog } from 'src/app/store/app.actions';

@Component({
  selector: 'app-bill-rates',
  templateUrl: './bill-rates.component.html',
  styleUrls: ['./bill-rates.component.scss']
})
export class BillRatesComponent implements OnInit {

  public billRateFormHeader: string;

  constructor(
    private confirmService: ConfirmService,
    private store: Store
  ) { }

  ngOnInit(): void {
  }

  public onAddBillRate(): void {
    this.billRateFormHeader = 'Add Bill Rate';
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onEditBillRate(billRate: any): void {
    this.billRateFormHeader = 'Edit Bill Rate';
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onRemoveBillRate(billRate: any): void {
    this.confirmService
      .confirm(
        'Are You sure you want to delete it?',
        { okButtonLabel: 'Remove',
          okButtonClass: 'delete-button',
          title: 'Remove the Bill Rate'
        })
      .pipe(take(1), filter((confirm) => !!confirm))
      .subscribe(() => {

      });
  }

  public onDialogCancel(): void {
    this.store.dispatch(new ShowSideDialog(false));
  }

  public onDialogOk(): void {
    this.store.dispatch(new ShowSideDialog(false));
  }

}
