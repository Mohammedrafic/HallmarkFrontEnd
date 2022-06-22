import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Actions, Select, Store } from '@ngxs/store';

import { BehaviorSubject, Observable, takeUntil, throttleTime } from 'rxjs';

import { SetHeaderState, ShowFilterDialog } from 'src/app/store/app.actions';
import { ITabConfigInterface } from '../../interface/i-tab-config.interface';
import { TAB_ADMIN_TIMESHEETS } from '../../constants/timesheets.constant';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { Destroyable } from '../../../../core/helpers/destroyable.helper';
import { TimeSheetsPage } from '../../store/model/timesheets.model';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { FilteredItem } from '@shared/models/filter.model';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { TIMETHEETS_STATUSES } from '../../enums/timesheets.enum';
import { FilterService } from '@shared/services/filter.service';
import { GetAssignedSkillsByPage } from '@organization-management/store/organization-management.actions';
import { SkillFilters } from '@shared/models/skill.model';
import { ITimesheetsFilter } from '../../interface/i-timesheet.interface';

enum ExportType {
  'Excel File',
  'CSV File',
  'Custom'
}

@Component({
  selector: 'app-timesheets-container.ts',
  templateUrl: './timesheets-container.component.html',
  styleUrls: ['./timesheets-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetsContainerComponent extends Destroyable implements OnInit {
  @Select(TimesheetsState.timesheets)
  timesheets$: Observable<TimeSheetsPage>;

  public tabConfig: ITabConfigInterface[] = TAB_ADMIN_TIMESHEETS;
  public formGroup: FormGroup;
  public exportOptions: ItemModel[] = [
    { text: ExportType[0], id: '0' },
    { text: ExportType[1], id: '1' },
    { text: ExportType[2], id: '2' }
  ];
  public filterOptionFields = {
    text: 'name', value: 'name'
  };
  public filterColumns: any;
  public filteredItems: FilteredItem[] = [];
  public filters: ITimesheetsFilter;

  private pageNumberSubj: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  private pageSize = 30;

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private filterService: FilterService
  ) {
    super();

    store.dispatch(new SetHeaderState({ iconName: 'clock', title: 'Timesheets' }));
  }

  ngOnInit(): void {
    this.initFilterColumn();
    this.initFormGroup();
    this.startPageStateWatching();
  }

  public handleChangeTab(tabIndex: number): void {
    switch (tabIndex) {
      case 0: {
        this.pageNumberSubj.next(1);
        this.pageSize = 30;

        break;
      }
      case 1: {
        console.log(1);
        break;
      }
      case 2: {
        console.log(2);
        break;
      }
      case 3: {
        console.log(2);
        break;
      }
    }
  }

  public handleChangePage(page: number): void {
    this.pageNumberSubj.next(page);
  }

  public handleChangePerPage(pageSize: number): void {
    this.pageSize = pageSize;
  }

  public exportSelected(event: any): void {
    if (event.item.properties.id === ExportType['Excel File']) {
    } else if (event.item.properties.id === ExportType['CSV File']) {
    } else if (event.item.properties.id === ExportType['Custom']) {
    }
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.formGroup, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.formGroup.reset();
    this.filteredItems = [];
    this.pageNumberSubj.next(1);
  }

  public onFilterApply(): void {
    this.filters = this.formGroup.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns);
    this.initTimesheets();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  private startPageStateWatching(): void {
    this.pageNumberSubj.asObservable()
      .pipe(takeUntil(this.componentDestroy()), throttleTime(100)).subscribe(() => {
      this.initTimesheets();
    });
  }

  private initTimesheets(): void {
    this.store.dispatch(new Timesheets.GetAll(Object.assign({}, this.filters, {
      pageNumber: this.pageNumberSubj.value,
      pageSize: this.pageSize,
    }))).pipe(takeUntil(this.componentDestroy()));
  }

  private initFormGroup(): void {
    this.formGroup = this.fb.group({
      date: [null],
      search: [''],
      orderId: [''],
      status: [[]],
      skill: [[]],
      department: [[]],
      billRate: [0],
      agencyName: [[]],
      totalHours: [0],
    });
  }

  private initFilterColumn(): void {
    this.filterColumns = {
      orderId: { type: ControlTypes.Text, valueType: ValueType.Text },
      status: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: Object.values(TIMETHEETS_STATUSES).map((val, idx) => ({
          id: idx + 1,
          name: this.capitalizeFirstLetter(val)
        }))
      },
      skill: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: [
          {
            id: 1,
            name: 'Certified Nursed Assistant'
          },
          {
            id: 2,
            name: 'Qualified Doctor'
          },
        ]
      },
      department: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: [
          {
            id: 1,
            name: 'Emergency'
          },
          {
            id: 2,
            name: 'Surgery'
          },
        ]
      },
      billRate: { type: ControlTypes.Text, valueType: ValueType.Text, },
      agencyName: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: [
          {
            id: 1,
            name: 'AB Staffing'
          },
          {
            id: 2,
            name: 'SQIN'
          }
        ]
      },
      totalHours: { type: ControlTypes.Text, valueType: ValueType.Text },
    };
  }

  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
