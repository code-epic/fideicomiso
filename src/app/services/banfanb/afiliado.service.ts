import { Injectable } from '@angular/core';



export interface Direccion {
  direccion : string
  pais : string
  ciudad : string
  municipio : string
  parroquia : string
  codigopostal : string
  urbanizacion : string
  telefono : string
  celular : string
  correo : string
  oficinanacional : string
}

export interface Afiliado {
  nacionalidad: string
  cedula: string
  estatus: number
  estadocivil: string
  pnombre: string // Primer Nombre
  smombre: string
  papellido: string // Primer Apellido
  sapellido: string
  sexo: string
  nacimiento : string
  ingreso : string
  actividad : string
  Direccion : Direccion
  
}





@Injectable({
  providedIn: 'root'
})
export class AfiliadoService {

  constructor() { }
}
