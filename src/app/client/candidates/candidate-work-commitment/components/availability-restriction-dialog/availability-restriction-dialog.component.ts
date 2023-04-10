import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild } from '@angular/core';
import { DepartmentFilterFormConfig } from '../../constants/availability-restriction-dialog.constants';
import { ControlTypes } from '@shared/enums/control-types.enum';
import { AvailabilityFilterColumns } from '../../enums/availability-filter-columns.enum';
import { AvailabilityFormFieldConfig } from '../../interfaces/availability-restriction.interface';
import { FormGroup } from '@angular/forms';
import { AvailabilityHelperService } from '../../services/availability-helper.service';
import { Subject, takeUntil } from 'rxjs';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Destroyable } from '@core/helpers';
import { Days } from '@shared/enums/days';

@Component({
  selector: 'app-availability-restriction-dialog',
  templateUrl: './availability-restriction-dialog.component.html',
  styleUrls: ['./availability-restriction-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvailabilityRestrictionDialogComponent extends Destroyable implements OnInit {
  @ViewChild('sideDialog') sideDialog: DialogComponent;

  @Input() public dialogSubject$: Subject<{ isOpen: boolean, isEdit: boolean, data?: unknown }>;

  public formGroup: FormGroup;
  public filtersFormConfig = DepartmentFilterFormConfig();
  public controlTypes = ControlTypes;

  constructor(private readonly availHelpService: AvailabilityHelperService) {
    super();
  }

  public trackByFn = (_: number,
    item: AvailabilityFormFieldConfig<AvailabilityFilterColumns>) => item.field;

  public ngOnInit(): void {
    this.initForm();
    this.operCloseDialog();
  }

  public saveAvailabilityRestriction(): void {
    console.error('Save');
    
  }

  public closeDialog(): void {
    this.sideDialog.hide();
  }

  private initForm(): void {
    this.formGroup = this.availHelpService.createAvailabilityForm();
  }

  private operCloseDialog(): void {
    this.dialogSubject$.pipe(takeUntil(this.componentDestroy())).subscribe((data) => {
      console.error(data);
      if(data.isOpen) {
        this.sideDialog.show();
      } else {
        this.sideDialog.hide();
      }
      
    });
  }
}
