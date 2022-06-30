import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Invoice } from "../../interface";



@Component({
  selector: 'app-profile-invoices',
  templateUrl: './profile-invoices.component.html',
  styleUrls: ['./profile-invoices.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileInvoicesComponent {
  @Input()
  public invoices: Invoice[] = [];

  public trackByName(_: number, item: Invoice): string {
    return item.name;
  }
}
