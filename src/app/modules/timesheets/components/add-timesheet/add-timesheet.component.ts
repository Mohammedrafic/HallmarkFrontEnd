import { ActivatedRoute } from '@angular/router';
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter,
  Inject, Input, OnInit, Output, ViewChild } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import {
  filter, takeUntil, Observable,
} from 'rxjs';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { tap } from 'rxjs/operators';

import { GlobalWindow } from '@core/tokens';
import { CustomFormGroup } from '@core/interface';
import { ConfirmService } from '@shared/services/confirm.service';
import { TimesheetsState } from './../../store/state/timesheets.state';
import { AddRecordService } from '../../services/add-record.service';
import { AddTimsheetForm } from '../../interface';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { RecordAddDialogConfig, ConfirmAddFormCancel } from '../../constants';
import { DialogAction, FieldType, RecordFields } from '../../enums';
import { TimesheetDateHelper } from '../../helpers';
import { RecordsAdapter } from '../../helpers/records.adapter';
import { TimesheetDetails } from '../../store/actions/timesheet-details.actions';

@Component({
  selector: 'app-add-timesheet',
  templateUrl: './add-timesheet.component.html',
  styleUrls: ['./add-timesheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTimesheetComponent extends TimesheetDateHelper implements OnInit {
  @ViewChild('sideAddDialog') protected sideAddDialog: DialogComponent;

  @Input() profileId: number;

  @Output() readonly updateTable: EventEmitter<void> = new EventEmitter<void>();

  public targetElement: HTMLBodyElement;

  public form: CustomFormGroup<AddTimsheetForm>;

  public readonly FieldTypes = FieldType;

  public readonly dialogConfig = RecordAddDialogConfig;

  public formType: RecordFields = RecordFields.Time;

  public readonly dropDownFieldsConfig = {
    text: 'text',
    value: 'value',
  };

  private isAgency: boolean;

  @Select(TimesheetsState.addDialogOpen)
  public readonly dialogState$: Observable<{ state: boolean, type: RecordFields, initDate: string }>

  constructor(
    private confirmService: ConfirmService,
    private store: Store,
    private addRecordService: AddRecordService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    @Inject(GlobalWindow) private readonly globalWindow: WindowProxy & typeof globalThis,
  ) {
    super();
    this.targetElement = this.globalWindow.document.body as HTMLBodyElement;
    this.isAgency = this.route.snapshot.data['isAgencyArea'];
  }

  ngOnInit(): void {
    this.getDialogState();
  }

  public cancelChanges(): void {
    if (this.form.touched) {
      this.confirmService.confirm(ConfirmAddFormCancel, {
        title: 'Unsaved Progress',
        okButtonLabel: 'Proceed',
        okButtonClass: 'delete-button',
      })
      .pipe(
        filter((value) => !!value),
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => {
        this.closeDialog();
      });
    } else {
      this.closeDialog();
    }
  }

  public trackByIndex(index: number): number {
    return index;
  }

  public saveRecord(): void {
    if (this.form.valid) {
      const { organizationId, id } = this.store.snapshot().timesheets.selectedTimeSheet;
      const body = RecordsAdapter.adaptRecordAddDto(this.form.value, organizationId, id, this.formType);

      this.store.dispatch(new TimesheetDetails.AddTimesheetRecord(body, this.isAgency));
      this.closeDialog();
    } else {
      this.form.updateValueAndValidity();
      this.cd.detectChanges();
    }
  }

  public updateValidity(): void {
    this.form.updateValueAndValidity();
  }

  private getDialogState(): void {
    this.dialogState$
    .pipe(
      filter((value) => !!value.state),
      tap((value) => {
        this.form = this.addRecordService.createForm(value.type);
        this.formType = value.type;
        this.setDateBounds(value.initDate, 7);
        this.populateOptions();
      }),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      this.sideAddDialog.show();
      this.cd.markForCheck();
    })
  }

  private closeDialog(): void {
    this.form.reset();
    this.sideAddDialog.hide();
    this.store.dispatch(new Timesheets.ToggleTimesheetAddDialog(DialogAction.Close, this.formType, ''));
  }

  private populateOptions(): void {
    this.dialogConfig[this.formType].fields.forEach((item) => {
      if (item.optionsStateKey) {
        item.options = this.store.snapshot().timesheets[item.optionsStateKey];
      }
      
      if (item.optionsStateKey === 'billRateTypes') {
        item.options = item.options?.filter((rate) => rate.text !== 'Mileage' && rate.text !== 'Charge');
      }
    })
  }
}
