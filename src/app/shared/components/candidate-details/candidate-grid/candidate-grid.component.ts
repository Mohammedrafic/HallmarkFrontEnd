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
import { CandidatStatus } from '@shared/enums/applicant-status.enum';

@Component({
  selector: 'app-candidate-grid',
  templateUrl: './candidate-grid.component.html',
  styleUrls: ['./candidate-grid.component.scss'],
})
export class CandidateGridComponent extends DestroyableDirective implements OnInit {
  @Input() public CandidateStatus: string;
  @Input() set candidatesPage(page: CandidateDetailsPage) {
    let Enumvalues: number;
    switch (this.CandidateStatus) {
      case "Applied":
        Enumvalues = CandidatStatus.Applied;
        break
      case "Shortlisted":
        Enumvalues = CandidatStatus.Shortlisted;
        break;
      case "Offered":
        Enumvalues = CandidatStatus.Offered;
        break;
      case "Accepted":
        Enumvalues = CandidatStatus.Accepted;
        break;
      case "Onboard":
        Enumvalues = CandidatStatus.OnBoard;
        break;
      default:
        Enumvalues = 0;
    }

    if (Enumvalues > 0) {
      this.candidatePage = page;
      this.candidatePage.items = (this.candidatePage.items || []).filter(f => f.status == Enumvalues);
      this.candidatePage.totalCount = this.candidatePage.items.length
    } else {
      this.candidatePage = page;
    }
    // this.CandidateStatus=="Onboard"? 'OnBoard':''
    // let Enumindex=Object.keys(CandidatStatus).indexOf(this.CandidateStatus=="Onboard"? 'OnBoard':''||"");
    // let Enumvalues =Object.values(CandidatStatus)[Enumindex]
    ;
  }

  @Input() public pageNumber: number;
  @Input() public pageSize: number;

  @ViewChild('grid') grid: GridComponent;

  public candidatePage: CandidateDetailsPage;
  public readonly statusEnum = CandidateStatus;
  public isAgency = false;
  public isLoading = false;
  public columnDefinitions: ColDef[];

  constructor(private router: Router, private store: Store) {
    super();
  }

  ngOnInit(): void {
    this.isAgency = this.router.url.includes('agency');
    this.columnDefinitions = CandidatesColumnsDefinition(this.isAgency);
  }

  public onRowsDropDownChanged(pageSize: number): void {
    this.store.dispatch(new SetPageSize(pageSize));
  }

  public onGoToClick(pageNumber: number): void {
    this.store.dispatch(new SetPageNumber(pageNumber));
  }
}
