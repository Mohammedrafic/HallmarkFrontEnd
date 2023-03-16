import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalTransferComponent } from './internal-transfer.component';

describe('InternalTransferComponent', () => {
  let component: InternalTransferComponent;
  let fixture: ComponentFixture<InternalTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InternalTransferComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InternalTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
