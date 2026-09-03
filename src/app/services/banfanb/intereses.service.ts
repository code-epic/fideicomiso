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

@Injectable({ providedIn: 'root' })
export class InteresesService {

  constructor(private apiService: ApiService) {}

  async calcularIntereses(fechaInicio: string, fechaFin: string): Promise<InteresProyectado[]> {
    const xAPI: IAPICore = {
      funcion: 'FID_CalcularInteresesDisponibilidad',
      parametros: `${fechaInicio}, ${fechaFin}`,
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
      parametros: `${idPlan}, ${fechaInicio}, ${fechaFin}`,
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
      parametros: `${idComprobante}, ${monto}, ${fecha}, ${idPlan}`,
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
}
