import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FillRateComponent } from './fillrate.component';

describe('FillRateComponent', () => {
  let component: FillRateComponent;
  let fixture: ComponentFixture<FillRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FillRateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FillRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
