import { OrderManagementState } from '@agency/store/order-management.state';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Select } from '@ngxs/store';
import { filter, Observable } from 'rxjs';

import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { OrderTypeOptions } from '@shared/enums/order-type';
import { AgencyOrderFilteringOptions } from '@shared/models/agency.model';


@Component({
  selector: 'app-agency-order-filters',
  templateUrl: './agency-order-filters.component.html',
  styleUrls: ['./agency-order-filters.component.scss'],
})
export class AgencyOrderFiltersComponent implements OnInit {
  @Input() form: FormGroup;
  @Input() filterColumns: any;

  @Select(OrderManagementState.orderFilteringOptions)
  orderFilteringOptions$: Observable<AgencyOrderFilteringOptions>;

  public optionFields = {
    text: 'name',
    value: 'id',
  };
  public statusFields = {
    text: 'statusText',
    value: 'status',
  };

  ngOnInit(): void {
    this.onOrderFilteringOptionsChange();
  }

  private onOrderFilteringOptionsChange(): void {
    this.orderFilteringOptions$
      .pipe(filter((options) => !!options))
      .subscribe(({ candidateStatuses, masterSkills, orderStatuses, partneredOrganizations }) => {
        this.filterColumns.organizationIds.dataSource = partneredOrganizations;
        this.filterColumns.skillIds.dataSource = masterSkills;
        this.filterColumns.candidateStatuses.dataSource = candidateStatuses;
        this.filterColumns.orderStatuses.dataSource = orderStatuses;
      });
  }

  static generateFiltersForm(): FormGroup {
    return new FormGroup({
      orderId: new FormControl(null),
      organizationIds: new FormControl([]),
      regionIds: new FormControl([]),
      locationIds: new FormControl([]),
      departmentsIds: new FormControl([]),
      skillIds: new FormControl([]),
      orderTypes: new FormControl([]),
      candidateStatuses: new FormControl([]),
      orderStatuses: new FormControl([]),
      jobTitle: new FormControl(null),
      billRateFrom: new FormControl(null),
      billRateTo: new FormControl(null),
      openPositions: new FormControl(null),
      jobStartDate: new FormControl(null),
      jobEndDate: new FormControl(null),
    });
  }

  static generateFolterColumns(): any {
    return {
      orderId: { type: ControlTypes.Text, valueType: ValueType.Text },
      organizationIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      regionIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      locationIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      departmentsIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      skillIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      orderTypes: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: OrderTypeOptions,
        valueField: 'name',
        valueId: 'id',
      },
      candidateStatuses: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'statusText',
        valueId: 'status',
      },
      orderStatuses: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'statusText',
        valueId: 'status',
      },
      jobTitle: { type: ControlTypes.Text, valueType: ValueType.Text },
      billRateFrom: { type: ControlTypes.Text, valueType: ValueType.Text },
      billRateTo: { type: ControlTypes.Text, valueType: ValueType.Text },
      openPositions: { type: ControlTypes.Text, valueType: ValueType.Text },
      jobStartDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      jobEndDate: { type: ControlTypes.Date, valueType: ValueType.Text },
    };
  }
}

