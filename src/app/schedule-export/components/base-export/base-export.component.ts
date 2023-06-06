import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-base-export',
  templateUrl: './base-export.component.html',
  styleUrls: ['./base-export.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BaseExportComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
