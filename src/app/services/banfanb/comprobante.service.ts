import { Injectable } from '@angular/core';



//no posee una sola transaccion
export interface Comprobante {
  codigo : string
  numero : string
  plan: string //numero de comprobante
  fecha : string //fecha de la operacion
  saldo_debe : number // Producto de las transaciones
  saldo_haber: number
  monto_total : number // Producto de las transaciones
  detalle : string
  tipo: string // debe o haber
  estatus : boolean 
  items : []
}

//no posee una sola transaccion
export interface IComprobante {
  cuenta: string //Cuenta de comprobante
  fecha : string //fecha de la operacion
  debe : number // Producto de las transaciones
  haber: number
  referencia : string //deuda publica o colocacion a plazo, operaciones, retiros
  descripcion : string
  auxiliar : string //transaccion ID
  cc : string //comprobante contable
  tipo: string // debe o haber
  estatus : boolean 
}


@Injectable({
  providedIn: 'root'
})
export class ComprobanteService {

  constructor() { }
}
