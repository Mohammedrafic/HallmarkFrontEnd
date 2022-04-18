import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { FileInfo, UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import { SetHeaderState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-add-edit-organization',
  templateUrl: './add-edit-organization.component.html',
  styleUrls: ['./add-edit-organization.component.scss']
})
export class AddEditOrganizationComponent implements OnInit, AfterViewInit {

  public data: string[] = ['Option 1', 'Option 2', 'Long text option 3'];
  public allowExtensions: string = '.png, .jpg, .jpeg';
  public dropElement: HTMLElement;
  public filesDetails : FileInfo[] = [];
  public filesName: string[] = [];
  public filesList: HTMLElement[] = [];

  @ViewChild('previewupload')
  public uploadObj: UploaderComponent;

  public path: Object = {
    saveUrl: 'https://ej2.syncfusion.com/services/api/uploadbox/Save',
    removeUrl: 'https://ej2.syncfusion.com/services/api/uploadbox/Remove'
  };

  constructor(private store: Store, private router: Router, private route: ActivatedRoute) {
    store.dispatch(new SetHeaderState({title: 'Organization List'}));
  }

  ngOnInit(): void {
    this.dropElement = document.getElementById('droparea') as HTMLElement;
  }

  ngAfterViewInit(): void {
    
  }

  public navigateBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  public uploadImages(): void {
    this.uploadObj.upload(this.filesDetails, true);
  }

  public onImageSelect(event: any): void {
    let validFiles: FileInfo[] = this.validateFiles(event, this.filesDetails);
    if (validFiles.length === 0) {
      event.cancel = true;
      return;
    }
    this.filesDetails = this.filesDetails.concat(validFiles);
    console.log(event);
  }

  public onUploadSuccess(event: any): void {
    console.log(event);
  }

  public onFileUpload(event: any): void {
    console.log(event);
  }

  public onUploadFailed(event: any): void {
    console.log(event);
  }

  public onFileRemove(event: any): void {
    console.log(event);
  }

  public validateFiles(args: any, viewedFiles: FileInfo[]): FileInfo[] {
    // TODO: validation goes here
    return args.filesData;
}
}
