import { Component, Input, Inject, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { GlobalWindow } from '@core/tokens';
import { AgencyPositionModel } from '../../models/agency-position.model';
import { FilterService } from '@shared/services/filter.service';
import { ProgressBar, AnimationModel, ILoadedEventArgs,ProgressTheme } from '@syncfusion/ej2-progressbar';


@Component({
  selector: 'app-upcoming-exp-creds',
  templateUrl: './upcoming-exp-creds.component.html',
  styleUrls: ['./upcoming-exp-creds.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpcomingExpCredsComponent {
  @Input() public isLoading: boolean;
  @Input() public isDarkTheme: boolean | false;
  @Input() public description: string;
  @Input() public chartData: AgencyPositionModel | undefined;


    public type: string = 'Linear';
    public width: string = '100%';
    public height: string = '20px';
    public trackThickness: number = 10;
    public progressThickness: number = 10;
    public min: number = 0;
    public max: number = 100;
    public value1: number = 51;
    public value2: number = 92;
    public value3: number = 79;
    public showProgressValue: boolean = true;
    public progressColor1: string = '#8cb3ff';
    public progressColor2: string = '#e48192';
    public progressColor3: string = '#9b85c6';
    public animation: AnimationModel = { enable: true, duration: 2000, delay: 0 };
    @ViewChild('linear4')
    public linear4: ProgressBar;
    @ViewChild('linear2')
    public linear2: ProgressBar;
    @ViewChild('linear3')
    public linear3: ProgressBar;
    public onClick = () => {
        this.linear4.refresh();
        this.linear2.refresh();
        this.linear3.refresh();
    }
    public cornerRadius2: string = 'Oval';

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
}
