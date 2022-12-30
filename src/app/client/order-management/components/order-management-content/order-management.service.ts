import { Injectable } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { OrderTab } from '@shared/components/candidate-details/models/candidate.model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
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
    });
  }

  public setOrderManagementSystem(system: OrderManagementIRPSystemId | null) {
    this.orderManagementSystem = system;
  }

  public getOrderManagementSystem(): OrderManagementIRPSystemId | null {
    return this.orderManagementSystem;
  }


}
