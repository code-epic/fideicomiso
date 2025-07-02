import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiService, IAPICore } from '../apicore/api.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CierreService {

  
  private ultimoCierreSubject = new BehaviorSubject<string>('');
  private ultimoPreCierreSubject = new BehaviorSubject<string>('');
  
  ultimoCierre$ = this.ultimoCierreSubject.asObservable();
  ultimoPreCierre$ = this.ultimoPreCierreSubject.asObservable();
  
  constructor(private apiService: ApiService) { }

  async actualizarCierres() {
    const preCierre = await this.getUltimoPrecierre();
    const cierre = await this.getUltimoCierre();

    this.ultimoPreCierreSubject.next(preCierre);
    this.ultimoCierreSubject.next(cierre);
  }

  getUltimoCierre(): Promise<string> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.CONSULTAR_ULTIMO_CIERRE,
      parametros: '',
      valores: ''
    };

    return new Promise((resolve, reject) => {
      this.apiService.Ejecutar(xAPI).subscribe({
        next: (data) => {
          const ultc = data.Cuerpo;
          if (ultc && ultc.length > 0) {
            resolve(this.convertirfecha(ultc[0].fecha_cierre));
          } else {
            resolve('');
          }
        },
        error: (error) => {
          console.error(error);
          reject(error);
        }
      });
    });
  }

  getUltimoPrecierre(): Promise<string> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.CONSULTAR_ULTIMO_PRECIERRE,
      parametros: '',
      valores: ''
    };

    return new Promise((resolve, reject) => {
      this.apiService.Ejecutar(xAPI).subscribe({
        next: (data) => {
          if (data.Cuerpo && data.Cuerpo.length > 0) {
            resolve(this.convertirfecha(data.Cuerpo[0].fecha_cierre));
          } else {
            resolve('');
          }
        },
        error: (err) => {
          console.error(err);
          reject(err);
        }
      });
    });
  }

  private convertirfecha(fecha: string): string {
    const fechaSplit = fecha.split('-');
    return fechaSplit[2] + '/' + fechaSplit[1] + '/' + fechaSplit[0];
  }

  getSiguienteDia(fecha: string, n: number = 1): Date {
    const [dia, mes, anio] = fecha.split('/').map(Number);
    // Mes en JS es base 0
    let fechaCierre = new Date(anio, mes - 1, dia);
    fechaCierre.setDate(fechaCierre.getDate() + n);
    fechaCierre.setHours(0, 0, 0, 0);
    return fechaCierre;
  }

  getSemestral(fecha: string): boolean {
    const [dia, mes, anio] = fecha.split('/');
    return (mes === '06' && dia === '30') || (mes === '12' && dia === '31');
  }

  compararFechas(f1: any, f2: any) {

  }
}
