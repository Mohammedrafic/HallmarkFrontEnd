import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { GetAllCredentials, GetAllCredentialTypes } from '@order-credentials/store/credentials.actions';
import { OrderCandidatesCredentialsState } from '@order-credentials/store/credentials.state';
import { CredentialType } from '@shared/models/credential-type.model';
import { Credential } from '@shared/models/credential.model';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-add-order-credential-form',
  templateUrl: './add-order-credential-form.component.html',
  styleUrls: ['./add-order-credential-form.component.scss']
})
export class AddOrderCredentialFormComponent implements OnInit {

  @ViewChild('searchGrid') searchGrid: GridComponent;

  @Input() form: FormGroup;

  @Select(OrderCandidatesCredentialsState.allCredentials)
  allCredentials$: Observable<Credential[]>;

  @Select(OrderCandidatesCredentialsState.credentialTypes)
  credentialTypes$: Observable<CredentialType[]>;

  public selectedCredType: string;
  public credTypesFields = { text: 'name', value: 'name', };

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.store.dispatch([new GetAllCredentials(), new GetAllCredentialTypes()]);
  }

  public filterByType(): void {
    if (this.selectedCredType) {
      this.searchGrid.filterByColumn('credentialTypeName', 'equal', this.selectedCredType );
    } else {
      this.searchGrid.clearFiltering();
    }
  }

  public selectCredential(event: any): void {
    this.form.get('credentialName')?.setValue(event.data.name);
    this.form.get('credentialType')?.setValue(event.data.credentialTypeName);
    console.log(event);
  }

  public deselectCredential(event: any): void {
    this.form.get('credentialName')?.setValue(null);
    this.form.get('credentialType')?.setValue(null);
  }

  public searchCredential(event: any): void {
    this.searchGrid.search((event.target as HTMLInputElement).value);
  }

}
