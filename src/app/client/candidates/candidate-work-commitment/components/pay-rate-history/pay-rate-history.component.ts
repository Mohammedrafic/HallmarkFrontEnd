import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';

import { AbstractPermission } from '@shared/helpers/permissions';
import { PagerConfig } from '../../constants';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { PayRateColumnDef } from '../../constants/pay-rate-history.constant';
import { AvailRestrictDialogData } from '../../interfaces';
import { PayRateService } from '../../services/pay-rate.service';

@Component({
  selector: 'app-pay-rate-history',
  templateUrl: './pay-rate-history.component.html',
  styleUrls: ['./pay-rate-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayRateHistoryComponent extends AbstractPermission implements OnInit {

  public readonly dialogSubject$: Subject<AvailRestrictDialogData> = new Subject();

  public gridTitle = 'Pay Rate History';
  public formGroup: FormGroup;
  public payRateHistory: any[] = [];
  public columnDef: ColumnDefinitionModel[];
  public customRowsPerPageDropDownObject = PagerConfig;
  public pagingData = {
    pageNumber: 1,
    pageSize: 5,
    totalCount: 0,
  };

  constructor(
    protected override store: Store,
    private readonly payRateService: PayRateService,
  ) { super(store); }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.initFormGroup();
    this.initColumnsDefinition();
  }

  public handleChangePage(pageNumber: number): void {
    if (pageNumber && this.pagingData.pageNumber !== pageNumber) {
      this.pagingData.pageNumber = pageNumber;
      this.getPayRateRecords();
    }
  }

  public addPayRate(): void {
    this.dialogSubject$.next({ isOpen: true });
  }

  private initColumnsDefinition(): void {
    this.columnDef = PayRateColumnDef(() => this.deletePayRate.bind(this));
  }

  private deletePayRate(id: number): void {
    //TODO implement delete pay rate
  }

  private initFormGroup(): void {
    this.formGroup = this.payRateService.createPayRateForm();
  }

  private getPayRateRecords(): void {
    //TODO implement method
  }

}
