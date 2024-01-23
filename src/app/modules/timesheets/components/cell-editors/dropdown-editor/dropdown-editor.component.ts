import { AbstractControl, FormGroup } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ColDef, ICellRendererParams } from '@ag-grid-community/core';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { Store } from '@ngxs/store';
import { takeUntil } from 'rxjs';

import { OutsideZone } from '@core/decorators';
import { Destroyable } from '@core/helpers';
import { OrganizationStructure } from '@shared/models/organization.model';
import { DropdownOption } from '@core/interface';
import { createUniqHashObj } from '@core/helpers/functions.helper';

import { GetCostCenterOptions, GetDropdownOptions } from '../../../helpers';
import { TimesheetsState } from '../../../store/state/timesheets.state';
import { AddRecorTimesheetReorder } from '../../../interface';

@Component({
  selector: 'app-dropdown-editor',
  templateUrl: './dropdown-editor.component.html',
  styleUrls: ['./dropdown-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownEditorComponent extends Destroyable  implements ICellRendererAngularComp {
  public value: DropdownOption;

  public options: DropdownOption[] = [];

  public editable = false;

  public filterType: string = 'Contains';

  public control: AbstractControl;

  private organizationStructure: OrganizationStructure;

  constructor(
    private store: Store,
    private cd: ChangeDetectorRef,
    private readonly ngZone: NgZone,
  ) {
    super();
  }

  public agInit(params: ICellRendererParams): void {
    this.setData(params);
    this.setFormControl(params);
  }

  public refresh(params: ICellRendererParams): boolean {
    this.setData(params);
    this.setFormControl(params);
    return true;
  }

  public itemChange(event: ChangeEventArgs):  void {
    this.control.markAsTouched();
    this.control.patchValue(event.itemData.value);
  }

  private setData(params: ICellRendererParams): void {
    const colDef = (params.colDef as ColDef);
    const storeField = colDef.cellRendererParams.storeField as string;
    const regionId = params.context.componentParent.timesheetDetails?.orderRegionId;
    this.editable = colDef.cellRendererParams.isEditable;
    this.organizationStructure = this.store.selectSnapshot(TimesheetsState.organizationStructure) as OrganizationStructure;
    this.options = this.store.snapshot().timesheets[storeField];

    if (storeField === 'locations') {
      const locations = this.organizationStructure?.regions.find((region) => region.id === regionId)?.locations || [];
      this.options = GetDropdownOptions(locations);
    }

    if (storeField === 'costCenterOptions') {
      this.options = GetCostCenterOptions(
        this.organizationStructure,
        params.context.componentParent.timesheetDetails?.orderRegionId,
        params.data.locationId
      );
    }

    if (storeField === 'billRateTypes') {
      const ratesNotForSelect = ['Daily OT', 'Daily Premium OT', 'Mileage', 'OT'];
      const isReorder = params.context.componentParent.timesheetDetails?.reorderDates !== null;
      let filteredOptions = this.options.filter((option) => {
        return !ratesNotForSelect.includes(option.text);
      });
      if (isReorder) {
        filteredOptions = filteredOptions.filter((option) => {
          return (option as AddRecorTimesheetReorder).candidateJobId === params.data.reorderCandidateJobId;
        });
      }
      const uniqBillRatesHashObj = createUniqHashObj(
        filteredOptions,
        (el: DropdownOption) => el.value,
        (el: DropdownOption) => el,
      );

      this.options = Object.values(uniqBillRatesHashObj);
    }

    if (this.options && this.options.length) {
      this.value =
        this.options.find((item) => item.value === params.value) as DropdownOption ||
        { text: 'N/A', value: 0 };
    }
    this.cd.markForCheck();
  }

  private setFormControl(params: ICellRendererParams): void {
    if (params.colDef?.cellRendererParams.formGroup?.[params.data.id]) {

      const group = params.colDef?.cellRendererParams.formGroup[params.data.id] as FormGroup;

      this.control = group.get((params.colDef as ColDef).field as string) as AbstractControl;
      this.watchForLocations(params, group);
    }
  }

  private watchForLocations(params: ICellRendererParams, group: FormGroup): void {
    const colDef = params.colDef as ColDef;
    const storeField = colDef.cellRendererParams.storeField as string;

    if (storeField === 'costCenterOptions') {
      group.get('locationId')?.valueChanges
        .pipe(takeUntil(this.componentDestroy()))
        .subscribe((locationId) => {
          this.resetCostCenterDropDown(group);
          this.setNewCostCenterOptions(params.context.componentParent.timesheetDetails?.orderRegionId, locationId);
        });
    }
  }

  private resetCostCenterDropDown(group: FormGroup): void {
    this.options = [];
    this.value = { value: 0, text: '' };
    group.get('departmentId')?.reset();
    this.cd.markForCheck();
  }

  @OutsideZone
  private setNewCostCenterOptions(orderRegionId: number, locationId: number): void {
    setTimeout(() => {
      this.options = GetCostCenterOptions(this.organizationStructure, orderRegionId, locationId);
      this.cd.markForCheck();
    }, 100);
  }
}
