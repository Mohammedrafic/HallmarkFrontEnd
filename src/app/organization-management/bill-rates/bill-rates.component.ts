import { Component, OnInit } from '@angular/core';
import { ShowSideDialog } from '../../store/app.actions';
import { Store } from '@ngxs/store';

export enum BillRateNavigationTabs {
  BillRateSetup,
  ExternalBillRateType,
  ExternalBillRateTypeMapping
}

@Component({
  selector: 'app-bill-rates',
  templateUrl: './bill-rates.component.html',
  styleUrls: ['./bill-rates.component.scss']
})
export class BillRatesComponent implements OnInit {
  public isBillRateSetupTabActive: boolean = true;
  public isExternalBillRateType: boolean = false;
  public isExternalBillRateTypeMapping: boolean = false;

  constructor(private store: Store) { }

  ngOnInit(): void {
  }

  public onTabSelected(selectedTab: any): void {
    this.isBillRateSetupTabActive = BillRateNavigationTabs['BillRateSetup'] === selectedTab.selectedIndex;
    this.isExternalBillRateType = BillRateNavigationTabs['ExternalBillRateType'] === selectedTab.selectedIndex;
    this.isExternalBillRateTypeMapping = BillRateNavigationTabs['ExternalBillRateTypeMapping'] === selectedTab.selectedIndex;
    this.store.dispatch(new ShowSideDialog(false));
  }

  public addBillRateSetupRecord(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }
}

