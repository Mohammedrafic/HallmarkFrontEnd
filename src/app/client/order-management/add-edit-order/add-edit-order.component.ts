import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { ItemModel, SelectEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { MenuEventArgs } from '@syncfusion/ej2-angular-splitbuttons';

import { Store } from '@ngxs/store';

import { Subject, takeUntil } from 'rxjs';

import { SetHeaderState } from 'src/app/store/app.actions';
import { SetImportFileDialogState } from '@admin/store/admin.actions';
import { SaveOrder } from '@organization-management/store/organization-management.actions';

import { OrderDetailsFormComponent } from '../order-details-form/order-details-form.component';
import { CreateOrderDto } from '@shared/models/organization.model';
import { BillRatesComponent } from '@bill-rates/bill-rates.component';
import { BillRate, OrderBillRateDto } from '@shared/models/bill-rate.model';

enum SelectedTab {
  OrderDetails,
  Credentials
}

enum SubmitButtonItem {
  SaveForLater = '0',
  SaveAsTemplate = '1'
}

@Component({
  selector: 'app-add-edit-order',
  templateUrl: './add-edit-order.component.html',
  styleUrls: ['./add-edit-order.component.scss']
})
export class AddEditOrderComponent implements OnDestroy {
  @ViewChild('stepper') tab: TabComponent;
  @ViewChild('orderDetailsForm') orderDetailsFormComponent: OrderDetailsFormComponent;
  @ViewChild('billRates') billRatesComponent: BillRatesComponent;

  public SelectedTab = SelectedTab;

  public title = 'Create';
  public submitMenuItems: ItemModel[] = [
    { id: SubmitButtonItem.SaveForLater, text: 'Save For Later' },
    { id: SubmitButtonItem.SaveAsTemplate, text: 'Save as Template' }
  ];
  public selectedTab: SelectedTab = SelectedTab.OrderDetails;

  private unsubscribe$: Subject<void> = new Subject();

  constructor(private store: Store, private router: Router) {
    store.dispatch(new SetHeaderState({ title: 'Order Management', iconName: 'file-text' }));
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
      case SubmitButtonItem.SaveForLater:
        this.saveForLater();
        break;

      case SubmitButtonItem.SaveForLater:
        this.saveAsTemplate();
        break;
    }
  }

  public save(): void {
    if (
      this.orderDetailsFormComponent.orderTypeStatusForm.valid &&
      this.orderDetailsFormComponent.generalInformationForm.valid &&
      this.orderDetailsFormComponent.jobDistributionForm.valid &&
      this.orderDetailsFormComponent.jobDescriptionForm.valid &&
      this.orderDetailsFormComponent.contactDetailsForm.valid &&
      this.orderDetailsFormComponent.workLocationForm.valid &&
      this.orderDetailsFormComponent.workflowForm.valid &&
      this.billRatesComponent.billRatesControl.valid
    ) {
      const order = this.collectOrderData(true);
      const documents = this.orderDetailsFormComponent.documents;

      this.store.dispatch(new SaveOrder(order, documents));
    } else {
      this.orderDetailsFormComponent.orderTypeStatusForm.markAllAsTouched();
      this.orderDetailsFormComponent.generalInformationForm.markAllAsTouched();
      this.orderDetailsFormComponent.jobDistributionForm.markAllAsTouched();
      this.orderDetailsFormComponent.jobDescriptionForm.markAllAsTouched();
      this.orderDetailsFormComponent.contactDetailsForm.markAllAsTouched();
      this.orderDetailsFormComponent.workLocationForm.markAllAsTouched();
      this.orderDetailsFormComponent.workflowForm.markAllAsTouched();
    }
  }

  private collectOrderData(isSubmit: boolean): CreateOrderDto {
    const allValues = {
      ...this.orderDetailsFormComponent.orderTypeStatusForm.value,
      ...this.orderDetailsFormComponent.generalInformationForm.value,
      ...this.orderDetailsFormComponent.jobDistributionForm.value,
      ...this.orderDetailsFormComponent.jobDescriptionForm.value,
      ...this.orderDetailsFormComponent.contactDetailsForm.value,
      ...this.orderDetailsFormComponent.workLocationForm.value,
      ...this.orderDetailsFormComponent.workflowForm.value,
      ...{ credentials: [] }, // Will be added soon
      ...{ billRates: this.billRatesComponent.billRatesControl.value }
    };

    const {
      orderType,
      title,
      regionId,
      locationId,
      departmentId,
      skillId,
      projectTypeId,
      projectType,
      projectNameId,
      projectName,
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
      credentials
    } = allValues;

    const billRates: OrderBillRateDto[] = (allValues.billRates as BillRate[]).map((billRate: BillRate) => {
      const { billRateConfigId, rateHour, intervalMin, intervalMax, effectiveDate } = billRate;
      return { id: 0, billRateConfigId, rateHour, intervalMin, intervalMax, effectiveDate };
    });

    const order: CreateOrderDto = {
      title,
      regionId,
      locationId,
      departmentId,
      skillId,
      orderType,
      projectTypeId,
      projectNameId,
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
      isSubmit
    };

    if (!projectTypeId && projectType) {
      order.projectType = projectType
    }

    if (!projectNameId && projectName) {
      order.projectName = projectName;
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

    this.store.dispatch(new SaveOrder(order, documents));
  }

  private saveAsTemplate(): void {

  }
}
