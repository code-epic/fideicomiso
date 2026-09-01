import { Injectable } from '@angular/core';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { FID_IComprobante, FID_IDetalleComprobante } from 'src/app/services/banfanb/comprobante.service';
import { environment } from 'src/environments/environment';
import { lastValueFrom } from 'rxjs';

export interface SaldoFiniquito {
  codigo_padre: string;
  descripcion: string;
  saldo: number;
}

export interface InversionActiva {
  identificador: number;
  instrumento: string;
  valor_nominal: number;
  fecha_vencimiento: string;
  estatus: number;
}

export interface ComprobantePendiente {
  id: number;
  codigo: string;
  descripcion: string;
  fecha_operacion: string;
  debe: number;
  haber: number;
  llave: string;
}

export interface RegistroFiniquito {
  id_plan: number;
  fecha_finiquito: string;
  saldo_711: number;
  saldo_722: number;
  saldo_731: number;
  saldo_734: number;
  saldo_740: number;
  saldo_750: number;
  remanente: number;
  comprobante_pasivos: number;
  comprobante_resultado: number;
  comprobante_finiquito: number;
  estatus: string;
  usuario: string;
}

@Injectable({
  providedIn: 'root'
})
export class FiniquitoService {

  constructor(private apiService: ApiService) { }

  async consultarSaldosPlan(idPlan: number): Promise<SaldoFiniquito[]> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.CONSULTAR_SALDOS_FINIQUITO_PLAN,
      parametros: idPlan.toString(),
      valores: ''
    };
    const data: any = await lastValueFrom(this.apiService.Ejecutar(xAPI));
    return (data?.Cuerpo || []) as SaldoFiniquito[];
  }

  async consultarInversionesActivasPlan(idPlan: number): Promise<InversionActiva[]> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.CONSULTAR_INVERSIONES_ACTIVAS_PLAN,
      parametros: idPlan.toString(),
      valores: ''
    };
    const data: any = await lastValueFrom(this.apiService.Ejecutar(xAPI));
    return (data?.Cuerpo || []) as InversionActiva[];
  }

  async consultarComprobantesPendientesPlan(idPlan: number): Promise<ComprobantePendiente[]> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.CONSULTAR_COMPROBANTES_PENDIENTES_PLAN,
      parametros: idPlan.toString(),
      valores: ''
    };
    const data: any = await lastValueFrom(this.apiService.Ejecutar(xAPI));
    return (data?.Cuerpo || []) as ComprobantePendiente[];
  }

  async consultarFiniquitoPlan(idPlan: number): Promise<any | null> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.CONSULTAR_FINIQUITO,
      parametros: idPlan.toString(),
      valores: ''
    };
    const data: any = await lastValueFrom(this.apiService.Ejecutar(xAPI));
    const cuerpo = data?.Cuerpo || [];
    return cuerpo.length > 0 ? cuerpo[0] : null;
  }

  async insertarComprobante(comprobante: FID_IComprobante): Promise<number> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.INSERTAR_COMPROBANTE,
      parametros: '',
      valores: JSON.stringify(comprobante)
    };
    const data: any = await lastValueFrom(this.apiService.Ejecutar(xAPI));
    const id = parseInt(data?.msj);
    if (isNaN(id)) {
      throw new Error('No se pudo obtener el ID del comprobante generado');
    }
    return id;
  }

  async insertarDetalleComprobante(detalle: FID_IDetalleComprobante): Promise<void> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.INSERTAR_DETALLE_COMPROBANTE,
      parametros: '',
      valores: JSON.stringify(detalle)
    };
    await lastValueFrom(this.apiService.Ejecutar(xAPI));
  }

  async cambiarEstatusPlan(idPlan: number, estatus: number, observacion: string): Promise<void> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.ACTUALIZAR_ESTATUS_PLAN,
      parametros: '',
      valores: JSON.stringify({
        identificador: idPlan,
        estatus: estatus,
        observacion: observacion
      })
    };
    await lastValueFrom(this.apiService.Ejecutar(xAPI));
  }

  async registrarFiniquito(registro: RegistroFiniquito): Promise<void> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.INSERTAR_FINIQUITO,
      parametros: '',
      valores: JSON.stringify(registro)
    };
    await lastValueFrom(this.apiService.Ejecutar(xAPI));
  }
}
