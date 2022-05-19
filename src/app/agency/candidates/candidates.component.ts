import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";

import { Actions, ofActionSuccessful, Select, Store } from "@ngxs/store";
import { GridComponent } from "@syncfusion/ej2-angular-grids";
import { debounceTime, filter, Observable, Subject, takeUntil } from "rxjs";
import { GetCandidatesByPage, SaveCandidate, SaveCandidateSucceeded } from "src/app/agency/store/candidate.actions";
import { CandidateState } from "src/app/agency/store/candidate.state";
import { AbstractGridConfigurationComponent } from "src/app/shared/components/abstract-grid-configuration/abstract-grid-configuration.component";
import { CandidateStatus, STATUS_COLOR_GROUP } from "src/app/shared/enums/status";
import { Candidate, CandidatePage } from "src/app/shared/models/candidate.model";
import { ConfirmService } from "src/app/shared/services/confirm.service";

import { SetHeaderState } from "src/app/store/app.actions";

@Component({
  selector: 'app-candidates',
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.scss']
})
export class CandidatesComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;

  public readonly statusEnum = CandidateStatus;

  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();

  @Select(CandidateState.candidates)
  candidates$: Observable<CandidatePage>;


  constructor(private store: Store,
              private router: Router,
              private route: ActivatedRoute,
              private actions$: Actions,
              private confirmService: ConfirmService) {
    super();
    this.store.dispatch(new SetHeaderState({ title: 'Candidates', iconName: 'clock' }));
  }

  ngOnInit(): void {
    this.store.dispatch(new GetCandidatesByPage(this.currentPage, this.pageSize));
    this.pageSubject.pipe(debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetCandidatesByPage(this.currentPage, this.pageSize));
    });
    this.actions$.pipe(
      takeUntil(this.unsubscribe$),
      ofActionSuccessful(SaveCandidateSucceeded)
    ).subscribe((agency: { payload: Candidate }) => {
      this.store.dispatch(new GetCandidatesByPage(this.currentPage, this.pageSize));
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public navigateToCandidateForm(): void {
    this.router.navigate(['./add'], { relativeTo: this.route });
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

  public getChipCssClass(status: string): string {
    const found = Object.entries(STATUS_COLOR_GROUP).find(item => item[1].includes(status));
    return found ? found[0] : 'e-default';
  }

  public onEdit(data: any) {
    this.router.navigate(['./edit', data.id], { relativeTo: this.route });
  }


  public onRemove(data: any) {
    this.confirmService
      .confirm(
        'Are you sure you want to inactivate the Candidate?',
        { okButtonLabel: 'Inactivate',
          okButtonClass: 'delete-button',
          title: 'Inactivate the Candidate'
        })
      .pipe(filter((confirm) => !!confirm))
      .subscribe(() => {
        this.inactivateCandidate(data)
      });
  }

  private inactivateCandidate({ id, agencyId, ssn, firstName, middleName, lastName, email, dob, classification, candidateAgencyStatus,
                                professionalSummary, candidateProfileContactDetail, candidateProfileSkills }: Candidate) {
    const inactiveCandidate: Candidate = {
      id, agencyId, ssn, firstName, middleName, lastName, email, dob, classification,
      candidateAgencyStatus, professionalSummary, candidateProfileContactDetail,
      profileStatus: CandidateStatus.Inactive,
      candidateProfileSkills: candidateProfileSkills.map(skill => skill.id)
    }

    this.store.dispatch(new SaveCandidate(inactiveCandidate));
  }
}
