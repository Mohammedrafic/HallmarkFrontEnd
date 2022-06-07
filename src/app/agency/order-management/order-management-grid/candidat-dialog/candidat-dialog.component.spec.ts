import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatDialogComponent } from './candidat-dialog.component';

describe('CandidatDialogComponent', () => {
  let component: CandidatDialogComponent;
  let fixture: ComponentFixture<CandidatDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandidatDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidatDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
