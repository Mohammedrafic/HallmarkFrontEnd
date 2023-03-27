import { Component, Input, Inject, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { GlobalWindow } from '@core/tokens';
import { FilterService } from '@shared/services/filter.service';
import { ProgressBar, AnimationModel, ILoadedEventArgs,ProgressTheme } from '@syncfusion/ej2-progressbar';
import { ExpiryDetailsModel } from '../../models/expiry.model';


@Component({
  selector: 'app-already-expired-creds',
  templateUrl: './already-expired-creds.component.html',
  styleUrls: ['./already-expired-creds.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlreadyExpiredCredsComponent  {
  @Input() public isLoading: boolean;
  @Input() public isDarkTheme: boolean | false;
  @Input() public description: string;
  @Input() public chartData: ExpiryDetailsModel | undefined;
  public expirydata:any;
  public getexp:any;
  public type: string = 'Linear';
  public width: string = '100%';
  public height: string = '20px';
  public trackThickness: number = 10;
  public progressThickness: number = 10;
  public min: number = 0;
  public max: number = 100;
  public showProgressValue: boolean = true;
  public animation: AnimationModel = { enable: true, duration: 2000, delay: 0 };

  constructor(private readonly dashboardService: DashboardService,
              @Inject(GlobalWindow) protected readonly globalWindow : WindowProxy & typeof globalThis,
              public filterservice : FilterService) {
              }

  public load(args: ILoadedEventArgs): void {
    let selectedTheme: string = location.hash.split('/')[1];
    selectedTheme = selectedTheme ? selectedTheme : 'Material';
    args.progressBar.theme = <ProgressTheme>(selectedTheme.charAt(0).toUpperCase() +
        selectedTheme.slice(1)).replace(/-dark/i, 'Dark').replace(/contrast/i, 'Contrast');
        if (args.progressBar.theme === 'Material') {
            args.progressBar.trackColor = '#969696';
        }
        if (selectedTheme === 'highcontrast') {
           args.progressBar.labelStyle.color = '#000000';
           args.progressBar.trackColor = '#969696';
       }
  }

  ngOnChanges():void {
    const getexp = [];
    if(this.chartData != undefined || null){
      this.expirydata = this.chartData;
      this.expirydata[4].name = "Licenses";
      this.expirydata[4].progressColor = '#8cb3ff';
      getexp.push(this.expirydata[4]);
      this.expirydata[0].name = "Certificates";
      this.expirydata[0].progressColor = '#e48192';
      getexp.push(this.expirydata[0]);
      this.expirydata[2].name = "Checklists";
      this.expirydata[2].progressColor = '#9b85c6';
      getexp.push(this.expirydata[2]);
      this.expirydata = getexp;
    }
  }
}
