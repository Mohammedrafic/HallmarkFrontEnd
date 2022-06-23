import {ChangeDetectionStrategy, Component} from '@angular/core';

interface Invoice {
  name: string;
}

@Component({
  selector: 'app-profile-invoices',
  templateUrl: './profile-invoices.component.html',
  styleUrls: ['./profile-invoices.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileInvoicesComponent {
  public readonly invoices: Invoice[] = [
    {
      name: 'Invoice_SenderP'
    }
  ];

  public trackByName(_: number, item: Invoice): string {
    return item.name;
  }
}
