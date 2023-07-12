import { AfterViewInit, Component, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { FieldSettingsModel, FilteringEventArgs, MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import { FormGroup } from '@angular/forms';
import { FilterColumnsModel } from '@shared/components/candidate-details/models/candidate.model';
import { Actions, Store, ofActionDispatched } from '@ngxs/store';
import { ShowFilterDialog } from 'src/app/store/app.actions';
import { debounceTime, delay, distinctUntilChanged, takeUntil } from 'rxjs';
import { EmitType } from '@syncfusion/ej2-base';
import { OutsideZone } from '@core/decorators';
import { UserState } from 'src/app/store/user.state';
import { DoNotReturnCandidateSearchFilter } from '@shared/models/donotreturn.model';
import { Getcandidatesearchbytext } from '../store/candidate.actions';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
})
export class FiltersComponent extends DestroyableDirective implements OnInit, AfterViewInit {
  @Input() public filterColumns: FilterColumnsModel;
  @Input() public filtersForm: FormGroup;
  @Input() public isAgency: boolean;
  @Input() public orgAgencyName:any
  @Input() public isClear: boolean;

  @ViewChild('regionDropdown') public regionDropdown: MultiSelectComponent;
  @ViewChild('locationDropdown') public  locationDropdown: MultiSelectComponent;
  @ViewChild('departmentDropdown') public  departmentDropdown: MultiSelectComponent;
  public optionFields = {
    text: 'name',
    value: 'id',
  };
  public typeFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public skillFields: FieldSettingsModel = { text: 'skillDescription', value: 'masterSkillId' };
  public orgid:number|null|undefined;
  public CandidateNames:any;
  public allOption: string = "All";
  public agencyFields = {
    text: 'agencyName',
    value: 'agencyId',
  };
  public filterType: string = 'Contains';
  constructor(private actions$: Actions, protected  store: Store, private readonly ngZone: NgZone,) {
    super();
    const user = this.store.selectSnapshot(UserState.user);
    this.orgid=user?.businessUnitId
  }
  remoteWaterMark: string = 'e.g. Andrew Fuller';
  commonFields: FieldSettingsModel = { text: 'name', value: 'id' };
  candidateNameFields: FieldSettingsModel = { text: 'fullName', value: 'id' };

  ngOnInit(): void {  
    this.actions$.pipe(
      ofActionDispatched(ShowFilterDialog),
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.regionDropdown.refresh();
      this.locationDropdown.refresh();
      this.departmentDropdown.refresh();
    });
    const user = this.store.selectSnapshot(UserState.user);
    this.orgid=user?.businessUnitId
  }

  public onFiltering: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFilterChild(e);
  }
  @OutsideZone
  private onFilterChild(e: FilteringEventArgs) {

    if (e.text != '') {
 const user = this.store.selectSnapshot(UserState.user);
 let lastSelectedOrganizationId = window.localStorage.getItem("lastSelectedOrganizationId");
    this.orgid=user?.businessUnitId|| parseInt(lastSelectedOrganizationId||'0')

         let filter: DoNotReturnCandidateSearchFilter = {
        searchText: e.text,
        businessUnitId: this.orgid
      };
      this.CandidateNames = [];
      this.store.dispatch(new Getcandidatesearchbytext(filter))
        .pipe(
          delay(500),
          distinctUntilChanged(),
          takeUntil(this.destroy$)
        ).subscribe((result) => {

          this.CandidateNames = result.candidateDetails.searchCandidates
          e.updateData(result.candidateDetails.searchCandidates);
        });
    }
  }
  ngAfterViewInit() {
    this.departmentDropdown.refresh();
    this.locationDropdown.refresh();
    if (this.isClear) {
      this.regionDropdown.selectAll(false);
      this.locationDropdown.selectAll(false);
      this.departmentDropdown.selectAll(false);
      this.locationDropdown.refresh();
      this.regionDropdown.refresh();
      this.departmentDropdown.refresh();
    }
    const user = this.store.selectSnapshot(UserState.user);
    this.orgid=user?.businessUnitId
  }
}
