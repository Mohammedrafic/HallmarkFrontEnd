import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-bill-rate-type-mapping',
  templateUrl: './bill-rate-type-mapping.component.html',
  styleUrls: ['./bill-rate-type-mapping.component.scss']
})
export class BillRateTypeMappingComponent implements OnInit {
  @Input() isActive: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
