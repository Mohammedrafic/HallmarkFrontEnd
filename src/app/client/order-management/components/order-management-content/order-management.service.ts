import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { Observable, Subject, takeUntil } from 'rxjs';

import { BaseObservable } from '@core/helpers';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { OrderTab } from '@shared/components/candidate-details/models/candidate.model';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';

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
  private previousSelectedOrganizationId: number;
  private readonly isAvailable: BaseObservable<boolean> = new BaseObservable<boolean>(false);
  private readonly updatedCandidate: BaseObservable<boolean> = new BaseObservable<boolean>(false);

  constructor(
    private fb: FormBuilder
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
    });
  }

  public setOrderManagementSystem(system: OrderManagementIRPSystemId | null) {
    this.orderManagementSystem = system;
  }

  public getOrderManagementSystem(): OrderManagementIRPSystemId | null {
    return this.orderManagementSystem;
  }

  public setPreviousOrganizationId(id: number): void {
    if (this.previousSelectedOrganizationId !== id) {
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
}
