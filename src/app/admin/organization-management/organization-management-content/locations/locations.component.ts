import { Component, OnInit } from '@angular/core';
import { AbstractGridConfigurationComponent } from '../../../../shared/components/abstract-grid-configuration/abstract-grid-configuration.component';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss']
})
export class LocationsComponent extends AbstractGridConfigurationComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
