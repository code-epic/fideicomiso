import { Injectable } from '@angular/core';


export interface Inversiones {
  codigo: string
  descripcion: string
  grupo: string
  limite: string
  moneda: string
  calculo: string
  contabilidad: string
  totalinvertido: number
  codigobcv: string
  codigoisin: string
  decreto: string
  emision: string
  valorinicial: string
  monedaextranjera: string
  estatus: number
  fecha: Date
  autor: string
}


@Injectable({
  providedIn: 'root'
})
export class InversionesService {

  constructor() { }
}
