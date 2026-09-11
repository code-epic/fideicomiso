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

export interface CuentaNominal {
  id_cuenta: number;
  codigo_padre: string;
  descripcion: string;
  aumenta: string;
  saldo: number;
}

export interface DiagnosticoFiniquito {
  id_plan: number;
  plan: string;
  tasa: number;
  ultimo_cierre: string;
  saldo_711: number;
  saldo_712: number;
  saldo_714: number;
  saldo_722: number;
  saldo_731: number;
  saldo_734: number;
  saldo_740: number;
  saldo_744: number;
  saldo_750: number;
  saldo_751: number;
  saldo_752: number;
  int_inicio: string;
  int_dias: number;
  intereses_proyectados: number;
  remanente_neto: number;
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
  numero_oficio?: string;
  banco_destino?: string;
  cuenta_destino?: string;
  referencia?: string;
  intereses_disponibilidad?: number;
  saldo_712?: number;
  saldo_714?: number;
  monto_liquidacion?: number;
  comprobante_intereses?: number;
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

  async consultarDiagnostico(idPlan: number, fechaFiniquito: string): Promise<DiagnosticoFiniquito | null> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.CONSULTAR_DIAGNOSTICO_FINIQUITO,
      parametros: `${idPlan},${fechaFiniquito}`,
      valores: ''
    };
    const data: any = await lastValueFrom(this.apiService.Ejecutar(xAPI));
    const cuerpo = data?.Cuerpo || [];
    if (cuerpo.length === 0) return null;
    const r = cuerpo[0];
    return {
      id_plan: parseInt(r.id_plan) || 0,
      plan: r.plan,
      tasa: parseFloat(r.tasa) || 0,
      ultimo_cierre: r.ultimo_cierre,
      saldo_711: parseFloat(r.saldo_711) || 0,
      saldo_712: parseFloat(r.saldo_712) || 0,
      saldo_714: parseFloat(r.saldo_714) || 0,
      saldo_722: parseFloat(r.saldo_722) || 0,
      saldo_731: parseFloat(r.saldo_731) || 0,
      saldo_734: parseFloat(r.saldo_734) || 0,
      saldo_740: parseFloat(r.saldo_740) || 0,
      saldo_744: parseFloat(r.saldo_744) || 0,
      saldo_750: parseFloat(r.saldo_750) || 0,
      saldo_751: parseFloat(r.saldo_751) || 0,
      saldo_752: parseFloat(r.saldo_752) || 0,
      int_inicio: r.int_inicio,
      int_dias: parseInt(r.int_dias) || 0,
      intereses_proyectados: parseFloat(r.intereses) || 0,
      remanente_neto: parseFloat(r.remanente_neto) || 0
    } as DiagnosticoFiniquito;
  }

  async consultarInversionesActivasPlan(idPlan: number, fechaFiniquito?: string): Promise<InversionActiva[]> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.CONSULTAR_INVERSIONES_ACTIVAS_PLAN,
      parametros: fechaFiniquito ? `${idPlan},${fechaFiniquito}` : idPlan.toString(),
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

  async consultarCuentasNominalesPlan(idPlan: number): Promise<CuentaNominal[]> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.CONSULTAR_CUENTAS_NOMINALES_PLAN,
      parametros: idPlan.toString(),
      valores: ''
    };
    const data: any = await lastValueFrom(this.apiService.Ejecutar(xAPI));
    const cuerpo = data?.Cuerpo || [];
    console.log('[FiniquitoService] consultarCuentasNominalesPlan:', idPlan, '→', cuerpo.length, 'cuentas', cuerpo);
    return cuerpo.map((c: any) => ({
      id_cuenta: parseInt(c.id_cuenta) || 0,
      codigo_padre: c.codigo_padre,
      descripcion: c.descripcion,
      aumenta: c.aumenta,
      saldo: parseFloat(c.saldo) || 0
    })) as CuentaNominal[];
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

  async insertarMovimientosFiniquito(plan: number, fecha: string, llave: string): Promise<void> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.INSERTAR_MOVIMIENTOS_FINIQUITO,
      parametros: `${fecha},${llave},finiquito,${plan}`,
      valores: ''
    };
    await lastValueFrom(this.apiService.Ejecutar(xAPI));
  }

  async borrarComprobantesFiniquito(plan: number, fecha: string): Promise<void> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.ELIMINAR_COMPROBANTES_FINIQUITO,
      parametros: `${plan},${fecha}`,
      valores: ''
    };
    await lastValueFrom(this.apiService.Ejecutar(xAPI));
  }

  async borrarMovimientosFiniquito(plan: number, fecha: string): Promise<void> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.ELIMINAR_MOVIMIENTOS_FINIQUITO,
      parametros: `${plan},${fecha}`,
      valores: ''
    };
    await lastValueFrom(this.apiService.Ejecutar(xAPI));
  }

  async borrarSaldosFiniquito(plan: number, fecha: string): Promise<void> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.ELIMINAR_SALDOS_FINIQUITO,
      parametros: `${plan},${fecha}`,
      valores: ''
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

  async consultarSaldosAjustados(idPlan: number, fechaCierre: string, fechaFiniquito: string): Promise<{saldo_712: number, saldo_714: number}> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.CONSULTAR_SALDOS_AJUSTADOS,
      parametros: `${idPlan},${fechaCierre},${fechaFiniquito}`,
      valores: ''
    };
    const data: any = await lastValueFrom(this.apiService.Ejecutar(xAPI));
    const r = data?.Cuerpo?.[0] || {};
    return {
      saldo_712: parseFloat(r.saldo_712) || 0,
      saldo_714: parseFloat(r.saldo_714) || 0
    };
  }
}
