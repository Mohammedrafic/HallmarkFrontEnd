import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { filter, Observable, Subject } from 'rxjs';

import { GridComponent } from '@syncfusion/ej2-angular-grids';

import { GetFeeSettingByOrganizationId, RemoveFeeExceptionsById } from 'src/app/agency/store/agency.actions';
import { AgencyState } from 'src/app/agency/store/agency.state';
import { AbstractGridConfigurationComponent } from 'src/app/shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { FeeExceptions, FeeExceptionsPage, FeeSettingsClassification } from 'src/app/shared/models/associate-organizations.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT } from '@shared/constants/messages';
import { GRID_CONFIG } from '@shared/constants/grid-config';

@Component({
  selector: 'app-fee-settings',
  templateUrl: './fee-settings.component.html',
  styleUrls: ['./fee-settings.component.scss'],
})
export class FeeSettingsComponent extends AbstractGridConfigurationComponent implements OnInit, AfterViewInit {
  @Input() form: FormGroup;

  @ViewChild('grid') grid: GridComponent;

  public openAddNewFeeDialog = new Subject<number>();
  public editFeeData = new Subject<FeeExceptions>();
  public classificationValueAccess = (_: string, { classification }: FeeExceptions) => {
    return FeeSettingsClassification[classification];
  };

  get feeExceptions(): FeeExceptions[] {
    return this.form.get('feeExceptions')?.value || [];
  }

  @Select(AgencyState.feeExceptionsPage)
  public feeExceptionsPage$: Observable<FeeExceptionsPage>;

  private organizationId: number;

  constructor(private store: Store, private confirmService: ConfirmService) {
    super();
  }

  ngOnInit(): void {
    this.form.get('id')?.valueChanges.subscribe((organizationId) => {
      this.organizationId = organizationId;
      this.store.dispatch(new GetFeeSettingByOrganizationId(organizationId, this.currentPage, this.pageSize));
    });
  }

  ngAfterViewInit(): void {
    this.grid.rowHeight = GRID_CONFIG.initialRowHeight;
  }

  public addNew(): void {
    this.openAddNewFeeDialog.next(this.organizationId);
  }

  public onEdit(data: { index: string } & FeeExceptions): void {
    this.openAddNewFeeDialog.next(this.organizationId);
    this.editFeeData.next(data);
  }

  public onRemove(data: { index: string } & FeeExceptions): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_CONFIRM_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
      .pipe(filter((confirm) => !!confirm))
      .subscribe(() => this.store.dispatch(new RemoveFeeExceptionsById(data.id)));
  }

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
      id: new FormControl(''),
      regionName: new FormControl(''),
      regionId: new FormControl(''),
      classification: new FormControl(''),
      skillName: new FormControl(''),
      skillId: new FormControl(''),
      fee: new FormControl(''),
    });
  }
}
