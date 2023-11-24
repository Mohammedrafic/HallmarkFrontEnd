import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SaveStatus } from '../../store/document-viewer.actions';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-status-component',
  templateUrl: './status-component.component.html',
  styleUrls: ['./status-component.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusComponentComponent implements OnInit {
  statusForm = new FormGroup({});
  orderId: number;
  statusText: string;
  private unsubscribe$: Subject<void> = new Subject();

  constructor(private fb: FormBuilder, private activeRoute: ActivatedRoute, private store: Store) {}

  ngOnInit(): void {
    this.subscribeEvent();
    this.statusForm = this.fb.group({
      jobId: ['', Validators.required],
    });
  }

  private subscribeEvent(): void {
    this.activeRoute.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe((params) => {
      if (params['orderId'] && params['statusText']) {
        this.orderId = params['orderId'];
        this.statusText = params['statusText'];
      }
    });
  }

  onSubmit() {
    if (this.statusForm.valid) {
      this.store.dispatch(new SaveStatus(this.orderId, this.statusForm.value.jobId, this.statusText));
    }
  }
}
