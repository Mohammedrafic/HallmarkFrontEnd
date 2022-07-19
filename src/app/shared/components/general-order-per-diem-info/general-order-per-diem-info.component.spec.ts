import { ComponentFixture, TestBed } from '@angular/core/testing';
import {GeneralOrderPerDiemInfoComponent} from "@shared/components/general-order-per-diem-info/general-order-per-diem-info.component";


describe('GeneralOrderPerDiemInfoComponent', () => {
  let component: GeneralOrderPerDiemInfoComponent;
  let fixture: ComponentFixture<GeneralOrderPerDiemInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralOrderPerDiemInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralOrderPerDiemInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
