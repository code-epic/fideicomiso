import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { CierreService } from 'src/app/services/banfanb/cierre.service';
import { FID_IComprobante, FID_IDetalleComprobante } from 'src/app/services/banfanb/comprobante.service';
import { InteresesService } from 'src/app/services/banfanb/intereses.service';
import { LPosicionInversiones } from 'src/app/services/banfanb/contabilidad.service';
import { UtilService } from 'src/app/services/util/util.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ccierre',
  templateUrl: './ccierre.component.html',
  styleUrls: ['./ccierre.component.scss']
})

export class CcierreComponent implements OnInit {
  public ELEMENT_DATA: LPosicionInversiones[] = [];
  displayedColumns: string[] = [
    "codigo",
    "instrumento",
    "valor_nominal",
    "costo_adquisicion",
    "interes_diario",
    "interes_acumulado",
  ];
  dataSource: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public fechau: any
  public fechaultimo = ''
  public fechai: any
  public fechaf: any

  public lstMovimientos = []
  public lstMovimientosAuxliares = []
  public bcuentat = false
  public dias: number = 0
  public acum_debe = 0
  public acum_haber = 0

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
  }

  public Comprobante: FID_IComprobante = {
    plan: 0,
    codigo: "",
    descripcion: "",
    detalle: "",
    fecha_operacion: "",
    fecha_ejercicio: "",
    debe: 0,
    haber: 0,
    llave: ''
  };

  public IDComprobante: FID_IDetalleComprobante = {
    id_comprobante: 0,
    cuenta: 0,
    debe: 0,
    haber: 0,
    fecha_operacion: "",
    fecha_ejercicio: "",
  };

  lstData = []
  public semestral: boolean = false

  events: string[] = [];
  blista: boolean = false
  bauxiliar: boolean = false
  // Cierre mensual
  public esUltimoDiaMes: boolean = false;
  public esPrimerDiaMes: boolean = false;
  public cierreDiarioCompletado: boolean = false;
  public interesesGenerados: boolean = false;
  public precierreEjecutado: boolean = false;
  public cierreMensualCompletado: boolean = false;
  public movimientosDEncontrados: boolean = false;
  public lstInteresesGenerados: any[] = [];
  public tasaInteres: number = 2.00;

  constructor(
    private apiService: ApiService,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    public formatter: NgbDateParserFormatter,
    private cierre: CierreService,
    private interesesService: InteresesService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.consultarUltimoCierre()
  }

  async consultarUltimoCierre() {
    this.fechaultimo = await this.cierre.getUltimoCierre()
    this.fechai = this.cierre.getSiguienteDia(this.fechaultimo);
    this.fechaf = this.fechai
    this.semestral = this.cierre.getSemestral(this.fechaultimo)
    this.dias = 1
    this.verificarUltimoDiaMes()
  }

  verificarUltimoDiaMes() {
    const hoy = new Date();
    const fechai = new Date(this.fechai);
    const ultimoDiaMes = new Date(fechai.getFullYear(), fechai.getMonth() + 1, 0);
    this.esUltimoDiaMes = hoy.getFullYear() === fechai.getFullYear() && 
                          hoy.getMonth() === fechai.getMonth() && 
                          hoy.getDate() === ultimoDiaMes.getDate();
    this.esPrimerDiaMes = fechai.getDate() === 1;

    if (this.esPrimerDiaMes) {
      this.verificarMovimientosD();
      this.verificarCierreMensual();
    }
  }

  async verificarCierreMensual() {
    try {
      const d = this.fechaultimo.split('/');
      const fechaVerificar = `${d[2]}-${d[1]}-${d[0]}`;
      this.xAPI.funcion = environment.xApi.VERIFICAR_CIERRE_MENSUAL;
      this.xAPI.parametros = fechaVerificar;
      this.xAPI.valores = '';

      const data = await firstValueFrom(this.apiService.Ejecutar(this.xAPI));
      const total = data?.Cuerpo?.[0]?.total ?? 0;
      this.cierreMensualCompletado = parseInt(total, 10) > 0;
    } catch (error) {
      console.error('Error verificando cierre mensual:', error);
      this.cierreMensualCompletado = false;
    }
  }

  CalcularDias(type: string, event: MatDatepickerInputEvent<Date>) {
    this.dias = this.util.CalcuarDiasTranscurridos(this.fechai, this.fechaf) + 1
  }


  async ValidarPreCierre() {
    this.ngxService.startLoader('load-precierre')
    let fentrada = await this.cierre.getUltimoPrecierre()
    let finicio = this.util.ConvertirFechaDB(this.fechai)

    fentrada = this.util.ConvertirFechaDB(fentrada)

    let fentradaDate = new Date(fentrada).toISOString(); // Convertir fentrada a formato UTC
    let finicioDate = new Date(finicio).toISOString();   // Convertir finicio a formato UTC

    if (fentradaDate >= finicioDate) {
      let fechaultimoDate = new Date(this.util.ConvertirFechaDB(this.fechaultimo)).toISOString();

      if (fechaultimoDate < finicioDate) {
        this.ValidarCierreCompleto(finicio)
      } else {
        this.apiService.Mensaje(
          "Pendiente",
          "Ya ha cerrado el dia " + this.util.ConvertirFechaHumana(this.fechai),
          "error",
          "Cierre"
        )
        this.consultarUltimoCierre()
      }
    } else {
      this.apiService.Mensaje(
        "Pendiente",
        "Tiene pendiente el Precierre para el dia: " + this.util.ConvertirFechaHumana(this.fechai),
        "error",
        "Cierre"
      )
      this.consultarUltimoCierre()
      this.ngxService.stopLoader('load-precierre')
    }
  }

  ValidarCierreCompleto(fecha: string) {
    this.xAPI.funcion = environment.xApi.VALIDAR_CIERRE
    this.xAPI.parametros = fecha
    this.xAPI.valores = ''

    this.apiService.Ejecutar(this.xAPI).subscribe({
      next: (data) => {
        const resultados = data.Cuerpo;
        const faltantes = resultados.filter(r => r.estado === 'FALTANTE');

        if (faltantes.length > 0) {
          this.ngxService.stopLoader('load-precierre');
          let listaHTML = '<ul style="text-align: left; margin: 10px 0; padding-left: 20px;">';
          faltantes.forEach(f => {
            const n = f.existe || 0;
            const msg = this.mensajeFaltante(f.tipo, n, f.existe, f.esperado);
            listaHTML += `<li style="margin: 5px 0;">${msg}</li>`;
          });
          listaHTML += '</ul>';

          Swal.fire({
            title: 'Comprobantes incompletos',
            html: `No se puede cerrar el día:${listaHTML}`,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Entendido'
          });
        } else {
          this.CrearSaldos()
        }
      },
      error: (error) => {
        console.error(error);
        this.ngxService.stopLoader('load-precierre');
      }
    })
  }

  mensajeFaltante(tipo: string, n: number, existe: any, esperado: any): string {
    const nombre = tipo.toUpperCase();
    switch (nombre) {
      case 'COMPROBANTE_SIN_MOV':
        return `<strong>Comprobantes sin movimientos:</strong> ${n} comprobante(s) del día no tienen movimientos. Realiza el precierre del día.`;
      case 'MOV_SIN_COMPROBANTE':
        return `<strong>Movimientos sin comprobante:</strong> ${n} movimiento(s) del día no tienen comprobante asociado (huérfanos).`;
      case 'DESCUADRE_MONTO':
        return `<strong>Descuadre de montos:</strong> ${n} comprobante(s) tienen montos que no concuerdan entre el comprobante y sus movimientos.`;
      case 'COMISION':
        if (existe == esperado) {
          return `<strong>Comisiones:</strong> Se generaron ${n} comprobantes de comisiones pero algunos no tienen movimientos. Realiza el precierre del día.`;
        }
        return `<strong>Comisiones:</strong> Faltan ${esperado - existe} comprobante(s) de comisión de ${esperado} planes activos.`;
      case 'DEVENGO':
        if (existe == esperado) {
          return `<strong>Devengos:</strong> Se generaron ${n} comprobantes de devengo pero algunos no tienen movimientos. Realiza el precierre del día.`;
        }
        return `<strong>Devengos:</strong> Faltan ${esperado - existe} comprobante(s) de devengo de ${esperado} inversiones vigentes.`;
      case 'VENCIMIENTO':
        if (existe == esperado) {
          return `<strong>Vencimientos:</strong> Se generaron ${n} comprobantes de vencimiento pero algunos no tienen movimientos. Realiza el precierre del día.`;
        }
        return `<strong>Vencimientos:</strong> Faltan ${esperado - existe} comprobante(s) de vencimiento de ${esperado} inversiones.`;
      case 'COMPRA':
        if (existe == esperado) {
          return `<strong>Compras:</strong> Se generaron ${n} comprobantes de compra pero algunos no tienen movimientos. Realiza el precierre del día.`;
        }
        return `<strong>Compras:</strong> Faltan ${esperado - existe} comprobante(s) de compra de ${esperado} inversiones.`;
      case 'COMPRA_SIN_PORTAFOLIO':
        return `<strong>Compra sin portafolio:</strong> ${n} compra(s) del día no están asignadas a un portafolio activo. Asigna el portafolio antes de cerrar el día.`;
      default:
        if (existe == esperado) {
          return `<strong>${nombre}</strong>: Los comprobantes existen pero no se registraron los movimientos. Realiza el precierre del día.`;
        }
        return `<strong>${nombre}</strong>: Faltan ${esperado - existe} comprobantes de ${esperado}`;
    }
  }

  CrearSaldos(llave = 'M') {
    let d = this.fechaultimo.split('/')
    let fultimo = d[2] + '-' + d[1] + '-' + d[0];
    let dt = new Date(this.fechai).toISOString()

    d = dt.split('T')
    let fopera = d[0]

      if (llave == 'S' || llave == 'D') {
        let f = new Date(fopera);
        f.setDate(f.getDate() - 1);
        fopera = f.toISOString().split('T')[0]

        if (llave == 'S') {
          // Cierre semestral: fultimo = fopera (Dec 31) para tomar D saldo como anterior
          fultimo = fopera
        } else {
          // Cierre mensual: fultimo = ayer de fopera (Nov 30)
          let fo = new Date(fultimo);
          fo.setDate(f.getDate() - 1);
          fultimo = fo.toISOString().split('T')[0]
        }
      }

    let usuario = 'Administrador'
    let plan = '%'

    this.ngxService.startLoader('load-precierre')
    this.xAPI.funcion = environment.xApi.INSERTAR_SALDOS_CIERRE
    this.xAPI.parametros = `${fopera},${usuario},${llave},${plan},${fultimo}`
    this.xAPI.valores = ''

    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        this.apiService.Mensaje(
          "Proceso exitoso",
          "Se ha realizado el cierre para el dia: " + this.util.ConvertirFechaHumana(this.fechai),
          "success",
          "Cierres"
        )
        this.consultarUltimoCierre()
        this.cierre.actualizarCierres()
        this.ngxService.stopLoader('load-precierre')

      },
      (error) => {
        console.error(error)
      }
    )
  }


  CrearSemestral(llave) {
    if (!this.cierreMensualCompletado) {
      this.toastr.error('Debe completar el cierre mensual antes del cierre semestral', 'Cierre Semestral');
      return;
    }
    this.ngxService.startLoader('load-precierre')
    // this.fechai = primer día del semestre (ej: 2027-01-01)
    // fultimo = último día del semestre (ayer de fechai) = fecha del cierre
    let dt = new Date(this.fechai)
    dt.setDate(dt.getDate() - 1)
    let fultimo = dt.toISOString().split('T')[0]
    this.xAPI.funcion = environment.xApi.BORRAR_CIERRE_SEMESTRAL
    this.xAPI.parametros = fultimo
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        try {
          await this.CrearSaldosAsync(llave)
          this.toastr.success('Cierre semestral completado exitosamente', 'Cierre Semestral')
        } catch (error) {
          console.error('Error en CrearSaldos semestral:', error)
          this.toastr.error('Error al generar saldos semestales. Se revirtió el proceso.', 'Cierre Semestral')
        } finally {
          this.ngxService.stopLoader('load-precierre')
        }
      },
      (error) => {
        console.error('Error al borrar cierre semestral:', error)
        this.toastr.error('Error al eliminar cierre semestral anterior', 'Cierre Semestral')
        this.ngxService.stopLoader('load-precierre')
      }
    )
  }

  // ============ CIERRE MENSUAL ============

  async ejecutarCierreDiario() {
    Swal.fire({
      title: 'Cierre Diario del Último Día',
      text: 'Se procederá a cerrar el último día del mes. ¿Continuar?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.ngxService.startLoader('load-precierre');
        await this.CrearSaldosAsync('M');
        this.cierreDiarioCompletado = true;
        this.ngxService.stopLoader('load-precierre');
        this.apiService.Mensaje(
          'Cierre Diario',
          'Último día del mes cerrado correctamente',
          'success',
          'Cierre Mensual'
        );
      }
    });
  }

  async generarInteresesDisponibilidad() {
    this.ngxService.startLoader('load-precierre');
    try {
      // Usar la fecha seleccionada por el usuario
      const fechaSeleccionada = this.util.ConvertirFechaDB(this.fechai);
      const partes = fechaSeleccionada.split('-');
      const anio = partes[0];
      const mes = partes[1];
      const ultimoDia = new Date(parseInt(anio), parseInt(mes), 0).getDate();
      const fechaInicio = `${anio}-${mes}-01`;
      const fechaFin = `${anio}-${mes}-${String(ultimoDia).padStart(2, '0')}`;

      // Eliminar comprobantes de intereses existentes para esta fecha
      await this.interesesService.eliminarInteresesDisponibilidad(fechaFin);

      const datos = await this.interesesService.calcularIntereses(fechaInicio, fechaFin);
      
      this.lstInteresesGenerados = [];
      let comprobantesGenerados = 0;

      for (const plan of datos) {
        const idPlan = plan.id_plan;
        const interesCalc = parseFloat(plan.interes_calculado as any) || 0;
        
        if (interesCalc <= 0) continue;

        const comprobante: FID_IComprobante = {
          plan: idPlan,
          codigo: '',
          descripcion: `INTERESES POR DISPONIBILIDAD MES ${this.util.ConvertirFechaHumana(fechaFin)}`,
          detalle: plan.plan,
          fecha_operacion: fechaFin,
          fecha_ejercicio: fechaFin,
          debe: interesCalc,
          haber: interesCalc,
          llave: 'D'
        };

        const idComprobante = await this.interesesService.insertarComprobante(comprobante);
        
        await this.interesesService.insertarDetalleInteres(
          idComprobante,
          interesCalc,
          fechaFin,
          idPlan
        );

        this.lstInteresesGenerados.push({
          id_plan: idPlan,
          plan: plan.plan,
          interes_calculado: interesCalc
        });
        
        comprobantesGenerados++;
      }

      this.interesesGenerados = true;
      this.ngxService.stopLoader('load-precierre');
      
      this.apiService.Mensaje(
        'Intereses Generados',
        `Se generaron ${comprobantesGenerados} comprobantes de intereses por disponibilidad`,
        'success',
        'Cierre Mensual'
      );
    } catch (error) {
      console.error(error);
      this.ngxService.stopLoader('load-precierre');
      this.apiService.Mensaje(
        'Error',
        'Error al generar intereses por disponibilidad',
        'error',
        'Cierre Mensual'
      );
    }
  }

  async ejecutarPrecierreMensual() {
    this.ngxService.startLoader('load-precierre');
    try {
      // Usar la fecha seleccionada por el usuario (fechaf o fechai)
      const fechaSeleccionada = this.util.ConvertirFechaDB(this.fechai);

      this.xAPI.funcion = environment.xApi.INSERTAR_MOVIMIVIENTOS_COMPROBANTES;
      this.xAPI.parametros = `${fechaSeleccionada},D`;
      this.xAPI.valores = '';

      await firstValueFrom(this.apiService.Ejecutar(this.xAPI));

      this.precierreEjecutado = true;
      await this.verificarMovimientosD();
      this.ngxService.stopLoader('load-precierre');
      
      this.apiService.Mensaje(
        'Precierre Ejecutado',
        `El precierre del ${this.util.ConvertirFechaHumana(this.fechai)} se ejecutó correctamente`,
        'success',
        'Cierre Mensual'
      );
    } catch (error) {
      console.error(error);
      this.ngxService.stopLoader('load-precierre');
      this.apiService.Mensaje(
        'Error',
        'Error al ejecutar el precierre mensual',
        'error',
        'Cierre Mensual'
      );
    }
  }

  CrearSaldosAsync(llave = 'M'): Promise<void> {
    return new Promise((resolve, reject) => {
      let d = this.fechaultimo.split('/')
      let fultimo = d[2] + '-' + d[1] + '-' + d[0];
      let dt = new Date(this.fechai).toISOString()

      d = dt.split('T')
      let fopera = d[0]

      if (llave == 'S' || llave == 'D') {
        // Para cierre semestral/mensual:
        // fopera = último día del período (ayer de this.fechai)
        // fultimo = fecha del último M balance (ayer de fopera)
        let f = new Date(fopera);
        f.setDate(f.getDate() - 1);
        fopera = f.toISOString().split('T')[0]

        let fo = new Date(fultimo);
        fo.setDate(f.getDate() - 1);
        fultimo = fo.toISOString().split('T')[0]
      }

      let usuario = 'Administrador'
      let plan = '%'

      this.xAPI.funcion = environment.xApi.INSERTAR_SALDOS_CIERRE
      this.xAPI.parametros = `${fopera},${usuario},${llave},${plan},${fultimo}`
      this.xAPI.valores = ''

      this.apiService.Ejecutar(this.xAPI).subscribe(
        async data => {
          this.consultarUltimoCierre()
          this.cierre.actualizarCierres()
          resolve();
        },
        (error) => {
          console.error(error)
          reject(error)
        }
      )
    });
  }

  async verificarMovimientosD() {
    try {
      const d = this.fechaultimo.split('/');
      const fechaVerificar = `${d[2]}-${d[1]}-${d[0]}`;
      this.xAPI.funcion = environment.xApi.VERIFICAR_MOVIMIENTOS_D;
      this.xAPI.parametros = fechaVerificar;
      this.xAPI.valores = '';

      const data = await firstValueFrom(this.apiService.Ejecutar(this.xAPI));
      const total = data?.Cuerpo?.[0]?.total ?? 0;
      this.movimientosDEncontrados = parseInt(total, 10) > 0;
    } catch (error) {
      console.error('Error verificando movimientos D:', error);
      this.movimientosDEncontrados = false;
    }
  }

  async ejecutarCierreMensual() {
    this.ngxService.startLoader('load-precierre');
    try {
      const d = this.fechaultimo.split('/');
      const fultimo = `${d[2]}-${d[1]}-${d[0]}`;

      // Verificar si ya se realizó el cierre mensual
      this.xAPI.funcion = environment.xApi.VERIFICAR_CIERRE_MENSUAL;
      this.xAPI.parametros = fultimo;
      this.xAPI.valores = '';
      const verif = await firstValueFrom(this.apiService.Ejecutar(this.xAPI));
      const total = verif?.Cuerpo?.[0]?.total ?? 0;

      if (parseInt(total, 10) > 0) {
        this.cierreMensualCompletado = true;
        this.ngxService.stopLoader('load-precierre');
        this.apiService.Mensaje(
          'Cierre Mensual Ya Realizado',
          `El cierre mensual del ${this.util.ConvertirFechaHumana(fultimo)} ya fue ejecutado`,
          'warning',
          'Cierre Mensual'
        );
        return;
      }

      // PASO 1: Borrar saldos del último día del mes (llave M)
      this.xAPI.funcion = environment.xApi.BORRAR_CIERRE_MENSUAL;
      this.xAPI.parametros = fultimo;
      this.xAPI.valores = '';
      await firstValueFrom(this.apiService.Ejecutar(this.xAPI));

      // PASO 2: Insertar saldos con llave D usando CrearSaldosAsync (mismo patrón que semestral)
      await this.CrearSaldosAsync('D');

      this.cierreMensualCompletado = true;
      this.ngxService.stopLoader('load-precierre');

      this.apiService.Mensaje(
        'Cierre Mensual Ejecutado',
        `El cierre mensual del ${this.util.ConvertirFechaHumana(fultimo)} se ejecutó correctamente`,
        'success',
        'Cierre Mensual'
      );
    } catch (error) {
      console.error(error);
      this.ngxService.stopLoader('load-precierre');
      this.apiService.Mensaje(
        'Error',
        'Error al ejecutar el cierre mensual',
        'error',
        'Cierre Mensual'
      );
    }
  }

  resetearEstadoCierreMensual() {
    this.cierreDiarioCompletado = false;
    this.interesesGenerados = false;
    this.precierreEjecutado = false;
    this.cierreMensualCompletado = false;
    this.movimientosDEncontrados = false;
    this.lstInteresesGenerados = [];
  }

}
