import { Injectable } from '@angular/core';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { environment } from 'src/environments/environment';
import { lastValueFrom } from 'rxjs';

export interface InteresProyectado {
  id_plan: number;
  plan: string;
  tasa: number;
  dias: number;
  saldo_promedio: number;
  interes_calculado: number;
  interes_diario: number;
  porcentaje?: number;
  interes_real?: number;
  diferencia?: number;
}

export interface PagoTramo {
  id: number;
  referencia: string;
  fechaValor: string;
  montoPago: number;
  planesIds: number[];
  estaContabilizado: boolean;
}

export interface DistribucionPlan {
  id_plan: number;
  plan: string;
  saldo_promedio: number;
  interes_calculado: number;
  interes_diario: number;
  porcentajeTramo: number;
  interesRealTramo: number;
  diferenciaTramo: number;
}

export interface TramoConDistribucion {
  pago: PagoTramo;
  distribuciones: DistribucionPlan[];
  totalTeorico: number;
  totalReal: number;
  cuadra: boolean;
}

export interface DiagnosticoPagoIntereses {
  id_plan: number;
  plan: string;
  fecha_corte: string;
  saldo_711_disponible: number;
  saldo_734: number;
  total_ingresos: number;
  total_gastos: number;
  resultado_neto: number;
  maximo_pagable: number;
}

export interface LineaDetalle {
  cuenta: number;
  debe: number;
  haber: number;
}

export interface ComprobantePagoIntereses {
  diagnostico: DiagnosticoPagoIntereses;
  montoSolicitado: number;
  debe_734: number;
  debe_744: number;
  haber_711: number;
  lineas: LineaDetalle[];
  esValido: boolean;
  errores: string[];
}

@Injectable({ providedIn: 'root' })
export class InteresesService {

  constructor(private apiService: ApiService) {}

  async calcularIntereses(fechaInicio: string, fechaFin: string): Promise<InteresProyectado[]> {
    const xAPI: IAPICore = {
      funcion: 'FID_CalcularInteresesDisponibilidad',
      parametros: `${fechaInicio},${fechaFin}`,
      valores: ''
    };
    const data: any = await lastValueFrom(this.apiService.Ejecutar(xAPI));
    return (data?.Cuerpo || []) as InteresProyectado[];
  }

  async obtenerIncrementosDia(fecha: string): Promise<any[]> {
    const xAPI: IAPICore = {
      funcion: 'FID_CObtenerIncrementosDia',
      parametros: fecha,
      valores: ''
    };
    const data: any = await lastValueFrom(this.apiService.Ejecutar(xAPI));
    return (data?.Cuerpo || []) as any[];
  }

  async verificarPagoIntereses(idPlan: number, fechaInicio: string, fechaFin: string): Promise<boolean> {
    const xAPI: IAPICore = {
      funcion: 'FID_CVerificarPagoIntereses',
      parametros: `${idPlan},${fechaInicio},${fechaFin}`,
      valores: ''
    };
    const data: any = await lastValueFrom(this.apiService.Ejecutar(xAPI));
    return (data?.Cuerpo?.[0]?.existe || 0) > 0;
  }

  async insertarComprobante(comprobante: any): Promise<number> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.INSERTAR_COMPROBANTE,
      parametros: '',
      valores: JSON.stringify(comprobante)
    };
    const data: any = await lastValueFrom(this.apiService.Ejecutar(xAPI));
    return parseInt(data?.msj);
  }

  async insertarDetalleComprobante(detalle: any): Promise<void> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.INSERTAR_DETALLE_COMPROBANTE,
      parametros: '',
      valores: JSON.stringify(detalle)
    };
    await lastValueFrom(this.apiService.Ejecutar(xAPI));
  }

  async insertarDetalleInteres(idComprobante: number, monto: number, fecha: string, idPlan: number): Promise<void> {
    const xAPI: IAPICore = {
      funcion: 'FID_IInteresDisponibilidad',
      parametros: `${idComprobante},${monto},${fecha},${idPlan}`,
      valores: ''
    };
    await lastValueFrom(this.apiService.Ejecutar(xAPI));
  }

  async eliminarInteresesDisponibilidad(fecha: string): Promise<void> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.ELIMINAR_INTERESES_DISPONIBILIDAD,
      parametros: fecha,
      valores: ''
    };
    await lastValueFrom(this.apiService.Ejecutar(xAPI));
  }

  async obtenerDevengosDia(fecha: string): Promise<any[]> {
    const xAPI: IAPICore = {
      funcion: 'FID_CDevengosDia',
      parametros: fecha,
      valores: ''
    };
    const data: any = await lastValueFrom(this.apiService.Ejecutar(xAPI));
    return (data?.Cuerpo || []) as any[];
  }

  // ============ PAGO DE RENDIMIENTOS / INTERESES ============

  async consultarDiagnosticoPagoIntereses(idPlan: number, fechaCierre: string, fechaCorte: string): Promise<DiagnosticoPagoIntereses | null> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.CONSULTAR_DIAGNOSTICO_PAGO_INTERESES,
      parametros: `${idPlan},${fechaCierre},${fechaCorte}`,
      valores: ''
    };
    const data: any = await lastValueFrom(this.apiService.Ejecutar(xAPI));
    const r = data?.Cuerpo?.[0];
    if (!r) return null;
    return {
      id_plan: parseInt(r.id_plan) || 0,
      plan: r.plan,
      fecha_corte: r.fecha_corte,
      saldo_711_disponible: parseFloat(r.saldo_711_disponible) || 0,
      saldo_734: parseFloat(r.saldo_734) || 0,
      total_ingresos: parseFloat(r.total_ingresos) || 0,
      total_gastos: parseFloat(r.total_gastos) || 0,
      resultado_neto: parseFloat(r.resultado_neto) || 0,
      maximo_pagable: parseFloat(r.maximo_pagable) || 0
    };
  }

  prepararComprobante(diagnostico: DiagnosticoPagoIntereses, montoSolicitado: number): ComprobantePagoIntereses {
    const errores: string[] = [];

    if (montoSolicitado <= 0) {
      errores.push('El monto solicitado debe ser mayor a 0.');
    }

    if (montoSolicitado > diagnostico.saldo_711_disponible) {
      errores.push(`El monto excede la disponibilidad en 711.`);
    }

    if (montoSolicitado > diagnostico.maximo_pagable) {
      errores.push(`El monto excede el máximo distribuible.`);
    }

    const debe_734 = Math.min(montoSolicitado, diagnostico.saldo_734);
    const debe_744 = Math.round((montoSolicitado - debe_734) * 100) / 100;
    const haber_711 = montoSolicitado;

    const lineas: LineaDetalle[] = [];

    if (haber_711 > 0) {
      lineas.push({ cuenta: 3, debe: 0, haber: haber_711 });
    }
    if (debe_734 > 0) {
      lineas.push({ cuenta: 40, debe: debe_734, haber: 0 });
    }
    if (debe_744 > 0) {
      lineas.push({ cuenta: 70, debe: debe_744, haber: 0 });
    }

    const totalDebe = lineas.reduce((sum, l) => sum + l.debe, 0);
    const totalHaber = lineas.reduce((sum, l) => sum + l.haber, 0);
    const cuadra = Math.abs(totalDebe - totalHaber) < 0.01;

    if (!cuadra) {
      errores.push(`El comprobante no cuadra: DEBE=${totalDebe}, HABER=${totalHaber}.`);
    }

    return {
      diagnostico,
      montoSolicitado,
      debe_734,
      debe_744,
      haber_711,
      lineas,
      esValido: errores.length === 0 && cuadra,
      errores
    };
  }

  async registrarPagoIntereses(
    planId: number,
    fecha: string,
    monto: number,
    lineas: LineaDetalle[],
    descripcion: string,
    detalle: string
  ): Promise<number> {
    const comprobante = {
      plan: planId,
      codigo: '',
      descripcion: descripcion,
      detalle: detalle,
      fecha_operacion: fecha,
      fecha_ejercicio: fecha,
      debe: monto,
      haber: monto,
      llave: 'M'
    };

    const idComprobante = await this.insertarComprobante(comprobante);

    for (const linea of lineas) {
      if (linea.debe > 0 || linea.haber > 0) {
        await this.insertarDetalleComprobante({
          id_comprobante: idComprobante,
          cuenta: linea.cuenta,
          debe: linea.debe,
          haber: linea.haber,
          fecha_ejercicio: fecha,
          fecha_operacion: fecha,
          plan: planId
        });
      }
    }

    return idComprobante;
  }
}
