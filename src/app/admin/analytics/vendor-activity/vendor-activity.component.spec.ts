import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorActivityComponent } from './vendor-activity.component';

describe('VendorActivityComponent', () => {
  let component: VendorActivityComponent;
  let fixture: ComponentFixture<VendorActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VendorActivityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
