import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { tabsConfig } from '@client/candidates/add-edit-candidate/tabs-config.constants';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';
import { Store } from '@ngxs/store';
import { TabsComponent } from '@shared/components/tabs/tabs.component';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { SetHeaderState } from 'src/app/store/app.actions';
import { CandidateService } from '../services/candidate.service';

@Component({
  selector: 'app-add-edit-candidate',
  templateUrl: './add-edit-candidate.component.html',
  styleUrls: ['./add-edit-candidate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEditCandidateComponent extends DestroyableDirective implements OnInit, AfterViewInit {
  @ViewChild('tabs') public tabsComponent: TabsComponent<unknown>;
  public readonly tabsConfig = tabsConfig;
  public showButtons = true;

  constructor(
    private router: Router,
    public candidateProfileFormService: CandidateProfileFormService,
    private candidateService: CandidateService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private store: Store,
  ) {
    super();
    store.dispatch(new SetHeaderState({ title: 'Candidates', iconName: 'clock' }));
  }

  ngOnInit(): void {
    this.subscribeOnTabUpdate();
  }

  ngAfterViewInit(): void {
    if (this.route.snapshot.paramMap.get('id')) {
      this.candidateProfileFormService.tabUpdate$.next(parseInt(this.route.snapshot.paramMap.get('id') as string));
    }
  }

  public get isCandidateFormPristine(): boolean {
    return this.candidateProfileFormService.candidateForm.pristine;
  }

  private subscribeOnTabUpdate(): void {
    this.candidateProfileFormService.tabUpdate$.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe((id) => {
      this.candidateService.employeeId = id;
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

  public onTabChange(tab: { selectedIndex: number }): void {
    this.showButtons = tab.selectedIndex === 0;
  }
}
