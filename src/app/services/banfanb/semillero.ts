import { Injectable } from '@angular/core';


export interface Semillero {
  codigo : number
  plan: string
  descripcion : string
  fecha : Date
  autor : string
}

@Injectable({
  providedIn: 'root'
})
export class SemilleroService {

  constructor() { }
}
