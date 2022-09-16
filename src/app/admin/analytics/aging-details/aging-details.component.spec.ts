import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgingDetailsComponent } from './aging-details.component';

describe('AgingDetailsComponent', () => {
  let component: AgingDetailsComponent;
  let fixture: ComponentFixture<AgingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgingDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
