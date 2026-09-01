import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { CierreService } from 'src/app/services/banfanb/cierre.service';
import { PlanGuardService } from 'src/app/services/banfanb/plan-guard.service';
import { FID_IComprobante } from 'src/app/services/banfanb/comprobante.service';
import { Inversion, InversionPortafolio } from 'src/app/services/banfanb/inversiones.service';
import { UtilService } from 'src/app/services/util/util.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-wzportafolio',
  templateUrl: './wzportafolio.component.html',
  styleUrls: ['./wzportafolio.component.scss']
})
export class WzportafolioComponent implements OnInit {
  public InvPort: InversionPortafolio = {
    id_inversion: 0,
    id_portafolio: 0,
    porcentaje: 0,
    estatus: 0,
    descripcion: '',
    usuario: ''
  }

  public xAPI: IAPICore = {
    funcion: '',
    parametros: ''
  }

  public portafolio
  public editando: boolean = false
  public index: number = null
  public editado: boolean = false

  public valor_inversion = null

  public porcentaje : any = 0

  public monto = 0
  public monto_general: any = 0

  public lstDataPortafolio = []

  public lstInversiones = []

  public blSave: boolean = false

  public Inversiones: Inversion = {
    identificador: 0,
    tipo_moneda: 0,
    estatus: 0,
    tipo_inversion: 0,
    plazo_vencimiento: 0,
    dias_caidos: 0,
    instrumento: '',
    numero: '',
    pais: 'VENEZUELA',
    codigo_isin: '',
    emisor: '',
    custodio: '',
    fecha_emision: '',
    fecha_compra: '',
    fecha_vencimiento: '',
    id_cartera: 0,
    id_portafolio: 0,
    valor_nominal: 0,
    precio_compra: 0,
    costo_adquisicion: 0,
    tasa_cupon: 0,
    base_calculo: 0,
    rendimiento_cupon: 0,
    plazo_cupon: 0,
    interes_diario: 0,
    rendimiento_vencimiento: 0,
    intereses_caidos: 0,
    amortizacion_diaria: 0,
    primas: 0,
    descuento: 0,
  };

  public lstData = []

  public total = 0
  public totalPorcentaje = 0
  public totalInicial = 0


  public titulo = 'DETALLES DE LA INVERSION POR PORTAFOLIO'

  bloquearMonto = false;
  bloquearPorcentaje = false;
  soloLectura = false;

  constructor(
    private apiService: ApiService, 
    private _util: UtilService,
    private _cierre: CierreService,
    private planGuard: PlanGuardService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    this.Inversiones = this.data
    this.valor_inversion = this.Inversiones.valor_nominal
    this.evaluarSoloLectura()
    this.Consultar()
    this.ListarPortafolio()
  }

  async evaluarSoloLectura() {
    const planId = this.data.id_plan || this.data.plan;
    if (planId) {
      const bloqueado = await this.planGuard.planBloqueado(planId);
      if (bloqueado) {
        this.soloLectura = true;
        return;
      }
    }

    const fechaUltimo = await this._cierre.getUltimoCierre();
    if (!fechaUltimo) { this.soloLectura = false; return; }
    const fechaCierre = this._util.ConvertirFechaDB(fechaUltimo);
    const fechaCompra = (this.Inversiones.fecha_compra || '').substring(0, 10);
    this.soloLectura = new Date(fechaCierre) > new Date(fechaCompra);
  }

  Consultar() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_INVERSIONES_PORTAFOLIO
    this.xAPI.parametros = this.Inversiones.identificador.toString()
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        this.lstInversiones = data.Cuerpo
        if( this.lstInversiones!= undefined ) {
          this.total =  this.lstInversiones.reduce((sum, e) => sum + parseFloat(e.porcentaje), 0)
          this.totalInicial = this.total
          this.editado = true
        }else{
          this.totalInicial = 0
          this.editado = false
        }
        this.actualizarBlSave()
        this.Limpiar()
      },
      error => {
        console.error(error)
      }
    )
  }

  private ListarPortafolio() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_PORTAFOLIOS
    this.xAPI.parametros = this.portafolio

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstDataPortafolio = data.Cuerpo
      },
      (error) => {
        console.error(error)
      }
    )
  } 

  soloNumeros(event: KeyboardEvent): boolean {
    const charCode = event.charCode;
    return charCode >= 48 && charCode <= 57;
  }

  habilitar(): boolean {
    const camposLlenos= this.portafolio !== '1' &&
                        this.monto_general !== null &&
                        this.porcentaje !== null &&
                        this.porcentaje > 0; 

    if (!camposLlenos) {
      return true;
    }

    const porcentajeNumerico = Number(this.porcentaje);

    const porcentajeRestante = 100 - this.total;

    if (porcentajeNumerico > porcentajeRestante) {
      return true;
    }

    const montoParaInvertir = Number(String(this.monto_general).replace(/[^0-9.]/g, ''));

    if (montoParaInvertir > this.monto) {
      return true;
    }

    return false;
  }

  getStatus(status): string {
    return status == '1' ? 'ACTIVO' : 'INACTIVO'
  }

  actualizarBlSave() {
    if (this.total == 100) {
      this.blSave = true
    } else if (this.editado && this.total != this.totalInicial) {
      this.blSave = true
    } else if (this.editado && this.lstInversiones.length === 0) {
      this.blSave = true
    } else {
      this.blSave = false
    }
  }

  Agregar() {
    const porcentajeNumerico = Number(this.porcentaje);
    const porcentajeRestante = 100 - this.total;
    if (porcentajeNumerico <= 0 || porcentajeNumerico > porcentajeRestante) return

    const portf = this.portafolio.split('|')
    const fecha = new Date()
    const fechaFormato = this._util.ConvertirFechaDB(fecha)
      const iPor = {
        id_inversion : this.Inversiones.identificador,
        id_portafolio : parseInt( portf[0]),
        descripcion : portf[1],
        porcentaje : parseFloat(this.porcentaje),
        estatus : 1,
        usuario: '',
        fecha: fechaFormato
      }
      this.total += parseFloat(this.porcentaje)
      this.actualizarBlSave()

      this.valor_inversion -= Number(this.monto_general)
      this.Limpiar()

    if(this.editando){
      this.lstInversiones[this.index] = iPor
      this.editando = false
    }else{
      this.lstInversiones.push(iPor)
    }

  }

  eliminar(i: number) {
    this.total -= parseFloat(this.lstInversiones[i].porcentaje)
    this.lstInversiones.splice(i, 1)
    this.actualizarBlSave()
    if (this.editando && this.index === i) {
      this.editando = false
      this.index = null
    } else if (this.editando && this.index > i) {
      this.index--
    }
  }

  editar(e: any, i: number){
    this.porcentaje = e.porcentaje
    this.portafolio = e.id_portafolio + '|' + e.descripcion 
    this.editando = true
    this.total -= e.porcentaje
    this.index = i
    this.actualizarBlSave()
  }

  async Commit() {
    await this.procesarVencimientosAutomaticos();

    if (this.editado) {
      this.Borrar().subscribe({
        next: () => {
          this.ejecutarInserciones();
          this.editando = false
        },
        error: (err) => {
          console.error(err);
          this.apiService.Mensaje('Error', 'No se pudieron eliminar las asignaciones previas', 'error', 'Portafolio');
        }
      });
    } else {
      this.ejecutarInserciones();
    }
  }

  private ejecutarInserciones() {
    if (this.lstInversiones.length === 0) {
      this.apiService.Mensaje('Proceso exitoso', 'Asignaciones eliminadas correctamente', 'success', 'inversion');
      this.Consultar();
      return;
    }

    this.xAPI.funcion = environment.xApi.INSERTAR_INVERSIONES_PORTAFOLIO;
    this.xAPI.parametros = '';

    let completados = 0;
    this.lstInversiones.forEach(inv => {
      this.xAPI.valores = JSON.stringify(inv);
      this.apiService.Ejecutar(this.xAPI).subscribe({
        next: (data) => {
          completados++
          if (completados === this.lstInversiones.length) {
            this.apiService.Mensaje('Proceso exitoso', 'Asignaciones guardadas correctamente', 'success', 'inversion');
            this.Consultar();
          }
        },
        error: (err) => {
          console.error(err);
          this.apiService.Mensaje('Error', 'No se pudo guardar la asignación del portafolio', 'error', 'Portafolio');
        }
      });
    });
  }

  // La función Borrar ahora debe devolver el observable
  Borrar():Observable<any> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.BORRAR_INVERSIONES_PORTAFOLIO,
      parametros: this.Inversiones.identificador.toString(),
      valores: ''
    };
    return this.apiService.Ejecutar(xAPI)
  }

  private Limpiar() {
    this.porcentaje = 0.00
    this.monto_general = 0
    this.portafolio = null
  }


  async ConsultarMontoPortafolio() {
    const portf = this.portafolio.split('|')
    const idPortafolio = portf[0]

    const apiSaldo: IAPICore = {
      funcion: environment.xApi.CONSULTAR_SALDO_PORTAFOLIO,
      parametros: idPortafolio,
      valores: ''
    };

    try {
      const data = await firstValueFrom(this.apiService.Ejecutar(apiSaldo));
      const cuerpo = data.Cuerpo && data.Cuerpo[0] ? data.Cuerpo[0] : null;
      let saldo = cuerpo ? Number(cuerpo.saldo) : 0;

      const portafolioSeleccionado = this.lstDataPortafolio.find((p: any) => Number(p.id) === Number(idPortafolio));
      const idPlan = portafolioSeleccionado?.id_plan;

      const fechaCompra = this.Inversiones.fecha_compra?.substring(0, 10);
      if (fechaCompra && idPlan) {
        const apiVenc: IAPICore = {
          funcion: environment.xApi.CONSULTAR_VENCIMIENTO_INVERSIONES,
          parametros: fechaCompra,
          valores: ''
        };
        const vencData = await firstValueFrom(this.apiService.Ejecutar(apiVenc));

        if (vencData?.Cuerpo?.length) {
          for (const v of vencData.Cuerpo) {
            if (v.id_plan != idPlan) continue;
            saldo += parseFloat(v.valor_nominal) + this.RendicionCupon(v);
          }
        }
      }

      this.monto = saldo;
    } catch (error) {
      console.error(error);
    }
  }

  private editandoPorcentaje = false;
  private editandoMonto = false;

  onPorcentajeChange() {
    if (this.editandoMonto) return; // Evita bucle
    this.editandoPorcentaje = true;
    const valor = Number(this.Inversiones.valor_nominal);
    if (this.porcentaje !== null && this.porcentaje !== undefined && this.porcentaje !== '') {
      const porcentajeNum = Number(this.porcentaje);
      if (!isNaN(porcentajeNum) && this.Inversiones?.valor_nominal) {
        this.monto_general = ((porcentajeNum / 100) * valor).toFixed(2);
        this.bloquearMonto = true;
        this.bloquearPorcentaje = false;
      }
    } else {
      this.bloquearMonto = false;
    }
    this.editandoPorcentaje = false;
  }

  onMontoChange() {
    if (this.editandoPorcentaje) return; // Evita bucle
    this.editandoMonto = true;
    const valor = Number(this.Inversiones.valor_nominal);
    if (this.monto_general !== null && this.monto_general !== undefined && this.monto_general !== '') {
      const montoNum = Number((this.monto_general + '').replace(/[^0-9.]/g, ''));
      if (!isNaN(montoNum) && this.Inversiones?.valor_nominal) {
        this.porcentaje = ((montoNum / valor) * 100).toFixed(2);
        this.bloquearPorcentaje = true;
        this.bloquearMonto = false;
      }
    } else {
      this.bloquearPorcentaje = false;
    }
    this.editandoMonto = false;
  }

  RendicionCupon(inv): number {
    let rendicion =
      (inv.valor_nominal * inv.tasa_cupon * (inv.plazo_cupon / 100)) /
      inv.base_calculo;
    return parseFloat(rendicion.toFixed(2));
  }

  async procesarVencimientosAutomaticos(): Promise<void> {
    const fechaCompra = this.Inversiones.fecha_compra?.substring(0, 10);
    if (!fechaCompra) return;

    const apiVenc: IAPICore = {
      funcion: environment.xApi.CONSULTAR_VENCIMIENTO_INVERSIONES,
      parametros: fechaCompra,
      valores: ''
    };

    try {
      const data = await firstValueFrom(this.apiService.Ejecutar(apiVenc));
      if (!data?.Cuerpo?.length) return;

      for (const v of data.Cuerpo) {
        if (!v.id_plan) continue;

        const monto = parseFloat(v.valor_nominal) + this.RendicionCupon(v);
        const comprobante: FID_IComprobante = {
          plan: Number(v.id_plan),
          codigo: this._util.GenerarUnicId(),
          descripcion: `VENCIMIENTO DE INVERSIONES ${this._util.ConvertirFechaHumana(fechaCompra)}`,
          detalle: v.plan_nombre || `VENCIMIENTO DE INVERSIONES ${this._util.ConvertirFechaHumana(fechaCompra)}`,
          fecha_operacion: fechaCompra,
          fecha_ejercicio: fechaCompra,
          debe: monto,
          haber: monto,
          llave: 'M',
        };

        const apiComp: IAPICore = {
          funcion: environment.xApi.INSERTAR_COMPROBANTE,
          parametros: '',
          valores: JSON.stringify(comprobante)
        };

        const res = await firstValueFrom(this.apiService.Ejecutar(apiComp));
        if (res?.msj) {
          const apiData: IAPICore = {
            funcion: environment.xApi.INSERTAR_VENCIMIENTO_INVERSIONES,
            parametros: res.msj + ',' + fechaCompra + ',' + v.codigo,
            valores: ''
          };
          await firstValueFrom(this.apiService.Ejecutar(apiData));
        }
      }
    } catch (error) {
      console.error('Error procesando vencimientos automáticos:', error);
    }
  }

  limpiarCampos() {
    if (this.editando && this.index !== null) {
      this.total += parseFloat(this.lstInversiones[this.index].porcentaje)
    }
    this.editando = false
    this.index = null
    this.porcentaje = ''
    this.monto_general = ''
    this.portafolio = null
    this.bloquearMonto = false
    this.bloquearPorcentaje = false
  }
}
