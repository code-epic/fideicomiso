import { Injectable } from '@angular/core';



//no posee una sola transaccion
export interface Comprobante {
  numero: string //numero de comprobante
  fecha : string //fecha de la operacion
  monto_global : number // Producto de las transaciones
  instrumento : string //deuda publica o colocacion a plazo, operaciones, retiros
  detalle : string
  debito: number
  credito: number
  monto: number
  idtra : string //transaccion ID
  cuenta : string
  tipo_movimiento: string // debe o haber
  estatus : boolean 
}


@Injectable({
  providedIn: 'root'
})
export class ComprobanteService {

  constructor() { }
}
