import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { UtilService } from 'src/app/services/util/util.service';
import { environment } from 'src/environments/environment';
import { CierreService } from 'src/app/services/banfanb/cierre.service';
import { InteresesService, InteresProyectado } from 'src/app/services/banfanb/intereses.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-intereses',
  templateUrl: './intereses.component.html',
  styleUrls: ['./intereses.component.scss']
})
export class InteresesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public mes: number = 0;
  public anio: number = new Date().getFullYear();
  public tasa: number = 2.00;
  public montoBanco: number = 0;

  public lstMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ].map((nombre, index) => ({ nombre, valor: index + 1 }));

  public anios: number[] = [2024, 2025, 2026];

  public lstIntereses: InteresProyectado[] = [];
  public totalInteresCalculado: number = 0;
  public totalInteresReal: number = 0;

  public fechaultimo: string = '';
  public mostrarResultados: boolean = false;
  public mesCerrado: boolean = false;

  public xAPI: IAPICore = { funcion: '', parametros: '', valores: '' };

  constructor(
    private apiService: ApiService,
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

    // Verificar si el día anterior al último fue cerrado
    const fechaCierreDB = this.util.ConvertirFechaDB(this.fechaultimo);
    this.mesCerrado = !(fechaCierreDB && fechaDiaAnterior > fechaCierreDB);

    if (!this.mesCerrado) {
      this.toastr.info(
        `El mes aún no está listo. El día ${diaAnterior} de ${this.lstMeses[this.mes - 1].nombre} no ha sido cerrado. Puede consultar pero no generar comprobantes.`,
        'Mes no cerrado'
      );
    }

    // Verificar si ya existen comprobantes para este mes
    const pagado = await this.interesesService.verificarPagoIntereses(
      1,
      fechaInicio,
      fechaFin
    );

    if (pagado) {
      this.toastr.warning('Ya existen comprobantes de intereses para este mes', 'Mes procesado');
      this.mostrarResultados = false;
      return;
    }

    this.ngxService.startLoader('load-cont');

    try {
      const datos = await this.interesesService.calcularIntereses(fechaInicio, fechaFin);
      const incrementos = await this.interesesService.obtenerIncrementosDia(fechaFin);

      // Combinar saldos con incrementos del último día
      const mapaSaldos = new Map<number, any>();
      datos.forEach(item => {
        mapaSaldos.set(item.id_plan, { ...item });
      });

      incrementos.forEach(inc => {
        const existente = mapaSaldos.get(inc.id_plan);
        if (existente) {
          existente.saldo_promedio = parseFloat(existente.saldo_promedio as any) + parseFloat(inc.incrementos as any);
          existente.interes_calculado = parseFloat(existente.saldo_promedio as any) * parseFloat(existente.tasa as any) / 100 / 360 * parseFloat(existente.dias as any);
        }
      });

      this.lstIntereses = Array.from(mapaSaldos.values()).map(item => ({
        ...item,
        tasa: this.tasa,
        porcentaje: 0,
        interes_real: 0,
        diferencia: 0
      }));

      this.calcularPorcentajes();
      this.mostrarResultados = true;
    } catch (error) {
      console.error(error);
      this.toastr.error('Error al calcular intereses', 'Error');
    } finally {
      this.ngxService.stopLoader('load-cont');
    }
  }

  calcularPorcentajes(): void {
    this.totalInteresCalculado = this.lstIntereses.reduce((sum, e) => sum + (parseFloat(e.interes_calculado as any) || 0), 0);

    this.lstIntereses.forEach(item => {
      item.porcentaje = this.totalInteresCalculado > 0
        ? ((parseFloat(item.interes_calculado as any) / this.totalInteresCalculado) * 100)
        : 0;
      item.interes_real = 0;
      item.diferencia = 0;
    });

    this.distribuirProporcional();
  }

  distribuirProporcional(): void {
    if (!this.montoBanco || this.montoBanco <= 0) return;

    this.lstIntereses.forEach(item => {
      item.interes_real = parseFloat(((item.porcentaje / 100) * this.montoBanco).toFixed(2));
      item.diferencia = parseFloat((item.interes_real - (parseFloat(item.interes_calculado as any) || 0)).toFixed(2));
    });

    this.totalInteresReal = this.lstIntereses.reduce((sum, e) => sum + (e.interes_real || 0), 0);
  }

  onMontoBancoChange(): void {
    this.distribuirProporcional();
  }

  async generarComprobantes(): Promise<void> {
    this.ngxService.startLoader('load-cont');

    try {
      for (const item of this.lstIntereses) {
        if (!item.interes_real || item.interes_real <= 0) continue;

        const pagado = await this.interesesService.verificarPagoIntereses(
          item.id_plan,
          `${this.anio}-${String(this.mes).padStart(2, '0')}-01`,
          `${this.anio}-${String(this.mes).padStart(2, '0')}-31`
        );

        if (pagado) {
          this.toastr.warning(`Plan ${item.plan} ya tiene pago registrado`, 'Duplicado');
          continue;
        }

        const ultimoDia = new Date(this.anio, this.mes, 0).getDate();
        const fechaPago = `${this.anio}-${String(this.mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
        const idComprobante = await this.interesesService.insertarComprobante({
          plan: item.id_plan,
          codigo: '',
          descripcion: `INTERESES POR DISPONIBILIDAD MES ${this.lstMeses[this.mes - 1].nombre} ${this.anio}`,
          detalle: item.plan,
          fecha_operacion: fechaPago,
          fecha_ejercicio: fechaPago,
          debe: item.interes_real,
          haber: item.interes_real,
          llave: 'M'
        });

        await this.interesesService.insertarDetalleComprobante({
          id_comprobante: idComprobante,
          cuenta: 3,
          debe: item.interes_real,
          haber: 0,
          fecha_operacion: fechaPago,
          fecha_ejercicio: fechaPago,
          plan: item.id_plan
        });

        await this.interesesService.insertarDetalleComprobante({
          id_comprobante: idComprobante,
          cuenta: 53,
          debe: 0,
          haber: item.interes_real,
          fecha_operacion: fechaPago,
          fecha_ejercicio: fechaPago,
          plan: item.id_plan
        });

        this.toastr.success(`Comprobante #${idComprobante} generado`, item.plan);
      }

      this.toastr.success('Todos los comprobantes generados', 'Éxito');
      this.limpiar();
    } catch (error) {
      console.error(error);
      this.toastr.error('Error al generar comprobantes', 'Error');
    } finally {
      this.ngxService.stopLoader('load-cont');
    }
  }

  limpiar(): void {
    this.lstIntereses = [];
    this.totalInteresCalculado = 0;
    this.totalInteresReal = 0;
    this.montoBanco = 0;
    this.mostrarResultados = false;
    this.mesCerrado = false;
  }

  formatearMonto(monto: number): string {
    return this.util.ConvertirMoneda(monto);
  }
}
