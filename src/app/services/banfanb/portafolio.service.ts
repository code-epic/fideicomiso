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
  autor : string
}

// export interface Cuenta {
//   codigo : string
//   descripcion: string
//   aumenta_por : string
//   disminuye_por : string
//   codigo_asignacion : string
//   cuenta: string
// }




@Injectable({
  providedIn: 'root'
})
export class PortafolioService {

  constructor() { }
}
