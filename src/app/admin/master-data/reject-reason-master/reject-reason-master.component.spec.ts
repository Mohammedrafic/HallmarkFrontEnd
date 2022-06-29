import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectReasonMasterComponent } from './reject-reason-master.component';

describe('RejectReasonMasterComponent', () => {
  let component: RejectReasonMasterComponent;
  let fixture: ComponentFixture<RejectReasonMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RejectReasonMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectReasonMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
