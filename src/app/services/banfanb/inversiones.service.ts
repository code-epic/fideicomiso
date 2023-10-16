import { Injectable } from "@angular/core";
import { ApiService, IAPICore } from "../apicore/api.service";
import { MatSnackBar } from "@angular/material/snack-bar";

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
  fecha_emision: any; // fecha
  fecha_compra: any; // fecha
  fecha_vencimiento: any; // fecha
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
};

export interface MovInversion {
  estatus: number;
  llave: string;
  debe: number; //Doble
  haber: number; //Doble
  usuario: string;
  cuenta: number;
  inversion: number;
  fecha_cierre?: string;
  fecha_precierre?: string;
  fecha_operacion: string;
};


export interface InversionPortafolio {
  id_inversion: number,
  id_portafolio: number,
  porcentaje: number,
  estatus: number,
  descripcion: string
  usuario: string
}

@Injectable({
  providedIn: 'root'
})
export class InversionesService {

  public xAPI: IAPICore = {
    funcion: "",
    parametros: "",
    valores: "",
  };



  constructor() { }




}
