import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoNotReturnDetailsComponent } from './do-not-return-details.component';

describe('DoNotReturnDetailsComponent', () => {
  let component: DoNotReturnDetailsComponent;
  let fixture: ComponentFixture<DoNotReturnDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoNotReturnDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DoNotReturnDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
