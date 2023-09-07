import { Inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { Observable, Subject, takeUntil } from 'rxjs';

import { BaseObservable } from '@core/helpers';
import { GlobalWindow } from '@core/tokens';
import { OrderTab } from '@shared/components/candidate-details/models/candidate.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import {
  OrderManagementIRPSystemId,
  OrderManagementIRPTabsIndex,
  OrganizationOrderManagementTabs,
} from '@shared/enums/order-management-tabs.enum';
import { IrpOrderType, OrderType } from '@shared/enums/order-type';
import { BillRate } from '@shared/models';
import { RegularRatesData } from '@shared/models/order-management.model';
import { OrderLinkDetails } from '../../../order-management/interfaces';
import { ControlsConfig } from '../order-details-form/interfaces';
import { BillRatesSyncService } from '@shared/services/bill-rates-sync.service';

@Injectable({
  providedIn: 'root',
})
export class OrderManagementService extends DestroyableDirective {
  public readonly orderPerDiemId$: Subject<{ id: number; prefix: string }> = new Subject<{
    id: number;
    prefix: string;
  }>();
  public readonly orderId$: Subject<{ id: number; prefix: string } | null> = new Subject<{
    id: number;
    prefix: string;
  } | null>();
  public readonly reorderId$: Subject<{ id: number; prefix: string } | null> = new Subject<{
    id: number;
    prefix: string;
  } | null>();
  public readonly selectedTab$: Subject<number> = new Subject<number>();
  public selectedOrderAfterRedirect$: Subject<OrderTab> = new Subject<OrderTab>();
  public excludeDeployed: boolean;

  private _selectedOrderAfterRedirect: OrderTab | null;
  private orderManagementSystem: OrderManagementIRPSystemId | null;
  private orderTypeToPrePopulate: OrderType | IrpOrderType | null;
  private previousSelectedOrganizationId: number;
  private readonly isAvailable: BaseObservable<boolean> = new BaseObservable<boolean>(false);
  private readonly updatedCandidate: BaseObservable<boolean> = new BaseObservable<boolean>(false);
  private readonly orderFromAnotherSystem: BaseObservable<OrderLinkDetails | null> =
    new BaseObservable<OrderLinkDetails | null>(null);

  constructor(
    private fb: FormBuilder,
    private billRatesSyncService: BillRatesSyncService,
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis
  ) {
    super();
    this.selectedOrderAfterRedirect$
      .pipe(takeUntil(this.destroy$))
      .subscribe((order: OrderTab) => (this.selectedOrderAfterRedirect = order));
  }

  set selectedOrderAfterRedirect(value: OrderTab | null) {
    this._selectedOrderAfterRedirect = value;
  }

  get selectedOrderAfterRedirect(): OrderTab | null {
    return this._selectedOrderAfterRedirect;
  }

  createFilterForm(): FormGroup {
    return this.fb.group({
      orderPublicId: new FormControl(null),
      regionIds: new FormControl([]),
      locationIds: new FormControl([]),
      departmentsIds: new FormControl([]),
      skillIds: new FormControl([]),
      orderTypes: new FormControl([]),
      jobTitle: new FormControl(null),
      billRateFrom: new FormControl(null),
      billRateTo: new FormControl(null),
      openPositions: new FormControl(null),
      jobStartDate: new FormControl(null),
      jobEndDate: new FormControl(null),
      orderStatuses: new FormControl([]),
      annualSalaryRangeFrom: new FormControl(null),
      annualSalaryRangeTo: new FormControl(null),
      candidateStatuses: new FormControl([]),
      candidatesCountFrom: new FormControl(null),
      candidatesCountTo: new FormControl(null),
      agencyIds: new FormControl([]),
      agencyType: new FormControl('0'),
      templateTitle: new FormControl(null),
      creationDateFrom: new FormControl(null),
      creationDateTo: new FormControl(null),
      distributedOnFrom: new FormControl(null),
      distributedOnTo: new FormControl(null),
      candidateName: new FormControl(null),
      projectTypeIds: new FormControl(null),
      projectNameIds: new FormControl(null),
      poNumberIds: new FormControl(null),
      contactEmails: new FormControl(null),
      irpOnly: new FormControl(false),
      reorderStatuses: new FormControl([]),
      shiftIds: new FormControl([]),
      shift: new FormControl([]),
      orderLocked: new FormControl(null),
      orderDistributionType: new FormControl(['0']),
    });
  }

  createOrderJourneyFilterForm(): FormGroup {
    return this.fb.group({
      orderPublicId: new FormControl(null),
      regionIds: new FormControl([]),
      locationIds: new FormControl([]),
      departmentsIds: new FormControl([]),
      skillIds: new FormControl([]),
      orderTypes: new FormControl([]),
      jobTitle: new FormControl(null),
      jobStartDate: new FormControl(null),
      jobEndDate: new FormControl(null),
      orderStatuses: new FormControl([]),
      includeInIRP:new FormControl(true),
      includeInVMS:new FormControl(true),
    });
  }

  public setOrderTypeToPrePopulate(
    vmsTab: OrganizationOrderManagementTabs,
    irpTab: OrderManagementIRPTabsIndex,
    system: OrderManagementIRPSystemId
  ): void {
    if (system === OrderManagementIRPSystemId.VMS) {
      this.orderTypeToPrePopulate = this.getVMSOrderType(vmsTab);
    } else if (system === OrderManagementIRPSystemId.IRP) {
      this.orderTypeToPrePopulate = this.getIRPOrderType(irpTab);
    } else {
      this.clearOrderTypeToPrePopulate();
    }
  }

  public getOrderTypeToPrePopulate(): OrderType | IrpOrderType | null {
    return this.orderTypeToPrePopulate;
  }

  public clearOrderTypeToPrePopulate(): void {
    this.orderTypeToPrePopulate = null;
  }

  public setOrderManagementSystem(system: OrderManagementIRPSystemId | null) {
    this.orderManagementSystem = system;
  }

  public getOrderManagementSystem(): OrderManagementIRPSystemId | null {
    return this.orderManagementSystem;
  }

  public setPreviousOrganizationId(id: number): void {
    const previousOrganizationId = this.globalWindow.localStorage.getItem('lastSelectedOrganizationId');

    if (Number(previousOrganizationId) !== id) {
      this.orderManagementSystem = null;
    }

    this.previousSelectedOrganizationId = id;
  }

  setIsAvailable(state: boolean): void {
    this.isAvailable.set(state);
  }

  getIsAvailable(): boolean {
    return this.isAvailable.get();
  }

  setCandidate(edit: boolean): void {
    this.updatedCandidate.set(edit);
  }

  getCandidate(): Observable<boolean> {
    return this.updatedCandidate.getStream();
  }

  setOrderFromAnotherSystem(orderLinkDetails: OrderLinkDetails): void {
    this.orderFromAnotherSystem.set(orderLinkDetails);
  }

  getOrderFromAnotherSystemStream(): Observable<OrderLinkDetails | null> {
    return this.orderFromAnotherSystem.getStream();
  }

  saveSelectedOrderManagementSystem(activeSystem: OrderManagementIRPSystemId): void {
    this.globalWindow.localStorage.setItem('selectedOrderManagementSystem', activeSystem.toString());
  }

  getControlsChangeState(controlNames: string[], formControls: ControlsConfig): boolean {
    return controlNames
      .map((name) => formControls[name as keyof ControlsConfig])
      .some((control) => control.dirty);
  }

  setRegularRates(rates: BillRate[], startDate: Date | string): RegularRatesData {
    const jobStartDate = startDate instanceof Date ? startDate : new Date(startDate);
    const regular = this.billRatesSyncService.getBillRateForSync(rates, jobStartDate, false, true);
    const regularLocal = this.billRatesSyncService.getBillRateForSync(rates, jobStartDate, true, true);

    return ({
      regular: regular?.rateHour as number || null,
      regularLocal: regularLocal?.rateHour as number || null,
    });
  }

  private getVMSOrderType(tab: OrganizationOrderManagementTabs): OrderType | null {
    if (tab === OrganizationOrderManagementTabs.PerDiem || tab === OrganizationOrderManagementTabs.ReOrders) {
      return OrderType.OpenPerDiem;
    }

    if (tab === OrganizationOrderManagementTabs.PermPlacement) {
      return OrderType.PermPlacement;
    }

    return null;
  }

  private getIRPOrderType(tab: OrderManagementIRPTabsIndex): IrpOrderType | null {
    if (tab === OrderManagementIRPTabsIndex.PerDiem) {
      return IrpOrderType.PerDiem;
    }

    if (tab === OrderManagementIRPTabsIndex.Lta) {
      return IrpOrderType.LongTermAssignment;
    }

    return null;
  }
}
