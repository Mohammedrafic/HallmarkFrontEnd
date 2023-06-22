import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';

import { take } from 'rxjs';

import { DateWeekService } from '@core/services';
import { EmployeeIcons } from '../../enums';
import { ScheduleCandidate, ScheduleFilters, ScheduleModel } from '../../interface';
import { CandidateIconName } from '../../constants';
import { GetCandidateTypeTooltip, GetIconTooltipMessage, PrepareCandidate } from './candidate-card.helper';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { SetLastSelectedOrganizationAgencyId } from 'src/app/store/user.actions';
import { disabledBodyOverflow } from '@shared/utils/styles.utils';
import { UserState } from 'src/app/store/user.state';
import { AppState } from 'src/app/store/app.state';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { GlobalWindow } from '@core/tokens';

@Component({
  selector: 'app-candidate-card',
  templateUrl: './candidate-card.component.html',
  styleUrls: ['./candidate-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CandidateCardComponent implements OnInit, OnChanges {
  isMobileScreen: any;
  
 
  isAgency: any;
  order: any;
  orderManagementPagerState: any;
  
  @Input() set candidate(schedule: ScheduleModel) {
    this.candidateData = PrepareCandidate(schedule.candidate);
  }

  @Input() selectedFilters: ScheduleFilters;
  @Input() showScheduledHours = true;

  candidateData: ScheduleCandidate;
  candidateIconName: EmployeeIcons | null;
  iconTooltipMessage = '';
  candidateTypeTooltip: string;
  startDate: string;

  constructor(
    private store: Store,
    private dateWeekService:DateWeekService,
    private cdr: ChangeDetectorRef,
    protected router: Router, 
    @Inject(GlobalWindow) protected readonly globalWindow : WindowProxy & typeof globalThis,
  ) {}

  ngOnInit(): void {
    this.watchForDateRangeChanges();
    this.candidateIconName = CandidateIconName(this.candidateData, this.selectedFilters, this.startDate);
    this.iconTooltipMessage = GetIconTooltipMessage(this.candidateIconName, this.candidateData, this.startDate);
  }

  private watchForDateRangeChanges(): void {
    this.dateWeekService.getRangeStream().pipe(
      take(1),
    ).subscribe((range: string[]) => {
      const [startDate] = range;
      this.startDate = startDate;
      this.cdr.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedFilters']?.currentValue && changes['candidate']?.currentValue) {
      this.createToolTipForSchedule(changes['candidate'].currentValue, changes['selectedFilters'].currentValue);
    }
  }

  public onViewNavigation(data: any): void {
  

    if(this.isMobileScreen){
      return;
    }
    const user = this.store.selectSnapshot(UserState.user);
    
    const isOrganizationAgencyArea = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
    const url =
      user?.businessUnitType === BusinessUnitType.Organization ? 'client/candidates/edit' : 'client/candidates/edit';
        if (user?.businessUnitType === BusinessUnitType.Hallmark) {
          this.store.dispatch(
            new SetLastSelectedOrganizationAgencyId({
              lastSelectedAgencyId: data.agencyId,
              lastSelectedOrganizationId: null,
            })
          );
        }
    const pageToBack = this.router.url;
    const state = {
          
            pageToBack,
            
          };
    this.globalWindow.localStorage.setItem('navigationState', JSON.stringify(state));
    this.router.navigate([url, data.id], {
      state: state,
    });
    disabledBodyOverflow(false);
  
  }

  private createToolTipForSchedule(schedule: ScheduleModel, filters: ScheduleFilters ): void {
    this.candidateTypeTooltip = GetCandidateTypeTooltip(
      schedule.candidate.ltaAssignment,
      filters.startDate as string,
      filters.endDate as string,
    );
  }
}
