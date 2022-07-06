import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { of, combineLatest, Subscription, filter, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { GridComponent } from '@syncfusion/ej2-angular-grids';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { TakeUntilDestroy } from '@core/decorators';
import { ConfirmService } from '@shared/services/confirm.service';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';

import { ProfileTimesheetTableConfig } from '../../constants';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { ProfileTimesheetService } from '../../services/profile-timesheet.service';
import { CandidateTimesheet } from '../../interface';


@TakeUntilDestroy
@Component({
  selector: 'app-profile-timesheet-table',
  templateUrl: './profile-timesheet-table.component.html',
  styleUrls: ['./profile-timesheet-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class ProfileTimesheetTableComponent extends AbstractGridConfigurationComponent implements OnDestroy, OnChanges {
  protected componentDestroy: () => Observable<unknown>;

  @ViewChild('profileTable')
  public readonly profileTable: GridComponent;

  @Input() candidateTimesheets: CandidateTimesheet[];

  @Input() tempProfile: any;

  @Output() openAddSideDialog: EventEmitter<number> = new EventEmitter<number>();

  @Output() updateTable: EventEmitter<void> = new EventEmitter<void>();

  @Output() deleteTableItemId: EventEmitter<{ profileId: number; tableItemId: number | any }>

    = new EventEmitter<{ profileId: number; tableItemId: number | any }>();

  public override readonly allowPaging = false;

  public readonly tableHeight = 220;

  public readonly tableConfig = ProfileTimesheetTableConfig;

  tempData: any[]; // TODO change tempData everywhere to timeSheetsProfile

  profileId: number;

  public initialSort = {
    columns: [
      { field: 'timeIn', direction: 'Ascending' },
    ],
  };
  public isEditOn = false;
  public subscription: Subscription;

  constructor(
    private store: Store,
    private cdr: ChangeDetectorRef,
    private confirmService: ConfirmService,
    private profileTimesheetService: ProfileTimesheetService
  ) {
    super();

  }

  ngOnChanges() {
    this.createTableData();
  }

  ngOnDestroy(): void {
    this.handleSubscription();
  }

  public editTimesheets(): void {
    this.updateTableView(true);
  }
  /**
   * Todo remove after demo
   */
  private createTableData(): void {
    let profile;
    const init = localStorage.getItem('profile');
    if (init) {
      profile = JSON.parse(init as string);
    } else {
      profile = {}
    }

    this.profileId = profile.id;
    this.tempData = [];
    const data = localStorage.getItem('timesheet-details-tables');
    let storageData;


    if (data) {
      storageData = JSON.parse(data)
    } else {
      storageData = {}
    }

    if (storageData && storageData[profile.id]) {
      this.tempData = storageData[profile.id];
    } else {
      let initDate: Date = new Date(profile.startDate);

      for (let i = 0; i < profile.totalDays; i++) {
        const tableItem = {
          id: 500 + i,
          day: new Date(initDate),
          timeIn: this.setInitTime(new Date(initDate)),
          timeOut: this.setEndOfday(new Date(initDate)),
          costCenter: '',
          category: 'Regular',
          hours: 8,
          rate: profile.billRate,
          total: profile.billRate * 8,
        };


        this.tempData.push(tableItem)
        initDate = new Date(initDate.setDate(initDate.getDate() + 1));
      }
      const storageItem = {
        [profile.id]: this.tempData,
      };

      localStorage.setItem('timesheet-details-tables', JSON.stringify({
        ...storageData,
        ...storageItem,
      }));
    }
    this.tempData = this.tempData.map((el) => ({ ...el, form: this.profileTimesheetService.populateForm(el) }));
  }

  private setInitTime(time: Date) {
    const clonedDate = new Date(time.getTime());
    clonedDate.setHours(8, 0, 0);
    return clonedDate;
  }

  private setEndOfday(time: Date) {
    const clonedDate = new Date(time.getTime());
    clonedDate.setHours(17, 0,  0);
    return clonedDate;
  }

  public deleteTimesheet(timesheet: CandidateTimesheet): void {
    this.deleteTableItemId.emit({ profileId: this.profileId, tableItemId: timesheet.id });
  }

  public cancelChanges(): void {
    if (this.tempData.some(el => el.form?.dirty)) {
      this.confirmService
        .confirm(CANCEL_COFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button'
        }).pipe(filter(confirm => confirm))
        .subscribe(() => {
          this.resetForms();
          this.updateTableView();
        });
    } else {
      this.resetForms();
      this.updateTableView();
    }
  }

  public saveChanges(): void {
    if (!this.tempData.some(el => el.form?.invalid)) {
      this.subscription = combineLatest(
        this.tempData
          .map((el) => {
            return el.form?.valid && el.form?.touched
            ? this.store.dispatch(new Timesheets.PatchProfileTimesheet(
              this.profileId,
              el.id,
              {
                ...el.form.getRawValue(),
                hours: Math.abs(el.form.getRawValue().timeOut.getTime() - el.form.getRawValue().timeIn.getTime()) / 36e5,
              }
            )) :
            of(null)
          }
          ),
      ).pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.updateTable.emit();
        this.updateTableView();
      });
    } else {
      this.tempData.forEach(el => {
        el.form?.markAllAsTouched();
      });
    }
  }

  public handleRowChange(form: FormGroup, key: string): void {
    form.get(key)?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    this.cdr.detectChanges();
  }

  private updateTableView(isEdit = false): void {
    this.isEditOn = isEdit;
    this.toggleColumn(isEdit);
    this.profileTable.autoFitColumns();
    this.cdr.detectChanges();
  }

  private handleSubscription(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private resetForms(): void {
    this.tempData = this.tempData.map(el => {
      el.form = this.profileTimesheetService.populateForm(el);

      return el;
    });
  }

  private toggleColumn(isShow = false): void {
    if (isShow) {
      this.profileTable.showColumns(this.tableConfig.actions.header);
    } else {
      this.profileTable.hideColumns(this.tableConfig.actions.header);
    }
  }
}
