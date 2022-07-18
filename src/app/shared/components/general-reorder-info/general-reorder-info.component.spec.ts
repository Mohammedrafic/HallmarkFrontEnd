import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralReorderInfoComponent } from './general-reorder-info.component';

describe('GeneralReorderInfoComponent', () => {
  let component: GeneralReorderInfoComponent;
  let fixture: ComponentFixture<GeneralReorderInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeneralReorderInfoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralReorderInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
