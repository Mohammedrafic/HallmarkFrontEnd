import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, Inject, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Observable, Subject, takeWhile } from 'rxjs';
import { AppSettings, APP_SETTINGS } from '../../../../../../app.settings';
import { LogiReportComponent } from '../../../../../shared/components/logi-report/logi-report.component';
import { LogiReportTypes } from '../../../../../shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '../../../../../shared/models/logi-report-file';
import { User } from '../../../../../shared/models/user.model';
import { disabledBodyOverflow, windowScrollTop } from '../../../../../shared/utils/styles.utils';
import { SetHeaderState } from '../../../../../store/app.actions';
import { UserState } from '../../../../../store/user.state';
import { SaveCustomReport } from '../../../store/actions/logi-custom-report.actions';
import { AddLogiCustomReportRequest, LogiCustomReport } from '../../../store/model/logi-custom-report.model';
import { LogiCustomReportState } from '../../../store/state/logi-custom-report.state';

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
  public RegularReportName: string = '/CustomReport/FinanaceReport.wls';
  public reportName: LogiReportFileDetails = {
    name: this.RegularReportName,
  };
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;
  public reportFormGroup: FormGroup;
  public isAddCustomReportSidebarShown: boolean;
  @Select(LogiCustomReportState.SaveCustomReport)
  public saveCustomReport$: Observable<LogiCustomReport>;

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
        this.catelogName = { name: this.selectedLog.catalogPath }
        this.reportName = { name: this.selectedLog.path }
        this.SearchReport();
        this.sideDialog.show();
        disabledBodyOverflow(true);
      } else {
        this.sideDialog.hide();
        disabledBodyOverflow(false);
      }
      this.isAddCustomReportSidebarShown = false
    });

    this.saveCustomReport$.pipe(takeWhile(() => this.isAlive)).subscribe((data: any) => {
      this.isAddCustomReportSidebarShown = false;
    });


   this.reportFormGroup=  new FormGroup({
     reportName: new FormControl('', [Validators.required]),
     
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

    this.reportFormGroup.markAllAsTouched();
    if (this.reportFormGroup.valid && this.reportFormGroup.errors == null) {
      const formValues = this.reportFormGroup.getRawValue();
      var path = "/IRPReports/Hallmark/" + formValues.reportName + "";
      const addLogiCustomReportRequestDto: AddLogiCustomReportRequest = {
        customReportName: formValues.reportName,
        isSystem: false,
        path: path,
        catalogPath: this.selectedLog.catalogPath,
        reportParamaters: '',
        businessUnitId: this.selectedLog.businessUnitId

      };
      this.store.dispatch(new SaveCustomReport(addLogiCustomReportRequestDto));

      let options: any = {
        savePath: path,
        linkedCatalog: true,
        saveSort: false,
        catalog: "/CustomReport/CustomReport.cat"
      };
      this.logiReportComponent.SaveAsReport(options, "reportIframe");
    }
  }
  public saveAsPopUp(): void {
    this.isAddCustomReportSidebarShown = true;
  }

  public SearchReport(): void {
    this.logiReportComponent.RenderReport();
  }

  public onAddReportClose(): void {
    this.isAddCustomReportSidebarShown = false;
  }

}
