import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { SelectEventArgs } from '@syncfusion/ej2-angular-navigations';

import { TakeUntilDestroy } from '@core/decorators';
import { FieldType } from '@core/enums';
import * as ReasonActions from '@organization-management/store/reject-reason.actions';
import { CancellationReasonsMap,
} from '@shared/components/candidate-cancellation-dialog/candidate-cancellation-dialog.constants';
import {
  CANCEL_REJECTION_REASON, DATA_OVERRIDE_TEXT,
  DATA_OVERRIDE_TITLE, DELETE_CONFIRM_TITLE,
} from '@shared/constants';
import { PenaltyCriteria } from '@shared/enums/candidate-cancellation';
import { DialogMode } from '@shared/enums/dialog-mode.enum';
import { AbstractPermissionGrid } from "@shared/helpers/permissions";
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { Organization, OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { Penalty } from '@shared/models/penalty.model';
import { RejectReason } from '@shared/models/reject-reason.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { concatMap, delay, filter, Observable, takeUntil } from 'rxjs';
import { ShowSideDialog } from 'src/app/store/app.actions';
import { AppState } from 'src/app/store/app.state';
import { UserState } from 'src/app/store/user.state';
import { ReasonDialogConfig, ReasonFormsTypeMap } from './constants';
import { ReasonFormType, ReasonsNavigationTabs } from './enums';
import { CategoryNoteValue, Closurevalue, ReasonCheckBoxGroup, ReasonFormConfig, UnavailabilityValue } from './interfaces';
import { ReasonsFormsService } from './services/reasons-form.service';
import { ReasonsService } from './services/reasons.service';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { SelectedSystemsFlag } from '@shared/components/credentials-list/interfaces';
import { SelectedSystems } from '@shared/components/credentials-list/constants';
import { BusinessUnitType } from '@shared/enums/business-unit-type';

@Component({
  selector: 'app-reasons',
  templateUrl: './reasons.component.html',
  styleUrls: ['./reasons.component.scss'],
})
@TakeUntilDestroy
export class ReasonsComponent extends AbstractPermissionGrid implements OnInit{
  // public selectedTab = ReasonsNavigationTabs.Rejection;
  public selectedTab : any;
  public reasonsNavigationTabs = ReasonsNavigationTabs;
  public canRejectOrClosure = true;
  public title = '';
  public cancellationReasons: { id: number; name: string; }[] = [];
  public regions: OrganizationRegion[] = [];
  public orgStructure: OrganizationStructure;
  public selectedRegions: OrganizationRegion[] = [];
  public locations: OrganizationLocation[] = [];
  public optionFields = {
    text: 'name',
    value: 'id',
  };

  public reasonForm: FormGroup;
  public dialogConfig: ReasonFormConfig[] | null;
  public readonly inputType = FieldType;
  public isIRPFlagEnabled = false;
  public selectedSystem: SelectedSystemsFlag = SelectedSystems;

  private isAllRegionsSelected = false;
  private isAllLocationsSelected = false;
  private isEdit = false;
  private formType;
  public filterType: string = 'Contains';
  protected componentDestroy: () => Observable<unknown>;
  public canUpdateAgencyFeeApplicable: boolean = false;
  public agencyFeeApplicableSwitch?: boolean = true;
  @Select(UserState.organizationStructure)
  organizationStructure$: Observable<OrganizationStructure>;

  @Select(OrganizationManagementState.organization)
  public readonly organization$: Observable<Organization>;
  public showSystem:boolean = false;
  public system:any;
  constructor(
    protected override store: Store,
    public confirmService: ConfirmService,
    private actions$: Actions,
    private reasonFormService: ReasonsFormsService,
    private reasonsService: ReasonsService,
    private cd: ChangeDetectorRef,
  ) {
    super(store);
    const cancellationReasons = Object.entries(CancellationReasonsMap).map(([key, value]) => ({ id: +key, name: value}));
    this.cancellationReasons = sortByField(cancellationReasons, 'name');
    if(this.selectedSystem.isIRP == true && this.selectedSystem.isVMS == false){
      this.selectedTab = ReasonsNavigationTabs.Requisition;
      this.formType = ReasonFormType.RequisitionReason;
    } else {
      this.selectedTab = ReasonsNavigationTabs.Rejection;
      this.formType = ReasonFormType.DefaultReason;
    } 
    this.dialogConfig = ReasonDialogConfig[this.formType];
    this.createForm();
    this.setIRPFlag();

  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.subscribeOnSaveReasonSuccess();
    this.canRejectOrClosureReason();
    this.getOrganizagionData();
  }

  selectTab(selectedTab: SelectEventArgs): void {
    if(selectedTab.selectedItem.innerText === "Candidate Rejection"){
      this.selectedTab = ReasonsNavigationTabs.Rejection;
    } else if(selectedTab.selectedItem.innerText === "Candidate Cancellation (Penalties)"){
      this.selectedTab = ReasonsNavigationTabs.Penalties;
    } else if(selectedTab.selectedItem.innerText === "Order Requisition"){
      this.selectedTab = ReasonsNavigationTabs.Requisition;
    } else if(selectedTab.selectedItem.innerText === "Order Closure"){
      this.selectedTab = ReasonsNavigationTabs.Closure;
    } else if (selectedTab.selectedItem.innerText === "Manual Invoice") {
      this.selectedTab = ReasonsNavigationTabs.ManualInvoice;
    } else if(selectedTab.selectedItem.innerText === "Unavailability"){
      this.selectedTab = ReasonsNavigationTabs.Unavailability;
    } else if(selectedTab.selectedItem.innerText === "Terminated Reason"){
      this.selectedTab = ReasonsNavigationTabs.Termination;
    } else if(selectedTab.selectedItem.innerText === "Internal Transfer/Recruitment"){
      this.selectedTab = ReasonsNavigationTabs.InternalTransfer;
    } else if(selectedTab.selectedItem.innerText === "Category Note"){
      this.selectedTab = ReasonsNavigationTabs.CategoryNote;
    } 
    
    this.formType = ReasonFormsTypeMap[this.selectedTab];
    this.createForm();
    this.dialogConfig = ReasonDialogConfig[this.formType];


    if (this.selectedTab === ReasonsNavigationTabs.Penalties) {
      this.createSubsForPenalties();
    }

    this.canRejectOrClosureReason();
  }

  saveReason(forceUpsert?: boolean): void {
    if (this.reasonForm.invalid) {
      this.reasonForm.markAllAsTouched();
      this.reasonForm.markAsDirty();
      this.reasonForm.updateValueAndValidity();
      return;
    }
    if(this.selectedSystem.isIRP && !this.selectedSystem.isVMS && this.selectedTab == 0){
      this.selectedTab = 2;
      this.formType = ReasonFormType.RequisitionReason;
    }
    this.reasonsService.saveReason({
      selectedTab: this.selectedTab,
      editMode: this.isEdit,
      formValue: this.reasonForm.value,
      formType: this.formType,
      allRegionsSelected: this.isAllRegionsSelected,
      allLocationsSelected: this.isAllLocationsSelected,
      forceUpsert: forceUpsert,
      isVMSIRP: this.showSystem,
      selectedSystem:this.selectedSystem
    });
  }

  addReason(): void {
    this.title = DialogMode.Add;
    this.isEdit = false;
    this.canUpdateAgencyFeeApplicable = !this.userPermission[this.userPermissions.CanUpdateAgencyFeeApplicable] ? true : false;
    this.store.dispatch(new ShowSideDialog(true));
  }

  editReason(data: RejectReason | Penalty | UnavailabilityValue | Closurevalue | CategoryNoteValue): void {
    this.isEdit = true;
    this.title = DialogMode.Edit;

    if (this.selectedTab === ReasonsNavigationTabs.Penalties) {
      const regionIds = this.reasonsService.createRegionIds(this.regions, data as Penalty);
      this.isAllLocationsSelected = (data as Penalty).locationId === null;
      this.selectedRegions = this.reasonsService.createSelectedRegions(this.regions, data as Penalty, regionIds);
      const locationIds = this.reasonsService.createLocationIds(this.selectedRegions, data as Penalty);

      this.reasonForm.patchValue({
        candidateCancellationSettingId: (data as Penalty).candidateCancellationSettingId,
        reason: data.reason,
        regionIds: regionIds,
        locationIds: locationIds,
        flatRate: (data as Penalty).flatRate,
        flatRateOfHours: (data as Penalty).flatRateOfHours,
        flatRateOfHoursPercentage: (data as Penalty).flatRateOfHoursPercentage,
        rateOfHours: (data as Penalty).rateOfHours,
        penaltyCriteria: (data as Penalty).penaltyCriteria,
      });

    } else if (this.selectedTab === ReasonsNavigationTabs.Unavailability) {
      const reason  = data as UnavailabilityValue;

      this.reasonForm.patchValue({
        id: reason.id,
        reason: reason.reason,
        description: reason.description,
        calculateTowardsWeeklyHours: !!reason.calculateTowardsWeeklyHours,
        eligibleToBeScheduled: !!reason.eligibleToBeScheduled,
        visibleForIRPCandidates: !!reason.visibleForIRPCandidates,
      });
    } else if((this.selectedTab === ReasonsNavigationTabs.Requisition )) {
      const reason  = data as Closurevalue;
      this.reasonForm.patchValue({
        id: reason.id,
        reason: reason.reason,
        includeInIRP: reason.includeInIRP,
        includeInVMS: reason.includeInVMS,
        isAutoPopulate : !!reason.isAutoPopulate
        });
    } else if((this.selectedTab === ReasonsNavigationTabs.Closure)) {

      const reason  = data as Closurevalue;
      this.reasonForm.patchValue({
        id: reason.id,
        reason: reason.reason,
        includeInIRP: reason.includeInIRP,
        includeInVMS: reason.includeInVMS,
        });
    } else if((this.selectedTab === ReasonsNavigationTabs.CategoryNote)) {
      const reason  = data as CategoryNoteValue;
      this.reasonForm.patchValue({
        id: reason.id,
        reason: reason.categoryName,
        isRedFlagCategory: !!reason.isRedFlag,
      });
    } else if ((this.selectedTab === ReasonsNavigationTabs.ManualInvoice)) {
      const reason = data as RejectReason;
      this.reasonForm.patchValue({
        id: reason.id,
        reason: reason.reason,
        agencyFeeApplicable: !!reason.agencyFeeApplicable,
        agencyFeeApplicableSwitch: reason.agencyFeeApplicable === false ? false : true,
      });
    } else {
      this.reasonForm.patchValue({
        id: (data as RejectReason).id,
        reason: data.reason,
      });
    }
    this.store.dispatch(new ShowSideDialog(true));
    this.cd.markForCheck();
  }

  closeDialog(): void {
    const isDirty = this.reasonForm.dirty;

    if (isDirty) {
      this.confirmService
        .confirm(CANCEL_REJECTION_REASON, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm:boolean) => !!confirm),
          takeUntil(this.componentDestroy()),
        )
        .subscribe(() => {
          this.closeSideDialog();
        });
    } else {
      this.closeSideDialog();
    }
  }

  private closeSideDialog(): void {
    this.store.dispatch(new ShowSideDialog(false))
    .pipe(
      delay(500),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      if (this.formType === ReasonFormType.PenaltyReason) {
        this.reasonForm.controls['penaltyCriteria'].patchValue(PenaltyCriteria.FlatRateOfHours);
      }
      if (this.formType === ReasonFormType.ManualInvoiceReason) {
          this.reasonForm.reset();
          this.reasonForm.controls['agencyFeeApplicable'].patchValue(true);
      }
    });
  }

  private canRejectOrClosureReason(): void {
      if (this.selectedTab === ReasonsNavigationTabs.Rejection) {
        this.canRejectOrClosure = this.userPermission[this.userPermissions.CanRejectCandidate];
      } else if (this.selectedTab === ReasonsNavigationTabs.Unavailability) {
        this.canRejectOrClosure = this.userPermission[this.userPermissions.CanEditUnavailabilityReasons];
      } else {
        this.canRejectOrClosure = this.userPermission[this.userPermissions.CanManageOrderClosureReasons];
      }
  }

  private createSubsForPenalties(): void {
    this.watchForOrgStructure();
    this.watchForRegionsControl();
    this.watchForLocationsControl();
    this.watchForOverridePenalty();
  }

  private createForm(): void {
    this.reasonForm = this.reasonFormService.createReasonsForm(this.formType);
  }

  private subscribeOnSaveReasonSuccess(): void {
    this.actions$.pipe(
      ofActionSuccessful(ReasonActions.SaveRejectReasonsSuccess, ReasonActions.UpdateClosureReasonsSuccess,
        ReasonActions.UpdateManualInvoiceRejectReasonSuccess, ReasonActions.UpdateOrderRequisitionSuccess,
        ReasonActions.UpdateInternalTransferReasonsSuccess, ReasonActions.UpdateTerminationReasonsSuccess,
        ReasonActions.UpdateCategoryNoteReasonsSuccess,
        ReasonActions.SavePenaltySuccess, ReasonActions.SaveUnavailabilityReason, ReasonActions.RemoveUnavailabilityReason),
      takeUntil(this.componentDestroy()),
    ).subscribe(() =>this.closeSideDialog());
  }

  private watchForOrgStructure(): void {
    this.organizationStructure$
      .pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy()),
      )
      .subscribe((structure: OrganizationStructure) => {
        this.orgStructure = structure;
        this.regions = this.reasonsService.addRegionNameForLocations(structure.regions);
      });
  }

  private watchForRegionsControl(): void {
    this.reasonForm.get('regionIds')?.valueChanges
    .pipe(
      takeUntil(this.componentDestroy()),
    )
    .subscribe((ids: number[]) => {
      if (ids) {
        this.isAllRegionsSelected = ids.length === this.regions.length;
        this.selectedRegions = this.regions.filter((region) => ids.includes(region.id as number));
        const regionLocations = this.selectedRegions.map((region) => region.locations).flat();

        this.locations = sortByField(regionLocations, 'name');
      } else {
        this.locations = [];
        this.isAllRegionsSelected = false;
      }
      this.reasonForm.get('locationIds')?.setValue(null);
    });
  }

  private watchForLocationsControl(): void {
    this.reasonForm.get('locationIds')?.valueChanges
    .pipe(
      takeUntil(this.componentDestroy()),
    )
    .subscribe((val: number[]) => {
      if (val && val.length === this.locations.length) {
        this.isAllLocationsSelected = true;
      } else {
        this.isAllLocationsSelected = false;
      }
    });
  }

  private watchForOverridePenalty(): void {
    this.actions$.pipe(
      ofActionDispatched(ReasonActions.ShowOverridePenaltyDialog),
      concatMap(() => this.confirmService
      .confirm(DATA_OVERRIDE_TEXT, {
        title: DATA_OVERRIDE_TITLE,
        okButtonLabel: 'Confirm',
        okButtonClass: '',
      })),
      filter((confirm) => !!confirm),
      takeUntil(this.componentDestroy()),
    ).subscribe(() => {
      this.saveReason(true);
    });
  }
  
  trackByField(index: number, item: ReasonFormConfig | ReasonCheckBoxGroup): string {
    return item.field;
  }

  private getOrganizagionData(): void {
    this.organization$
    .pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((organization : Organization) => {
      const isOrgUser = this.store.selectSnapshot(UserState.user)?.businessUnitType === BusinessUnitType.Organization;
      this.selectedSystem = {
        isIRP: !!organization.preferences.isIRPEnabled,
        isVMS: !!organization.preferences.isVMCEnabled,
      };
      this.showhidesystem();
    });
  }

  private showhidesystem(){
    if((this.selectedSystem.isIRP) && (this.selectedSystem.isVMS)){
      this.showSystem = true;
      this.system = "ALL";
    } else if(this.selectedSystem.isIRP && !this.selectedSystem.isVMS) {
      this.showSystem = false;
      this.system = "IRP"
    } else if(this.selectedSystem.isVMS && !this.selectedSystem.isIRP) {
      this.showSystem = false;
      this.system = "VMS"
    } 
  }

  private setIRPFlag(): void {
    this.isIRPFlagEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled);
  }
}
