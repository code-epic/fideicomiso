import { Injectable } from '@angular/core';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { environment } from 'src/environments/environment';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlanGuardService {

  private cache: Map<number, boolean> = new Map();
  private planesCargados: boolean = false;
  private estatusPlanes: Map<number, number> = new Map();

  constructor(private apiService: ApiService) { }

  async cargarPlanes(): Promise<void> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.CONSULTAR_PLANES_FIDEICOMISO,
      parametros: '',
      valores: ''
    };

    try {
      const data: any = await lastValueFrom(this.apiService.Ejecutar(xAPI));
      const planes = data?.Cuerpo || [];
      this.estatusPlanes.clear();
      planes.forEach((p: any) => {
        const id = parseInt(p.id) || 0;
        const estatus = parseInt(p.estatus) || 0;
        if (id > 0) {
          this.estatusPlanes.set(id, estatus);
        }
      });
      this.planesCargados = true;
    } catch (error) {
      console.error('Error al cargar planes:', error);
    }
  }

  async planBloqueado(idPlan: number): Promise<boolean> {
    await this.cargarPlanes();
    const estatus = this.estatusPlanes.get(idPlan);
    console.log('PlanGuardService: plan', idPlan, 'estatus:', estatus, 'bloqueado:', estatus === 3 || estatus === 4);
    return estatus === 3 || estatus === 4;
  }

  async obtenerEstatus(idPlan: number): Promise<number> {
    await this.cargarPlanes();
    return this.estatusPlanes.get(idPlan) || 0;
  }

  esFiniquitado(estatus: number): boolean {
    return estatus === 3;
  }

  esCerrado(estatus: number): boolean {
    return estatus === 4;
  }

  esBloqueado(estatus: number): boolean {
    return estatus === 3 || estatus === 4;
  }

  limpiarCache(): void {
    this.cache.clear();
    this.estatusPlanes.clear();
    this.planesCargados = false;
  }

  getNombreEstatus(estatus: number): string {
    switch (estatus) {
      case 1: return 'Activo';
      case 2: return 'Activo';
      case 3: return 'FINIQUITADO';
      case 4: return 'CERRADO';
      default: return 'Desconocido';
    }
  }

  esEstatusBloqueado(estatus: number): boolean {
    return estatus === 3 || estatus === 4;
  }
}
