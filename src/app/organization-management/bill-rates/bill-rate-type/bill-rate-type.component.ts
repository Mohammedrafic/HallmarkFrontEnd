import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-bill-rate-type',
  templateUrl: './bill-rate-type.component.html',
  styleUrls: ['./bill-rate-type.component.scss']
})
export class BillRateTypeComponent implements OnInit {
  @Input() isActive: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
