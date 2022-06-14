import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralOrderInfoComponent } from './general-order-info.component';

describe('GeneralOrderInfoComponent', () => {
  let component: GeneralOrderInfoComponent;
  let fixture: ComponentFixture<GeneralOrderInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralOrderInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralOrderInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
