import { Injectable } from "@angular/core"

export interface ICuenta {
  moneda: string
  totalizadora: number
  parte: string
  disminuye: string
  aumenta: string
  descripcion: string
  codigo: string
  nivel_1: string
  nivel_2: string
  nivel_3: string
  nivel_4: string
  nivel_5: string
  usuario: string
}

export interface LCuenta {
  codigo: string
  descripcion: string
  aumenta_por: string
  disminuye_por: string
  codigo_asignacion: string
  cuenta: string
  accion: string
  disparador: string
}

export interface LConfiguracionCuenta {
  cuenta: string
  descripcion: string
  instrumento: string
  tipo: string
  definicion: string
  accion: string
}


export interface LPosicionInversiones {
  codigo: string
  instrumento: string
  valor_nominal: string
  costo_adquisicion: number
  interes_diario: number
  interes_acumulado: number
}

export interface ILConfiguracionCuenta {
  cuenta: string
  codigo: string
  operacion: number
  instrumento: string
  concepto: string
  definicion: string
}


export interface IConfiguracionCuenta {
  accion: string
  cuenta: number
  operacion: number
  instrumento: number
  tipo: string
}

export interface PlanFideicomiso {
  identificador: number
  fecha_apertura: string //AAAA-MM-DD
  observacion: string
  monto_apertura: number //decimales
  usuario: string
  estatus: number
  metodo_ganancia: number
  frecuencia: number
  tasa_flat: number //decimales
  comision_flat: number
  tipo_calculo: number
  tasa_comision: number //decimales
  tipo_comision: number
  clasificacion: string
  tipo_fideicomiso: string
  fideicomiso: string
}

@Injectable({
  providedIn: "root",
})
export class CuentaService {
  constructor() {}

  getCuenta(codigo: string): string {
    return codigo
  }

  setCuenta(codigo: string) {}
}
