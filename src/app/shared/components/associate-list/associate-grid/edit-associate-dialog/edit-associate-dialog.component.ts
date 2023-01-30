import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { Actions, Select, Store } from '@ngxs/store';
import { distinctUntilChanged, filter, Observable, Subject, takeWhile } from 'rxjs';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';

import { AssociateOrganizationsAgency, FeeExceptionsPage } from '@shared/models/associate-organizations.model';
import { ConfirmService } from '@shared/services/confirm.service';
import {
  DELETE_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE, OrganizationalHierarchy, OrganizationSettingKeys,
  UNSAVED_TABS_TEXT
} from '@shared/constants';
import PriceUtils from '@shared/utils/price.utils';
import { AssociateListState } from '@shared/components/associate-list/store/associate.state';
import { FeeSettingsComponent } from '@shared/components/associate-list/associate-grid/edit-associate-dialog/fee-settings/fee-settings.component';
import { PartnershipSettingsComponent } from '@shared/components/associate-list/associate-grid/edit-associate-dialog/partnership-settings/partnership-settings.component';
import { TiersException } from '@shared/components/associate-list/store/associate.actions';
import { Tabs, TabsText } from '@shared/components/associate-list/associate-grid/edit-associate-dialog/associate-settings.constant';
import { UserState } from '../../../../../store/user.state';
import { AgencyStatus } from '@shared/enums/status';
import { AbstractPermission } from "@shared/helpers/permissions";
import { createDepartmentsTier } from '@shared/helpers';
import { SettingsViewService } from '@shared/services';
import { TierLogic } from '@shared/enums/tier-logic.enum';
import { GetOrgTierStructure } from '../../../../../store/user.actions';

@Component({
  selector: 'app-edit-associate-dialog',
  templateUrl: './edit-associate-dialog.component.html',
  styleUrls: ['./edit-associate-dialog.component.scss'],
})
export class EditAssociateDialogComponent extends AbstractPermission implements OnInit, OnDestroy {
  @Input() openEvent: Subject<AssociateOrganizationsAgency>;
  @Output() editEndEvent = new EventEmitter<never>();

  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('editOrgTab') editOrgTab: TabComponent;

  @Select(AssociateListState.feeExceptionsPage)
  public feeExceptionsPage$: Observable<FeeExceptionsPage>;
  @Select(AssociateListState.baseFee)
  public baseFee$: Observable<number>;

  public targetElement: HTMLElement = document.body;
  public editAgencyOrg: AssociateOrganizationsAgency;
  public width: string;
  public feeSettingsForm: FormGroup;
  public partnershipForm: FormGroup;
  private tierControl: FormControl;
  public firstActive = true;
  public activeTab: number | string = 0;
  public agencyActionsAllowed = true;
  public readonly agencyStatus = AgencyStatus;
  public isAgencyInactive: boolean = true;
  public canEditPermission: boolean = true;
  public canViewTierTab: boolean = true;
  public feeSettingsText: string = TabsText[TabsText["Fee Settings"]];
  public tierExceptionText: string =TabsText[TabsText["Tier Settings"]];
  public partnershipText: string = TabsText[TabsText["Partnership Settings"]];
  private isAlive = true;
  public isAgency: boolean;

  constructor(
    protected override store: Store,
    private actions$: Actions,
    private confirmService: ConfirmService,
    private router: Router,
    private settingsViewService: SettingsViewService,
  ) {
    super(store);
  }

  override ngOnInit(): void {
    super.ngOnInit()
    this.isAgency = this.router.url.includes('agency');
    this.onOpenEvent();
    this.width = this.getDialogWidth();
    this.feeSettingsForm = FeeSettingsComponent.createFormGroup();
    this.onBaseFeeChanged();
    this.onFeeExceptionsPageChanged();

    this.partnershipForm = PartnershipSettingsComponent.createForm();

    if (this.isAgency) {
      this.checkForAgencyStatus();
    }
  }

  override ngOnDestroy(): void {
    this.isAlive = false;
    this.sideDialog.hide();
  }

  public onCancel(): void {
    if ((this.feeSettingsForm.dirty && this.feeSettingsForm.value.baseFee) || this.partnershipForm.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
          this.feeSettingsForm.reset();
          this.partnershipForm.reset();
          this.sideDialog.hide();
          this.editEndEvent.emit();
        });
    } else {
      this.sideDialog.hide();
      this.editEndEvent.emit();
    }
  }

  public onSave(): void {
    let switchTabVal=this.activeTab;
    switch (switchTabVal) {
      case Tabs.JobDistribution:
        this.partnershipForm.markAllAsTouched();
        if (this.partnershipForm.valid) {
          const jobDistributionFormValue = this.partnershipForm.getRawValue();
          this.store.dispatch(
            new TiersException.SavePartnershipSettings({ ...jobDistributionFormValue, associateOrganizationId: this.editAgencyOrg.id })
          );
        }
        break;
      case Tabs.TierException:
        this.tierControl.markAsTouched();
        if(this.tierControl.valid) {
          this.store.dispatch( new TiersException.SaveTier({
            associateOrganizationId: this.editAgencyOrg.id!,
            organizationTierId: this.getOrganizationTierId(this.tierControl.value)
          }));
        }
        break;
      case Tabs.FeeSettings:
        this.feeSettingsForm.markAllAsTouched();
        if (this.feeSettingsForm.valid && this.editAgencyOrg.id) {
          const { baseFee } = this.feeSettingsForm.getRawValue();
          this.store.dispatch(new TiersException.SaveBaseFee(this.editAgencyOrg.id, baseFee ? baseFee : null));
        }
        break;
      default:
        break;
    }
    this.partnershipForm.markAsUntouched();
    this.partnershipForm.markAsPristine();
    this.feeSettingsForm.markAsUntouched();
    this.feeSettingsForm.markAsPristine();
  }

  public onTabSelecting(tab: SelectingEventArgs): void {
    this.firstActive = false;

    let switchTabVal=this.switchTab(tab?.selectingItem?.innerText);
    this.activeTab = switchTabVal;
    switch (switchTabVal) {
      case Tabs.JobDistribution:
        this.confirmSwitchBetweenTab(this.partnershipForm, tab);
        break;
      case Tabs.FeeSettings:
        this.confirmSwitchBetweenTab(this.feeSettingsForm, tab);
        break;
      case Tabs.TierException:
        this.confirmSwitchBetweenTab(this.tierControl, tab);
        break;
      default:
        break;
    }

    this.checkUserPermission();
  }

  public handleTierControl(tierControl: FormControl): void {
    this.tierControl = tierControl;
  }

  private switchTab(tabSelected:string):number{
    //As the Tier Settings tab getting hidden tab so the switch logic is calling wrong tab so adding +1 to the tab number based on condition
    switch (tabSelected) {
      case TabsText[TabsText["Fee Settings"]]:
        return 0;
      case TabsText[TabsText["Tier Settings"]]:
        return 1;
      case TabsText[TabsText["Partnership Settings"]]:
        return 2;
        default:
        return 0;
    }

  }

  private onOpenEvent(): void {
    this.openEvent
      .pipe(takeWhile(() => this.isAlive))
      .subscribe((associateOrganizationsAgency: AssociateOrganizationsAgency) => {
        if (associateOrganizationsAgency) {
          this.editAgencyOrg = associateOrganizationsAgency;
          this.isAgencyInactive =
            associateOrganizationsAgency.agencyStatus === this.agencyStatus.Inactive ||
            associateOrganizationsAgency.agencyStatus === this.agencyStatus.Terminated;
          this.sideDialog.show();

          if (associateOrganizationsAgency.id && associateOrganizationsAgency.organizationId) {
            this.feeSettingsForm.patchValue({
              id: associateOrganizationsAgency.id,
              baseFee: PriceUtils.formatNumbers(associateOrganizationsAgency.baseFee),
            });

            this.getInitialDataForSettings(associateOrganizationsAgency);
            this.canViewTierSettings(associateOrganizationsAgency.organizationId);
          }
        }
      });
  }

  private getInitialDataForSettings(associateOrganizationsAgency: AssociateOrganizationsAgency): void {
    this.store.dispatch([
      new TiersException.GetFeeExceptionsInitialData(associateOrganizationsAgency.organizationId!),
      new TiersException.GetJobDistributionInitialData(),
      new TiersException.GetPartnershipSettings(associateOrganizationsAgency.id!),
      new TiersException.GetGeneralTiers(
        createDepartmentsTier(associateOrganizationsAgency.organizationId!)
      ),
      new TiersException.GetSelectedOrgAgency(associateOrganizationsAgency),
      new GetOrgTierStructure(associateOrganizationsAgency.organizationId)
    ]);
  }

  private onBaseFeeChanged(): void {
    this.baseFee$.pipe(takeWhile(() => this.isAlive)).subscribe((baseFee: number) => {
      this.feeSettingsForm.patchValue({ baseFee: PriceUtils.formatNumbers(baseFee) });
    });
  }

  private onFeeExceptionsPageChanged(): void {
    this.feeExceptionsPage$.pipe(takeWhile(() => this.isAlive)).subscribe((feeExceptions: FeeExceptionsPage) => {
      this.updateFeeExceptions(feeExceptions);
    });
  }

  private updateFeeExceptions(feeExceptions: FeeExceptionsPage): void {
    const feeExceptionsControl = this.feeSettingsForm.get('feeExceptions') as FormArray;
    feeExceptionsControl.clear();
    feeExceptions?.items.forEach((fee) => {
      const control = FeeSettingsComponent.createFeeExceptionsForm();
      control.patchValue({ ...fee });
      feeExceptionsControl.push(control);
    });
  }

  private confirmSwitchBetweenTab(tabForm: FormGroup | FormControl, tab: SelectingEventArgs): void {
    if (tabForm?.dirty) {
      tab.cancel = true;
      this.confirmService
        .confirm(UNSAVED_TABS_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm) => confirm))
        .subscribe(() => {
          tabForm.markAsPristine();
          this.editOrgTab.select(tab.selectingIndex);
          this.activeTab = this.switchTab(tab?.selectingItem?.innerText);
        });
    }
  }

  private getDialogWidth(): string {
    const thirdPart = window.innerWidth / 3;
    return `${thirdPart * 2}px`;
  }

  private checkForAgencyStatus(): void {
    this.store
      .select(UserState.agencyActionsAllowed)
      .pipe(
        distinctUntilChanged(),
        takeWhile(() => this.isAlive)
      )
      .subscribe((value) => {
        this.agencyActionsAllowed = value;
      });
  }

  private checkUserPermission(): void {
    let switchTabVal=this.activeTab;
    switch (switchTabVal) {
      case Tabs.FeeSettings:
        this.canEditPermission = this.userPermission[this.userPermissions.CanEditFeeExceptions];
        break;
      case Tabs.TierException:
        this.canEditPermission = !this.isAgency;
        break;
      case Tabs.JobDistribution:
        this.canEditPermission = this.userPermission[this.userPermissions.CanEditPartnershipSettings];
        break;
      default:
        this.canEditPermission = true;
    }
  }

  private canViewTierSettings(id: number): void {
    this.settingsViewService.getViewSettingKey(
      OrganizationSettingKeys.TieringLogic,
      OrganizationalHierarchy.Organization,
      id,
      id
    ).pipe(
      takeWhile(() => this.isAlive)
    ).subscribe(({TieringLogic}) => {
      this.canViewTierTab = TieringLogic === TierLogic.Show;
    })
  }

  private getOrganizationTierId(id: number | null): number | null {
    return id && id >= 0 ? id : null;
  }
}
