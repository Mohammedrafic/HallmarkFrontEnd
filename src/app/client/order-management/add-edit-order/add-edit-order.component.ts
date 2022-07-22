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

  public title: string;
  public submitMenuItems: ItemModel[] = [
    { id: SubmitButtonItem.SaveForLater, text: 'Save For Later' },
    { id: SubmitButtonItem.SaveAsTemplate, text: 'Save as Template' },
  ];
  public selectedTab: SelectedTab = SelectedTab.OrderDetails;
  // todo: update/set credentials list in edit mode for order
  public orderCredentials: IOrderCredentialItem[] = [];
  public orderBillRates: BillRate[] = [];

  private unsubscribe$: Subject<void> = new Subject();

  public isPerDiem = false;
  public disableOrderType = false;
  public isSaveForTemplate = false;

  public constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private actions$: Actions
  ) {
    store.dispatch(new SetHeaderState({ title: 'Order Management', iconName: 'file-text' }));

    this.orderId = Number(this.route.snapshot.paramMap.get('orderId'));

    if (this.orderId > 0) {
      this.title = 'Edit';
      store.dispatch(new GetSelectedOrderById(this.orderId));
    } else {
      this.title = 'Create';
    }
  }

  public get jobTitle(): string {
    return this.orderDetailsFormComponent.generalInformationForm.get('title')?.value;
  }

  public ngOnInit(): void {
    if (this.orderId > 0) {
      this.selectedOrder$.pipe(takeUntil(this.unsubscribe$)).subscribe((order: Order) => {
        if (order?.credentials) {
          this.orderCredentials = [...order.credentials];
        }
        if (order?.billRates) {
          this.orderBillRates = [...order.billRates];
        }

        if (order?.status === OrderStatus.Incomplete) {
          this.addMenuItem(SubmitButtonItem.SaveForLater, 'Save For Later');
          this.removeMenuItem(SubmitButtonItem.Save);
        } else {
          if (order?.orderType === OrderType.OpenPerDiem) {
            this.disableOrderType = true;
          }
          this.addMenuItem(SubmitButtonItem.Save, 'Save');
          this.removeMenuItem(SubmitButtonItem.SaveForLater);
        }
      });
    }
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionDispatched(SaveOrderSucceeded)).subscribe(() => {
      this.router.navigate(['/client/order-management']);
    });

    this.getPredefinedBillRatesData$
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap((getPredefinedBillRatesData) => {
          if (getPredefinedBillRatesData && !this.orderBillRates.length) {
            return this.store.dispatch(new GetPredefinedBillRates());
          } else {
            return of(null);
          }
        })
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

  public onOrderTypeChange(orderType: OrderType): void {
    this.isPerDiem = orderType === OrderType.OpenPerDiem;
    this.tab.hideTab(SelectedTab.BillRates, this.isPerDiem);
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

  public save(): void {
    if (
      (this.orderDetailsFormComponent.orderTypeForm.disabled || this.orderDetailsFormComponent.orderTypeForm.valid) &&
      this.orderDetailsFormComponent.generalInformationForm.valid &&
      this.orderDetailsFormComponent.jobDistributionForm.valid &&
      this.orderDetailsFormComponent.jobDescriptionForm.valid &&
      this.orderDetailsFormComponent.contactDetailsForm.valid &&
      this.orderDetailsFormComponent.workLocationForm.valid &&
      (this.orderDetailsFormComponent.workflowForm.disabled || this.orderDetailsFormComponent.workflowForm.valid) &&
      this.orderDetailsFormComponent.specialProject.valid &&
      (this.billRatesComponent?.billRatesControl.valid || this.orderBillRates.length || this.isPerDiem)
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
        this.store.dispatch(new SaveOrder(order, documents));
      }
    } else {
      this.orderDetailsFormComponent.orderTypeForm.markAllAsTouched();
      this.orderDetailsFormComponent.generalInformationForm.markAllAsTouched();
      this.orderDetailsFormComponent.jobDistributionForm.markAllAsTouched();
      this.orderDetailsFormComponent.jobDescriptionForm.markAllAsTouched();
      this.orderDetailsFormComponent.contactDetailsForm.markAllAsTouched();
      this.orderDetailsFormComponent.workLocationForm.markAllAsTouched();
      this.orderDetailsFormComponent.workflowForm.markAllAsTouched();
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
    if (this.isPerDiem) {
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
      ...this.orderDetailsFormComponent.workflowForm.getRawValue(),
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
      reasonForRequestId,
      poNumberId,
      hourlyRate,
      openPositions,
      minYrsRequired,
      joiningBonus,
      compBonus,
      duration,
      jobStartDate,
      jobEndDate,
      shiftRequirementId,
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
      reasonForRequisition,
      contactDetails,
      workLocations,
      workflowId,
      credentials,
      canApprove,
    } = allValues;

    const billRates: OrderBillRateDto[] = (allValues.billRates as BillRate[])?.map((billRate: BillRate) => {
      const { id, billRateConfigId, rateHour, intervalMin, intervalMax, effectiveDate } = billRate;
      return { id: id || 0, billRateConfigId, rateHour, intervalMin, intervalMax, effectiveDate };
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
      reasonForRequestId,
      poNumberId,
      hourlyRate,
      openPositions,
      minYrsRequired,
      joiningBonus,
      compBonus,
      duration,
      jobStartDate,
      jobEndDate,
      shiftRequirementId,
      shiftStartTime,
      shiftEndTime,
      classification,
      onCallRequired,
      asapStart,
      criticalOrder,
      nO_OT,
      jobDescription,
      unitDescription,
      reasonForRequisition,
      billRates,
      jobDistributions,
      contactDetails,
      workLocations,
      credentials,
      workflowId,
      isSubmit,
      canApprove,
    };

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

    const contactDetailsForm = this.orderDetailsFormComponent.contactDetailsForm;
    const workLocationForm = this.orderDetailsFormComponent.workLocationForm;

    if (titleControl.invalid) {
      titleControl.markAsTouched();
      return;
    }

    const order = this.collectOrderData(false);
    const documents = this.orderDetailsFormComponent.documents;

    if (contactDetailsForm.invalid) {
      order.contactDetails = [];
    }

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
      this.store.dispatch(new SaveOrder(order, documents));
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
      this.orderBillRates = predefinedBillRates;
    });
  }

  private getOrderDetailsControl(name: string): AbstractControl {
    return this.orderDetailsFormComponent.generalInformationForm.get(name) as AbstractControl;
  }

  private saveAsTemplate(): void {
    const { selectedRegion, selectedLocation, selectedDepartment, selectedSkills } = this.orderDetailsFormComponent;
    const requiredFields = [selectedRegion, selectedSkills, selectedDepartment, selectedLocation];
    const isRequiredFieldsFilled = !some(isNil, requiredFields);

    if (isRequiredFieldsFilled) {
      this.isSaveForTemplate = true;
    } else {
      this.getOrderDetailsControl('regionId')?.markAllAsTouched();
      this.getOrderDetailsControl('skillId')?.markAllAsTouched();
      if (this.orderDetailsFormComponent.isLocationsDropDownEnabled) {
        this.getOrderDetailsControl('locationId')?.markAllAsTouched();
      }
      if (this.orderDetailsFormComponent.isDepartmentsDropDownEnabled) {
        this.getOrderDetailsControl('departmentId')?.markAllAsTouched();
      }
    }
  }

  public closeSaveTemplateDialog(): void {
    this.isSaveForTemplate = false;
  }

  public createTemplate(event: { templateTitle: string }): void {
    const order = this.collectOrderData(false);
    const title = order.title ?? event.templateTitle;
    const extendedOrder = {
      ...order,
      title: title,
      templateTitle: title,
      isTemplate: true,
    };
    const documents = this.orderDetailsFormComponent.documents;
    this.store.dispatch(new SaveOrder(extendedOrder, documents));
    this.closeSaveTemplateDialog();
  }
}
