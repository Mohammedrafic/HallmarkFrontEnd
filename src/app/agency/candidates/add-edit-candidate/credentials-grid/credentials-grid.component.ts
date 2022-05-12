import { GetCandidatesByPage, GetCandidatesCredentialByPage } from "@agency/store/candidate.actions";
import { CandidateState } from "@agency/store/candidate.state";
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Actions, Select, Store } from "@ngxs/store";
import { AbstractGridConfigurationComponent } from "@shared/components/abstract-grid-configuration/abstract-grid-configuration.component";
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from "@shared/constants/messages";
import { CandidateCredentialPage } from "@shared/models/candidate-credential.model";
import { ConfirmService } from "@shared/services/confirm.service";
import { GridComponent } from "@syncfusion/ej2-angular-grids";
import { debounceTime, filter, Observable, Subject } from "rxjs";
import { SetHeaderState } from "src/app/store/app.actions";

@Component({
  selector: 'app-credentials-grid',
  templateUrl: './credentials-grid.component.html',
  styleUrls: ['./credentials-grid.component.scss']
})
export class CredentialsGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;

  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();

  @Select(CandidateState.candidateCredential)
  candidateCredential$: Observable<CandidateCredentialPage>;


  constructor(private store: Store,
              private router: Router,
              private route: ActivatedRoute,
              private actions$: Actions,
              private confirmService: ConfirmService) {
    super();
    this.store.dispatch(new SetHeaderState({ title: 'Candidates', iconName: 'clock' }));
  }

  ngOnInit(): void {
    this.store.dispatch(new GetCandidatesCredentialByPage(this.currentPage, this.pageSize));
    this.pageSubject.pipe(debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetCandidatesByPage(this.currentPage, this.pageSize));
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onIncludeExcludeChange(event: any) {
    // TODO
  }

  public addNew(): void {
    // TODO
  }

  public onFilter(): void {

  }

  public dataBound(): void {
    this.grid.hideScroll();
  }

  public onRowsDropDownChanged(): void {
    this.pageSize  = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  public onCopy(event: MouseEvent, data: any) {
    event.stopPropagation();
    // TODO
  }

  public onDownload(event: MouseEvent, data: any) {
    event.stopPropagation();
    // TODO
  }

  public onEdit(event: MouseEvent, data: any) {
    event.stopPropagation();
    // TODO
  }


  public onRemove(event: MouseEvent, data: any) {
    event.stopPropagation();
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .pipe(filter((confirm) => !!confirm))
      .subscribe(() => {
        // TODO
      });
  }
}
