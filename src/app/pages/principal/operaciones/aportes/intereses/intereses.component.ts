import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { UtilService } from 'src/app/services/util/util.service';
import { CierreService } from 'src/app/services/banfanb/cierre.service';
import {
  InteresesService,
  InteresProyectado,
  PagoTramo,
  DistribucionPlan,
  TramoConDistribucion
} from 'src/app/services/banfanb/intereses.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-intereses',
  templateUrl: './intereses.component.html',
  styleUrls: ['./intereses.component.scss']
})
export class InteresesComponent implements OnInit {

  public mes: number = 0;
  public anio: number = new Date().getFullYear();
  public tasa: number = 2.00;

  public lstMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ].map((nombre, index) => ({ nombre, valor: index + 1 }));

  public anios: number[] = [2024, 2025, 2026];

  public lstIntereses: InteresProyectado[] = [];
  public lstPagos: PagoTramo[] = [];
  public tramosConDistribucion: TramoConDistribucion[] = [];

  public totalInteresCalculado: number = 0;
  public totalRealGlobal: number = 0;
  public totalTeoricoGlobal: number = 0;

  public fechaultimo: string = '';
  public mostrarResultados: boolean = false;
  public mesCerrado: boolean = false;

  // Formulario de pago inline
  public mostrarFormPago: boolean = false;
  public editandoPagoId: number | null = null;
  public nuevoPagoFecha: string = '';
  public nuevoPagoMonto: number = 0;
  public nuevoPagoPlanes: number[] = [];

  private contadorPagos: number = 0;

  constructor(
    private ngxService: NgxUiLoaderService,
    private toastr: ToastrService,
    private util: UtilService,
    private cierre: CierreService,
    private interesesService: InteresesService
  ) {}

  ngOnInit(): void {
    this.cierre.getUltimoCierre().then(fecha => {
      this.fechaultimo = fecha;
    });
  }

  async consultar(): Promise<void> {
    if (!this.mes || !this.anio || !this.tasa) {
      this.toastr.warning('Complete todos los filtros', 'Parámetros');
      return;
    }

    const fechaInicio = `${this.anio}-${String(this.mes).padStart(2, '0')}-01`;
    const ultimoDia = new Date(this.anio, this.mes, 0).getDate();
    const fechaFin = `${this.anio}-${String(this.mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
    const diaAnterior = ultimoDia - 1;
    const fechaDiaAnterior = `${this.anio}-${String(this.mes).padStart(2, '0')}-${String(diaAnterior).padStart(2, '0')}`;

    const fechaCierreDB = this.util.ConvertirFechaDB(this.fechaultimo);
    this.mesCerrado = !!(fechaCierreDB && fechaFin <= fechaCierreDB);

    if (!this.mesCerrado) {
      this.toastr.info(
        `El mes aún no está listo. El día ${diaAnterior} de ${this.lstMeses[this.mes - 1].nombre} no ha sido cerrado. Se calculará la disponibilidad del día ${ultimoDia} con saldo del día anterior + incrementos.`,
        'Mes no cerrado'
      );
    }

    this.ngxService.startLoader('load-cont');

    try {
      const datos = await this.interesesService.calcularIntereses(fechaInicio, fechaFin);
      const incrementos = await this.interesesService.obtenerIncrementosDia(fechaFin);

      const mapaSaldos = new Map<number, any>();
      datos.forEach(item => {
        mapaSaldos.set(item.id_plan, { ...item });
      });

      // REGLA CRÍTICA: Si el último día NO tiene cierre, proyectar saldo del último día
      if (!this.mesCerrado) {
        // Obtener saldos del día anterior para cada plan
        const datosDiaAnterior = await this.interesesService.calcularIntereses(fechaDiaAnterior, fechaDiaAnterior);
        const mapaAnterior = new Map<number, any>();
        datosDiaAnterior.forEach(item => mapaAnterior.set(item.id_plan, item));

        // Para cada plan, calcular saldo del último día = saldo día anterior + incrementos
        for (const [idPlan, item] of mapaSaldos) {
          const saldoAnterior = mapaAnterior.has(idPlan)
            ? (parseFloat(mapaAnterior.get(idPlan).saldo_promedio as any) || 0)
            : 0;
          
          const incrementoPlan = incrementos.find((inc: any) => inc.id_plan === idPlan);
          const montoIncremento = incrementoPlan ? (parseFloat(incrementoPlan.incrementos as any) || 0) : 0;

          // Saldo Último Día = Saldo Día Anterior + Incrementos
          const saldoUltimoDia = saldoAnterior + montoIncremento;

          // Interés Último Día = SaldoÚltimo Día × Tasa / 360
          const interesUltimoDia = saldoUltimoDia * this.tasa / 100 / 360;

          // Interés Teórico Total = Intereses días anteriores + Interés último día
          const interesDiasAnteriores = parseFloat(item.interes_calculado as any) || 0;
          item.interes_calculado = interesDiasAnteriores + interesUltimoDia;
          item.saldo_promedio = saldoUltimoDia;
          item.dias = ultimoDia;
        }
      }

      this.lstIntereses = Array.from(mapaSaldos.values()).map(item => {
        const interesMensual = parseFloat(item.interes_calculado as any) || 0;
        const dias = parseInt(item.dias as any) || 30;
        const interesDiario = interesMensual / dias;

        return {
          ...item,
          tasa: this.tasa,
          interes_diario: interesDiario,
          porcentaje: 0,
          interes_real: 0,
          diferencia: 0
        };
      });

      this.calcularTotales();
      this.mostrarResultados = true;
      this.lstPagos = [];
      this.tramosConDistribucion = [];
    } catch (error) {
      console.error(error);
      this.toastr.error('Error al calcular intereses', 'Error');
    } finally {
      this.ngxService.stopLoader('load-cont');
    }
  }

  calcularTotales(): void {
    this.totalInteresCalculado = this.lstIntereses.reduce(
      (sum, e) => sum + (parseFloat(e.interes_calculado as any) || 0), 0
    );
  }

  // ============ GESTIÓN DE PAGOS/TRAMOS ============

  abrirFormPago(): void {
    this.editandoPagoId = null;
    this.nuevoPagoFecha = `${this.anio}-${String(this.mes).padStart(2, '0')}-31`;
    this.nuevoPagoMonto = 0;
    this.nuevoPagoPlanes = [];
    this.mostrarFormPago = true;
  }

  editarPago(pago: PagoTramo): void {
    this.editandoPagoId = pago.id;
    this.nuevoPagoFecha = pago.fechaValor;
    this.nuevoPagoMonto = pago.montoPago;
    this.nuevoPagoPlanes = pago.planesIds.map(Number);
    this.mostrarFormPago = true;
  }

  cancelarFormPago(): void {
    this.mostrarFormPago = false;
    this.editandoPagoId = null;
    this.nuevoPagoPlanes = [];
  }

  togglePlanSeleccion(planId: number): void {
    const idx = this.nuevoPagoPlanes.indexOf(planId);
    if (idx >= 0) {
      this.nuevoPagoPlanes.splice(idx, 1);
    } else {
      this.nuevoPagoPlanes.push(planId);
    }
  }

  isPlanSeleccionado(planId: number): boolean {
    return this.nuevoPagoPlanes.includes(planId);
  }

  guardarPago(): void {
    if (!this.nuevoPagoFecha) {
      this.toastr.warning('Ingrese la fecha valor', 'Validación');
      return;
    }
    if (!this.nuevoPagoMonto || this.nuevoPagoMonto <= 0) {
      this.toastr.warning('El monto debe ser mayor a 0', 'Validación');
      return;
    }
    if (this.nuevoPagoPlanes.length === 0) {
      this.toastr.warning('Seleccione al menos un plan', 'Validación');
      return;
    }

    if (this.editandoPagoId !== null) {
      const idx = this.lstPagos.findIndex(p => p.id === this.editandoPagoId);
      if (idx >= 0) {
        this.lstPagos[idx] = {
          ...this.lstPagos[idx],
          referencia: `PAGO-${this.lstPagos[idx].id}`,
          fechaValor: this.nuevoPagoFecha,
          montoPago: this.nuevoPagoMonto,
          planesIds: this.nuevoPagoPlanes.map(Number)
        };
      }
    } else {
      this.contadorPagos++;
      this.lstPagos.push({
        id: this.contadorPagos,
        referencia: `PAGO-${this.contadorPagos}`,
        fechaValor: this.nuevoPagoFecha,
        montoPago: this.nuevoPagoMonto,
        planesIds: this.nuevoPagoPlanes.map(Number),
        estaContabilizado: false
      });
    }

    this.mostrarFormPago = false;
    this.editandoPagoId = null;
    this.calcularDistribucionPorTramo();
  }

  eliminarPago(id: number): void {
    this.lstPagos = this.lstPagos.filter(p => p.id !== id);
    this.calcularDistribucionPorTramo();
  }

  // ============ DISTRIBUCIÓN POR TRAMO ============

  calcularDistribucionPorTramo(): void {
    this.tramosConDistribucion = this.lstPagos.map(pago => {
      const planesTramo = this.lstIntereses.filter(
        i => pago.planesIds.includes(Number(i.id_plan))
      );

      // Total de saldos del tramo (base para distribución)
      const totalSaldos = planesTramo.reduce(
        (sum, p) => sum + (parseFloat(String(p.saldo_promedio || '0').replace(/,/g, '.')) || 0), 0
      );

      // Total teórico de intereses (diario)
      const totalTeorico = planesTramo.reduce(
        (sum, p) => sum + ((Number(p.interes_diario) || 0)), 0
      );

      // Distribución basada en SALDO
      const distribuciones: DistribucionPlan[] = planesTramo.map(plan => {
        const saldoRaw = String(plan.saldo_promedio || '0');
        const saldo = parseFloat(saldoRaw.replace(/,/g, '.')) || 0;
        const interesCalc = Number(plan.interes_calculado) || 0;
        const interesDiario = Number(plan.interes_diario) || 0;
        
        // % = Saldo del Plan / Suma de Saldos
        const porcentaje = totalSaldos > 0 ? (saldo / totalSaldos) * 100 : 0;
        
        // Interés Real = Saldo/Total × Monto del Pago
        const interesReal = Math.round((saldo / totalSaldos) * pago.montoPago * 100) / 100;

        return {
          id_plan: plan.id_plan,
          plan: plan.plan,
          saldo_promedio: saldo,
          interes_calculado: interesCalc,
          interes_diario: interesDiario,
          porcentajeTramo: porcentaje,
          interesRealTramo: interesReal,
          diferenciaTramo: Math.round((interesReal - interesDiario) * 100) / 100
        };
      });

      // Cuadre de céntimos
      const sumaReal = distribuciones.reduce((sum, d) => sum + d.interesRealTramo, 0);
      const residuo = Math.round((pago.montoPago - sumaReal) * 100) / 100;

      if (residuo !== 0 && distribuciones.length > 0) {
        const maxPlan = distribuciones.reduce((max, d) =>
          d.porcentajeTramo > max.porcentajeTramo ? d : max
        );
        maxPlan.interesRealTramo = Math.round((maxPlan.interesRealTramo + residuo) * 100) / 100;
        maxPlan.diferenciaTramo = Math.round((maxPlan.interesRealTramo - maxPlan.interes_calculado) * 100) / 100;
      }

      const totalReal = distribuciones.reduce((sum, d) => sum + d.interesRealTramo, 0);

      return {
        pago,
        distribuciones,
        totalTeorico,
        totalReal,
        cuadra: Math.abs(totalReal - pago.montoPago) < 0.01
      };
    });

    this.totalTeoricoGlobal = this.tramosConDistribucion.reduce(
      (sum, t) => sum + t.totalTeorico, 0
    );
    this.totalRealGlobal = this.tramosConDistribucion.reduce(
      (sum, t) => sum + t.totalReal, 0
    );
  }

  get todosCuadran(): boolean {
    return this.tramosConDistribucion.length > 0 &&
           this.tramosConDistribucion.every(t => t.cuadra);
  }

  get planesSinAsignar(): InteresProyectado[] {
    const todosPlanesAsignados = new Set<number>();
    this.lstPagos.forEach(p => p.planesIds.forEach(id => todosPlanesAsignados.add(id)));
    return this.lstIntereses.filter(i => !todosPlanesAsignados.has(i.id_plan));
  }

  getTotalSaldosSeleccion(): number {
    return this.nuevoPagoPlanes.reduce(
      (sum, planId) => sum + this.getSaldoPlan(planId), 0
    );
  }

  // ============ GENERACIÓN DE COMPROBANTES ============

  async generarComprobantes(): Promise<void> {
    if (!this.todosCuadran) {
      this.toastr.error('Hay tramos que no cuadran', 'Error');
      return;
    }

    if (this.planesSinAsignar.length > 0) {
      const nombres = this.planesSinAsignar.map(p => p.plan).join(', ');
      const confirmar = await Swal.fire({
        title: 'Planes sin pago',
        text: `Los planes ${nombres} no tienen pago asignado. ¿Continuar sin incluirlos?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'No, cancelar'
      });
      if (!confirmar.isConfirmed) return;
    }

    this.ngxService.startLoader('load-cont');

    try {
      const fechaInicio = `${this.anio}-${String(this.mes).padStart(2, '0')}-01`;
      const ultimoDia = new Date(this.anio, this.mes, 0).getDate();
      const fechaFin = `${this.anio}-${String(this.mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;

      let comprobantesGenerados = 0;

      for (const tramo of this.tramosConDistribucion) {
        for (const dist of tramo.distribuciones) {
          if (!dist.interesRealTramo || dist.interesRealTramo <= 0) continue;

          const pagado = await this.interesesService.verificarPagoIntereses(
            dist.id_plan, fechaInicio, fechaFin
          );

          if (pagado) {
            this.toastr.warning(`Plan ${dist.plan} ya tiene pago registrado`, 'Duplicado');
            continue;
          }

          const idComprobante = await this.interesesService.insertarComprobante({
            plan: dist.id_plan,
            codigo: '',
            descripcion: `INTERESES POR DISPONIBILIDAD MES ${this.lstMeses[this.mes - 1].nombre} ${this.anio} - REF ${tramo.pago.referencia}`,
            detalle: dist.plan,
            fecha_operacion: tramo.pago.fechaValor,
            fecha_ejercicio: tramo.pago.fechaValor,
            debe: dist.interesRealTramo,
            haber: dist.interesRealTramo,
            llave: 'M'
          });

          await this.interesesService.insertarDetalleComprobante({
            id_comprobante: idComprobante,
            cuenta: 3,
            debe: dist.interesRealTramo,
            haber: 0,
            fecha_operacion: tramo.pago.fechaValor,
            fecha_ejercicio: tramo.pago.fechaValor,
            plan: dist.id_plan
          });

          await this.interesesService.insertarDetalleComprobante({
            id_comprobante: idComprobante,
            cuenta: 53,
            debe: 0,
            harbor: dist.interesRealTramo,
            fecha_operacion: tramo.pago.fechaValor,
            fecha_ejercicio: tramo.pago.fechaValor,
            plan: dist.id_plan
          });

          comprobantesGenerados++;
        }
      }

      if (comprobantesGenerados > 0) {
        this.toastr.success(`${comprobantesGenerados} comprobantes generados`, 'Éxito');
      } else {
        this.toastr.info('No se generaron comprobantes', 'Información');
      }

      this.limpiar();
    } catch (error) {
      console.error(error);
      this.toastr.error('Error al generar comprobantes', 'Error');
    } finally {
      this.ngxService.stopLoader('load-cont');
    }
  }

  // ============ UTILIDADES ============

  limpiar(): void {
    this.lstIntereses = [];
    this.lstPagos = [];
    this.tramosConDistribucion = [];
    this.totalInteresCalculado = 0;
    this.totalRealGlobal = 0;
    this.totalTeoricoGlobal = 0;
    this.mostrarResultados = false;
    this.mesCerrado = false;
    this.mostrarFormPago = false;
  }

  formatearMonto(monto: number): string {
    return this.util.ConvertirMoneda(monto);
  }

  getNombrePlan(idPlan: number): string {
    const plan = this.lstIntereses.find(i => i.id_plan === idPlan);
    return plan ? plan.plan : `Plan ${idPlan}`;
  }

  getSaldoPlan(idPlan: number): number {
    const plan = this.lstIntereses.find(i => i.id_plan === idPlan);
    return plan ? (parseFloat(String(plan.saldo_promedio || '0').replace(/,/g, '.')) || 0) : 0;
  }

  getInteresTeoricoPlan(idPlan: number): number {
    const plan = this.lstIntereses.find(i => i.id_plan === idPlan);
    return plan ? (parseFloat(String(plan.interes_calculado || '0').replace(/,/g, '.')) || 0) : 0;
  }

  getTotalTeoricoSeleccion(): number {
    return this.nuevoPagoPlanes.reduce(
      (sum, planId) => sum + this.getInteresTeoricoPlan(planId), 0
    );
  }
}
