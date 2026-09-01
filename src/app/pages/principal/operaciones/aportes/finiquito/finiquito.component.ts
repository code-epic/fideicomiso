import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { FID_IComprobante, FID_IDetalleComprobante } from 'src/app/services/banfanb/comprobante.service';
import { CierreService } from 'src/app/services/banfanb/cierre.service';
import { FiniquitoService, InversionActiva, ComprobantePendiente, SaldoFiniquito, RegistroFiniquito } from 'src/app/services/banfanb/finiquito.service';
import { UtilService } from 'src/app/services/util/util.service';
import { PlanGuardService } from 'src/app/services/banfanb/plan-guard.service';
import { environment } from 'src/environments/environment';
import { ImprimirService } from 'src/app/services/util/imprimir.service';

interface PlanActivo {
  id: number;
  fideicomiso: string;
  tipo_fideicomiso: string;
  observacion: string;
}

@Component({
  selector: 'app-finiquito',
  templateUrl: './finiquito.component.html',
  styleUrls: ['./finiquito.component.scss']
})
export class FiniquitoComponent implements OnInit {

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: ''
  };

  public lstPlanes: PlanActivo[] = [];
  public planSeleccionado: PlanActivo | null = null;
  public fechaFiniquito: any;
  public fechaultimo: string = '';

  public saldos: Map<string, SaldoFiniquito> = new Map();
  public inversionesActivas: InversionActiva[] = [];
  public comprobantesPendientes: ComprobantePendiente[] = [];
  public errores: string[] = [];
  public validacionesPasadas: boolean = false;

  public procesando: boolean = false;
  public resultadoFiniquito: any = null;
  public yaFiniquitado: boolean = false;

  // IDs de comprobantes generados
  private idComprobantePasivos: number = 0;
  private idComprobanteResultado: number = 0;
  private idComprobanteFiniquito: number = 0;

  constructor(
    private apiService: ApiService,
    private ngxService: NgxUiLoaderService,
    private toastr: ToastrService,
    private util: UtilService,
    private cierre: CierreService,
    private finiquitoService: FiniquitoService,
    private _imprimir: ImprimirService
  ) { }

  async ngOnInit(): Promise<void> {
    this.cierre.getUltimoCierre().then(fecha => {
      this.fechaultimo = fecha;
    });
    await this.listarPlanesActivos();
  }

  async listarPlanesActivos(): Promise<void> {
    this.ngxService.startLoader('load-finiquito');
    this.xAPI.funcion = environment.xApi.CONSULTAR_PLANES_FIDEICOMISO;
    this.xAPI.parametros = '';
    this.xAPI.valores = '';

    try {
      const data: any = await this.apiService.Ejecutar(this.xAPI).toPromise();
      this.lstPlanes = (data?.Cuerpo || [])
        .map((p: any) => ({
          id: p.id,
          fideicomiso: p.fideicomiso,
          tipo_fideicomiso: p.tipo_fideicomiso,
          observacion: p.observacion
        }));
    } catch (error) {
      console.error(error);
      this.toastr.error('Error al cargar los planes de fideicomiso', 'Finiquito');
    } finally {
      this.ngxService.stopLoader('load-finiquito');
    }
  }

  async seleccionarPlan(plan: PlanActivo): Promise<void> {
    this.planSeleccionado = plan;
    this.resultadoFiniquito = null;
    this.validacionesPasadas = false;
    this.errores = [];
    this.saldos.clear();
    this.inversionesActivas = [];
    this.comprobantesPendientes = [];

    if (!plan) return;

    this.ngxService.startLoader('load-finiquito');
    try {
      const existe = await this.finiquitoService.consultarFiniquitoPlan(plan.id);
      this.yaFiniquitado = !!existe;

      if (this.yaFiniquitado && existe) {
        // Cargar saldos desde tabla finiquito
        this.saldos.set('711', { codigo_padre: '711', descripcion: 'Disponibilidad', saldo: existe.saldo_711 });
        this.saldos.set('722', { codigo_padre: '722', descripcion: 'Comisiones por pagar', saldo: existe.saldo_722 });
        this.saldos.set('731', { codigo_padre: '731', descripcion: 'Patrimonio asignado', saldo: existe.saldo_731 });
        this.saldos.set('734', { codigo_padre: '734', descripcion: 'Resultados acumulados', saldo: existe.saldo_734 });
        this.saldos.set('740', { codigo_padre: '740', descripcion: 'Gastos', saldo: existe.saldo_740 });
        this.saldos.set('750', { codigo_padre: '750', descripcion: 'Ingresos', saldo: existe.saldo_750 });

        // Cargar resultado para impresión
        this.resultadoFiniquito = {
          comprobante_pasivos: existe.comprobante_pasivos,
          comprobante_resultado: existe.comprobante_resultado,
          comprobante_finiquito: existe.comprobante_finiquito,
          remanente: existe.remanente,
          fecha_finiquito: existe.fecha_finiquito
        };
      } else {
        // Consultar saldos actuales
        const saldos = await this.finiquitoService.consultarSaldosPlan(plan.id);
        saldos.forEach(s => this.saldos.set(s.codigo_padre, s));
      }

      this.inversionesActivas = await this.finiquitoService.consultarInversionesActivasPlan(plan.id);
      this.comprobantesPendientes = await this.finiquitoService.consultarComprobantesPendientesPlan(plan.id);

      this.validarPrerrequisitos();
    } catch (error) {
      console.error(error);
      this.toastr.error('Error al consultar la información del plan', 'Finiquito');
    } finally {
      this.ngxService.stopLoader('load-finiquito');
    }
  }

  validarPrerrequisitos(): void {
    this.errores = [];

    if (this.yaFiniquitado) {
      this.errores.push('El plan seleccionado ya posee un finiquito registrado.');
    }

    if (!this.fechaFiniquito) {
      this.errores.push('Debe seleccionar la fecha de finiquito.');
    } else {
      const fechaOperacion = this.util.ConvertirFechaDB(this.fechaFiniquito);
      const fechaCierreDB = this.util.ConvertirFechaDB(this.fechaultimo);
      if (fechaCierreDB && fechaOperacion && fechaOperacion <= fechaCierreDB) {
        this.errores.push(`La fecha de finiquito (${fechaOperacion}) debe ser posterior al último cierre (${fechaCierreDB}).`);
      }
    }

    if (this.inversionesActivas.length > 0) {
      this.errores.push(`Existen ${this.inversionesActivas.length} inversiones activas asociadas al plan. Deben liquidarse previamente.`);
    }

    if (this.comprobantesPendientes.length > 0) {
      this.errores.push(`Existen ${this.comprobantesPendientes.length} comprobantes pendientes en el plan.`);
    }

    const saldo711 = this.getSaldo('711');
    const saldo722 = this.getSaldo('722');
    const saldo731 = this.getSaldo('731');

    if (saldo711 <= 0) {
      this.errores.push('La disponibilidad (711) no presenta saldo positivo. No hay fondos para liquidar.');
    }

    if (saldo731 <= 0) {
      this.errores.push('El patrimonio asignado (731) no presenta saldo positivo.');
    }

    this.validacionesPasadas = this.errores.length === 0;
  }

  getSaldo(codigo: string): number {
    return this.saldos.has(codigo) ? parseFloat(this.saldos.get(codigo)!.saldo as any) || 0 : 0;
  }

  get remanente(): number {
    return this.getSaldo('711') - this.getSaldo('722');
  }

  get fechaOperacionFormateada(): string {
    return this.fechaFiniquito ? this.util.ConvertirFechaDB(this.fechaFiniquito) : '';
  }

  async procesarFiniquito(): Promise<void> {
    this.validarPrerrequisitos();
    if (!this.validacionesPasadas || !this.planSeleccionado) return;

    const confirm = await Swal.fire({
      title: '¿Confirmar finiquito?',
      text: `Se procederá a liquidar el plan ${this.planSeleccionado.observacion}. Esta acción generará comprobantes contables y cambiará el estatus del plan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Procesar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirm.isConfirmed) return;

    this.procesando = true;
    this.ngxService.startLoader('load-finiquito');

    try {
      const planId = this.planSeleccionado.id;
      const fecha = this.fechaOperacionFormateada;

      // 1. Liquidar pasivos (722 -> 711)
      const saldo722 = this.getSaldo('722');
      if (saldo722 > 0) {
        this.idComprobantePasivos = await this.crearComprobante(planId, fecha, 'FINIQUITO - LIQUIDACION DE PASIVOS', saldo722);
        await this.crearDetalle(this.idComprobantePasivos, planId, fecha, 14, saldo722, 0); // DEBE 722.01
        await this.crearDetalle(this.idComprobantePasivos, planId, fecha, 3, 0, saldo722);  // HABER 711.02
      } else {
        this.idComprobantePasivos = 0;
      }

      // 2. Cerrar resultados del ejercicio (740/750 -> 734)
      const saldo740 = this.getSaldo('740');
      const saldo750 = this.getSaldo('750');
      if (saldo740 > 0 || saldo750 > 0) {
        const montoResultado = saldo740 + saldo750;
        this.idComprobanteResultado = await this.crearComprobante(planId, fecha, 'FINIQUITO - CIERRE DE RESULTADOS', montoResultado);
        if (saldo740 > 0) {
          await this.crearDetalle(this.idComprobanteResultado, planId, fecha, 21, 0, saldo740); // HABER 740
          await this.crearDetalle(this.idComprobanteResultado, planId, fecha, 20, saldo740, 0); // DEBE 734
        }
        if (saldo750 > 0) {
          await this.crearDetalle(this.idComprobanteResultado, planId, fecha, 26, saldo750, 0); // DEBE 750
          await this.crearDetalle(this.idComprobanteResultado, planId, fecha, 40, 0, saldo750); // HABER 734
        }
      } else {
        this.idComprobanteResultado = 0;
      }

      // 3. Comprobante de finiquito (cancelar patrimonio y resultados contra disponibilidad)
      const saldo731 = this.getSaldo('731');
      const saldo734 = this.getSaldo('734');
      const totalCancelar = saldo731 + saldo734;
      if (totalCancelar > 0) {
        this.idComprobanteFiniquito = await this.crearComprobante(planId, fecha, 'FINIQUITO - CANCELACION DE PATRIMONIO Y RESULTADOS', totalCancelar);
        if (saldo731 > 0) {
          await this.crearDetalle(this.idComprobanteFiniquito, planId, fecha, 19, saldo731, 0); // DEBE 731
        }
        if (saldo734 > 0) {
          await this.crearDetalle(this.idComprobanteFiniquito, planId, fecha, 20, saldo734, 0); // DEBE 734
        }
        await this.crearDetalle(this.idComprobanteFiniquito, planId, fecha, 3, 0, totalCancelar); // HABER 711
      } else {
        this.idComprobanteFiniquito = 0;
      }

      // 4. Cambiar estatus del plan a finiquitado (asumimos estatus 3)
      const observacionOriginal = this.planSeleccionado?.observacion || ''
      const observacionFiniquito = observacionOriginal + ' [FINIQUITADO - ' + fecha + ']'
      await this.finiquitoService.cambiarEstatusPlan(planId, 3, observacionFiniquito);

      // 5. Registrar finiquito
      const registro: RegistroFiniquito = {
        id_plan: planId,
        fecha_finiquito: fecha,
        saldo_711: this.getSaldo('711'),
        saldo_722: saldo722,
        saldo_731: saldo731,
        saldo_734: saldo734,
        saldo_740: saldo740,
        saldo_750: saldo750,
        remanente: this.getSaldo('711') - saldo722,
        comprobante_pasivos: this.idComprobantePasivos,
        comprobante_resultado: this.idComprobanteResultado,
        comprobante_finiquito: this.idComprobanteFiniquito,
        estatus: 'COMPLETADO',
        usuario: 'sistema'
      };
      await this.finiquitoService.registrarFiniquito(registro);

      this.resultadoFiniquito = registro;
      this.toastr.success('Finiquito procesado exitosamente', 'Finiquito');
      await this.listarPlanesActivos();
    } catch (error) {
      console.error(error);
      this.toastr.error('Ocurrió un error durante el procesamiento del finiquito', 'Finiquito');
    } finally {
      this.procesando = false;
      this.ngxService.stopLoader('load-finiquito');
    }
  }

  private async crearComprobante(planId: number, fecha: string, descripcion: string, monto: number): Promise<number> {
    const comprobante: FID_IComprobante = {
      plan: planId,
      codigo: '',
      descripcion: descripcion,
      detalle: this.planSeleccionado?.observacion || '',
      fecha_operacion: fecha,
      fecha_ejercicio: fecha,
      debe: monto,
      haber: monto,
      llave: 'M'
    };
    return await this.finiquitoService.insertarComprobante(comprobante);
  }

  private async crearDetalle(idComprobante: number, planId: number, fecha: string, cuenta: number, debe: number, haber: number): Promise<void> {
    const detalle: FID_IDetalleComprobante = {
      id_comprobante: idComprobante,
      cuenta: cuenta,
      debe: debe,
      haber: haber,
      fecha_operacion: fecha,
      fecha_ejercicio: fecha,
      plan: planId
    };
    await this.finiquitoService.insertarDetalleComprobante(detalle);
  }

  getDescripcionCuenta(codigo: string): string {
    return this.saldos.has(codigo) ? this.saldos.get(codigo)!.descripcion : codigo;
  }

  formatearMonto(monto: number): string {
    return this.util.ConvertirMoneda(monto);
  }

  limpiarNombrePlan(observacion: string): string {
    if (!observacion) return ''
    // Limpiar formato: "30513493|adrian campos prueba [FINIQUITADO - 2026-08-04]"
    let nombre = observacion.split('|')[0].trim()
    nombre = nombre.replace(/\s*\[FINIQUITADO.*\]/i, '').trim()
    return nombre
  }

  imprimirActa(): void {
    if (!this.resultadoFiniquito || !this.planSeleccionado) return;

    const plan = this.planSeleccionado;
    const fecha = this.resultadoFiniquito.fecha_finiquito || this.fechaOperacionFormateada;
    const nombreLimpio = this.limpiarNombrePlan(plan.observacion)
    const cedula = plan.observacion.split('|')[0]?.trim() || ''
    const remanente = this.getSaldo('711') - this.getSaldo('722')

    // Tabla de saldos
    let filasSaldos = ''
    const saldo711 = this.getSaldo('711')
    const saldo722 = this.getSaldo('722')
    const saldo731 = this.getSaldo('731')
    const saldo734 = this.getSaldo('734')
    const saldo740 = this.getSaldo('740')
    const saldo750 = this.getSaldo('750')

    if (saldo711 !== 0) {
      filasSaldos += `<tr><td style="padding: 6px 8px; text-align: left;">Saldo disponible en cuenta operativa (711)</td><td style="padding: 6px 8px; text-align: right;">${this.formatearMonto(saldo711)}</td></tr>`
    }
    if (saldo722 !== 0) {
      filasSaldos += `<tr><td style="padding: 6px 8px; text-align: left;">Comisiones administrativas por pagar (722)</td><td style="padding: 6px 8px; text-align: right; color: #c62828;">(-) ${this.formatearMonto(saldo722)}</td></tr>`
    }
    if (saldo731 !== 0) {
      filasSaldos += `<tr><td style="padding: 6px 8px; text-align: left;">Patrimonio asignado (731)</td><td style="padding: 6px 8px; text-align: right;">${this.formatearMonto(saldo731)}</td></tr>`
    }
    if (saldo734 !== 0) {
      filasSaldos += `<tr><td style="padding: 6px 8px; text-align: left;">Resultados acumulados (734)</td><td style="padding: 6px 8px; text-align: right;">${this.formatearMonto(saldo734)}</td></tr>`
    }
    if (saldo740 !== 0) {
      filasSaldos += `<tr><td style="padding: 6px 8px; text-align: left;">Gastos del fideicomiso (740)</td><td style="padding: 6px 8px; text-align: right;">${this.formatearMonto(saldo740)}</td></tr>`
    }
    if (saldo750 !== 0) {
      filasSaldos += `<tr><td style="padding: 6px 8px; text-align: left;">Ingresos del fideicomiso (750)</td><td style="padding: 6px 8px; text-align: right;">${this.formatearMonto(saldo750)}</td></tr>`
    }

    filasSaldos += `
      <tr style="background-color: #eeeee4; font-weight: bold;">
        <td style="padding: 6px 8px; text-align: left;">REMANENTE A DEVOLVER (711 - 722)</td>
        <td style="padding: 6px 8px; text-align: right;">${this.formatearMonto(remanente)}</td>
      </tr>`

    // Comprobantes (solo mostrar los que existen)
    let comprobantes = ''
    if (this.resultadoFiniquito.comprobante_pasivos && this.resultadoFiniquito.comprobante_pasivos > 0) {
      comprobantes += `<li>Liquidación de comisiones administrativas: Comprobante #${this.resultadoFiniquito.comprobante_pasivos}</li>`
    }
    if (this.resultadoFiniquito.comprobante_resultado && this.resultadoFiniquito.comprobante_resultado > 0) {
      comprobantes += `<li>Cierre de resultados del ejercicio: Comprobante #${this.resultadoFiniquito.comprobante_resultado}</li>`
    }
    if (this.resultadoFiniquito.comprobante_finiquito && this.resultadoFiniquito.comprobante_finiquito > 0) {
      comprobantes += `<li>Cancelación de patrimonio asignado: Comprobante #${this.resultadoFiniquito.comprobante_finiquito}</li>`
    }

    const contenido = `
      <div style="font-family: 'Roboto', sans-serif; font-size: 13px; color: #333; padding: 0; margin: 0;">

        <div style="text-align: center;">
          <img src="./assets/img/brand/logo.png" style="max-width: 200px; height: auto;">
        </div>
        <div style="text-align: center;">
          <p style="font-weight: 700; font-size: 14px; margin: 1px 0;">BANCO DE LA FUERZA ARMADA NACIONAL BOLIVARIANA</p>
          <p style="font-weight: 500; font-size: 12px; margin: 0; color: #555;">DIRECCION DE FIDEICOMISO</p>
        </div>
        <hr style="border: none; border-top: 2px solid #1a237e; margin: 3px 0;">
        <div style="text-align: center;">
          <p style="font-weight: 700; font-size: 13px; margin: 1px 0;">ACTA DE FINIQUITO Y LIQUIDACION DEFINITIVA</p>
          <p style="font-weight: 500; font-size: 12px; margin: 0;">Fecha de liquidación: ${fecha}</p>
        </div>

        <div style="margin-top: 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 3px 0; font-weight: 600; width: 180px;">Fideicomiso:</td>
              <td style="padding: 3px 0;">${nombreLimpio}</td>
            </tr>
            <tr>
              <td style="padding: 3px 0; font-weight: 600;">Cédula/RIF:</td>
              <td style="padding: 3px 0;">${cedula}</td>
            </tr>
            <tr>
              <td style="padding: 3px 0; font-weight: 600;">Fecha de constitución:</td>
              <td style="padding: 3px 0;">${fecha}</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 12px;">
          <p style="margin: 2px 0; font-weight: 600;">I. RESUMEN DE LIQUIDACION</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
            <thead>
              <tr style="background-color: #eeeee4;">
                <th style="padding: 6px 8px; text-align: left; font-weight: 600;">Concepto</th>
                <th style="padding: 6px 8px; text-align: right; font-weight: 600;">Monto (Bs.)</th>
              </tr>
            </thead>
            <tbody>
              ${filasSaldos}
            </tbody>
          </table>
        </div>

        <div style="margin-top: 12px;">
          <p style="margin: 2px 0; font-weight: 600;">II. COMPROBANTES CONTABLES GENERADOS</p>
          <ul style="margin: 5px 0; padding-left: 20px;">
            ${comprobantes || '<li>No se generaron comprobantes adicionales</li>'}
          </ul>
        </div>

        <div style="margin-top: 12px;">
          <p style="margin: 2px 0; font-weight: 600;">III. DATOS DEL DESEMBOLSO</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 3px 0; font-weight: 600; width: 180px;">Banco destino:</td>
              <td style="padding: 3px 0;">_______________________</td>
            </tr>
            <tr>
              <td style="padding: 3px 0; font-weight: 600;">Cuenta receptora:</td>
              <td style="padding: 3px 0;">_______________________</td>
            </tr>
            <tr>
              <td style="padding: 3px 0; font-weight: 600;">Referencia de transferencia:</td>
              <td style="padding: 3px 0;">_______________________</td>
            </tr>
            <tr>
              <td style="padding: 3px 0; font-weight: 600;">Monto transferido:</td>
              <td style="padding: 3px 0; font-weight: 700;">${this.formatearMonto(remanente)} Bs.</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 12px;">
          <p style="margin: 2px 0; text-align: justify;">
            Con la firma del presente documento, las partes declaran extinguidas todas las obligaciones
            derivadas del contrato de fideicomiso identificado como <strong>${nombreLimpio}</strong>,
            quedando cancelados los pasivos, el patrimonio asignado y los resultados acumulados.
          </p>
        </div>

      </div>

      <div style="font-family: 'Roboto', sans-serif; font-size: 12px; color: #333; padding: 0; margin: 0;">
        <div style="margin-top: 60px; display: flex; justify-content: space-between;">
          <div style="width: 45%; text-align: center;">
            <hr style="border: none; border-top: 1px solid #333; margin-bottom: 0.5rem;">
            <p style="font-weight: 600; font-size: 12px; margin: 0;">POR EL FIDUCIARIO</p>
            <p style="font-weight: 500; font-size: 11px; margin: 2px 0; color: #555;">BANFANB - Dirección de Fideicomiso</p>
            <p style="font-weight: 500; font-size: 11px; margin: 2px 0;">Tcnel. Carlos Contreras</p>
            <p style="font-weight: 500; font-size: 11px; margin: 2px 0; color: #555;">C.I. V-________</p>
          </div>
          <div style="width: 45%; text-align: center;">
            <hr style="border: none; border-top: 1px solid #333; margin-bottom: 0.5rem;">
            <p style="font-weight: 600; font-size: 12px; margin: 0;">POR EL FIDEICOMITENTE</p>
            <p style="font-weight: 500; font-size: 11px; margin: 2px 0; color: #555;">${nombreLimpio}</p>
            <p style="font-weight: 500; font-size: 11px; margin: 2px 0;">C.I./RIF: ${cedula}</p>
            <p style="font-weight: 500; font-size: 11px; margin: 2px 0; color: #555;">Firma y sello de recepción conforme</p>
          </div>
        </div>
      </div>
    `;

    this._imprimir.createHtmlSectionForPrint(contenido, 0);
  }
}
