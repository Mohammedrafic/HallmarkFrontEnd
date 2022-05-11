import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';

import { GridComponent } from '@syncfusion/ej2-angular-grids';

import { GetFeeSettingByOrganizationId } from 'src/app/agency/store/agency.actions';
import { AgencyState } from 'src/app/agency/store/agency.state';
import { AbstractGridConfigurationComponent } from 'src/app/shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { FeeExceptions, FeeExceptionsPage } from 'src/app/shared/models/associate-organizations.model';

@Component({
  selector: 'app-fee-settings',
  templateUrl: './fee-settings.component.html',
  styleUrls: ['./fee-settings.component.scss'],
})
export class FeeSettingsComponent extends AbstractGridConfigurationComponent implements OnInit {
  @Input() form: FormGroup;

  @ViewChild('grid') grid: GridComponent;

  public openAddNewFeeDialog = new Subject<boolean>();

  get feeExceptions(): FeeExceptions[] {
    return this.form.get('feeExceptions')?.value || [];
  }

  @Select(AgencyState.feeExceptionsPage)
  public feeExceptionsPage$: Observable<FeeExceptionsPage>;

  private organizationId: number;

  constructor(private store: Store) {
    super();
  }

  ngOnInit(): void {
    this.form.get('id')?.valueChanges.subscribe((organizationId) => {
      this.organizationId = organizationId;
      this.store.dispatch(new GetFeeSettingByOrganizationId(organizationId, this.currentPage, this.pageSize));
    });
  }

  public addNew(): void {
    this.openAddNewFeeDialog.next(true);
  }

  public onEdit(data: undefined): void {}

  public onRemove(data: undefined): void {}

  public dataBound(): void {
    this.grid.autoFitColumns();
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.store.dispatch(new GetFeeSettingByOrganizationId(this.organizationId, this.currentPage, this.pageSize));
    }
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
  }

  static createFormGroup(): FormGroup {
    return new FormGroup({
      id: new FormControl(null),
      baseFee: new FormControl(''),
      feeExceptions: new FormArray([]),
    });
  }

  static createFeeExceptionsForm(): FormGroup {
    return new FormGroup({
      regionName: new FormControl(''),
      classification: new FormControl(''),
      skill: new FormControl(''),
      fee: new FormControl(''),
    });
  }
}
