import { Injectable } from '@angular/core';


export interface Aportes {
  numero: string
  estatus : boolean
  fecharecepcion : string
  fechavalor : string
  cedula : string
  nombre : string
  apellido : string
  contrato : string
  nombrecontrato: string
  portafolio : string
  nombredepositante : string
  apellidodepositante : string
  agencia : string
  numerocuenta : string
  movimiento : string
  numerodocumento : string
  numerocheque : string
  banco : string
  aprobadopor : string
  totalefectivo : number
  totalcheque : number
  totalplanilla : number
  aprobado : boolean
}


@Injectable({
  providedIn: 'root'
})
export class AportesService {

  constructor() { }
}
