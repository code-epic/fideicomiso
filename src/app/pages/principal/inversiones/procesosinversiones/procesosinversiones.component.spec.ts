import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcesosinversionesComponent } from './procesosinversiones.component';

describe('ProcesosinversionesComponent', () => {
  let component: ProcesosinversionesComponent;
  let fixture: ComponentFixture<ProcesosinversionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcesosinversionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcesosinversionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
