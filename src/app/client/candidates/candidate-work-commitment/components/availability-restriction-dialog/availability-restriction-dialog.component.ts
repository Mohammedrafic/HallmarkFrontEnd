import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Subject, takeUntil, take, filter } from 'rxjs';

import { ControlTypes } from '@shared/enums/control-types.enum';
import { DateTimeHelper, Destroyable } from '@core/helpers';
import { DepartmentFilterFormConfig } from '../../constants';
import { AvailRestrictDialogData, AvailabilityFormFieldConfig, AvailabilityRestriction } from '../../interfaces';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, formatTime } from '@shared/constants';
import { AvailabilityFilterColumns } from '../../enums';
import { AvailabilityService } from '../../services/availability.service';

@Component({
  selector: 'app-availability-restriction-dialog',
  templateUrl: './availability-restriction-dialog.component.html',
  styleUrls: ['./availability-restriction-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvailabilityRestrictionDialogComponent extends Destroyable implements OnInit {
  @ViewChild('sideDialog') sideDialog: DialogComponent;

  @Input() public dialogSubject$: Subject<AvailRestrictDialogData>;
  @Input() public employeeId: number;

  @Output() public saveAvailabilityRestriction: EventEmitter<AvailabilityRestriction> = new EventEmitter();

  public formGroup: FormGroup;
  public filtersFormConfig = DepartmentFilterFormConfig();
  public controlTypes = ControlTypes;
  public title = 'Add';
  public format = formatTime;

  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly confirmService: ConfirmService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();
  }

  public trackByFn = (_: number,
    item: AvailabilityFormFieldConfig<AvailabilityFilterColumns>) => item.field;

  public ngOnInit(): void {
    this.initForm();
    this.openCloseDialog();
  }

  public submitForm(): void {
    if (this.formGroup.valid) {
      const formData = this.formGroup.getRawValue();
      const payload = this.availabilityService.createRestrictionPayload(formData, this.employeeId);
      this.saveAvailabilityRestriction.emit(payload);
    } else {
      this.formGroup.markAllAsTouched();
    }

    this.cdr.markForCheck();
  }

  public closeDialog(): void {
    this.handleCloseDirtyForm();
  }

  private initForm(): void {
    this.formGroup = this.availabilityService.createAvailabilityForm();
  }

  private openCloseDialog(): void {
    this.dialogSubject$.pipe(takeUntil(this.componentDestroy())).subscribe((data) => {
      if (data.isOpen) {
        this.sideDialog.show();
        this.editAvailabilityRestriction(data.data);
      } else {
        this.closeSideDialog();
      }

      this.cdr.markForCheck();
    });
  }

  private editAvailabilityRestriction(data?: AvailabilityRestriction): void {
    if (data) {
      this.title = 'Edit';

      this.formGroup.patchValue({
        ...data,
        startTime: DateTimeHelper.convertDateToUtc(data.startTime),
        endTime: DateTimeHelper.convertDateToUtc(data.endTime),
      });
    } else {
      this.title = 'Add';
    }
  }

  private handleCloseDirtyForm(): void {
    if (this.formGroup.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter(Boolean),
          take(1)
        ).subscribe(() => {
          this.closeSideDialog();
        });
    } else {
      this.closeSideDialog();
    }
  }

  private closeSideDialog(): void {
    this.sideDialog.hide();
    this.formGroup.reset();
  }
}
