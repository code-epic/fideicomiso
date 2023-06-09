import { Injectable } from '@angular/core';
import { Direccion } from './afiliado.service';



export interface Empresa {
    rif: string,
    razonsocial: string,
    tipo : string
    numerocuenta: string
    Direccion : Direccion
}






@Injectable({
    providedIn: 'root'
})
export class AdministracionService {

    constructor() { }
}
