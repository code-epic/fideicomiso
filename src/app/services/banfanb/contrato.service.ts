import { Injectable } from '@angular/core';
import { Direccion } from './afiliado.service';



export interface Saldos {
  saldoinicio: number
  sse_fechainicio : string
  fechainicio: string
  fondo: number
  total: number
  prestamo: number
  capital: number
  valor: number
  utilidad: number
}

export interface Politicas {
  observaciones: string
  tipocuenta: string
  numerocuenta: string
  portafolio: string
  metodocalculo: string
  tipocalculo: string
  rendicion: string
  condicionganancia: string
  metodoganancia: string
  enviar: string
  numeromaximo: number
  intervalominimo: number

}

export interface Ejecutivo {
  negocio: string
  cliente: string
  proceso: string
}

export interface Contrato {
  numero: string
  rif: string
  razonsocial: string
  plan: string
  estatus: string
  tipo: string
  empresa: string
  fideicomiso: string
  reporte: string
  codigo: string
  plananterior: string
  grupoanterior: string
  segmento: string
  subsegmento: string
  oficinatutora: string
  fecha: Date
  Direccion: Direccion
  Ejecutivo: Ejecutivo
  Politicas: Politicas
  Saldos: Saldos
}


@Injectable({
  providedIn: 'root'
})
export class ContratoService {

  constructor() { }
}
