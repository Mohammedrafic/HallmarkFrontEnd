import { AfterViewInit, Component, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { FieldSettingsModel, FilteringEventArgs, MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import { FormGroup } from '@angular/forms';
import { FilterColumnsModel } from '@shared/components/candidate-details/models/candidate.model';
import { Actions, Store, ofActionDispatched } from '@ngxs/store';
import { ShowFilterDialog } from 'src/app/store/app.actions';
import { debounceTime, delay, distinctUntilChanged, takeUntil } from 'rxjs';
import { EmitType } from '@syncfusion/ej2-base';
import { OutsideZone } from '@core/decorators';
import { DoNotReturnCandidateSearchFilter } from '@shared/models/donotreturn.model';
import { GetcandidateOrgSearchbytext, Getcandidatesearchbytext } from '../store/candidate.actions';
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
  @Input() public orgAgencyName:string;
  @Input() public lastOrgId:number;
  @Input() public lastAgencyId:number;

  @ViewChild('regionDropdown') public regionDropdown: MultiSelectComponent;
  @ViewChild('locationDropdown') public  locationDropdown: MultiSelectComponent;
  @ViewChild('departmentDropdown') public  departmentDropdown: MultiSelectComponent;
  public optionFields = {
    text: 'text',
    value: 'value',
  };
  
  public typeFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public skillFields: FieldSettingsModel = { text: 'skillDescription', value: 'masterSkillId' };
  public allOption: string = "All";
  public agencyFields = {
    text: 'agencyName',
    value: 'agencyId',
  };
  public filterType: string = 'Contains';
  constructor(private actions$: Actions, protected  store: Store, private readonly ngZone: NgZone,) {
    super();
  }
  public htmlAttributes = {  maxlength: "50" };
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
  }

  public filterCandidateName: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFilterChild(e);
  }

  @OutsideZone
  private onFilterChild(e: FilteringEventArgs) {
    if (e.text != '') {
      const filter: DoNotReturnCandidateSearchFilter = {
        searchText: e.text,
        businessUnitId: this.isAgency ? this.lastAgencyId : this.lastOrgId,
      };
      if(this.isAgency){
        this.store.dispatch(new Getcandidatesearchbytext(filter))
        .pipe(
          delay(500),
          distinctUntilChanged(),
          takeUntil(this.destroy$)
        ).subscribe((result) => {
          e.updateData(result.candidateDetails.searchCandidates);

        });
      }else{
        this.store.dispatch(new GetcandidateOrgSearchbytext(filter))
        .pipe(
          delay(500),
          distinctUntilChanged(),
          takeUntil(this.destroy$)
        ).subscribe((result) => {
            e.updateData(result.candidateDetails.searchOrgCandidates);
        });
      }
  
    }
  }

  ngAfterViewInit() {
    this.departmentDropdown.refresh();
    this.locationDropdown.refresh();
    
  }
}
