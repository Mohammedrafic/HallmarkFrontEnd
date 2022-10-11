import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { distinctUntilChanged, filter, Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { AssociateOrganizationsAgency, FeeExceptionsPage } from '@shared/models/associate-organizations.model';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { SelectingEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { Actions, Select, Store } from '@ngxs/store';
import { FormArray, FormGroup } from '@angular/forms';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, UNSAVED_TABS_TEXT } from '@shared/constants';
import PriceUtils from '@shared/utils/price.utils';
import { AssociateListState } from '@shared/components/associate-list/store/associate.state';
import { FeeSettingsComponent } from '@shared/components/associate-list/associate-grid/edit-associate-dialog/fee-settings/fee-settings.component';
import { PartnershipSettingsComponent } from '@shared/components/associate-list/associate-grid/edit-associate-dialog/partnership-settings/partnership-settings.component';
import {
  GetFeeExceptionsInitialData,
  GetJobDistributionInitialData,
  GetPartnershipSettings,
  SaveBaseFee,
  SavePartnershipSettings,
} from '@shared/components/associate-list/store/associate.actions';
import { Router } from '@angular/router';
import { Tabs } from '@shared/components/associate-list/associate-grid/edit-associate-dialog/associate-settings.constant';
import { UserState } from '../../../../../store/user.state';
import { AgencyStatus } from '@shared/enums/status';

@Component({
  selector: 'app-edit-associate-dialog',
  templateUrl: './edit-associate-dialog.component.html',
  styleUrls: ['./edit-associate-dialog.component.scss'],
})
export class EditAssociateDialogComponent implements OnInit, OnDestroy {
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
  public firstActive = true;
  public activeTab: number | string = 0;
  public agencyActionsAllowed = true;
  public readonly agencyStatus = AgencyStatus;

  private isAlive = true;
  private isAgency: boolean;

  constructor(
    private store: Store,
    private actions$: Actions,
    private confirmService: ConfirmService,
    private router: Router
  ) {}

  ngOnInit(): void {
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

  ngOnDestroy(): void {
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
    switch (this.editOrgTab.selectedItem) {
      case Tabs.JobDistribution:
        this.partnershipForm.markAllAsTouched();
        if (this.partnershipForm.valid) {
          const jobDistributionFormValue = this.partnershipForm.getRawValue();
          this.store.dispatch(
            new SavePartnershipSettings({ ...jobDistributionFormValue, associateOrganizationId: this.editAgencyOrg.id })
          );
        }
        break;
      case Tabs.FeeSettings:
        this.feeSettingsForm.markAllAsTouched();
        if (this.feeSettingsForm.valid && this.editAgencyOrg.id) {
          const { baseFee } = this.feeSettingsForm.getRawValue();
          this.store.dispatch(new SaveBaseFee(this.editAgencyOrg.id, baseFee ? baseFee : null));
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
    this.activeTab = tab.selectingIndex;

    this.editOrgTab.selectedItem === Tabs.JobDistribution
      ? this.confirmSwitchBetweenTab(this.partnershipForm, tab)
      : this.confirmSwitchBetweenTab(this.feeSettingsForm, tab);
  }

  private onOpenEvent(): void {
    this.openEvent
      .pipe(takeWhile(() => this.isAlive))
      .subscribe((associateOrganizationsAgency: AssociateOrganizationsAgency) => {
        if (associateOrganizationsAgency) {
          const isAgency = this.router.url.includes('agency');
          this.editAgencyOrg = associateOrganizationsAgency;
          this.sideDialog.show();

          if (associateOrganizationsAgency.id && associateOrganizationsAgency.organizationId) {
            this.feeSettingsForm.patchValue({
              id: associateOrganizationsAgency.id,
              baseFee: PriceUtils.formatNumbers(associateOrganizationsAgency.baseFee),
            });
            this.store.dispatch(new GetFeeExceptionsInitialData(associateOrganizationsAgency.organizationId));
            this.store.dispatch(new GetJobDistributionInitialData());
            this.store.dispatch(new GetPartnershipSettings(associateOrganizationsAgency.id));
          }
        }
      });
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

  private confirmSwitchBetweenTab(tabForm: FormGroup, tab: SelectingEventArgs): void {
    if (tabForm.dirty) {
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
          this.activeTab = Tabs[tab.selectingIndex];
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
}
