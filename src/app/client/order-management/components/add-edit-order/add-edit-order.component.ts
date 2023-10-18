import unionBy from 'lodash/fp/unionBy';
import { filter, Observable, skip, Subject, takeUntil } from 'rxjs';
import { ItemModel, SelectEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { MenuEventArgs } from '@syncfusion/ej2-angular-splitbuttons';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';

import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  ClearPredefinedBillRates,
  EditOrder,
  GetParentOrderById,
  GetPredefinedBillRates,
  SaveOrder,
  SaveOrderSucceeded,
  SelectNavigationTab,
  SetIsDirtyOrderForm,
} from '@client/store/order-managment-content.actions';
import { OrderDetailsFormComponent } from '../order-details-form/order-details-form.component';
import { CreateOrderDto, EditOrderDto, GetPredefinedBillRatesData, Order } from '@shared/models/order-management.model';
import { BillRatesComponent } from '@shared/components/bill-rates/bill-rates.component';
import { BillRate, OrderBillRateDto } from '@shared/models/bill-rate.model';
import { IOrderCredentialItem } from '@order-credentials/types';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { OrderStatus } from '@shared/enums/order-management';
import { OrderCandidatesCredentialsState } from '@order-credentials/store/credentials.state';
import { UpdatePredefinedCredentials } from '@order-credentials/store/credentials.actions';
import { OrderType } from '@shared/enums/order-type';
import some from 'lodash/fp/some';
import isNil from 'lodash/fp/isNil';
import { AbstractControl } from '@angular/forms';
import { OrganizationOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { SaveTemplateDialogService } from '@client/order-management/components/save-template-dialog/save-template-dialog.service';
import { ToastUtility } from '@syncfusion/ej2-notifications';
import { ConfirmService } from '@shared/services/confirm.service';
import { BillRatesSyncService } from '@shared/services/bill-rates-sync.service';
import { OrderJobDistribution } from '@shared/enums/job-distibution';
import {
  ERROR_CAN_NOT_Edit_OpenPositions,
  ExtensionStartDateValidation,
  JOB_DISTRIBUTION_TITLE,
  ORDER_DISTRIBUTED_TO_ALL,
  PROCEED_FOR_ALL_AGENCY,
  PROCEED_FOR_TIER_LOGIC,
} from '@shared/constants';
import { OrderCredentialsService } from "@client/order-management/services";
import { JobDistributionModel } from '@shared/models/job-distribution.model';
import { DateTimeHelper, GenerateLocationDepartmentOverlapMessage, IsStartEndDateOverlapWithInactivePeriod }
  from '@core/helpers';
import { FieldName } from '@client/order-management/enums';
import { MessageTypes } from '@shared/enums/message-types';
import { ShowToast } from 'src/app/store/app.actions';
import { ValidationCredentialOption, ValidationExistenceCredential }
  from '@order-credentials/constants/credential-message.constant';


enum SelectedTab {
  OrderDetails,
  Credentials,
  BillRates,
}

enum SubmitButtonItem {
  SaveForLater = '0',
  Save = '1',
  SaveAsTemplate = '2',
}

@Component({
  selector: 'app-add-edit-order',
  templateUrl: './add-edit-order.component.html',
  styleUrls: ['./add-edit-order.component.scss'],
})
export class AddEditOrderComponent implements OnDestroy, OnInit {
  @ViewChild('stepper') tab: TabComponent;
  @ViewChild('orderDetailsForm') orderDetailsFormComponent: OrderDetailsFormComponent;
  @ViewChild('billRates') billRatesComponent: BillRatesComponent;

  @Input('handleSaveEvents') public handleSaveEvents$: Subject<void | MenuEventArgs>;
  @Input() public externalCommentConfiguration ?: boolean | null;

  @Select(OrderManagementContentState.selectedOrder)
  selectedOrder$: Observable<Order>;

  @Select(OrderManagementContentState.selectedParentOrder)
  selectedParentOrder$: Observable<Order>;

  @Select(OrderManagementContentState.getPredefinedBillRatesData)
  getPredefinedBillRatesData$: Observable<GetPredefinedBillRatesData | null>;

  @Select(OrderManagementContentState.predefinedBillRates)
  predefinedBillRates$: Observable<BillRate[]>;

  @Select(OrderCandidatesCredentialsState.predefinedCredentials)
  predefinedCredentials$: Observable<IOrderCredentialItem[]>;

  public SelectedTab = SelectedTab;
  public orderId: number;
  public publicId: number;

  public submitMenuItems: ItemModel[] = [
    { id: SubmitButtonItem.SaveForLater, text: 'Save For Later' },
    { id: SubmitButtonItem.SaveAsTemplate, text: 'Save as Template' },
  ];
  public selectedTab: SelectedTab = SelectedTab.OrderDetails;
  // todo: update/set credentials list in edit mode for order
  public orderCredentials: IOrderCredentialItem[] = [];
  public orderBillRates: BillRate[] = [];
  private manuallyAddedBillRates: BillRate[] = [];
  private unsubscribe$: Subject<void> = new Subject();
  private order: Order;
  public parentOrder: Order;
  public startDate: Date;

  public isPerDiem = false;
  public isPermPlacementOrder = false;
  public disableOrderType = false;
  public isSaveForTemplate = false;
  public isTemplate = false;

  private isCredentialsChanged = false;
  private isBillRatesChanged = false;

  public constructor(
    private orderCredentialsService: OrderCredentialsService,
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private actions$: Actions,
    private saveTemplateDialogService: SaveTemplateDialogService,
    private confirmService: ConfirmService,
    private billRatesSyncService: BillRatesSyncService,
    private cd: ChangeDetectorRef,
  ) {
    this.orderId = Number(this.route.snapshot.paramMap.get('orderId'));
    this.isTemplate = !!this.route.snapshot.paramMap.get('fromTemplate');
  }

  public get generalInformationForm(): Order {
    return {
      ...this.orderDetailsFormComponent.generalInformationForm.getRawValue(),
      title: this.orderDetailsFormComponent.orderTypeForm.get('title')?.value,
    };
  }

  public ngOnInit(): void {
    if (this.orderId > 0) {
      this.selectedOrder$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe((order: Order) => {
        this.order = order;
        this.publicId = order?.publicId as number;
        this.isPermPlacementOrder = order?.orderType === OrderType.PermPlacement;
        this.initCredentialsAndBillRates(order);
        if (this.isPermPlacementOrder) {
          this.tab.hideTab(SelectedTab.BillRates, this.isPermPlacementOrder);
        }

        if (order?.status === OrderStatus.Incomplete) {
          this.addMenuItem(SubmitButtonItem.SaveForLater, 'Save For Later');
          this.removeMenuItem(SubmitButtonItem.Save);
        } else {
          if (
            (order?.orderType === OrderType.OpenPerDiem ||
              order?.orderType === OrderType.PermPlacement ||
              order?.extensionFromId) &&
            order?.status !== OrderStatus.PreOpen
          ) {
            this.disableOrderType = true;
          }
          this.addMenuItem(SubmitButtonItem.Save, 'Save');
          this.removeMenuItem(SubmitButtonItem.SaveForLater);
        }
        if(order?.extensionFromId != null){
          this.store.dispatch(new GetParentOrderById(order?.extensionFromId))
        }
      });

      this.selectedParentOrder$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe((parentOrder: Order) => {
        this.parentOrder = parentOrder;
      });
    }
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionDispatched(SaveOrderSucceeded)).subscribe(() => {
      this.router.navigate(['/client/order-management']);
    });
    if (this.isTemplate) {
      this.selectedOrder$.pipe(takeUntil(this.unsubscribe$)).subscribe((order: Order) => {
        this.initCredentialsAndBillRates(order);
      });
    }

    this.getPredefinedBillRatesData$.pipe(takeUntil(this.unsubscribe$)).subscribe((getPredefinedBillRatesData) => {
      if (getPredefinedBillRatesData && !getPredefinedBillRatesData.ignoreUpdateBillRate) {
        this.store.dispatch(new GetPredefinedBillRates());
      }
    });

    this.subscribeOnPredefinedCredentials();
    this.subscribeOnPredefinedBillRates();
    this.watchForSaveEvents();
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.store.dispatch(new ClearPredefinedBillRates());
    this.store.dispatch(new UpdatePredefinedCredentials([]));
    this.store.dispatch(new SetIsDirtyOrderForm(false));
  }

  private initCredentialsAndBillRates(order: Order): void {
    if (order?.credentials) {
      this.orderCredentials = [...order.credentials];
    }
    if (order?.billRates && !order.isTemplate) {
      this.orderBillRates = [...order.billRates];
    }
  }

  public onOrderTypeChange(orderType: OrderType): void {
    this.isPerDiem = orderType === OrderType.OpenPerDiem;
    this.isPermPlacementOrder = orderType === OrderType.PermPlacement;
    this.tab.hideTab(SelectedTab.BillRates, this.isPerDiem || this.isPermPlacementOrder);
  }

  public onStepperCreated(): void {
    let forceHourlyRateSync = true;
    this.tab.selected.pipe(takeUntil(this.unsubscribe$)).subscribe((event: SelectEventArgs) => {
      this.selectedTab = event.selectedIndex;
      if (this.selectedTab === SelectedTab.BillRates && forceHourlyRateSync) {
        forceHourlyRateSync = false;
        const value = this.orderDetailsFormComponent.generalInformationForm.value.hourlyRate;
        setTimeout(() => this.hourlyRateToBillRateSync(value));
      }
      this.cd.detectChanges();
    });
  }

  public onSplitButtonSelect(args: MenuEventArgs): void {
    switch (args.item.id) {
      case SubmitButtonItem.Save:
        this.saveForLater();
        break;

      case SubmitButtonItem.SaveForLater:
        this.saveForLater();
        this.store.dispatch(new SelectNavigationTab(OrganizationOrderManagementTabs.Incomplete));
        break;

      case SubmitButtonItem.SaveAsTemplate:
        this.saveAsTemplate();
        break;
    }
  }

  public onBillRatesChanged(): void {
    this.isBillRatesChanged = true;
    this.store.dispatch(new SetIsDirtyOrderForm(true));
  }

  public updateOrderCredentials(credential: IOrderCredentialItem): void {
    this.isCredentialsChanged = true;
    this.orderCredentials = this.orderCredentialsService.updateOrderCredentials(this.orderCredentials, credential);
    this.store.dispatch(new SetIsDirtyOrderForm(true));
  }

  public deleteOrderCredential(credential: IOrderCredentialItem): void {
    this.isCredentialsChanged = true;
    this.orderCredentials = this.orderCredentialsService.deleteOrderCredential(this.orderCredentials, credential);
    this.store.dispatch(new SetIsDirtyOrderForm(true));
  }

  public isOrderTouched(): boolean {
    return this.orderDetailsFormComponent?.orderTypeForm?.touched
      || this.orderDetailsFormComponent?.generalInformationForm?.touched
      || this.orderDetailsFormComponent?.jobDistributionForm?.touched
      || this.orderDetailsFormComponent?.jobDescriptionForm?.touched
      || this.orderDetailsFormComponent?.contactDetailsForm?.touched
      || this.orderDetailsFormComponent?.workLocationForm?.touched
      || this.orderDetailsFormComponent?.specialProject?.touched
      || this.isBillRatesChanged
      || this.isCredentialsChanged;
  }

  private collectInvalidFields(): string[] {
    const forms = [
      this.orderDetailsFormComponent.generalInformationForm.controls,
      this.orderDetailsFormComponent.jobDistributionForm.controls,
      this.orderDetailsFormComponent.jobDescriptionForm.controls,
      this.orderDetailsFormComponent.contactDetailsForm.controls,
      this.orderDetailsFormComponent.workLocationForm.controls,
      this.orderDetailsFormComponent.specialProject.controls,
    ];

    const requiredFields = forms.map((controls) => {
      const invalidaControls = Object.keys(controls).filter((control) => {
        const filedHasRequiredError = !!(controls[control].invalid && controls[control].errors?.['required']);
        return filedHasRequiredError;
      });

      return invalidaControls;
    }).flat().map((controlName) => {
      return `\u2022 ${FieldName[controlName as keyof typeof FieldName]}`;
    });

    return requiredFields;
  }

  private showOrderFormValidationMessage(fieldsString?: string): void {
    const fields = fieldsString || this.collectInvalidFields().join(',\n');

    if (fields && fields.length) {
      ToastUtility.show({
        title: 'Error',
        content: 'Please fill in the required fields in Order Details tab:\n' + fields,
        position: { X: 'Center', Y: 'Top' },
        cssClass: 'error-toast',
      });
    }
  }

  private showInvalidValueMessage(): void {
    const controls = this.orderDetailsFormComponent.generalInformationForm.controls;
    const invalidFields = Object.keys(controls).filter((control) => {
      const filedHasRequiredError = !!(controls[control].invalid && !controls[control].errors?.['required']);
      return filedHasRequiredError;
    }).map((controlName) => `\u2022 ${FieldName[controlName as keyof typeof FieldName]}`);

    if (invalidFields && invalidFields.length) {
      ToastUtility.show({
        title: 'Error',
        content: 'Please fill in a correct value in Order Details tab:\n' + invalidFields.join(',\n'),
        position: { X: 'Center', Y: 'Top' },
        cssClass: 'error-toast',
      });
    }
  }

  private showCredentialsValidationMessage(credentialState: boolean): void {
    const message = credentialState
      ? ValidationCredentialOption
      : ValidationExistenceCredential;

    ToastUtility.show({
      title: 'Error',
      content: message,
      position: { X: 'Center', Y: 'Top' },
      cssClass: 'error-toast',
    });
  }

  private showBillRatesValidationMessage(): void {
    ToastUtility.show({
      title: 'Error',
      content: 'Please set up at least one Regular Bill Rate in Organization Settings',
      position: { X: 'Center', Y: 'Top' },
      cssClass: 'error-toast',
    });
  }

  public save(): void {
    if(this.order) {
      this.checkJobDistributionChange();
    } else {
      this.saveOrder();
    }
  }

  private showConfirmPopupForZeroRate(order: CreateOrderDto, documents: Blob[]): void {
    this.confirmService
      .confirm('Are you sure you want to submit order with $0.00 Hourly Rate?', {
        title: 'Confirmation',
        okButtonLabel: 'Yes',
        cancelButtonLabel: 'No',
        okButtonClass: 'delete-button',
      })
      .pipe(filter((confirm) => !!confirm),takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.checkInactiveLocationDepartmentOverlap(order, documents);
      });
  }

  private showConfirmLocationDepartmentOverlap(order: CreateOrderDto, documents: Blob[], message: string): void {
    this.confirmService
      .confirm(message, {
        title: 'Confirmation',
        okButtonLabel: 'Yes',
        cancelButtonLabel: 'Cancel',
        okButtonClass: 'delete-button',
      })
      .pipe(filter((confirm) => !!confirm),takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.proceedWithSaving(order, documents);
      });
  }

  private checkInactiveLocationDepartmentOverlap(order: CreateOrderDto, documents: Blob[]): void {
    if (this.orderDetailsFormComponent.selectedLocation && this.orderDetailsFormComponent.selectedDepartment && (order.orderType !== OrderType.OpenPerDiem)) {
      const jobEndDate = order.jobEndDate;
      const jobStartDate = order.jobStartDate;
      const locationInactiveDate = this.orderDetailsFormComponent.selectedLocation.inactiveDate ?
        new Date(DateTimeHelper.formatDateUTC(this.orderDetailsFormComponent.selectedLocation.inactiveDate, 'MM/dd/yyyy')) : null;
      const locationReactivateDate = this.orderDetailsFormComponent.selectedLocation.reactivateDate ?
        new Date(DateTimeHelper.formatDateUTC(this.orderDetailsFormComponent.selectedLocation.reactivateDate, 'MM/dd/yyyy')) : null;
      const departmentInactiveDate = this.orderDetailsFormComponent.selectedDepartment.inactiveDate ?
        new Date(DateTimeHelper.formatDateUTC(this.orderDetailsFormComponent.selectedDepartment.inactiveDate, 'MM/dd/yyyy')) : null;
      const departmentReactivateDate = this.orderDetailsFormComponent.selectedDepartment.reactivateDate ?
        new Date(DateTimeHelper.formatDateUTC(this.orderDetailsFormComponent.selectedDepartment.reactivateDate, 'MM/dd/yyyy')) : null;
        locationInactiveDate && locationInactiveDate.setHours(0, 0, 0, 0);
        departmentInactiveDate && departmentInactiveDate.setHours(0, 0, 0, 0);
      const isLocationOverlaps = IsStartEndDateOverlapWithInactivePeriod(locationInactiveDate, locationReactivateDate, jobStartDate, jobEndDate);
      const isDepartmentOverlaps = IsStartEndDateOverlapWithInactivePeriod(departmentInactiveDate, departmentReactivateDate, jobStartDate, jobEndDate);
      const isLocationDepartmentDateSame = this.orderDetailsFormComponent.selectedLocation.inactiveDate === this.orderDetailsFormComponent.selectedDepartment.inactiveDate;
      if (isLocationOverlaps || isDepartmentOverlaps) {
        this.showConfirmLocationDepartmentOverlap(order, documents, GenerateLocationDepartmentOverlapMessage(isLocationOverlaps, isDepartmentOverlaps, isLocationDepartmentDateSame, locationInactiveDate as Date, departmentInactiveDate as Date));
      } else {
        this.proceedWithSaving(order, documents);
      }
    } else {
      this.proceedWithSaving(order, documents);
    }
  }

  private proceedWithSaving(order: CreateOrderDto, documents: Blob[]): void {
    const selectedDistributions = this.getJobDistributionOptions(order.jobDistributions);
    const prevDistributions = this.order ? this.getJobDistributionOptions(this.order.jobDistributions) : [];
    let message = null;

    if(
      prevDistributions.includes(OrderJobDistribution.TierLogic) &&
      selectedDistributions.includes(OrderJobDistribution.All)) {
      message = ORDER_DISTRIBUTED_TO_ALL;
    }
    if (this.orderId) {
      this.store.dispatch(
        new EditOrder(
          {
            ...order,
            id: this.orderId,
            deleteDocumentsGuids: this.orderDetailsFormComponent.deleteDocumentsGuids,
          },
          documents,
          message as string
        )
      );
    } else {
      this.store.dispatch(
        new SaveOrder(
          order,
          documents,
          this.orderDetailsFormComponent.isEditMode ? undefined : this.orderDetailsFormComponent.comments
        )
      );
    }
  }

  private isZeroRate(hourlyRate: string): boolean {
    return hourlyRate === '0.00';
  }

  needToShowConfirmPopup(order: CreateOrderDto, hourlyRate: string): boolean {
    return (
      (order.orderType === OrderType.ContractToPerm || order.orderType === OrderType.LongTermAssignment) &&
      this.isZeroRate(hourlyRate)
    );
  }

  hourlyRateToBillRateSync(value: string): void {
    if (!this.billRatesComponent?.billRatesControl.value) {
      return;
    }

    const billRates = this.billRatesComponent?.billRatesControl.value;
    const regularBillRate = this.billRatesSyncService.getBillRateForSync(
      billRates, this.orderDetailsFormComponent.generalInformationForm.value.jobStartDate
    );

    if (!regularBillRate) {
      return;
    }

    const restBillRates = this.billRatesComponent?.billRatesControl.value.filter(
      (billRate: BillRate) => billRate.billRateConfig.id !== regularBillRate?.id
    );

    regularBillRate.rateHour = Number(value);

    this.billRatesComponent.billRatesControl.patchValue([...restBillRates, regularBillRate]);
  }

  hourlyRateToOrderSync(event: { value: string; billRate?: BillRate }): void {
    const { value, billRate } = event;

    if (!value) {
      return;
    }
    const billRates = this.billRatesComponent?.billRatesControl.value;
    const billRateToUpdate: BillRate | null = this.billRatesSyncService.getBillRateForSync(
      billRates, this.orderDetailsFormComponent.generalInformationForm.value.jobStartDate
    );

    if (billRateToUpdate?.id !== billRate?.id) {
      return;
    }

    this.orderDetailsFormComponent.generalInformationForm.patchValue({ hourlyRate: value }, { emitEvent: false });
  }

  private getMenuButtonIndex(menuItem: SubmitButtonItem): number {
    return this.submitMenuItems.findIndex((i: ItemModel) => i.id === menuItem);
  }

  private addMenuItem(menuItem: SubmitButtonItem, text: string): void {
    const index = this.getMenuButtonIndex(menuItem);

    if (index < 0) {
      this.submitMenuItems.unshift({ id: menuItem, text });
      this.submitMenuItems = [...this.submitMenuItems];
    }
  }

  private removeMenuItem(menuItem: SubmitButtonItem): void {
    const index = this.getMenuButtonIndex(menuItem);

    if (index >= 0) {
      this.submitMenuItems.splice(index, 1);
      this.submitMenuItems = [...this.submitMenuItems];
    }
  }

  private collectOrderData(isSubmit: boolean): CreateOrderDto {
    let orderBillRates: BillRate[] | null;
    if (this.isPerDiem || this.isPermPlacementOrder) {
      orderBillRates = null;
    } else {
      orderBillRates = this.billRatesComponent?.billRatesControl.value || this.orderBillRates;

      const billRateToUpdate = this.billRatesSyncService.getBillRateForSync(
        orderBillRates as BillRate[], this.orderDetailsFormComponent.generalInformationForm.value.jobStartDate
      );
      const index = orderBillRates?.indexOf(billRateToUpdate as BillRate) as number;
      if (index > -1) {
        const hourlyRate = this.orderDetailsFormComponent.generalInformationForm.getRawValue().hourlyRate;
        if (orderBillRates) {
          orderBillRates[index].rateHour = hourlyRate;
        }
      }
    }

    const allValues = {
      ...this.orderDetailsFormComponent.orderTypeForm.getRawValue(),
      ...this.orderDetailsFormComponent.generalInformationForm.getRawValue(),
      ...this.orderDetailsFormComponent.jobDistributionForm.getRawValue(),
      ...this.orderDetailsFormComponent.jobDescriptionForm.getRawValue(),
      ...this.orderDetailsFormComponent.contactDetailsForm.getRawValue(),
      ...this.orderDetailsFormComponent.workLocationForm.getRawValue(),
      ...this.orderDetailsFormComponent.specialProject.getRawValue(),
      ...{ credentials: this.orderCredentials },
      ...{ billRates: orderBillRates },
       AllowToUpdateDept:this.orderDetailsFormComponent.AllowToUpdateDept
    };

    const {
      orderType,
      title,
      regionId,
      locationId,
      departmentId,
      skillId,
      projectTypeId,
      projectNameId,
      poNumberId,
      hourlyRate,
      openPositions,
      minYrsRequired,
      joiningBonus,
      compBonus,
      duration,
      jobStartDate,
      jobEndDate,
      shift,
      shiftStartTime,
      shiftEndTime,
      jobDistributions,
      classifications,
      onCallRequired,
      asapStart,
      criticalOrder,
      jobDescription,
      unitDescription,
      orderRequisitionReasonId,
      orderRequisitionReasonName,
      contactDetails,
      workLocations,
      credentials,
      canApprove,
      annualSalaryRangeFrom,
      annualSalaryRangeTo,
      orderPlacementFee,
      linkedId,
      AllowToUpdateDept
    } = allValues;
    const billRates: OrderBillRateDto[] = (allValues.billRates as BillRate[])?.map((billRate: BillRate) => {
      const {
        id,
        billRateConfigId,
        rateHour,
        intervalMin,
        intervalMax,
        effectiveDate,
        billType,
        editAllowed,
        isPredefined,
        seventhDayOtEnabled,
        weeklyOtEnabled,
        dailyOtEnabled,
        holidayCalculationEnabled,
      } = billRate;
      return {
        id: id || 0,
        billRateConfigId,
        rateHour,
        intervalMin,
        intervalMax,
        effectiveDate,
        billType,
        editAllowed,
        isPredefined,
        seventhDayOtEnabled,
        weeklyOtEnabled,
        dailyOtEnabled,
        holidayCalculationEnabled,
        AllowToUpdateDept
      };
    });

    const order: CreateOrderDto | EditOrderDto = {
      title,
      regionId,
      locationId,
      departmentId,
      skillId,
      orderType,
      projectTypeId,
      projectNameId,
      poNumberId,
      hourlyRate,
      openPositions,
      minYrsRequired,
      joiningBonus,
      compBonus,
      duration,
      jobStartDate,
      jobEndDate,
      shift,
      shiftStartTime,
      shiftEndTime,
      classifications,
      onCallRequired,
      asapStart,
      criticalOrder,
      jobDescription,
      unitDescription,
      orderRequisitionReasonId,
      orderRequisitionReasonName,
      billRates,
      jobDistributions,
      contactDetails,
      workLocations,
      credentials,
      isSubmit,
      canApprove,
      annualSalaryRangeFrom,
      annualSalaryRangeTo,
      orderPlacementFee,
      isTemplate: false,
      linkedId,
      AllowToUpdateDept
    };

    if (this.orderDetailsFormComponent.order?.isTemplate) {
      const selectedOrder = this.store.selectSnapshot(OrderManagementContentState.selectedOrder);
      order.fromTemplateId = selectedOrder?.id;
      order.contactDetails = order.contactDetails.map((contact) => ({ ...contact, id: 0 }));
      order.jobDistributions = order.jobDistributions.map((job) => ({ ...job, orderId: 0, id: 0 }));
      order.workLocations = order.workLocations.map((workLocation) => ({ ...workLocation, id: 0 }));
    }

    if (!order.hourlyRate) {
      order.hourlyRate = null;
    }

    if (!order.openPositions) {
      order.openPositions = null;
    }

    if (!order.minYrsRequired) {
      order.minYrsRequired = null;
    }

    if (!order.joiningBonus) {
      order.joiningBonus = null;
    }

    if (!order.compBonus) {
      order.compBonus = null;
    }

    if (order.jobStartDate) {
      order.jobStartDate.setHours(0, 0, 0, 0);
    }

    if (order.jobEndDate) {
      order.jobEndDate.setHours(0, 0, 0, 0);
    }

    return order;
  }

  private saveForLater(): void {
    const titleControl = this.orderDetailsFormComponent.orderTypeForm.controls['title'];
    const workLocationForm = this.orderDetailsFormComponent.workLocationForm;
    const hasSelectedCredentialFlag = this.orderCredentialsService.hasSelectedCredentialFlags(this.orderCredentials);

    if (titleControl.invalid) {
      titleControl.markAsTouched();
      this.showOrderFormValidationMessage(FieldName.title);
      return;
    }

    if (!this.orderCredentials?.length || !hasSelectedCredentialFlag) {
      this.showCredentialsValidationMessage(!!this.orderCredentials?.length && !hasSelectedCredentialFlag);
      return;
    }

    const order = this.collectOrderData(false);
    const documents = this.orderDetailsFormComponent.documents;

    if (workLocationForm.invalid) {
      order.workLocations = [];
    }

    if (this.orderId) {
      this.store.dispatch(
        new EditOrder(
          {
            ...order,
            id: this.orderId,
            deleteDocumentsGuids: this.orderDetailsFormComponent.deleteDocumentsGuids,
          },
          documents
        )
      );
    } else {
      this.store.dispatch(new SaveOrder(order, documents, this.orderDetailsFormComponent.comments));
    }
  }

  private subscribeOnPredefinedCredentials(): void {
    this.predefinedCredentials$
      .pipe(
        skip(1),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((predefinedCredentials: IOrderCredentialItem[]) => {
        if (!this.orderDetailsFormComponent.isEditMode) {
          this.orderCredentials = predefinedCredentials;
          this.cd.detectChanges();
          return;
        }

        const departmentChanged = this.orderDetailsFormComponent?.generalInformationForm.get('departmentId')?.touched;
        const skillChanged = this.orderDetailsFormComponent?.generalInformationForm.get('skillId')?.touched;

        if (this.orderDetailsFormComponent.isEditMode && (departmentChanged || skillChanged)) {
          const credentials = this.orderCredentials.filter(cred => !cred.isPredefined);
          this.orderCredentials = unionBy('credentialId', credentials, predefinedCredentials);
          this.cd.detectChanges();
        }
      });
  }

  private subscribeOnPredefinedBillRates(): void {
    this.predefinedBillRates$
      .pipe(
        filter(() => this.billRatesSyncService.getFormChangedState()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((predefinedBillRates) => {
        if (this.billRatesComponent?.billRatesControl) {
          this.manuallyAddedBillRates = this.billRatesComponent.billRatesControl
            .getRawValue()
            .filter((billrate) => !billrate.isPredefined);
        }

        this.orderBillRates = [...predefinedBillRates, ...this.manuallyAddedBillRates];
        this.cd.detectChanges();
      });
  }

  private getOrderDetailsControl(name: string): AbstractControl {
    return this.orderDetailsFormComponent.generalInformationForm.get(name) as AbstractControl;
  }

  private saveAsTemplate(): void {
    const { regionId, locationId, departmentId, skillId } =
      this.orderDetailsFormComponent.generalInformationForm.getRawValue();
    const requiredFields = [regionId, locationId, departmentId, skillId];
    const isRequiredFieldsFilled = !some(isNil, requiredFields);
    const hasSelectedCredentialFlag = this.orderCredentialsService.hasSelectedCredentialFlags(this.orderCredentials);
    
    if (isRequiredFieldsFilled && hasSelectedCredentialFlag) {
      this.isSaveForTemplate = true;
    } else {
      this.markControlsAsRequired();
      const fields = [FieldName.regionId, FieldName.locationId, FieldName.departmentId, FieldName.skillId];
      const invalidFields = fields.filter((field, i) => !requiredFields[i]).join(',\n');
      this.showOrderFormValidationMessage(invalidFields);
      
      if (!this.orderCredentials?.length || !hasSelectedCredentialFlag) {
        this.showCredentialsValidationMessage(!!this.orderCredentials?.length && !hasSelectedCredentialFlag);
      }
    }
  }

  public closeSaveTemplateDialog(): void {
    this.isSaveForTemplate = false;
  }

  public createTemplate(event: { templateTitle: string }): void {
    const order = this.collectOrderData(false);
    const { templateTitle } = event;
    const extendedOrder = {
      ...this.saveTemplateDialogService.resetOrderPropertyIds(order),
      templateTitle,
      title: isNil(order.title) ? '' : order.title,
      isTemplate: true,
    };
    const documents = this.orderDetailsFormComponent.documents;
    this.store.dispatch(new SaveOrder(extendedOrder, documents));
    this.closeSaveTemplateDialog();
  }

  private saveOrder(): void {
    const isRegularBillRate =
      this.billRatesComponent?.billRatesControl.value.some((item: BillRate) => item.billRateConfigId === 1) ||
      this.orderBillRates.some((item: BillRate) => item.billRateConfigId === 1);
    const billRatesValid = isRegularBillRate || this.isPerDiem || this.isPermPlacementOrder;
    const credentialsValid = this.orderCredentials?.length;
    const hasSelectedCredentialFlag = this.orderCredentialsService.hasSelectedCredentialFlags(this.orderCredentials);
    const orderValid =
      (this.orderDetailsFormComponent.orderTypeForm.disabled || this.orderDetailsFormComponent.orderTypeForm.valid) &&
      this.orderDetailsFormComponent.generalInformationForm.valid &&
      this.orderDetailsFormComponent.jobDistributionForm.valid &&
      this.orderDetailsFormComponent.jobDescriptionForm.valid &&
      this.orderDetailsFormComponent.contactDetailsForm.valid &&
      this.orderDetailsFormComponent.workLocationForm.valid &&
      this.orderDetailsFormComponent.specialProject.valid;

    if (!billRatesValid) {
      this.showBillRatesValidationMessage();
    }

    if (!credentialsValid || !hasSelectedCredentialFlag) {
      this.showCredentialsValidationMessage(!!credentialsValid && !hasSelectedCredentialFlag);
    }

    if (!orderValid) {
      this.showOrderFormValidationMessage();
      this.showInvalidValueMessage();
    }

    if(this.orderDetailsFormComponent.isEditMode && this.order.disableNumberOfOpenPositions && this.order.openPositions != this.orderDetailsFormComponent.generalInformationForm.getRawValue().openPositions){
      this.store.dispatch(new ShowToast(MessageTypes.Error, ERROR_CAN_NOT_Edit_OpenPositions));
      return;
    }

    if (orderValid && billRatesValid && credentialsValid && hasSelectedCredentialFlag) {

      const order = this.collectOrderData(true);
      const documents = this.orderDetailsFormComponent.documents;
      
      if(this.orderDetailsFormComponent.isEditMode && this.order?.extensionFromId != null){
        let positionOrder = this.parentOrder?.candidates?.find((current) => current.id == this.order?.candidates?.[0].id);
        if(positionOrder && positionOrder?.actualEndDate){
          this.startDate = order.jobStartDate;
          let parentOrderEndDate = new Date(positionOrder?.actualEndDate);
          let twoWeekDate = new Date(parentOrderEndDate.setDate(parentOrderEndDate.getDate() + 14));
          if(this.startDate && this.startDate > twoWeekDate ){
              this.store.dispatch(new ShowToast(MessageTypes.Error, ExtensionStartDateValidation));
              return;
           }
        }
      }
      
      const hourlyRate = this.orderDetailsFormComponent.generalInformationForm.getRawValue().hourlyRate;
      if (this.needToShowConfirmPopup(order, hourlyRate)) {
        this.showConfirmPopupForZeroRate(order, documents);
      } else {
        this.checkInactiveLocationDepartmentOverlap(order, documents);
      }
    } else {
      this.orderDetailsFormComponent.orderTypeForm.markAllAsTouched();
      this.orderDetailsFormComponent.generalInformationForm.markAllAsTouched();
      this.orderDetailsFormComponent.jobDistributionForm.markAllAsTouched();
      this.orderDetailsFormComponent.jobDescriptionForm.markAllAsTouched();
      this.orderDetailsFormComponent.contactDetailsForm.markAllAsTouched();
      this.orderDetailsFormComponent.workLocationForm.markAllAsTouched();
      this.orderDetailsFormComponent.specialProject.markAllAsTouched();
    }
  }

  private checkJobDistributionChange(): void {
    const [selectedDistribution] = this.getJobDistributionValues(
      this.orderDetailsFormComponent.jobDistributionForm.value.jobDistributions
    );
    const [updatedDistribution] = this.getJobDistributionValues(this.order.jobDistributions);

    if(updatedDistribution !== selectedDistribution && updatedDistribution === OrderJobDistribution.Selected){
      this.confirmService
        .confirm(
          selectedDistribution === OrderJobDistribution.All ?
            PROCEED_FOR_ALL_AGENCY : PROCEED_FOR_TIER_LOGIC,
          {
                  title: JOB_DISTRIBUTION_TITLE,
                  okButtonLabel: 'Proceed',
                  okButtonClass: 'primary',
          }).pipe(
            filter(Boolean),
            takeUntil(this.unsubscribe$)
          ).subscribe(() => {
            this.saveOrder();
          });
    } else {
      this.saveOrder();
    }
  }

  private getJobDistributionValues(jobDistributions: JobDistributionModel[]): number[] {
   return jobDistributions.map((distribution: JobDistributionModel) => distribution.jobDistributionOption);
  }

  private markControlsAsRequired(): void {
    this.getOrderDetailsControl('regionId')?.markAsTouched();
    this.getOrderDetailsControl('skillId')?.markAsTouched();
    if (!this.getOrderDetailsControl('locationId')?.disabled) {
      this.getOrderDetailsControl('locationId')?.markAsTouched();
    }
    if (!this.getOrderDetailsControl('departmentId')?.disabled) {
      this.getOrderDetailsControl('departmentId')?.markAsTouched();
    }
  }

  private getJobDistributionOptions(distributions: JobDistributionModel[]): number[] {
    return distributions.map((distribution: JobDistributionModel) => distribution.jobDistributionOption);
  }

  private watchForSaveEvents(): void {
    this.handleSaveEvents$.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((saveType: MenuEventArgs | void) => {
      if(saveType) {
        this.onSplitButtonSelect(saveType);
      } else {
        this.save();
      }
    });
  }
}
