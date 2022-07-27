import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferDeploymentComponent } from './offer-deployment.component';

describe('OfferDeploymentComponent', () => {
  let component: OfferDeploymentComponent;
  let fixture: ComponentFixture<OfferDeploymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfferDeploymentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfferDeploymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
