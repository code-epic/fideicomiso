import { Injectable } from '@angular/core';


export interface Inversiones {
  codigo : string
  descripcion : string
  grupo : string
  limitecartera : number
  monedaoperaciones : string
  calculocosto : number
  contabilidadcomo : string
  totalinvertido : number
  codigobcv : string
  codigoisin : string
  decreto : string
  emision : string
  valorinicial : number
  monedaextranjera : number
  estatus : number
}


@Injectable({
  providedIn: 'root'
})
export class InversionesService {

  constructor() { }
}
