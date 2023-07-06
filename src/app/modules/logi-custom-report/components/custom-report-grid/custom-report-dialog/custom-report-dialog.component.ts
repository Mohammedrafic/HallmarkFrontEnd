import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, Inject, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngxs/store';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Subject, takeWhile } from 'rxjs';
import { AppSettings, APP_SETTINGS } from '../../../../../../app.settings';
import { LogiReportComponent } from '../../../../../shared/components/logi-report/logi-report.component';
import { LogiReportTypes } from '../../../../../shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '../../../../../shared/models/logi-report-file';
import { User } from '../../../../../shared/models/user.model';
import { disabledBodyOverflow, windowScrollTop } from '../../../../../shared/utils/styles.utils';
import { SetHeaderState } from '../../../../../store/app.actions';
import { UserState } from '../../../../../store/user.state';
import { LogiCustomReport } from '../../../store/model/logi-custom-report.model';

@Component({
  selector: 'app-custom-report-dialog',
  templateUrl: './custom-report-dialog.component.html',
  styleUrls: ['./custom-report-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomReportDialogComponent implements OnInit {
  public user: User | null;
  @Input() selectedLog: LogiCustomReport;
  @Input() openDialogue: Subject<boolean>;
  @ViewChild('customReportSideDialog') sideDialog: DialogComponent;
  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;
  private isAlive = true;
  private unsubscribe$: Subject<void> = new Subject();
  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public paramsData: any = {
    OrganizationParam: '',
    RegionsParam: '',
    LocationsParam: '',
    DepartmentsParam: '',
  };
  public catelogName: LogiReportFileDetails = { name: '/CustomReport/CustomReport.cat' };
  public RegularReportName: string = '/CustomReport/FinanaceReport.cls';
  public reportName: LogiReportFileDetails = {
    name: this.RegularReportName,
  };
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;

  constructor(
    private store: Store,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(APP_SETTINGS) private appSettings: AppSettings
  ) {
    this.user = this.store.selectSnapshot(UserState.user);
   
  }
  ngOnInit(): void {

    this.openDialogue.pipe(takeWhile(() => this.isAlive)).subscribe((isOpen) => {
      if (isOpen) {
        windowScrollTop();
        this.SearchReport();
        this.sideDialog.show();
        disabledBodyOverflow(true);
      } else {
        this.sideDialog.hide();
        disabledBodyOverflow(false);
      }
    });
  }

  public onClose(): void {
    this.sideDialog.hide();
    this.openDialogue.next(false);
  }

  ngOnDestroy(): void {
    this.isAlive = false;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public saveAsReport(): void {
    let options: any = {
      savePath: "/IRPReports/Hallmark/CustomReport1.cls",
      linkedCatalog: true,
      saveSort: false,
      catalog: "/CustomReport/CustomReport.cat"
    };
    this.logiReportComponent.SaveAsReport(options, "reportIframe");
  }

  public SearchReport(): void {
    this.logiReportComponent.RenderReport();
  }

}
