import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';

import { BehaviorSubject, Observable, takeUntil, throttleTime } from 'rxjs';

import { SetHeaderState } from 'src/app/store/app.actions';
import { ITabConfigInterface } from '../../interface/i-tab-config.interface';
import { TAB_ADMIN_TIMESHEETS } from '../../constants/timesheets.constant';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { Destroyable } from '../../../../core/helpers/destroyable.helper';
import { TimeSheetsPage } from '../../store/model/timesheets.model';

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

  private pageNumberSubj: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  private pageSize = 30;

  constructor(private store: Store, private fb: FormBuilder) {
    super();

    store.dispatch(new SetHeaderState({ iconName: 'clock', title: 'Timesheets' }));
  }

  ngOnInit(): void {
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

  private startPageStateWatching(): void {
    this.pageNumberSubj.asObservable()
      .pipe(takeUntil(this.componentDestroy()), throttleTime(100)).subscribe(() => {
      this.initTimesheets();
    });
  }

  private initTimesheets(): void {
    this.store.dispatch(new Timesheets.GetAll({
      pageNumber: this.pageNumberSubj.value,
      pageSize: this.pageSize,
    })).pipe(takeUntil(this.componentDestroy()));
  }

  private initFormGroup(): void {
    this.formGroup = this.fb.group({
      date: [null],
      search: ['']
    });
  }
}
