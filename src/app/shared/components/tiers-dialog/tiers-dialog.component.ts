import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { filter, Observable, switchMap, takeUntil } from 'rxjs';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { FieldType } from '@core/enums';
import { OPTION_FIELDS, TIER_DIALOG_TYPE, TiersDialogConfig, OPTION_FIELDS_IRP } from '@shared/components/tiers-dialog/constants';
import { TierDataSource, TierDetails, TierDialogConfig, TiersInputConfig } from '@shared/components/tiers-dialog/interfaces';
import { Tiers } from '@shared/enums/tiers.enum';
import { CustomFormGroup } from '@core/interface';
import { TierService } from '@shared/components/tiers-dialog/services';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { findSelectedItems } from '@core/helpers/functions.helper';
import { ConfirmService } from '@shared/services/confirm.service';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { ShowSideDialog } from '../../../store/app.actions';
import { TierDTO } from '@shared/components/tiers-dialog/interfaces/tier-form.interface';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { mapperSelectedItems, setDataSourceValue } from '@shared/components/tiers-dialog/helper';
import { TiersException } from '@shared/components/associate-list/store/associate.actions';
import { AssociateListState } from '@shared/components/associate-list/store/associate.state';
import { DepartmentsTierDTO } from '@shared/models/associate-organizations.model';
import { createDepartmentsTier } from '@shared/helpers';
import { TierList } from '@shared/components/associate-list/interfaces';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { Query } from "@syncfusion/ej2-data";
import { FilteringEventArgs } from "@syncfusion/ej2-dropdowns";
import { SystemType } from '@shared/enums/system-type.enum';
import { FieldNames, FiledNamesSettings } from '@shared/constants/base-dropdown-fields-settings';
import { CandidateWorkCommitment } from '@client/candidates/candidate-work-commitment/models/candidate-work-commitment.model';

@Component({
  selector: 'app-tiers-dialog',
  templateUrl: './tiers-dialog.component.html',
  styleUrls: ['./tiers-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TiersDialogComponent extends DestroyableDirective implements OnInit {
  @ViewChild('sideDialog') sideDialog: DialogComponent;

  @Output() saveTier = new EventEmitter<TierDTO>();
  @Input() set workcommitments(commitments: CandidateWorkCommitment) {
    this.commitments = commitments;
    this.dialogConfig = TiersDialogConfig(this.regions, commitments)[this.dialogType];
  }
  @Input() systemType: SystemType;
  @Input() set regionsStructure(regions: OrganizationRegion[]) {
    this.regions = regions;
    this.dialogConfig = TiersDialogConfig(this.regions, this.commitments)[this.dialogType];
  }
  @Input() set selectedTier(tier: TierDetails) {
    if (tier) {
      this.selectedTierDetails = tier;
      this.tierForm?.patchValue(this.tierService.mapStructureForForms(this.dialogType, tier, this.regions));
      if(this.systemType === 0){
        this.allRecords.regionIds = !tier.regionId;
        this.allRecords.locationIds = !tier.locationId;
        this.allRecords.departmentIds = !tier.departmentId;
        this.allRegionsChange({ checked: this.allRecords.regionIds });
        this.allLocationsChange({ checked: this.allRecords.locationIds });
        this.allDepartmentsChange({ checked: this.allRecords.departmentIds }, false);  
      }
    }
  }

  @Input() set isEditDialog(value: boolean) {
    this.setDialogTitle(value);
    this.isEdit = value;  
  }

  @Input() public permission: boolean;
  @Input() public organizationId: number;

  public dialogConfig: TierDialogConfig;
  public title = '';
  public regions: OrganizationRegion[] = [];
  public locations: OrganizationLocation[] = [];
  public tierForm: CustomFormGroup<TierDTO> | null;
  public readonly FieldTypes = FieldType;
  public optionFields: FieldSettingsModel = OPTION_FIELDS;
  public optionFieldsIRP: FieldSettingsModel = OPTION_FIELDS_IRP;
  public isTierSettingsDialog: boolean;
  public isEdit : boolean;

  private selectedRegions: number[] = [];
  private selectedLocations: number[] = [];
  private selectedTierDetails: TierDetails;
  private commitments: CandidateWorkCommitment;

  public allRecords: FiledNamesSettings = {
    'regionIds': false,
    'locationIds': false,
    'departmentIds': false,
  };
  public maxDepartmentsLength = 1000;
  public query: Query = new Query().take(this.maxDepartmentsLength);
  public noValue = undefined;

  @Select(AssociateListState.getTiersList)
  public tierList$: Observable<TierList[]>;

  constructor(
    @Inject(TIER_DIALOG_TYPE) protected dialogType: Tiers,
    private tierService: TierService,
    private changeDetection: ChangeDetectorRef,
    private confirmService: ConfirmService,
    private store: Store,
    private actions$: Actions,
  ) {
    super();
  }

  ngOnInit(): void {
    this.watchForShowDialog();
    this.watchForCloseDialog();
  }

  ngOnChanges(changes: SimpleChanges) : void {
    if (changes['systemType']) {
      this.systemTypeHandler();
    }
  }

  public systemTypeHandler() {
    this.systemType === 0 ? this.dialogType = Tiers.tierSettings : this.dialogType = Tiers.tierSettingsIRP;
    this.dialogConfig = TiersDialogConfig(this.regions, this.commitments)[this.dialogType];
    this.createForm();
    if (this.systemType === 0) {
      this.watchForRegions();
      this.watchForLocation();
      this.watchForDepartments();  
    }
  }

  public allRegionsChange(event: { checked: boolean }): void {
    this.allRecords[FieldNames.regionIds] = event.checked;
    const regionsControl = this.tierForm?.controls['regionIds'];
    if (this.allRecords[FieldNames.regionIds]) {
      regionsControl?.setValue(null);
      regionsControl?.disable();
      let locations: Location[] = [];
      this.regions.forEach((region: OrganizationRegion) => {
        const filteredLocation = region.locations || [];
        locations = [...locations, ...filteredLocation] as Location[];
      });
      this.locations = sortByField(locations, 'name');
      setDataSourceValue(this.dialogConfig.fields, 'locationIds', locations);
    } else {
      regionsControl?.enable();
    }
  }

  public allLocationsChange(event: { checked: boolean }): void {
    this.allRecords[FieldNames.locationIds] = event.checked;
    const locationsControl = this.tierForm?.controls['locationIds'];
    if (this.allRecords[FieldNames.locationIds]) {
      locationsControl?.setValue(null);
      locationsControl?.disable();
      let departments: OrganizationDepartment[] = [];
      let locations: TierDataSource | undefined = this.dialogConfig.fields.find((configField: TiersInputConfig) => configField.field === 'locationIds')!.dataSource;
      locations?.forEach((location: any) => {
        const filteredDepartments = location.departments || [];
        departments = [...departments, ...filteredDepartments] as OrganizationDepartment[];
      });
      setDataSourceValue(this.dialogConfig.fields, 'departmentIds', departments);
    } else {
      locationsControl?.enable();
    }
  }

  public allDepartmentsChange(event: { checked: boolean }, emitEvent = true): void {
    this.allRecords[FieldNames.departmentIds] = event.checked;
    const departmentsControl = this.tierForm?.controls['departmentIds'];
    if (this.allRecords[FieldNames.departmentIds]) {
      departmentsControl?.setValue(null, {emitEvent: emitEvent});
      departmentsControl?.disable({emitEvent: false});
    } else {
      departmentsControl?.enable({emitEvent: false});
    }
  }

  public allRecordsChange(event: { checked: boolean }, field: string): void {
    field === 'regionIds' && this.allRegionsChange(event);
    field === 'locationIds' && this.allLocationsChange(event);
    field === 'departmentIds' && this.allDepartmentsChange(event);
  }


  public getToggleValue(field: string): boolean {
    return this.allRecords[field as FieldNames];
  }

  public onDepartmentsFiltering(e: FilteringEventArgs): void {
    const char = e.text.length + 1;
    let query: Query = new Query();
    query =
      e.text !== ''
        ? query.where('name', 'contains', e.text, true).take(char * 15)
        : query;
        let departments: TierDataSource | undefined = this.dialogConfig.fields.find((configField: TiersInputConfig) => configField.field === 'departmentIds')!.dataSource;
    e.updateData(departments as [], query);
  }

  public saveTiers(): void {
    if (this.tierForm?.valid) {
      this.saveTier.emit(this.tierForm.getRawValue());
    } else {
      this.tierForm?.markAllAsTouched();
    }
  }

  public closeDialog(): void {
    if (this.tierForm?.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        }).pipe(
        filter(Boolean),
        takeUntil(this.destroy$)
      )
        .subscribe(() => {
          this.hideDialog();
        });
    } else {
      this.hideDialog();
    }
  }

  public trackByIndex(index: number, config: TiersInputConfig): string {
    return index + config.field;
  }

  private resetToggles(): void {
    if (this.systemType === 0) {
      this.allRegionsChange({ checked: false });
      this.allLocationsChange({ checked: false });
      this.allDepartmentsChange({ checked: false });  
    }
  }

  private watchForCloseDialog(): void {
    this.actions$.pipe(
      ofActionDispatched(ShowSideDialog),
      filter(({ isDialogShown }) => !isDialogShown),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.isTierSettingsDialog || setDataSourceValue(this.dialogConfig.fields, 'organizationTierId', []);
      this.resetToggles();
      this.tierForm?.reset({}, {emitEvent: false});
      this.tierForm?.patchValue({
        skills: '1',
      });
      this.changeDetection.markForCheck();
    });
  }

  private hideDialog(): void {
    this.store.dispatch(new ShowSideDialog(false));
  }

  private createForm(): void {
    this.tierForm = this.tierService.createTierForm(this.dialogType);
  }

  private watchForRegions(): void {
    this.tierForm?.get('regionIds')?.valueChanges
      .pipe(
        filter((value: number[]) => !!value?.length),
        takeUntil(this.destroy$)
      )
      .subscribe((value: number[]) => {
        this.selectedRegions = value;
        const selectedRegions: OrganizationRegion[] = findSelectedItems(value, this.regions);
        const selectedLocation: OrganizationLocation[] = mapperSelectedItems(selectedRegions, 'locations');
        this.locations = sortByField(selectedLocation, 'name');
        setDataSourceValue(this.dialogConfig.fields, 'locationIds', selectedLocation);
        this.changeDetection.markForCheck();
      });
  }

  private watchForLocation(): void {
    this.tierForm?.get('locationIds')?.valueChanges.pipe(
      filter((value: number[]) => !!value?.length),
      takeUntil(this.destroy$)
    )
      .subscribe((value: number[]) => {
        this.selectedLocations = value;
        const selectedLocation: OrganizationLocation[] = findSelectedItems(value, this.locations);
        const selectedDepartment: OrganizationDepartment[] = mapperSelectedItems(selectedLocation, 'departments');
        setDataSourceValue(this.dialogConfig.fields, 'departmentIds', sortByField(selectedDepartment, 'name'));
        this.changeDetection.markForCheck();
      });
  }

  private setDialogTitle(value: boolean): void {
    this.title = value ? this.dialogConfig.editTitle : this.dialogConfig.title;
  }

  private watchForShowDialog(): void {
    if(this.systemType == 0){
      this.isTierSettingsDialog = this.dialogType === Tiers.tierSettings
    } else {
      this.isTierSettingsDialog = this.dialogType === Tiers.tierSettingsIRP
    }
    this.actions$.pipe(ofActionDispatched(ShowSideDialog), takeUntil(this.destroy$)).subscribe((payload) => {
      if (payload.isDialogShown) {
        if(this.systemType == 0){
          this.allRecords.regionIds = false;
          this.allRecords.locationIds = false;
          this.allRecords.departmentIds = false;
          this.allRegionsChange({ checked: false });
          this.allLocationsChange({ checked: false });
          this.allDepartmentsChange({ checked: false });
        }
        this.sideDialog.show();
      } else {
        this.sideDialog.hide();
      }
    });
  }

  private watchForDepartments(): void {
    if (this.dialogType === Tiers.tierException) {
      this.tierForm?.get('departmentIds')?.valueChanges.pipe(
        switchMap((departments: number[]) => this.getTiers(departments)),
        switchMap(() => this.tierList$),
        takeUntil(this.destroy$)
      ).subscribe((tiers: TierList[]) => {
        setDataSourceValue(this.dialogConfig.fields, 'organizationTierId', tiers);

        if (this.selectedTierDetails) {
          this.tierForm?.patchValue({
            organizationTierId: this.selectedTierDetails.organizationTierId,
          });
        }

        this.changeDetection.markForCheck();
      });
    }
  }

  private getTiers(departments: number[]): Observable<TierList> {
    const departmentTierDTO: DepartmentsTierDTO = createDepartmentsTier(this.organizationId, this.selectedRegions, this.selectedLocations, departments, this.allRecords);
    return this.store.dispatch(new TiersException.GetTiers(departmentTierDTO));
  }
}
