import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { FID_IComprobante, FID_IDetalleComprobante } from 'src/app/services/banfanb/comprobante.service';
import { CierreService } from 'src/app/services/banfanb/cierre.service';
import {
  FiniquitoService,
  InversionActiva,
  ComprobantePendiente,
  SaldoFiniquito,
  RegistroFiniquito,
  DiagnosticoFiniquito,
  CuentaNominal
} from 'src/app/services/banfanb/finiquito.service';
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

  // Datos del diagnostico
  public diagnostico: DiagnosticoFiniquito | null = null;

  // Campos nuevos de desembolso
  public numeroOficio: string = '';
  public bancoDestino: string = '';
  public cuentaDestino: string = '';
  public referencia: string = '';

  // IDs de comprobantes generados
  private idComprobanteIntereses: number = 0;
  private idComprobantePasivos: number = 0;
  private idComprobanteResultado: number = 0;
  private idComprobanteFiniquito: number = 0;

  // TODO (Fase 2): Reemplazar por filtro dinámico por fecha_cierre/periodo via API FID_CSeCuentasNominalesPlan
  private static readonly CUENTAS_EXCLUIDAS_NOMINALES: number[] = [];

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
        .filter((p: any) => p.estatus !== 3 && p.estatus !== 4)
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
    this.diagnostico = null;
    this.numeroOficio = '';
    this.bancoDestino = '';
    this.cuentaDestino = '';
    this.referencia = '';

    if (!plan) return;

    this.ngxService.startLoader('load-finiquito');
    try {
      const existe = await this.finiquitoService.consultarFiniquitoPlan(plan.id);
      this.yaFiniquitado = !!existe;

      if (this.yaFiniquitado && existe) {
        this.saldos.set('711', { codigo_padre: '711', descripcion: 'Disponibilidad', saldo: existe.saldo_711 });
        this.saldos.set('722', { codigo_padre: '722', descripcion: 'Comisiones por pagar', saldo: existe.saldo_722 });
        this.saldos.set('731', { codigo_padre: '731', descripcion: 'Patrimonio asignado', saldo: existe.saldo_731 });
        this.saldos.set('734', { codigo_padre: '734', descripcion: 'Resultados acumulados', saldo: existe.saldo_734 });
        this.saldos.set('740', { codigo_padre: '740', descripcion: 'Gastos', saldo: existe.saldo_740 });
        this.saldos.set('750', { codigo_padre: '750', descripcion: 'Ingresos', saldo: existe.saldo_750 });
        this.resultadoFiniquito = {
          comprobante_intereses: existe.comprobante_intereses,
          comprobante_pasivos: existe.comprobante_pasivos,
          comprobante_resultado: existe.comprobante_resultado,
          comprobante_finiquito: existe.comprobante_finiquito,
          remanente: existe.remanente,
          fecha_finiquito: existe.fecha_finiquito,
          monto_liquidacion: existe.monto_liquidacion,
          intereses_disponibilidad: existe.intereses_disponibilidad,
          numero_oficio: existe.numero_oficio,
          banco_destino: existe.banco_destino,
          cuenta_destino: existe.cuenta_destino,
          referencia: existe.referencia
        };
      } else {
        // Consultar diagnostico completo
        if (this.fechaFiniquito) {
          await this.cargarDiagnostico(plan.id, this.util.ConvertirFechaDB(this.fechaFiniquito));
        } else {
          const saldos = await this.finiquitoService.consultarSaldosPlan(plan.id);
          saldos.forEach(s => this.saldos.set(s.codigo_padre, s));
        }
      }

      const fechaConsulta = this.fechaFiniquito ? this.util.ConvertirFechaDB(this.fechaFiniquito) : undefined;
      this.inversionesActivas = await this.finiquitoService.consultarInversionesActivasPlan(plan.id, fechaConsulta);
      this.comprobantesPendientes = await this.finiquitoService.consultarComprobantesPendientesPlan(plan.id);

      this.validarPrerrequisitos();
    } catch (error) {
      console.error(error);
      this.toastr.error('Error al consultar la información del plan', 'Finiquito');
    } finally {
      this.ngxService.stopLoader('load-finiquito');
    }
  }

  async onFechaChange(): Promise<void> {
    if (this.planSeleccionado && this.fechaFiniquito) {
      const fecha = this.util.ConvertirFechaDB(this.fechaFiniquito);
      if (fecha) {
        await this.cargarDiagnostico(this.planSeleccionado.id, fecha);
        // Reconsultar inversiones activas con la nueva fecha para filtrar vencidas
        this.inversionesActivas = await this.finiquitoService.consultarInversionesActivasPlan(this.planSeleccionado.id, fecha);
      }
    }
    this.validarPrerrequisitos();
  }

  private async cargarDiagnostico(planId: number, fecha: string): Promise<void> {
    try {
      this.diagnostico = await this.finiquitoService.consultarDiagnostico(planId, fecha);
      if (this.diagnostico) {
        this.saldos.clear();
        this.saldos.set('711', { codigo_padre: '711', descripcion: 'Disponibilidad', saldo: this.diagnostico.saldo_711 });
        this.saldos.set('712', { codigo_padre: '712', descripcion: 'Inversiones', saldo: this.diagnostico.saldo_712 });
        this.saldos.set('714', { codigo_padre: '714', descripcion: 'Rendimientos por cobrar', saldo: this.diagnostico.saldo_714 });
        this.saldos.set('722', { codigo_padre: '722', descripcion: 'Comisiones por pagar', saldo: this.diagnostico.saldo_722 });
        this.saldos.set('731', { codigo_padre: '731', descripcion: 'Patrimonio asignado', saldo: this.diagnostico.saldo_731 });
        this.saldos.set('734', { codigo_padre: '734', descripcion: 'Resultados acumulados', saldo: this.diagnostico.saldo_734 });
        this.saldos.set('740', { codigo_padre: '740', descripcion: 'Gastos', saldo: this.diagnostico.saldo_740 });
        this.saldos.set('744', { codigo_padre: '744', descripcion: 'Gastos por administración', saldo: this.diagnostico.saldo_744 });
        this.saldos.set('750', { codigo_padre: '750', descripcion: 'Ingresos', saldo: this.diagnostico.saldo_750 });
        this.saldos.set('751', { codigo_padre: '751', descripcion: 'Ingresos financieros', saldo: this.diagnostico.saldo_751 });
        this.saldos.set('752', { codigo_padre: '752', descripcion: 'Ingresos por recuperación', saldo: this.diagnostico.saldo_752 });
      }
    } catch (error) {
      console.error('Error al cargar diagnóstico:', error);
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

    // Validaciones bloqueantes nuevas
    const saldo712 = this.getSaldo('712');
    if (saldo712 > 0) {
      this.errores.push(`El plan presenta inversiones pendientes (712 = ${this.formatearMonto(saldo712)}). Deben liquidarse antes del finiquito.`);
    }

    const saldo714 = this.getSaldo('714');
    if (saldo714 > 0) {
      this.errores.push(`El plan presenta rendimientos por cobrar no conciliados (714 = ${this.formatearMonto(saldo714)}). Requieren conciliación previa.`);
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

    // Validar campos de desembolso requeridos
    if (!this.numeroOficio || this.numeroOficio.trim() === '') {
      this.errores.push('Debe ingresar el número de oficio/acta de finiquito.');
    }
    if (!this.bancoDestino || this.bancoDestino.trim() === '') {
      this.errores.push('Debe ingresar el banco destino para la transferencia.');
    }
    if (!this.cuentaDestino || this.cuentaDestino.trim() === '') {
      this.errores.push('Debe ingresar la cuenta destino para la transferencia.');
    }

    this.validacionesPasadas = this.errores.length === 0;
  }

  getSaldo(codigo: string): number {
    return this.saldos.has(codigo) ? parseFloat(this.saldos.get(codigo)!.saldo as any) || 0 : 0;
  }

  get remanente(): number {
    return this.getSaldo('711') - this.getSaldo('722');
  }

  get montoLiquidacion(): number {
    const intereses = this.diagnostico?.intereses_proyectados || 0;
    return this.getSaldo('711') + intereses - this.getSaldo('722');
  }

  get fechaOperacionFormateada(): string {
    return this.fechaFiniquito ? this.util.ConvertirFechaDB(this.fechaFiniquito) : '';
  }

  get nominalesConSaldo(): { codigo: string; descripcion: string; saldo: number; aumenta: string }[] {
    const grupos = ['740', '744', '750', '751', '752'];
    const resultado: { codigo: string; descripcion: string; saldo: number; aumenta: string }[] = [];
    for (const g of grupos) {
      const s = this.getSaldo(g);
      if (s !== 0) {
        const desc = this.saldos.get(g)?.descripcion || g;
        const aumenta = (g === '740' || g === '744') ? 'DEBE' : 'HABER';
        resultado.push({ codigo: g, descripcion: desc, saldo: s, aumenta });
      }
    }
    return resultado;
  }

  get saldo734Final(): number {
    const saldo734Previo = this.getSaldo('734');
    let resultado = saldo734Previo;
    for (const n of this.nominalesConSaldo) {
      if (n.aumenta === 'HABER') {
        resultado += n.saldo;
      } else {
        resultado -= n.saldo;
      }
    }
    return resultado;
  }

  async procesarFiniquito(): Promise<void> {
    this.validarPrerrequisitos();
    if (!this.validacionesPasadas || !this.planSeleccionado) return;

    // Re-validar contra la BD para evitar finiquito doble
    try {
      const existe = await this.finiquitoService.consultarFiniquitoPlan(this.planSeleccionado.id);
      if (existe) {
        this.yaFiniquitado = true;
        this.toastr.error('Este plan ya fue finiquitado previamente.', 'Finiquito');
        return;
      }
    } catch (e) {
      console.error('[Finiquito] Error re-validando finiquito existente:', e);
    }

    // Saldos para el diálogo de confirmación (se refrescan dentro del try)
    const saldo711Confirm = this.getSaldo('711');
    const saldo722Confirm = this.getSaldo('722');
    const interesesConfirm = this.diagnostico?.intereses_proyectados || 0;
    const montoLiquidacionConfirm = this.montoLiquidacion;

    const confirm = await Swal.fire({
      title: '¿Confirmar finiquito?',
      html: `
        <div style="text-align: left; font-size: 13px;">
          <p><strong>Plan:</strong> ${this.planSeleccionado.observacion}</p>
          <p><strong>Fecha:</strong> ${this.fechaOperacionFormateada}</p>
          <table style="width: 100%; margin-top: 8px;">
            <tr><td>Disponibilidad (711)</td><td style="text-align: right;">${this.formatearMonto(saldo711Confirm)}</td></tr>
            ${interesesConfirm > 0 ? `<tr><td>Intereses por disponibilidad</td><td style="text-align: right;">+ ${this.formatearMonto(interesesConfirm)}</td></tr>` : ''}
            ${saldo722Confirm > 0 ? `<tr><td>Comisiones por pagar (722)</td><td style="text-align: right; color: #c62828;">- ${this.formatearMonto(saldo722Confirm)}</td></tr>` : ''}
            <tr style="font-weight: bold; border-top: 1px solid #ccc;"><td>Monto a transferir</td><td style="text-align: right;">${this.formatearMonto(montoLiquidacionConfirm)}</td></tr>
          </table>
          <p style="margin-top: 8px;"><strong>Banco:</strong> ${this.bancoDestino}</p>
          <p><strong>Cuenta:</strong> ${this.cuentaDestino}</p>
        </div>
      `,
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

      // Blindar diagnóstico: recargar para asegurar intereses_proyectados
      try {
        this.diagnostico = await this.finiquitoService.consultarDiagnostico(planId, fecha);
      } catch (e) {
        console.error('[Finiquito] Error recargando diagnóstico, fallback cálculo directo:', e);
      }
      if (!this.diagnostico || !this.diagnostico.intereses_proyectados) {
        // Fallback: calcular saldo_711 × tasa/100/360 × días(1° mes → corte)
        const tasa = this.diagnostico?.tasa || 2.00;
        // Parsear como componentes locales para evitar desfase UTC
        const partes = fecha.split('-').map(Number);
        const fechaFinDate = new Date(partes[0], partes[1] - 1, partes[2]);
        // int_inicio = 1° del mes de la fecha de finiquito
        const intInicio = new Date(partes[0], partes[1] - 1, 1);
        const intDias = Math.floor((fechaFinDate.getTime() - intInicio.getTime()) / 86400000);
        const saldo711 = this.getSaldo('711');
        const interesesCalc = saldo711 * tasa / 100 / 360 * intDias;
        if (!this.diagnostico) {
          this.diagnostico = {} as any;
        }
        this.diagnostico.intereses_proyectados = Math.round(interesesCalc * 100) / 100;
        this.diagnostico.tasa = tasa;
        this.diagnostico.ultimo_cierre = this.diagnostico?.ultimo_cierre || this.fechaultimo;
        console.log('[Finiquito] Fallback cálculo intereses:', { saldo711, tasa, intDias, intInicio: fecha.split('-').slice(0, 2).join('-') + '-01', interesesCalc: this.diagnostico.intereses_proyectados });
      }

      // Recalcular saldos frescos del diagnóstico
      const saldo711 = this.getSaldo('711');
      const saldo722 = this.getSaldo('722');
      const saldo731 = this.getSaldo('731');
      const saldo734 = this.getSaldo('734');
      const saldo740 = this.getSaldo('740');
      const saldo744 = this.getSaldo('744');
      const saldo750 = this.getSaldo('750');
      const saldo751 = this.getSaldo('751');
      const saldo752 = this.getSaldo('752');
      const saldo712 = this.getSaldo('712');
      const saldo714 = this.getSaldo('714');
      const intereses = this.diagnostico?.intereses_proyectados || 0;
      const montoLiquidacion = this.montoLiquidacion;

      // Limpieza defensiva (idempotencia)
      await this.compensarSilencioso(planId, fecha);

      // C1: Intereses por disponibilidad — cuenta canónica 53 (ingresos por disponibilidades)
      this.idComprobanteIntereses = 0;
      if (intereses > 0) {
        this.idComprobanteIntereses = await this.crearComprobante(planId, fecha, 'FINIQUITO - INTERESES POR DISPONIBILIDAD', intereses);
        await this.crearDetalle(this.idComprobanteIntereses, planId, fecha, 3, intereses, 0);  // DEBE 711.02
        await this.crearDetalle(this.idComprobanteIntereses, planId, fecha, 53, 0, intereses);  // HABER 751 (ingresos por disponibilidades)
      }

      // C2: Liquidar pasivos
      this.idComprobantePasivos = 0;
      if (saldo722 > 0) {
        this.idComprobantePasivos = await this.crearComprobante(planId, fecha, 'FINIQUITO - LIQUIDACION DE PASIVOS', saldo722);
        await this.crearDetalle(this.idComprobantePasivos, planId, fecha, 14, saldo722, 0);  // DEBE 722.01
        await this.crearDetalle(this.idComprobantePasivos, planId, fecha, 3, 0, saldo722);    // HABER 711.02
      }

      // C3: Refundición de resultados — consulta cuentas leaf con saldo ≠ 0
      this.idComprobanteResultado = 0;
      const cuentasNominales = await this.finiquitoService.consultarCuentasNominalesPlan(planId);
      console.log('[Finiquito] C3 cuentas nominales (raw):', cuentasNominales.length, cuentasNominales);

      // Excluir cuentas de ejercicio cerrado anterior (solo período corriente)
      const cuentasParaC3 = cuentasNominales.filter(
        c => !FiniquitoComponent.CUENTAS_EXCLUIDAS_NOMINALES.includes(Number(c.id_cuenta)) && Number(c.saldo) !== 0
      );

      // Ajustar hoja 53 con intereses de C1 (mismos que se acreditaron en HABER 53)
      if (intereses > 0) {
        const existe = cuentasParaC3.find(c => c.id_cuenta === 53);
        if (existe) {
          existe.saldo += intereses;
        } else {
          cuentasParaC3.push({ id_cuenta: 53, codigo_padre: '751', descripcion: 'ingresos por disponibilidades', aumenta: 'HABER', saldo: intereses });
        }
        // Actualizar saldo 751 en el mapa para display (grupo = 28 + 53 ajustado)
        const saldo28 = this.getSaldo('751'); // valor original del diagnostico (incluye 28+53)
        const saldo53ajustado = cuentasParaC3.find(c => c.id_cuenta === 53)?.saldo || 0;
        // El grupo 751 = saldo28(que incluye 53 original) - 53_original + 53_ajustado
        // Simpler: grupo 751 = saldo28 + intereses (porque 53_está ya en saldo28)
        this.saldos.set('751', { codigo_padre: '751', descripcion: 'ingresos financieros', saldo: saldo28 + intereses });
        console.log('[Finiquito] C3 ajuste intereses en hoja 53:', { intereses, saldo751Grupo: saldo28 + intereses });
      }

      console.log('[Finiquito] C3 cuentas para refundición:', cuentasParaC3.length, cuentasParaC3);

      if (cuentasParaC3.length > 0) {
        let totalRefundicion = 0;
        for (const c of cuentasParaC3) {
          totalRefundicion += c.saldo;
        }
        this.idComprobanteResultado = await this.crearComprobante(planId, fecha, 'FINIQUITO - REFUNDICION DE RESULTADOS', Math.abs(totalRefundicion));
        for (const c of cuentasParaC3) {
          if (c.aumenta === 'HABER') {
            await this.crearDetalle(this.idComprobanteResultado, planId, fecha, c.id_cuenta, c.saldo, 0);
            await this.crearDetalle(this.idComprobanteResultado, planId, fecha, 40, 0, c.saldo);
          } else {
            await this.crearDetalle(this.idComprobanteResultado, planId, fecha, 40, c.saldo, 0);
            await this.crearDetalle(this.idComprobanteResultado, planId, fecha, c.id_cuenta, 0, c.saldo);
          }
        }
      } else {
        console.error('[Finiquito] C3: No se encontraron cuentas nominales con saldo ≠ 0');
        throw new Error('No se encontraron cuentas nominales con saldo para la refundición. Verifique que existan saldos en las cuentas 740/744/750/751/752.');
      }

      // C4: Extinción patrimonial — solo 731 + 734 + 711 (sin cuentas 751)
      this.idComprobanteFiniquito = 0;
      const saldo734Previo = this.getSaldo('734');
      let netoRefundicion734 = 0;
      for (const c of cuentasParaC3) {
        if (c.aumenta === 'HABER') netoRefundicion734 += c.saldo;
        else netoRefundicion734 -= c.saldo;
      }
      const saldo734PostC3 = saldo734Previo + netoRefundicion734;
      const monto711 = this.montoLiquidacion;
      const debe731C4 = saldo731 > 0 ? saldo731 : 0;
      const haber734C4 = saldo734PostC3 < 0 ? Math.abs(saldo734PostC3) : 0;
      const debe734C4 = saldo734PostC3 > 0 ? saldo734PostC3 : 0;

      this.idComprobanteFiniquito = await this.crearComprobante(planId, fecha, 'FINIQUITO - CANCELACION DE PATRIMONIO Y RESULTADOS', Math.max(debe731C4, monto711));
      if (debe731C4 > 0) {
        await this.crearDetalle(this.idComprobanteFiniquito, planId, fecha, 19, debe731C4, 0);  // DEBE 731.02
      }
      if (debe734C4 > 0) {
        await this.crearDetalle(this.idComprobanteFiniquito, planId, fecha, 40, debe734C4, 0);
      }
      if (haber734C4 > 0) {
        await this.crearDetalle(this.idComprobanteFiniquito, planId, fecha, 40, 0, haber734C4);  // HABER 734 (absorción pérdida)
      }
      await this.crearDetalle(this.idComprobanteFiniquito, planId, fecha, 3, 0, monto711);  // HABER 711.02 (disponibilidad neta)
      console.log('[Finiquito] C4:', { debe731C4, debe734C4, haber734C4, monto711, DR: debe731C4 + debe734C4, CR: monto711 + haber734C4 });

      // Paso 5: Copiar detalles de finiquito a movimientos (plan-scoped)
      await this.finiquitoService.insertarMovimientosFiniquito(planId, fecha, 'M');

      // Paso 6: Regenerar saldos del plan en fecha de finiquito
      await this.regenerarSaldos(planId, fecha);

      // Paso 7: Verificar balance cero
      const balanceOk = await this.verificarBalanceCero(planId, fecha);
      if (!balanceOk) {
        await this.compensar(planId, fecha);
        throw new Error('La verificación de balance cero falló. Se revirtieron los cambios.');
      }

      // Paso 8: Registrar finiquito (ANTES de cambiar estatus para evitar estado inconsistente)
      const registro: RegistroFiniquito = {
        id_plan: planId,
        fecha_finiquito: fecha,
        saldo_711: saldo711,
        saldo_722: saldo722,
        saldo_731: saldo731,
        saldo_734: saldo734,
        saldo_740: saldo740,
        saldo_750: saldo750,
        remanente: this.remanente,
        comprobante_pasivos: this.idComprobantePasivos,
        comprobante_resultado: this.idComprobanteResultado,
        comprobante_finiquito: this.idComprobanteFiniquito,
        numero_oficio: this.numeroOficio,
        banco_destino: this.bancoDestino,
        cuenta_destino: this.cuentaDestino,
        referencia: this.referencia,
        intereses_disponibilidad: intereses,
        saldo_712: saldo712,
        saldo_714: saldo714,
        monto_liquidacion: montoLiquidacion,
        comprobante_intereses: this.idComprobanteIntereses,
        estatus: 'COMPLETADO',
        usuario: 'sistema'
      };
      await this.finiquitoService.registrarFiniquito(registro);

      // Paso 9: Cambiar estatus del plan a finiquitado (solo si el INSERT fue exitoso)
      const observacionOriginal = this.planSeleccionado?.observacion || '';
      const observacionLimpia = observacionOriginal.replace(/\s*\[FINIQUITADO[^\]]*\]/g, '').trim();
      const observacionFiniquito = observacionLimpia + ' [FINIQUITADO - ' + fecha + ']';
      await this.finiquitoService.cambiarEstatusPlan(planId, 3, observacionFiniquito);

      // Paso 10: Reload resultado
      this.resultadoFiniquito = registro;
      this.toastr.success('Finiquito procesado exitosamente. Balance verificado en cero.', 'Finiquito');
      await this.listarPlanesActivos();
    } catch (error) {
      console.error(error);
      this.toastr.error(error instanceof Error ? error.message : 'Ocurrió un error durante el procesamiento del finiquito', 'Finiquito');
    } finally {
      this.procesando = false;
      this.ngxService.stopLoader('load-finiquito');
    }
  }

  private async regenerarSaldos(planId: number, fecha: string): Promise<void> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.INSERTAR_SALDOS_CIERRE,
      parametros: `${fecha}, finiquito, M, ${planId}, ${this.fechaultimo}`,
      valores: ''
    };
    await lastValueFrom(this.apiService.Ejecutar(xAPI));
  }

  private async verificarBalanceCero(planId: number, fecha: string): Promise<boolean> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.AUDITORIA_BALANCE_CERO,
      parametros: `${planId}, ${fecha}`,
      valores: ''
    };
    const data: any = await lastValueFrom(this.apiService.Ejecutar(xAPI));
    const cuerpo = data?.Cuerpo || [];
    return cuerpo.length === 0;
  }

  private async compensar(planId: number, fecha: string): Promise<void> {
    try {
      await this.finiquitoService.borrarSaldosFiniquito(planId, fecha);
      await this.finiquitoService.borrarMovimientosFiniquito(planId, fecha);
      await this.finiquitoService.borrarComprobantesFiniquito(planId, fecha);
      this.toastr.warning('Se revirtieron los cambios del finiquito (compensación)', 'Compensación');
    } catch (err) {
      console.error('Error en compensación:', err);
      this.toastr.error('Error durante la compensación. Revise manualmente la base de datos.', 'Compensación');
    }
  }

  private async compensarSilencioso(planId: number, fecha: string): Promise<void> {
    try {
      await this.finiquitoService.borrarSaldosFiniquito(planId, fecha);
      await this.finiquitoService.borrarMovimientosFiniquito(planId, fecha);
      await this.finiquitoService.borrarComprobantesFiniquito(planId, fecha);
    } catch (err) {
      // Silencioso: puede no haber datos previos
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
    if (!observacion) return '';
    let nombre = observacion.split('|')[0].trim();
    nombre = nombre.replace(/\s*\[FINIQUITADO.*\]/i, '').trim();
    return nombre;
  }

  imprimirActa(): void {
    if (!this.resultadoFiniquito || !this.planSeleccionado) return;

    const plan = this.planSeleccionado;
    const fecha = this.resultadoFiniquito.fecha_finiquito || this.fechaOperacionFormateada;
    const nombreLimpio = this.limpiarNombrePlan(plan.observacion);
    const cedula = plan.observacion.split('|')[0]?.trim() || '';
    const montoLiquidacion = this.resultadoFiniquito.monto_liquidacion || this.montoLiquidacion;
    const banco = this.resultadoFiniquito.banco_destino || this.bancoDestino || '_______________________';
    const cuenta = this.resultadoFiniquito.cuenta_destino || this.cuentaDestino || '_______________________';
    const ref = this.resultadoFiniquito.referencia || this.referencia || '_______________________';
    const oficio = this.resultadoFiniquito.numero_oficio || this.numeroOficio || '';
    const intereses = this.resultadoFiniquito.intereses_disponibilidad || 0;

    // Tabla de saldos
    let filasSaldos = '';
    const saldo711 = this.resultadoFiniquito.saldo_711 || this.getSaldo('711');
    const saldo722 = this.resultadoFiniquito.saldo_722 || this.getSaldo('722');
    const saldo731 = this.resultadoFiniquito.saldo_731 || this.getSaldo('731');
    const saldo734 = this.resultadoFiniquito.saldo_734 || this.getSaldo('734');
    const saldo740 = this.resultadoFiniquito.saldo_740 || this.getSaldo('740');
    const saldo750 = this.resultadoFiniquito.saldo_750 || this.getSaldo('750');

    if (saldo711 !== 0) {
      filasSaldos += `<tr><td style="padding: 6px 8px; text-align: left;">Saldo disponible en cuenta operativa (711)</td><td style="padding: 6px 8px; text-align: right;">${this.formatearMonto(saldo711)}</td></tr>`;
    }
    if (intereses > 0) {
      filasSaldos += `<tr><td style="padding: 6px 8px; text-align: left;">Intereses por disponibilidad (1° mes → corte)</td><td style="padding: 6px 8px; text-align: right; color: #2e7d32;">+ ${this.formatearMonto(intereses)}</td></tr>`;
    }
    if (saldo722 !== 0) {
      filasSaldos += `<tr><td style="padding: 6px 8px; text-align: left;">Comisiones administrativas por pagar (722)</td><td style="padding: 6px 8px; text-align: right; color: #c62828;">(-) ${this.formatearMonto(saldo722)}</td></tr>`;
    }
    if (saldo731 !== 0) {
      filasSaldos += `<tr><td style="padding: 6px 8px; text-align: left;">Patrimonio asignado (731)</td><td style="padding: 6px 8px; text-align: right;">${this.formatearMonto(saldo731)}</td></tr>`;
    }
    if (saldo734 !== 0) {
      filasSaldos += `<tr><td style="padding: 6px 8px; text-align: left;">Resultados acumulados (734)</td><td style="padding: 6px 8px; text-align: right;">${this.formatearMonto(saldo734)}</td></tr>`;
    }
    if (saldo740 !== 0) {
      filasSaldos += `<tr><td style="padding: 6px 8px; text-align: left;">Gastos del fideicomiso (740)</td><td style="padding: 6px 8px; text-align: right;">${this.formatearMonto(saldo740)}</td></tr>`;
    }
    if (saldo750 !== 0) {
      filasSaldos += `<tr><td style="padding: 6px 8px; text-align: left;">Ingresos del fideicomiso (750)</td><td style="padding: 6px 8px; text-align: right;">${this.formatearMonto(saldo750)}</td></tr>`;
    }

    filasSaldos += `
      <tr style="background-color: #eeeee4; font-weight: bold;">
        <td style="padding: 6px 8px; text-align: left;">MONTO A TRANSFERIR (711 + intereses - 722)</td>
        <td style="padding: 6px 8px; text-align: right;">${this.formatearMonto(montoLiquidacion)}</td>
      </tr>`;

    // Comprobantes
    let comprobantes = '';
    if (this.resultadoFiniquito.comprobante_intereses && this.resultadoFiniquito.comprobante_intereses > 0) {
      comprobantes += `<li>Intereses por disponibilidad: Comprobante #${this.resultadoFiniquito.comprobante_intereses}</li>`;
    }
    if (this.resultadoFiniquito.comprobante_pasivos && this.resultadoFiniquito.comprobante_pasivos > 0) {
      comprobantes += `<li>Liquidación de comisiones administrativas: Comprobante #${this.resultadoFiniquito.comprobante_pasivos}</li>`;
    }
    if (this.resultadoFiniquito.comprobante_resultado && this.resultadoFiniquito.comprobante_resultado > 0) {
      comprobantes += `<li>Cierre de resultados del ejercicio: Comprobante #${this.resultadoFiniquito.comprobante_resultado}</li>`;
    }
    if (this.resultadoFiniquito.comprobante_finiquito && this.resultadoFiniquito.comprobante_finiquito > 0) {
      comprobantes += `<li>Cancelación de patrimonio asignado: Comprobante #${this.resultadoFiniquito.comprobante_finiquito}</li>`;
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
          ${oficio ? `<p style="font-weight: 500; font-size: 12px; margin: 0;">Oficio/Acta N°: ${oficio}</p>` : ''}
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
              <td style="padding: 3px 0; font-weight: 600; width: 180px;">Oficio/Acta N°:</td>
              <td style="padding: 3px 0;">${oficio || '_______________________'}</td>
            </tr>
            <tr>
              <td style="padding: 3px 0; font-weight: 600;">Banco destino:</td>
              <td style="padding: 3px 0;">${banco}</td>
            </tr>
            <tr>
              <td style="padding: 3px 0; font-weight: 600;">Cuenta receptora:</td>
              <td style="padding: 3px 0;">${cuenta}</td>
            </tr>
            <tr>
              <td style="padding: 3px 0; font-weight: 600;">Referencia de transferencia:</td>
              <td style="padding: 3px 0;">${ref}</td>
            </tr>
            <tr>
              <td style="padding: 3px 0; font-weight: 600;">Monto transferido:</td>
              <td style="padding: 3px 0; font-weight: 700;">${this.formatearMonto(montoLiquidacion)} Bs.</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 12px;">
          <p style="margin: 2px 0; text-align: justify;">
            Con la firma del presente documento, las partes declaran extinguidas todas las obligaciones
            derivadas del contrato de fideicomiso identificado como <strong>${nombreLimpio}</strong>,
            quedando cancelados los pasivos, el patrimonio asignado, los resultados acumulados
            y los intereses por disponibilidad pendientes.
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
