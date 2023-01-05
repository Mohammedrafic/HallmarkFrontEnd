import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { tabsConfig } from '@client/candidates/add-edit-candidate/tabs-config.constants';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';
import { TabsComponent } from '@shared/components/tabs/tabs.component';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { debounceTime, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-add-edit-candidate',
  templateUrl: './add-edit-candidate.component.html',
  styleUrls: ['./add-edit-candidate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEditCandidateComponent extends DestroyableDirective implements OnInit, AfterViewInit {
  @ViewChild('tabs') public tabsComponent: TabsComponent<unknown>;
  public readonly tabsConfig = tabsConfig;

  private tabUpdate$: Subject<void> = new Subject();

  constructor(
    private router: Router,
    public candidateProfileFormService: CandidateProfileFormService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribeOnTabUpdate();
  }

  ngAfterViewInit(): void {
    if (this.route.snapshot.paramMap.get('id')) {
      this.tabUpdate$.next();
    }
  }

  public get isCandidateFormPristine(): boolean {
    return this.candidateProfileFormService.candidateForm.pristine;
  }

  private subscribeOnTabUpdate(): void {
    this.tabUpdate$.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(() => {
      this.enableTabs();
    });
  }

  public navigateBack(): void {
    this.router.navigate(['/client/candidates']);
  }

  public saveCandidate(): void {
    this.tabUpdate$.next();
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
}
