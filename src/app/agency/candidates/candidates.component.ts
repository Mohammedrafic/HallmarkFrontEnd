import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { distinctUntilChanged, Observable, Subject, takeWhile } from 'rxjs';
import { ShowExportDialog, ShowFilterDialog } from 'src/app/store/app.actions';
import { CandidateListComponent } from '@shared/components/candidate-list/components/candidate-list/candidate-list.component';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { UserState } from '../../store/user.state';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';

@Component({
  selector: 'app-candidates',
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.scss'],
})
export class CandidatesComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  @ViewChild('candidateList') candidateList: CandidateListComponent;

  public includeDeployedCandidates$: Subject<boolean> = new Subject<boolean>();
  public filteredItems$ = new Subject<number>();
  public search$ = new Subject<string>();
  public exportUsers$ = new Subject<ExportedFileType>();
  public agencyActionsAllowed = true;
  public includeDeployed = true;

  private openImportDialog: Subject<void> = new Subject<void>();
  private isAlive = true;
  private isAgency: boolean;

  public openImportDialog$: Observable<void> = this.openImportDialog.asObservable();

  constructor(protected override store: Store, private router: Router, private route: ActivatedRoute) {
    super(store);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.isAgency = this.router.url.includes('agency');

    if (this.isAgency) {
      this.checkForAgencyStatus();
    }
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public reloadCandidatesList(): void {
    this.candidateList?.dispatchNewPage();
  }

  public onImport(): void {
    this.openImportDialog.next();
  }

  public onSwitcher(event: { checked: boolean }) {
    this.includeDeployedCandidates$.next(event.checked);
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public navigateToCandidateForm(): void {
    this.router.navigate(['./add'], { relativeTo: this.route });
  }

  public override customExport(): void {
    this.store.dispatch(new ShowExportDialog(true));
  }

  public override defaultExport(fileType: ExportedFileType): void {
    this.exportUsers$.next(fileType);
  }

  public observeIncludeDeployed(): void {
    this,this.includeDeployedCandidates$.asObservable()
    .pipe(
      distinctUntilChanged(),
      takeWhile(() => this.isAlive)
    )
    .subscribe((value) => {
      this.includeDeployed = value;
    });
  }

  private checkForAgencyStatus(): void {
    this.store
      .select(UserState.agencyActionsAllowed)
      .pipe(
        distinctUntilChanged(),
        takeWhile(() => this.isAlive)
      )
      .subscribe((value) => {
        this.agencyActionsAllowed = value;
      });
  }
}
