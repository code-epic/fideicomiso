import { Injectable } from "@angular/core";
import { Direccion } from "./afiliado.service";

export interface Saldos {
  saldoinicio: number;
  sse_fechainicio: string;
  fechainicio: string;
  fondo: number;
  total: number;
  prestamo: number;
  capital: number;
  valor: number;
  utilidad: number;
}

export interface Politicas {
  observaciones: string;
  tipocuenta: string;
  numerocuenta: string;
  portafolio: string;
  portafolionomb: string;
  metodocalculo: string;
  tipocalculo: string;
  rendicion: string;
  condicionganancia: string;
  metodoganancia: string;
  comision: string;
  tasa: number;
  flat: string;
  tasaflat: number;
  enviar: string;
  numeromaximo: number;
  intervalominimo: number;
}

export interface Ejecutivo {
  negocio: string;
  cliente: string;
  proceso: string;
}

export interface Contrato {
  numero: string;
  clasificacion: string;
  tiporif?: string;
  rif: string;
  razonsocial: string;
  plan: string;
  estatus: string;
  tipo: string;
  empresa: string;
  fideicomiso: string;
  reporte: string;
  codigo: string;
  plananterior: string;
  grupoanterior: string;
  segmento: string;
  subsegmento: string;
  oficinatutora: string;
  fecha: Date;
  Direccion: Direccion;
  Ejecutivo: any;
  Politicas: Politicas;
  Saldos: Saldos;
}

export interface MovComision {
  debe: number;
  estatus: number;
  fecha_operacion: string;
  fecha_cierre: string;
  fecha_precierre: string;
  haber: number;
  cuenta: number;
  plan: number;
  llave: string;
  usuario: string;
}

@Injectable({
  providedIn: "root",
})
export class ContratoService {
  constructor() {}
}
