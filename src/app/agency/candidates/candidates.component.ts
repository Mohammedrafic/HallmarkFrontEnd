import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { ShowExportDialog, ShowFilterDialog } from 'src/app/store/app.actions';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ExportedFileType } from '@shared/enums/exported-file-type';

@Component({
  selector: 'app-candidates',
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.scss'],
})
export class CandidatesComponent extends AbstractGridConfigurationComponent implements OnDestroy {
  public includeDeployedCandidates$: Subject<boolean> = new Subject<boolean>();
  public filteredItems$ = new Subject<number>();
  public search$ = new Subject<string>();
  public exportUsers$ = new Subject<ExportedFileType>();

  private unsubscribe$: Subject<void> = new Subject();
  private openImportDialog: Subject<void> = new Subject<void>();

  public openImportDialog$: Observable<void> = this.openImportDialog.asObservable();

  constructor(private store: Store, private router: Router, private route: ActivatedRoute) {
    super();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
}
