import { Component, OnInit, ViewChild } from '@angular/core';

import { Actions, ofActionDispatched } from '@ngxs/store';
import { Maps } from '@syncfusion/ej2-angular-maps';
import { Subject, takeUntil } from 'rxjs';

import { ToggleSidebarState } from 'src/app/store/app.actions';
import { us_map } from './us-map';

@Component({
  selector: 'app-maps-chart',
  templateUrl: './maps-chart.component.html',
  styleUrls: ['./maps-chart.component.scss'],
})
export class MapsChartComponent implements OnInit {
  @ViewChild('maps') maps: Maps;
  private unsubscribe$ = new Subject();
  public height = '290';
  public sidebarIsOpen = false;
  public legendSettings = {
    visible: true,
    alignment: 'Near',
    width: '25%',
    shapeHeight: 12,
    shapeWidth: 12,
    height: '40%',
  };

  public layers: object[] = [
    {
      shapeData: us_map,
      labelSettings: { enable: true },
      dataSource: [
        {
          name: 'Alabama',
          code: 'AL',
          density: 0,
          sum: 1576,
        },
        {
          name: 'Alaska',
          code: 'AK',
          density: 7,
          sum: 3576,
        },
        {
          name: 'Arizona',
          code: 'AZ',
          density: 0,
          sum: 35,
        },
        {
          name: 'Arkansas',
          code: 'AR',
          density: 1,
          sum: 376,
        },
        {
          name: 'California',
          code: 'CA',
          density: 29,
          sum: 346,
        },
        {
          name: 'Colorado',
          code: 'CO',
          density: 26,
          sum: 3357,
        },
        {
          name: 'Connecticut',
          code: 'CT',
          density: 4,
          sum: 76,
        },
        {
          name: 'Delaware',
          code: 'DE',
          density: 10,
          sum: 3,
        },
        {
          name: 'Florida',
          code: 'FL',
          density: 20,
          sum: 76,
        },
        {
          name: 'Georgia',
          code: 'GA',
          density: 30,
          sum: 57,
        },
        {
          name: 'Hawaii',
          code: 'HI',
          density: 35,
          sum: 276,
        },
        {
          name: 'Idaho',
          code: 'ID',
          density: 17,
          sum: 359,
        },
        {
          name: 'Illinois',
          code: 'IL',
          density: 10,
          sum: 350,
        },
        {
          name: 'Indiana',
          code: 'IN',
          density: 20,
          sum: 0,
        },
        {
          name: 'Iowa',
          code: 'IA',
          density: 3,
          sum: 3126,
        },
        {
          name: 'Kansas',
          code: 'KS',
          density: 34,
          sum: 3576,
        },
        {
          name: 'Kentucky',
          code: 'KY',
          density: 35,
          sum: 9976,
        },
        {
          name: 'Louisiana',
          code: 'LA',
          density: 31,
          sum: 888,
        },
        {
          name: 'Maine',
          code: 'ME',
          density: 23,
          sum: 39586,
        },
        {
          name: 'Maryland',
          code: 'MD',
          density: 1,
          sum: 3576,
        },
        {
          name: 'Massachusetts',
          code: 'MA',
          density: 7,
          sum: 3576,
        },
        {
          name: 'Michigan',
          code: 'MI',
          density: 6,
          sum: 5556,
        },
        {
          name: 'Minnesota',
          code: 'MN',
          density: 3,
          sum: 3576,
        },
        {
          name: 'Mississippi',
          code: 'MS',
          density: 7,
          sum: 76,
        },
        {
          name: 'Missouri',
          code: 'MO',
          density: 14,
          sum: 276,
        },
        {
          name: 'Montana',
          code: 'MT',
          density: 23,
          sum: 6,
        },
        {
          name: 'Nebraska',
          code: 'NE',
          density: 5,
          sum: 79,
        },
        {
          name: 'Nevada',
          code: 'NV',
          density: 35,
          sum: 35,
        },
        {
          name: 'New Hampshire',
          code: 'NH',
          density: 1,
          sum: 3576,
        },
        {
          name: 'New Jersey',
          code: 'NJ',
          density: 5,
          sum: 3576,
        },
        {
          name: 'New Mexico',
          code: 'NM',
          density: 4,
          sum: 36,
        },
        {
          name: 'New York',
          code: 'NY',
          density: 10,
          sum: 7644,
        },
        {
          name: 'North Carolina',
          code: 'NC',
          density: 20,
          sum: 3576,
        },
        {
          name: 'North Dakota',
          code: 'ND',
          density: 30,
          sum: 1276,
        },
        {
          name: 'Ohio',
          code: 'OH',
          density: 0,
          sum: 2022,
        },
        {
          name: 'Oklahoma',
          code: 'OK',
          density: 13,
          sum: 32021,
        },
        {
          name: 'Oregon',
          code: 'OR',
          density: 12,
          sum: 3576,
        },
        {
          name: 'Pennsylvania',
          code: 'PA',
          density: 0,
          sum: 3576,
        },
        {
          name: 'Rhode Island',
          code: 'RI',
          density: 55,
          sum: 3576,
        },
        {
          name: 'South Carolina',
          code: 'SC',
          density: 0,
          sum: 76,
        },
        {
          name: 'South Dakota',
          code: 'SD',
          density: 53,
          sum: 3576,
        },
        {
          name: 'Tennessee',
          code: 'TN',
          density: 6,
          sum: 3576,
        },
        {
          name: 'Texas',
          code: 'TX',
          density: 0,
          sum: 4476,
        },
        {
          name: 'Utah',
          code: 'UT',
          density: 38,
          sum: 3559,
        },
        {
          name: 'Vermont',
          code: 'VT',
          density: 0,
          sum: 3576,
        },
        {
          name: 'Virginia',
          code: 'VA',
          density: 31,
          sum: 116,
        },
        {
          name: 'Washington',
          code: 'WA',
          density: 34,
          sum: 3576,
        },
        {
          name: 'West Virginia',
          code: 'WV',
          density: 0,
          sum: 7776,
        },
        {
          name: 'Wisconsin',
          code: 'WI',
          density: 40,
          sum: 38888,
        },
        {
          name: 'Wyoming',
          code: 'WY',
          density: 22,
          sum: 100,
        },
      ],

      shapeSettings: {
        autofill: false,
        colorValuePath: 'density',
        colorMapping: [
          {
            from: 0,
            to: 5,
            color: '#ECF2FF',
          },
          {
            from: 6,
            to: 11,
            color: '#C5D9FF',
          },
          {
            from: 12,
            to: 30,
            color: '#9EBFFF',
          },
          {
            color: '#6499FF',
          },
        ],
      },

      tooltipSettings: {
        visible: true,
        fill: '#fff',
        format: '<b>$ ${sum}</b>',
        textStyle: {
          color: '#1A1B2E',
        },
      },
    },
  ];

  constructor(private actions$: Actions) {}

  ngOnInit(): void {
    this.actions$.pipe(ofActionDispatched(ToggleSidebarState), takeUntil(this.unsubscribe$)).subscribe((data) => {
      setTimeout(() => (this.height = data.payload ? '230' : '290'), 500);
    });
  }
}
