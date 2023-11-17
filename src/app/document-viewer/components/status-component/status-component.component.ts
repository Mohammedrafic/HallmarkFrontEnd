import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-status-component',
  templateUrl: './status-component.component.html',
  styleUrls: ['./status-component.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusComponentComponent implements OnInit {
  statusForm = new FormGroup({});
  private unsubscribe$: Subject<void> = new Subject();

  constructor(private fb:FormBuilder, private activeRoute:ActivatedRoute) { }

  ngOnInit(): void {
    this.subscribeEvent();
    this.statusForm = this.fb.group({
      jobId: ['', Validators.required],
    });
  }

  private subscribeEvent(): void {
    this.activeRoute.params.pipe(takeUntil(this.unsubscribe$)).subscribe((params) => {
      if (params['id']) {
        // this.fileHash = params['id'];
        // this.store.dispatch(new GetGroupedFiles(this.fileHash));
        // this.initialFileId = params['initialId'];
      }
    });
  }

  onSubmit(){
    if(this.statusForm.valid){
      console.log(this.statusForm)
    }
  }

}
