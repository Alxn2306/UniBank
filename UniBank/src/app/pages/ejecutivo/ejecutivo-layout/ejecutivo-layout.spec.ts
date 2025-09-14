import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EjecutivoLayout } from './ejecutivo-layout';

describe('EjecutivoLayout', () => {
  let component: EjecutivoLayout;
  let fixture: ComponentFixture<EjecutivoLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EjecutivoLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EjecutivoLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
