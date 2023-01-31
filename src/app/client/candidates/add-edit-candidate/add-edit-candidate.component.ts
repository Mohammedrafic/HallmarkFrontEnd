import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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

  public readonly tabsConfig = tabsConfig;
  public readonly userPermissions = UserPermissions;
  public showButtons = true;
  public title: DialogMode;
  public candidateName$ = this.candidatesService.getCandidateName();

  constructor(
    private router: Router,
    private candidateProfileFormService: CandidateProfileFormService,
    public candidatesService: CandidatesService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private store: Store,
  ) {
    super();
    store.dispatch(new SetHeaderState({ title: 'Candidates', iconName: 'clock' }));
  }

  public ngOnInit(): void {
    this.subscribeOnTabUpdate();
  }

  public ngAfterViewInit(): void {
    if (this.route.snapshot.paramMap.get('id')) {
      this.candidateProfileFormService.tabUpdate$.next(parseInt(this.route.snapshot.paramMap.get('id') as string));
      this.title = DialogMode.Edit;
    } else {
      this.title = DialogMode.Add;
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
    this.router.navigate(['/client/candidates']);
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
