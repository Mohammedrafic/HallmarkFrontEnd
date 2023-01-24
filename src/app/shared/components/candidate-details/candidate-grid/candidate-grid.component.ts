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

@Component({
  selector: 'app-candidate-grid',
  templateUrl: './candidate-grid.component.html',
  styleUrls: ['./candidate-grid.component.scss'],
})
export class CandidateGridComponent extends DestroyableDirective implements OnInit {
  @Input() public CandidateStatus: number;
  @Input() set candidatesPage(page: CandidateDetailsPage) {
    if (page) {
      this.candidatePage = page;
      this.candidatePage.totalCount = this.candidatePage.items.length
    }
    if(this.CandidateStatus){
      if(page){
        this.candidatePage = page;
        this.candidatePage.items = (this.candidatePage.items || []).filter(f => f.status == this.CandidateStatus);
        this.candidatePage.totalCount = this.candidatePage.items.length
      }
    }
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
