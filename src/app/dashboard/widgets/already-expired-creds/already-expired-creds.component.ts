import { Component, Input, Inject, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { GlobalWindow } from '@core/tokens';
import { FilterService } from '@shared/services/filter.service';
import { ProgressBar, AnimationModel, ILoadedEventArgs,ProgressTheme } from '@syncfusion/ej2-progressbar';
import { ExpiryDetailsModel } from '../../models/expiry.model';
import { Router } from '@angular/router';


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
  @Input() public chartData: ExpiryDetailsModel[] | undefined;
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
              private router : Router,
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

  redirect_to_candidate(name : string):void {

    var d = new Date();
    var startDate = new Date(d.setMonth(d.getMonth() - 1));

    const timeStamp = new Date().getTime();
    const yesterdayTimeStamp = timeStamp - 24*60*60*1000;
    const yesterdayDate = new Date(yesterdayTimeStamp);

    var type;
    if(name == "Licenses"){
      type = 3;
    } else if(name == "Certificates"){
      type = 1;
    } else {
      type = 2;
    }

    this.dashboardService.redirect_to_credentials("/client/candidates",startDate, yesterdayDate, type);
  }

  ngOnChanges():void {
    const getExp = [];
    if(this.chartData != undefined || null){
      this.expirydata = this.chartData?.filter(x => x.mode == "EXPIRED");

      const licIndex = this.expirydata.findIndex((x: { typeId: number; }) => x.typeId === 3);
      this.expirydata[licIndex].name = "Licenses";
      this.expirydata[licIndex].progressColor = '#8cb3ff';
      getExp.push(this.expirydata[licIndex]);

      const certIndex = this.expirydata.findIndex((x: { typeId: number; }) => x.typeId === 1);
      this.expirydata[certIndex].name = "Certificates";
      this.expirydata[certIndex].progressColor = '#e48192';
      getExp.push(this.expirydata[certIndex]);

      const chIndex = this.expirydata.findIndex((x: { typeId: number; }) => x.typeId === 2);
      this.expirydata[chIndex].name = "Checklists";
      this.expirydata[chIndex].progressColor = '#9b85c6';
      getExp.push(this.expirydata[chIndex]);

      this.expirydata = getExp;
    }
  }
}
