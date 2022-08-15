import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState, ShowExportDialog, ShowFilterDialog } from 'src/app/store/app.actions';
import { Observable, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';

@Component({
  selector: 'app-candidates-content',
  templateUrl: './candidates-content.component.html',
  styleUrls: ['./candidates-content.component.scss'],
})
export class CandidatesContentComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  public includeDeployedCandidates$: Subject<boolean> = new Subject<boolean>();
  public filteredItems$ = new Subject<number>();
  public exportUsers$ = new Subject<ExportedFileType>();
  public search$ = new Subject<string>();

  private unsubscribe$: Subject<void> = new Subject();

  constructor(private store: Store, private router: Router, private route: ActivatedRoute) {
    super();
    store.dispatch(new SetHeaderState({ title: 'Candidate List', iconName: 'users' }));
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onSwitcher(event: { checked: boolean }): void {
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
