import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { GetAllCredentials, GetAllCredentialTypes } from '@order-credentials/store/credentials.actions';
import { OrderCandidatesCredentialsState } from '@order-credentials/store/credentials.state';
import { IOrderCredentialItem } from '@order-credentials/types';
import { CredentialType } from '@shared/models/credential-type.model';
import { Credential } from '@shared/models/credential.model';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-add-order-credential-form',
  templateUrl: './add-order-credential-form.component.html',
  styleUrls: ['./add-order-credential-form.component.scss'],
})
export class AddOrderCredentialFormComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChild('searchGrid') searchGrid: GridComponent;

  @Input() form: FormGroup;
  @Input() addedCredentials: IOrderCredentialItem[] = [];
  @Input() formSubmitted = false;
  @Input() includeInIRP = false;

  @Output() selectCredentialItem: EventEmitter<Credential> = new EventEmitter();

  @Select(OrderCandidatesCredentialsState.allCredentials)
  allCredentials$: Observable<Credential[]>;

  @Select(OrderCandidatesCredentialsState.credentialTypes)
  credentialTypes$: Observable<CredentialType[]>;

  public selectedCredType: string;
  public credTypesFields = { text: 'name', value: 'name', };
  public filteredCreds: Credential[] = [];
  public credSelectionInvalid = false;
  private unsubscribe$: Subject<void> = new Subject();
  private allCredentialsOrigin: Credential[] = [];

  constructor(private store: Store, private cd: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    const { addedCredentials, formSubmitted } = changes;
    if ( addedCredentials && !addedCredentials.firstChange) {
      this.filterCredentials(this.allCredentialsOrigin);
    }
    if (formSubmitted) {
      this.credSelectionInvalid = this.formSubmitted && !this.form.valid;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.store.dispatch([new GetAllCredentials(this.includeInIRP), new GetAllCredentialTypes()]);
    this.form.statusChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(status => {
      this.credSelectionInvalid = this.formSubmitted && (status === 'INVALID');
    });
    this.allCredentials$.pipe(takeUntil(this.unsubscribe$)).subscribe(allCredentials => {
      this.allCredentialsOrigin = allCredentials;
      this.filterCredentials(allCredentials);
    });
  }

  public filterByType(): void {
    if (!this.searchGrid) {
      return;
    }
    if (this.selectedCredType) {
      this.searchGrid.filterByColumn('credentialTypeName', 'equal', this.selectedCredType );
    } else {
      this.searchGrid.clearFiltering();
    }
  }

  public selectCredential(event: { data: Credential }): void {
    this.form.get('credentialId')?.setValue(event.data.id);
    this.form.get('credentialName')?.setValue(event.data.name);
    this.form.get('credentialType')?.setValue(event.data.credentialTypeName);
    this.selectCredentialItem.emit(event.data);
  }

  public deselectCredential(): void {
    this.form.get('credentialId')?.setValue(0);
    this.form.get('credentialName')?.setValue(null);
    this.form.get('credentialType')?.setValue(null);
    this.selectCredentialItem.emit({} as Credential);
  }

  public searchCredential(event: KeyboardEvent): void {
    if (this.searchGrid) {
      this.searchGrid.search((event.target as HTMLInputElement).value);
    }
  }

  public clearGridSelection(): void {
    if (this.searchGrid) {
      this.searchGrid.selectionModule.clearSelection();
    }
  }

  private filterCredentials(allCredentials: Credential[]): void {
    this.filteredCreds = allCredentials.filter(credential => {
      return !(this.addedCredentials.find(addedCred => addedCred.credentialId === credential.id));
    });
    this.cd.markForCheck();
  }
}
