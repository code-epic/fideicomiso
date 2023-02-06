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
  fecha : Date
  autor : string
}

@Injectable({
  providedIn: 'root'
})
export class PortafolioService {

  constructor() { }
}
