import { Injectable } from "@angular/core";

export interface Inversion {
  identificador: number;
  tipo_moneda: number;
  estatus: number;
  tipo_inversion: number;
  plazo_vencimiento: number;
  dias_caidos: number;
  instrumento: string;
  numero: string;
  pais: string;
  codigo_isin: string;
  emisor: string;
  custodio: string;
  fecha_emision: string; // fecha
  fecha_compra: string; // fecha
  fecha_vencimiento: string; // fecha
  id_cartera: number;
  id_portafolio: number;
  valor_nominal: number; //doble
  precio_compra: number; //doble
  costo_adquisicion: number; //doble
  tasa_cupon: number; //doble
  base_calculo: number; //doble
  rendimiento_cupon: number; //doble
  plazo_cupon: number; //doble
  interes_diario: number; //doble
  rendimiento_vencimiento: number; //doble
  intereses_caidos: number; //doble
  amortizacion_diaria: number; //doble
  primas: number; //doble
  descuento: number; //doble
}



// export interface Inversiones {
//   codigo: string
//   descripcion: string
//   grupo: string
//   limite: string
//   moneda: string
//   calculo: string
//   contabilidad: string
//   totalinvertido: number
//   codigobcv: string
//   codigoisin: string
//   decreto: string
//   emision: string
//   tipo: string
//   valor_nominal: number
//   costo_adquisicion: number
//   precio_compra: number
//   base_calculo: number
//   tasa_cupon: number
//   plazo_cupon: number
//   intereses_caidos: number
//   dias_caidos: number
//   intereses_diario_caidos:  number
//   descuento: number
//   rendimiento_vencimiento: number
//   plazo_vencimiento: number
//   prima: number
//   rendimiento_cupon: number
//   amortizacion_diaria: number
//   valorinicial: string
//   monedaextranjera: string
//   estatus: string
//   fecha: Date
//   autor: string
//   pais: string
//   fecha_emision: string
//   fecha_compra: string
//   fecha_vencimiento : string
//   fecha_inicio_cupon: string
//   fecha_fin_cupon: string
// }

@Injectable({
  providedIn: "root",
})
export class InversionesService {
  constructor() {}
}
