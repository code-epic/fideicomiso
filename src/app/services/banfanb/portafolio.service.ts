import { Injectable } from '@angular/core';


export interface Portafolio {
  codigo : string
  descripcion : string
  moneda : string
  frecuencia : string
  distribucion : string
  tipo : string
  numerocuenta : string
  valormercado : string

}

@Injectable({
  providedIn: 'root'
})
export class PortafolioService {

  constructor() { }
}
