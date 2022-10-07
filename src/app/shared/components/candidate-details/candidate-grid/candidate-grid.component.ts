import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { CandidateStatus } from '@shared/enums/status';
import { Store } from '@ngxs/store';
import { CandidatesColumnsDefinition } from '@shared/components/candidate-details/candidate-grid/candidate-grid.constant';
import { Router } from '@angular/router';
import { SetPageNumber, SetPageSize } from '@shared/components/candidate-details/store/candidate.actions';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { CandidateDetailsPage } from '@shared/components/candidate-details/models/candidate.model';
import { ColDef } from '@ag-grid-community/core';
import { UserState } from '../../../../store/user.state';
import { distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-candidate-grid',
  templateUrl: './candidate-grid.component.html',
  styleUrls: ['./candidate-grid.component.scss'],
})
export class CandidateGridComponent extends DestroyableDirective implements OnInit {
  @Input() set candidatesPage(page: CandidateDetailsPage) {
    this.candidatePage = page;
  }

  @Input() public pageNumber: number;
  @Input() public pageSize: number;

  @ViewChild('grid') grid: GridComponent;

  public candidatePage: CandidateDetailsPage;
  public readonly statusEnum = CandidateStatus;
  public isAgency = false;
  public isLoading = false;
  public columnDefinitions: ColDef[];
  public agencyActionsAllowed = true;

  constructor(private router: Router, private store: Store) {
    super();
  }

  ngOnInit(): void {
    this.isAgency = this.router.url.includes('agency');

    if (this.isAgency) {
      this.checkForAgencyStatus();
    }

    this.columnDefinitions = CandidatesColumnsDefinition(this.isAgency, this.agencyActionsAllowed);
  }

  public onRowsDropDownChanged(pageSize: number): void {
    this.store.dispatch(new SetPageSize(pageSize));
  }

  public onGoToClick(pageNumber: number): void {
    this.store.dispatch(new SetPageNumber(pageNumber));
  }

  private checkForAgencyStatus(): void {
    this.store
      .select(UserState.agencyActionsAllowed)
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => {
        this.agencyActionsAllowed = value;
      });
  }
}
