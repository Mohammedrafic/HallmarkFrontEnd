import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { filter, map, Observable, takeUntil, tap } from 'rxjs';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { Destroyable } from '@core/helpers';
import { GlobalWindow } from '@core/tokens';
import { CustomFormGroup } from '@core/interface';
import { TimesheetsState } from './../../store/state/timesheets.state';
import { ProfileTimeSheetActionType } from '../../enums/timesheets.enum';
import { ProfileTimeSheetDetail } from '../../store/model/timesheets.model';
import { EditTimesheetService } from '../../services/edit-timesheet.service';
import { EditTimsheetForm } from '../../interface/form.interface';
import { Timesheets } from '../../store/actions/timesheets.actions';


@Component({
  selector: 'app-edit-timesheet',
  templateUrl: './edit-timesheet.component.html',
  styleUrls: ['./edit-timesheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTimesheetComponent extends Destroyable implements OnInit {
  @ViewChild('sideEditDialog') protected sideEditDialog: DialogComponent;

  @Select(TimesheetsState.timeSheetEditDialogOpen)
  readonly editDialogType$: Observable<{ dialogType: ProfileTimeSheetActionType, timesheet: ProfileTimeSheetDetail}>;

  public targetElement: HTMLBodyElement;

  public form: CustomFormGroup<EditTimsheetForm>;

  public readonly today = Date.now();

  public headerText = 'Edit Timesheet';

  costCenter = [{ text: 'FAV-871000', value: 1}, { text: 'DAS-965', value: 2}, { text: 'LES-1000', value: 3}];

  categories = [{ text: 'Regular', value: 1}, { text: 'On-Call', value: 2}, { text: 'Temporary', value: 3}]

  constructor(
    private store: Store,
    private editTimsheetService: EditTimesheetService,
    private cd: ChangeDetectorRef,
    @Inject(GlobalWindow) private readonly globalWindow: WindowProxy & typeof globalThis,
  ) {
    super();
    this.targetElement = this.globalWindow.document.body as HTMLBodyElement;
    this.createForm();
  }

  ngOnInit(): void {
    this.getDialogState();
  }

  public cancelChanges(): void {
    this.store.dispatch(new Timesheets.CloseProfileTimesheetEditDialog());
  }

  private getDialogState(): void {
    this.editDialogType$
    .pipe(
      filter(() => !!this.sideEditDialog),
      tap((event) => {
        if (!event) {
          this.sideEditDialog.hide();
        }
      }),
      filter((event) => !!event),
      takeUntil(this.componentDestroy())
      )
    .subscribe((event: { dialogType: ProfileTimeSheetActionType, timesheet: ProfileTimeSheetDetail}) => {
      console.log(event, )
      if (event.dialogType === ProfileTimeSheetActionType.Edit) {
        this.populateForm(event.timesheet);
      }
      this.sideEditDialog.show();
      this.cd.markForCheck();
    })
  }

  private createForm(): void {
    this.form = this.editTimsheetService.createForm();
  }

  private populateForm(timesheet: ProfileTimeSheetDetail): void {
    this.form.patchValue({
      day: timesheet.day,
      timeIn: timesheet.timeIn,
      timeOut: timesheet.timeOut,
      costCenter: timesheet.costCenter,
      category: timesheet.category,
      hours: timesheet.hours,
      rate: timesheet.rate,
      total: timesheet.total,
    });
  }
}
