import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import {
  SaveClosureReasons,
  SaveClosureReasonsError,
  CreateManualInvoiceRejectReason, SaveManualInvoiceRejectReasonError,
  SaveRejectReasons,
  SaveRejectReasonsError,
  SaveRejectReasonsSuccess,
  UpdateClosureReasonsSuccess, UpdateManualInvoiceRejectReason, UpdateManualInvoiceRejectReasonSuccess,
  UpdateRejectReasons,
  SaveOrderRequisition,
  UpdateOrderRequisitionSuccess,
  SaveOrderRequisitionError,
  SavePenalty,
  SavePenaltyError,
  SavePenaltySuccess,
  ShowOverridePenaltyDialog
} from '@organization-management/store/reject-reason.actions';
import {
  CANCEL_REJECTION_REASON,
  DELETE_CONFIRM_TITLE,
  ALPHANUMERICS_AND_SYMBOLS,
  DATA_OVERRIDE_TEXT,
  DATA_OVERRIDE_TITLE,
} from '@shared/constants';
import { DialogMode } from '@shared/enums/dialog-mode.enum';
import { ConfirmService } from '@shared/services/confirm.service';
import { delay, filter, takeWhile, Observable } from 'rxjs';
import { ShowSideDialog } from 'src/app/store/app.actions';
import { RejectReason } from '@shared/models/reject-reason.model';
import { OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { CancellationReasonsMap } from '@shared/components/candidate-cancellation-dialog/candidate-cancellation-dialog.constants';
import { PenaltyCriteria } from '@shared/enums/candidate-cancellation';
import { UserState } from 'src/app/store/user.state';
import { Penalty } from '@shared/models/penalty.model';
import { AbstractPermissionGrid } from "@shared/helpers/permissions";
import { sortByField } from '@shared/helpers/sort-by-field.helper';

export enum ReasonsNavigationTabs {
  Rejection,
  Penalties,
  Requisition,
  Closure,
  ManualInvoice,
}

@Component({
  selector: 'app-reasons',
  templateUrl: './reasons.component.html',
  styleUrls: ['./reasons.component.scss']
})
export class ReasonsComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  public selectedTab: ReasonsNavigationTabs = ReasonsNavigationTabs.Rejection;
  public reasonsNavigationTabs = ReasonsNavigationTabs;
  public form: FormGroup;
  public penaltiesForm: FormGroup;
  public canRejectOrClosure = true;

  private isEdit = false;
  public title: string = '';
  private isAlive = true;
  private isSaving = false;
  public cancellationReasons: { id: number; name: string; }[] = [];
  public regions: OrganizationRegion[] = [];
  public orgStructure: OrganizationStructure;
  public selectedRegions: OrganizationRegion[] = [];
  public locations: OrganizationLocation[] = [];
  private isAllRegionsSelected = false;
  private isAllLocationsSelected = false;

  @Select(UserState.organizationStructure)
  organizationStructure$: Observable<OrganizationStructure>;

  public optionFields = {
    text: 'name',
    value: 'id',
  };

  constructor(protected override store: Store, private confirmService: ConfirmService, private actions$: Actions) {
    super(store);
    const cancellationReasons = Object.entries(CancellationReasonsMap).map(([key, value]) => ({ id: +key, name: value}));
    this.cancellationReasons = sortByField(cancellationReasons, 'name');
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.createForm();
    this.subscribeOnSaveReasonSuccess();
    this.penaltiesSubscriptionHandler();
    this.canRejectOrClosureReason();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public onTabSelected(selectedTab: any): void {
    this.selectedTab = selectedTab.selectedIndex;
    this.canRejectOrClosureReason();
  }

  private penaltiesSubscriptionHandler(): void {
    this.organizationStructure$
      .pipe(takeWhile(() => this.isAlive), filter(Boolean))
      .subscribe((structure: OrganizationStructure) => {
        this.orgStructure = structure;
        this.regions = structure.regions;
      });
    this.penaltiesForm.get('regionIds')?.valueChanges.subscribe((val: number[]) => {
      this.selectedRegions = [];
      if (val) {
        val.forEach((id) =>
          this.selectedRegions.push(this.regions.find((region) => region.id === id) as OrganizationRegion)
        );
        const regionLocations: OrganizationLocation[] = [];
        this.isAllRegionsSelected = val.length === this.regions.length;
        this.selectedRegions.forEach((region) => {
          region.locations?.forEach((location) => (location.regionName = region.name));
          regionLocations.push(...(region.locations as []));
        });
        this.locations = sortByField(regionLocations, 'name');
      } else {
        this.locations = [];
        this.isAllRegionsSelected = false;
      }
      this.penaltiesForm.get('locationIds')?.setValue(null);
    });
    this.penaltiesForm.get('locationIds')?.valueChanges.subscribe((val: number[]) => {
      if (val && val.length === this.locations.length) {
        this.isAllLocationsSelected = true;
      } else {
        this.isAllLocationsSelected = false;
      }
    });
    this.actions$.pipe(
      ofActionDispatched(ShowOverridePenaltyDialog),
      takeWhile(() => this.isAlive)
    ).subscribe(() => {
      this.isSaving = false
      this.confirmService
        .confirm(DATA_OVERRIDE_TEXT, {
          title: DATA_OVERRIDE_TITLE,
          okButtonLabel: 'Confirm',
          okButtonClass: '',
        })
        .pipe(
          filter((confirm) => !!confirm),
          takeWhile(() => this.isAlive)
        )
        .subscribe(() => {
          this.saveReason(true);
        });
      });
  }

  private createForm(): void {
    this.form = new FormGroup({
      id: new FormControl(null),
      reason: new FormControl('', [Validators.required, Validators.maxLength(100), Validators.minLength(3), Validators.pattern(ALPHANUMERICS_AND_SYMBOLS)])
    });
    this.penaltiesForm = new FormGroup({
      candidateCancellationSettingId: new FormControl(null),
      reason: new FormControl(null, [Validators.required]),
      regionIds: new FormControl([], [Validators.required]),
      locationIds: new FormControl([], [Validators.required]),
      penaltyCriteria: new FormControl(PenaltyCriteria.FlatRateOfHours, [Validators.required]),
      flatRate: new FormControl(null, [Validators.required]),
      rateOfHours: new FormControl(null, [Validators.required]),
      flatRateOfHoursPercentage: new FormControl(null, [Validators.required]),
      flatRateOfHours: new FormControl(null, [Validators.required]),
    });
  }

  private subscribeOnSaveReasonSuccess(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveRejectReasonsSuccess, UpdateClosureReasonsSuccess, UpdateManualInvoiceRejectReasonSuccess, UpdateOrderRequisitionSuccess, SavePenaltySuccess),
      takeWhile(() => this.isAlive)
    ).subscribe(() =>this.closeSideDialog());
    this.actions$.pipe(
      ofActionSuccessful(SaveRejectReasonsError, SaveClosureReasonsError, SaveManualInvoiceRejectReasonError, SaveOrderRequisitionError, SavePenaltyError),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.isSaving = false);
  }

  public saveReason(forceUpsert?: boolean): void {
    if (this.selectedTab === ReasonsNavigationTabs.Penalties) {
      this.penaltiesForm.markAllAsTouched();
      if(this.penaltiesForm.invalid) {
        return;
      }
    } else {
      this.form.markAllAsTouched();
      if(this.form.invalid) {
        return;
      }
    }

    if (!this.isSaving) {
      this.isSaving = true;
      switch (this.selectedTab) {
        case ReasonsNavigationTabs.Rejection:
          if(!this.isEdit) {
            this.store.dispatch(new SaveRejectReasons({ reason: this.form.value.reason }));
          } else if(this.isEdit) {
            const payload = {
              id: this.form.value.id,
              reason: this.form.value.reason
            }

            this.store.dispatch(new UpdateRejectReasons(payload));
          }
          break;
        case ReasonsNavigationTabs.Requisition:
          this.store.dispatch(new SaveOrderRequisition({
            id: this.form.value.id,
            reason: this.form.value.reason
          }));
          break;
        case ReasonsNavigationTabs.Closure:
          const payload = {
            id: this.form.value.id,
            reason: this.form.value.reason
          }
          this.store.dispatch(new SaveClosureReasons(payload));
          break;
        case ReasonsNavigationTabs.ManualInvoice:
          const data: RejectReason = {
            id: this.form.value.id,
            reason: this.form.value.reason
          };

          this.store.dispatch(
            this.isEdit ? new UpdateManualInvoiceRejectReason(data) : new CreateManualInvoiceRejectReason(data)
          );
          break;
        case ReasonsNavigationTabs.Penalties:
          const penaltyValue = this.penaltiesForm.getRawValue();
          if (this.isAllRegionsSelected) {
            penaltyValue.regionIds = [];
          }
          if (this.isAllLocationsSelected) {
            penaltyValue.locationIds = [];
          }
          if (forceUpsert) {
            penaltyValue.forceUpsert = true;
          }
          this.store.dispatch(new SavePenalty(penaltyValue));
          break;
      }
    }
  }

  public addReason(): void {
    this.title = DialogMode.Add;
    this.isEdit = false;
    this.store.dispatch(new ShowSideDialog(true));
    this.isSaving = false;
  }

  public onEdit(data: RejectReason | Penalty): void {
    this.isEdit = true;
    this.title = DialogMode.Edit;
    if (this.selectedTab === ReasonsNavigationTabs.Penalties) {
      this.isAllLocationsSelected = (data as Penalty).locationId === null;
      let regions: number[];
      let locations: number[];
      if ((data as Penalty).regionId === null) {
        regions = this.regions.map((region => region.id)) as number[];
      } else {
        regions = [(data as Penalty).regionId];
      }
      if ((data as Penalty).locationId === null) {
        locations = [];
        this.selectedRegions = [];
        regions.forEach((id) =>
          this.selectedRegions.push(this.regions.find((region) => region.id === id) as OrganizationRegion)
        );
        this.selectedRegions.forEach((region) => region.locations?.forEach((location) => locations.push(location.id)));
      } else {
        locations = [(data as Penalty).locationId];
      }

      this.penaltiesForm.patchValue({
        candidateCancellationSettingId: (data as Penalty).candidateCancellationSettingId,
        reason: data.reason,
        regionIds: regions,
        locationIds: locations,
        flatRate: (data as Penalty).flatRate,
        flatRateOfHours: (data as Penalty).flatRateOfHours,
        flatRateOfHoursPercentage: (data as Penalty).flatRateOfHoursPercentage,
        rateOfHours: (data as Penalty).rateOfHours,
        penaltyCriteria: (data as Penalty).penaltyCriteria
      });
    } else {
      this.form.patchValue({
        id: (data as RejectReason).id,
        reason: data.reason
      });
    }

    this.store.dispatch(new ShowSideDialog(true));
    this.isSaving = false;
  }

  private closeSideDialog(): void {
    this.store.dispatch(new ShowSideDialog(false)).pipe(delay(500)).subscribe(() => {
      this.form.reset();
      this.penaltiesForm.reset();
      this.penaltiesForm.controls['penaltyCriteria'].setValue(PenaltyCriteria.FlatRateOfHours);
    });
  }

  public closeDialog(): void {
    let isDirty = false;
    if (this.selectedTab === ReasonsNavigationTabs.Penalties) {
      isDirty = this.penaltiesForm.dirty;
    } else {
      isDirty = this.form.dirty;
    }
    if (isDirty) {
      this.confirmService
        .confirm(CANCEL_REJECTION_REASON, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm:boolean) => !!confirm))
        .subscribe(() => {
          this.closeSideDialog()
        });
    } else {
      this.closeSideDialog()
    }
  }

  private canRejectOrClosureReason(): void {
    this.canRejectOrClosure = this.selectedTab === 0 ?
      this.userPermission[this.userPermissions.CanRejectCandidate] :
      this.userPermission[this.userPermissions.CanManageOrderClosureReasons];
  }
}
