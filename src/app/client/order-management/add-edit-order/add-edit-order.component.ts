import unionBy from 'lodash/fp/unionBy';
import { filter, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { ItemModel, SelectEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { MenuEventArgs } from '@syncfusion/ej2-angular-splitbuttons';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SetHeaderState } from 'src/app/store/app.actions';
import { SetImportFileDialogState } from '@admin/store/admin.actions';
import {
  ClearPredefinedBillRates,
  EditOrder,
  GetPredefinedBillRates,
  GetSelectedOrderById,
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
import { SaveTemplateDialogService } from '@client/order-management/save-template-dialog/save-template-dialog.service';
import { AlertTrigger } from '@admin/store/alerts.actions';
import { AlertTriggerDto } from '@shared/models/alerts-template.model';
import { UserState } from 'src/app/store/user.state';
import { User } from '@shared/models/user.model';
import { AgencyState } from '@agency/store/agency.state';
import { Agency } from '@shared/models/agency.model';
import { AlertIdEnum, AlertParameterEnum } from '@admin/alerts/alerts.enum';
import { ToastUtility } from '@syncfusion/ej2-notifications';

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

enum FieldName {
  'title' = 'Job Title',
  'regionId' = 'Region',
  'locationId' = 'Location',
  'departmentId' = 'Department',
  'skillId' = 'Skill',
  'hourlyRate' = 'Hourly rate',
  'openPositions' = '# Open Positions',
  'jobStartDate' = 'Job Start Date',
  'jobEndDate' = 'Job End Date',
  'shift' = 'Shift Name',
  'shiftStartTime' = 'Shift Start Time',
  'shiftEndTime' = 'Shift End Time',
  'jobDistribution' = 'Job Distribution',
  'orderRequisitionReasonId' = 'Reason for Requisition',
  'contactDetails' = 'Contact Details',
  'workLocations' = 'Work Location',
  'projectTypeId' = 'Special Project Category',
  'projectNameId' = 'Project Name',
  'poNumberId' = 'PO#'
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

  @Select(OrderManagementContentState.selectedOrder)
  selectedOrder$: Observable<Order>;

  @Select(OrderManagementContentState.getPredefinedBillRatesData)
  getPredefinedBillRatesData$: Observable<GetPredefinedBillRatesData | null>;

  @Select(OrderManagementContentState.predefinedBillRates)
  predefinedBillRates$: Observable<BillRate[]>;

  @Select(OrderCandidatesCredentialsState.predefinedCredentials)
  predefinedCredentials$: Observable<IOrderCredentialItem[]>;

  public SelectedTab = SelectedTab;
  public orderId: number;
  public publicId: number;
  public prefix: string;

  public title: string;
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

  public isPerDiem = false;
  public isPermPlacementOrder = false;
  public disableOrderType = false;
  public isSaveForTemplate = false;
  public isTemplate = false;

  public constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private actions$: Actions,
    private saveTemplateDialogService: SaveTemplateDialogService
  ) {
    store.dispatch(new SetHeaderState({ title: 'Order Management', iconName: 'file-text' }));

    this.orderId = Number(this.route.snapshot.paramMap.get('orderId'));
    this.isTemplate = !!this.route.snapshot.paramMap.get('fromTemplate');

    if (this.orderId > 0) {
      this.title = 'Edit';
    } else {
      this.title = 'Create';
    }
  }

  public get generalInformationForm(): Order {
    return this.orderDetailsFormComponent.generalInformationForm.getRawValue();
  }

  public ngOnInit(): void {
    if (this.orderId > 0) {
      this.store.dispatch(new GetSelectedOrderById(this.orderId));
      this.selectedOrder$.pipe(takeUntil(this.unsubscribe$)).subscribe((order: Order) => {
        this.prefix = order?.organizationPrefix as string;
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
          if ((order?.orderType === OrderType.OpenPerDiem || order?.orderType === OrderType.PermPlacement || order?.extensionFromId) && order?.status !== OrderStatus.PreOpen) {
            this.disableOrderType = true;
          }
          this.addMenuItem(SubmitButtonItem.Save, 'Save');
          this.removeMenuItem(SubmitButtonItem.SaveForLater);
        }
      });
    }
    if (this.isTemplate) {
      this.selectedOrder$.pipe(takeUntil(this.unsubscribe$))
      .subscribe((order: Order) => {
        this.initCredentialsAndBillRates(order);
      });
    }
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionDispatched(SaveOrderSucceeded)).subscribe((data) => {
      const user = this.store.selectSnapshot(UserState.user) as User;
      const agency = this.store.selectSnapshot(AgencyState.agency) as Agency;
      let params: any = {};
      params['@' + AlertParameterEnum[AlertParameterEnum.MyOrganization]] = user?.businessUnitName;
      params['@' + AlertParameterEnum[AlertParameterEnum.Agency]] = agency?.agencyDetails?.name;
      params['@' + AlertParameterEnum[AlertParameterEnum.OrderId]] =
        data?.order?.organizationPrefix == null
          ? data?.order?.publicId + ''
          : data?.order?.organizationPrefix + '-' + data?.order?.publicId;
      params['@' + AlertParameterEnum[AlertParameterEnum.JobTitle]] = data?.order?.title;
      var url = location.origin + '/#/client/order-management/edit/' + data?.order?.publicId;
      params['@' + AlertParameterEnum[AlertParameterEnum.ClickbackURL]] = url;

      let alertTriggerDto: AlertTriggerDto = {
        BusinessUnitId: user?.businessUnitId,
        AlertId: this.orderId > 0 ? AlertIdEnum.OrderUpdated : AlertIdEnum.OrderCreated,
        Parameters: params,
      };
      this.store.dispatch(new AlertTrigger(alertTriggerDto));
      this.router.navigate(['/client/order-management']);
    });

    this.getPredefinedBillRatesData$
      .pipe(
        switchMap((getPredefinedBillRatesData) => {
          if (getPredefinedBillRatesData) {
            return this.store.dispatch(new GetPredefinedBillRates());
          } else {
            return of(null);
          }
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();

    this.subscribeOnPredefinedCredentials();
    this.subscribeOnPredefinedBillRates();
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
    if (order?.billRates) {
      this.orderBillRates = [...order.billRates];
    }
  }

  public onOrderTypeChange(orderType: OrderType): void {
    this.isPerDiem = orderType === OrderType.OpenPerDiem;
    this.isPermPlacementOrder = orderType === OrderType.PermPlacement;
    this.tab.hideTab(SelectedTab.BillRates, this.isPerDiem || this.isPermPlacementOrder);
  }

  public navigateBack(): void {
    this.router.navigate(['/client/order-management']);
  }

  public onImportDataClick(): void {
    this.store.dispatch(new SetImportFileDialogState(true));
    // TODO: implement data parse after BE implementation
  }

  public onStepperCreated(): void {
    this.tab.selected.pipe(takeUntil(this.unsubscribe$)).subscribe((event: SelectEventArgs) => {
      this.selectedTab = event.selectedIndex;
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
    this.store.dispatch(new SetIsDirtyOrderForm(true));
  }

  public onCredentialChanged(cred: IOrderCredentialItem): void {
    const isExist = this.orderCredentials.find(
      ({ credentialId }: IOrderCredentialItem) => cred.credentialId === credentialId
    );
    if (isExist) {
      Object.assign(isExist, cred);
    } else {
      this.orderCredentials.push(cred);
    }

    this.store.dispatch(new SetIsDirtyOrderForm(true));
  }

  public onCredentialDeleted(cred: IOrderCredentialItem): void {
    const credToDelete = this.orderCredentials.find(
      ({ credentialId }: IOrderCredentialItem) => cred.credentialId === credentialId
    ) as IOrderCredentialItem;
    if (credToDelete) {
      const index = this.orderCredentials.indexOf(credToDelete);
      this.orderCredentials.splice(index, 1);
    }

    this.store.dispatch(new SetIsDirtyOrderForm(true));
  }

  private collectInvalidFieldsFromForm(controls: any, fields: string[]) {
    for (const name in controls) {
      if (controls[name].invalid) {
        fields.push(` \u2022 ${FieldName[name as keyof typeof FieldName]}`);
      }
    }
  }

  private collectInvalidFields(): string[] {
    const fields: string[] = [];
    const forms = [
      this.orderDetailsFormComponent.generalInformationForm.controls,
      this.orderDetailsFormComponent.jobDistributionForm.controls,
      this.orderDetailsFormComponent.jobDescriptionForm.controls,
      this.orderDetailsFormComponent.contactDetailsForm.controls,
      this.orderDetailsFormComponent.workLocationForm.controls,
      this.orderDetailsFormComponent.specialProject.controls
    ];
    forms.forEach((form) => this.collectInvalidFieldsFromForm(form, fields));
    return fields;
  }

  private showOrderFormValidationMessage(fieldsString?: string): void {
    const fields = fieldsString || this.collectInvalidFields().join(',\n');
    ToastUtility.show({
      title: 'Error',
      content: 'Please fill in the required fields in Order Details tab:\n' + fields,
      position: { X: 'Center', Y: 'Top' },
      cssClass: 'error-toast',
    });
  }

  private showCredentialsValidationMessage(): void {
    ToastUtility.show({
      title: 'Error',
      content: 'Please add Credentials in Credentials tab',
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
    const isRegularBillRate = this.billRatesComponent?.billRatesControl.value.some((item: BillRate) => item.billRateConfigId === 1) ||
      this.orderBillRates.some((item: BillRate) => item.billRateConfigId === 1);
    const billRatesValid = (isRegularBillRate ||
      this.isPerDiem ||
      this.isPermPlacementOrder);
    const credentialsValid = this.orderCredentials?.length;
    const orderValid = (this.orderDetailsFormComponent.orderTypeForm.disabled || this.orderDetailsFormComponent.orderTypeForm.valid) &&
      this.orderDetailsFormComponent.generalInformationForm.valid &&
      this.orderDetailsFormComponent.jobDistributionForm.valid &&
      this.orderDetailsFormComponent.jobDescriptionForm.valid &&
      this.orderDetailsFormComponent.contactDetailsForm.valid &&
      this.orderDetailsFormComponent.workLocationForm.valid &&
      this.orderDetailsFormComponent.specialProject.valid;

    if (!billRatesValid) {
      this.showBillRatesValidationMessage();
    }
    if (!credentialsValid) {
      this.showCredentialsValidationMessage();
    }
    if (!orderValid) {
      this.showOrderFormValidationMessage();
    }

    if (
      orderValid && billRatesValid && credentialsValid
    ) {
      const order = this.collectOrderData(true);
      const documents = this.orderDetailsFormComponent.documents;

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
        this.store.dispatch(new SaveOrder(order, documents, this.orderDetailsFormComponent.isEditMode ? undefined : this.orderDetailsFormComponent.comments));
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
      classification,
      onCallRequired,
      asapStart,
      criticalOrder,
      nO_OT,
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
    } = allValues;
    const billRates: OrderBillRateDto[] = (allValues.billRates as BillRate[])?.map((billRate: BillRate) => {
      const { id, billRateConfigId, rateHour, intervalMin, intervalMax, effectiveDate, billType, editAllowed, isPredefined, seventhDayOtEnabled, weeklyOtEnabled, dailyOtEnabled } = billRate;
      return { id: id || 0, billRateConfigId, rateHour, intervalMin, intervalMax, effectiveDate, billType, editAllowed, isPredefined, seventhDayOtEnabled, weeklyOtEnabled, dailyOtEnabled };
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
      classification,
      onCallRequired,
      asapStart,
      criticalOrder,
      nO_OT,
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
    };

    if (this.orderDetailsFormComponent.order?.isTemplate) {
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

    return order;
  }

  private saveForLater(): void {
    const titleControl = this.orderDetailsFormComponent.generalInformationForm.controls['title'];
    const workLocationForm = this.orderDetailsFormComponent.workLocationForm;

    if (titleControl.invalid) {
      titleControl.markAsTouched();
      this.showOrderFormValidationMessage(FieldName.title);
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
        filter((predefinedCredentials: IOrderCredentialItem[]) => !!predefinedCredentials.length),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((predefinedCredentials: IOrderCredentialItem[]) => {
        this.orderCredentials = unionBy('credentialId', this.orderCredentials, predefinedCredentials);
      });
  }

  private subscribeOnPredefinedBillRates(): void {
    this.predefinedBillRates$.pipe(takeUntil(this.unsubscribe$)).subscribe((predefinedBillRates) => {
      this.orderBillRates = [...predefinedBillRates, ...this.manuallyAddedBillRates];
    });
  }

  private getOrderDetailsControl(name: string): AbstractControl {
    return this.orderDetailsFormComponent.generalInformationForm.get(name) as AbstractControl;
  }

  private saveAsTemplate(): void {
    const { regionId, locationId, departmentId, skillId } =
      this.orderDetailsFormComponent.generalInformationForm.getRawValue();
    const requiredFields = [regionId, departmentId, locationId, skillId];
    const isRequiredFieldsFilled = !some(isNil, requiredFields);

    if (isRequiredFieldsFilled) {
      this.isSaveForTemplate = true;
    } else {
      this.markControlsAsRequired();
      const fields = [FieldName.regionId, FieldName.locationId, FieldName.departmentId, FieldName.skillId];
      const invalidFields = fields.filter((field, i) => !requiredFields[i]).join(',\n');
      this.showOrderFormValidationMessage(invalidFields);
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
    this.selectOrderTemplatesTab();
    this.closeSaveTemplateDialog();
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

  private selectOrderTemplatesTab(): void {
    this.store.dispatch(new SelectNavigationTab(OrganizationOrderManagementTabs.OrderTemplates));
  }

  public saveManuallyAddedBillRates(event: BillRate[]): void {
    this.manuallyAddedBillRates = event;
  }
}
