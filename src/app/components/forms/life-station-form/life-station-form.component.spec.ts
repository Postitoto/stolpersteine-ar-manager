import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifeStationFormComponent } from './life-station-form.component';

describe('LifeStationFormComponent', () => {
  let component: LifeStationFormComponent;
  let fixture: ComponentFixture<LifeStationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LifeStationFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LifeStationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
