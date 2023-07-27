import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { tabsConfig } from '@client/candidates/add-edit-candidate/tabs-config.constants';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';
import { Select, Store } from '@ngxs/store';
import { TabsComponent } from '@shared/components/tabs/tabs.component';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { Observable, debounceTime, takeUntil } from 'rxjs';
import { SetHeaderState } from 'src/app/store/app.actions';
import { CandidatesService } from '../services/candidates.service';
import { CandidateTabsEnum } from '@client/candidates/enums/candidate-tabs.enum';
import { DialogMode } from '@shared/enums/dialog-mode.enum';
import { UserState } from 'src/app/store/user.state';
import { Permission } from '@core/interface';
import { UserPermissions } from '@core/enums';
import { SelectNavigationTab } from '@client/store/order-managment-content.actions';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { CandidateDetailsState } from '@shared/components/candidate-details/store/candidate.state';
import { SelectNavigation } from '@shared/components/candidate-details/store/candidate.actions';
import { OrderManagementPagerState } from '@shared/models/candidate.model';

import { Location } from "@angular/common";

import { GlobalWindow } from "@core/tokens";
import { AppState } from 'src/app/store/app.state';
@Component({
  selector: 'app-add-edit-candidate',
  templateUrl: './add-edit-candidate.component.html',
  styleUrls: ['./add-edit-candidate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEditCandidateComponent extends DestroyableDirective implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tabs') public tabsComponent: TabsComponent<unknown>;

  @Select(UserState.userPermission)
  public readonly userPermissions$: Observable<Permission>;

  @Select(AppState.isMobileScreen)
  public readonly isMobile$: Observable<boolean>;

  public readonly tabsConfig = tabsConfig;
  public readonly userPermissions = UserPermissions;
  public showButtons = true;
  public title: DialogMode;
  public titlevalue: string;
  public candidateName$ = this.candidatesService.getCandidateName();

  constructor(
    private router: Router,
    private candidateProfileFormService: CandidateProfileFormService,
    public candidatesService: CandidatesService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private store: Store,
     private location:Location,
    @Inject(GlobalWindow) protected readonly globalWindow : WindowProxy & typeof globalThis,
  ) {
    super();
    store.dispatch(new SetHeaderState({ title: 'Employees', iconName: 'users' }));
  }

  public ngOnInit(): void {
    this.subscribeOnTabUpdate();
  }

  public ngAfterViewInit(): void {
    if (this.route.snapshot.paramMap.get('id')) {
      this.candidateProfileFormService.tabUpdate$.next(parseInt(this.route.snapshot.paramMap.get('id') as string));
      this.title = DialogMode.Edit;
      this.titlevalue=this.title + '  Employee';
    } else {
      this.title = DialogMode.Add ;
      this.titlevalue=this.title + '  Employee';
    }
    const locationState = this.location.getState() as {
      orderId: number;
      pageToBack: string;
      isNavigateFromCandidateDetails: boolean;
      orderManagementPagerState?: OrderManagementPagerState | null;
    };
    const navigationStateString = this.globalWindow.localStorage.getItem('navigationState');
    const navigationState = navigationStateString ? JSON.parse(navigationStateString) : null;
    const location = navigationState ? Object.assign(locationState, navigationState) : locationState;
    if((location!=null&&  location.pageToBack=='/client/scheduling')||(location!=null && location.pageToBack=='/client/order-management') )
    {
      this.titlevalue='';
    }
  }

  public get isCandidateFormPristine(): boolean {
    return this.candidateProfileFormService.candidateForm.pristine;
  }

  private subscribeOnTabUpdate(): void {
    this.candidateProfileFormService.tabUpdate$.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe((id) => {
      this.candidatesService.employeeId = id;
      this.enableTabs();
      this.cdr.detectChanges();
    });
  }

  public navigateBack(): void {
    const locationState = this.location.getState() as {
      orderId: number;
      pageToBack: string;
      isNavigateFromCandidateDetails: boolean;
      orderManagementPagerState?: OrderManagementPagerState | null;
    };
    const navigationStateString = this.globalWindow.localStorage.getItem('navigationState');
    const navigationState = navigationStateString ? JSON.parse(navigationStateString) : null;
    const location = navigationState ? Object.assign(locationState, navigationState) : locationState;
    this.globalWindow.localStorage.removeItem('navigationState');

    switch (true) {
      case location!=null&&  location.pageToBack=='/client/scheduling':
      this.router.navigate([location.pageToBack]);
      break;
      case location.orderId && !location.isNavigateFromCandidateDetails:
        this.router.navigate([location.pageToBack], { state: { orderId: location.orderId, orderManagementPagerState: location.orderManagementPagerState,irpActiveTab:location.irpActiveTab


        } });
        this.globalWindow.localStorage.setItem("IsEmployeeTab", JSON.stringify(true));
        const selectedNavigation = this.store.selectSnapshot(OrderManagementContentState.navigationTab);
        this.store.dispatch(new SelectNavigationTab(selectedNavigation?.current));
        break;
      case location.orderId && location.isNavigateFromCandidateDetails:
        this.router.navigate([location.pageToBack]);
        const selectedTab = this.store.selectSnapshot(CandidateDetailsState.navigationTab);
        this.store.dispatch(new SelectNavigation(selectedTab.active, null, true));
        break;
      default:
        this.router.navigate(['/client/candidates']);
    }
  }

  public saveCandidate(): void {
    this.candidateProfileFormService.triggerSaveEvent();
  }

  public clearForm(): void {
    this.candidateProfileFormService.resetCandidateForm();
  }

  public enableTabs(): void {
    this.tabsConfig.forEach((tab, index: number) => {
      this.tabsComponent.tabComponent.enableTab(index, true);
    });
  }

  public onTabChange(tab: { selectedIndex: CandidateTabsEnum }): void {
    this.showButtons = tab.selectedIndex === 0;
    this.candidatesService.changeTab(tab.selectedIndex);
  }
}
