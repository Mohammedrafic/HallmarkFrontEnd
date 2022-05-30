import { Component, OnInit } from '@angular/core';

import { Store } from '@ngxs/store';

import { ShowSideDialog } from 'src/app/store/app.actions';

import { IOrderCredential, IOrderCredentialItem } from './types';

@Component({
  selector: 'app-order-credentials',
  templateUrl: './order-credentials.component.html',
  styleUrls: ['./order-credentials.component.scss']
})
export class OrderCredentialsComponent implements OnInit {
  public credentials: IOrderCredential[] = [
    {
      type: 'Checklist',
      items: [
        {
          name: 'Candidate Profile',
          reqForSubmission: true,
          reqForOnboard: true,
          optional: false,
          comments: 'Resume, References, and Specialty Specific Competancy Testing'
        },
        {
          name: 'Code of Condact Form',
          reqForSubmission: false,
          reqForOnboard: true,
          optional: false,
          comments: 'Upload a signed, page 27'
        }
      ],
      totalCount: 2,
      totalPages: 1
    },
    {
      type: 'Certification',
      items: [
        {
          name: 'Candidate Profile',
          reqForSubmission: false,
          reqForOnboard: true,
          optional: false,
          comments: 'Resume, References, and Specialty Specific Competancy Testing'
        },
        {
          name: 'Code of Condact Form',
          reqForSubmission: false,
          reqForOnboard: true,
          optional: false,
          comments: 'Upload a signed, page 27'
        }
      ],
      totalCount: 2,
      totalPages: 1
    }
  ];

  public credentialFormHeader: string;
  public isEditMode: boolean;

  constructor(private store: Store) { }

  ngOnInit(): void {
  }

  public addNew(): void {
    this.credentialFormHeader = 'Add Credential';
    this.isEditMode = false;
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onEdit(credential: IOrderCredentialItem): void {
    this.credentialFormHeader = 'Edit Credential';
    this.isEditMode = true;
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onDialogCancel(): void {
    this.store.dispatch(new ShowSideDialog(false));
  }

  public onDialogOk(): void {
    this.store.dispatch(new ShowSideDialog(false));
  }

}
