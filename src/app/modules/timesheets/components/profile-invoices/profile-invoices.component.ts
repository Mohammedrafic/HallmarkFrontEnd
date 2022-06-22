import { Component } from '@angular/core';

@Component({
  selector: 'app-profile-invoices',
  templateUrl: './profile-invoices.component.html',
  styleUrls: ['./profile-invoices.component.scss']
})
export class ProfileInvoicesComponent {
  public readonly invoices: { name: string }[] = [
    {
      name: 'Invoice_SenderP'
    }
  ];
}
