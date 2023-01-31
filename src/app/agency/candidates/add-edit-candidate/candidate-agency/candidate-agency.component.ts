import { GetAgencyByPage } from '@agency/store/agency.actions';
import { AgencyState } from '@agency/store/agency.state';
import { AfterViewInit, Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UserState } from 'src/app/store/user.state';
import { GRID_CONFIG } from '@shared/constants';

@Component({
  selector: 'app-candidate-agency',
  templateUrl: './candidate-agency.component.html',
  styleUrls: ['./candidate-agency.component.scss'],
})
export class CandidateAgencyComponent implements AfterViewInit {
  @Input() formGroup: FormGroup;

  public agencyFields = {
    text: 'createUnder.name',
    value: 'createUnder.id',
  };

  @Select(AgencyState.agencies)
  agencies$: Observable<any>;

  constructor(private store: Store) {
    store.dispatch(new GetAgencyByPage(
      GRID_CONFIG.initialPage,
      GRID_CONFIG.initialRowsPerPage,
      '',
      {}
    )); // TODO: needed until we dont have agency switcher in the header
  }

  ngAfterViewInit(): void {
    this.store.select(UserState.lastSelectedAgencyId).subscribe((agencyId) => {
      this.formGroup.patchValue({
        agencyId,
      });
    });
  }

  static createFormGroup(): FormGroup {
    return new FormGroup({
      agencyId: new FormControl(null),
    });
  }
}
