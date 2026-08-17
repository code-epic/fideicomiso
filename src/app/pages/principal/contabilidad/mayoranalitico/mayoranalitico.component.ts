import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { UtilService } from 'src/app/services/util/util.service';
import { ImprimirService } from 'src/app/services/util/imprimir.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

interface MovimientoAnalitico {
  fecha_operacion: string;
  id_comprobante: number;
  descripcion_comprobante: string;
  referencia: string;
  debe: number;
  haber: number;
  saldo_corrido: number;
}

interface CuentaAnalitico {
  id_cuenta: number;
  codigo_cuenta: string;
  nombre_cuenta: string;
  saldo_inicial: number;
  movimientos: MovimientoAnalitico[];
  total_debe: number;
  total_haber: number;
  saldo_final: number;
}

interface CuentaItem {
  id: number;
  codigo: string;
  descripcion: string;
  totalizadora: number;
}

@Component({
  selector: 'app-mayoranalitico',
  templateUrl: './mayoranalitico.component.html',
  styleUrls: ['./mayoranalitico.component.css']
})
export class MayoranaliticoComponent implements OnInit {

  public xAPI: IAPICore = {
    funcion: "",
    parametros: "",
  };

  public fechaInicio: any;
  public fechaFin: any;
  public cuentaControl = new FormControl();
  public cuentaSeleccionada = '';
  public cuentaDescripcionSeleccionada = '';
  public cuentaIdSeleccionada: number = 0;

  public mostrarResultados = false;
  public lstMovimientos = [];
  public cuentasConMovimientos: CuentaAnalitico[] = [];
  public totalGeneralDebe = 0;
  public totalGeneralHaber = 0;
  public totalGeneralSaldoInicial = 0;
  public totalGeneralSaldoFinal = 0;

  public lstCuentas: CuentaItem[] = [];
  public filteredCuentas: CuentaItem[] = [];

  public plan: string = '%';
  public estatus: string = '%';
  public bAntes: boolean = true;

  constructor(
    private apiService: ApiService,
    private ngxService: NgxUiLoaderService,
    private toasService: ToastrService,
    private util: UtilService,
    private _imprimir: ImprimirService,
    public formatter: NgbDateParserFormatter,
  ) { }

  ngOnInit(): void {
    this.fechaInicio = new Date();
    this.fechaFin = new Date();
    this.cargarCuentas();
    this.filteredCuentas = this.lstCuentas;

    this.cuentaControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCuentas(value))
    ).subscribe(result => {
      this.filteredCuentas = result;
    });
  }

  private _filterCuentas(value: string): CuentaItem[] {
    const filterValue = value.toLowerCase();
    return this.lstCuentas.filter(c =>
      c.codigo.toLowerCase().includes(filterValue) ||
      c.descripcion.toLowerCase().includes(filterValue)
    );
  }

  onCuentaSelected(event: any) {
    const selected = this.lstCuentas.find(c => c.codigo === event.option.value);
    if (selected) {
      this.cuentaSeleccionada = selected.codigo;
      this.cuentaDescripcionSeleccionada = selected.descripcion;
      this.cuentaIdSeleccionada = selected.id;
    }
  }

  cargarCuentas() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_CUENTAS;
    this.xAPI.parametros = '%';
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data: any) => {
        if (data.Cuerpo) {
          this.lstCuentas = data.Cuerpo.map((c: any) => ({
            id: c.id,
            codigo: `${c.codigo_padre}.${c.parte}.${c.moneda}.${c.nivel_1}.${c.nivel_2}`,
            descripcion: c.descripcion,
            totalizadora: parseInt(c.totalizadora) || 0
          }));
          this.filteredCuentas = this.lstCuentas;
        }
      },
      (error) => {
        console.error('Error cargando cuentas', error);
      }
    );
  }

  ConsultarMayor() {
    if (!this.fechaInicio || !this.fechaFin) {
      this.toasService.warning("Debe seleccionar fechas de inicio y fin", "Fideicomiso");
      return;
    }

    const sInicio = new Date(this.fechaInicio).toISOString().substring(0, 10);
    const sFin = new Date(this.fechaFin).toISOString().substring(0, 10);
    const cuentaId = this.cuentaIdSeleccionada > 0 ? this.cuentaIdSeleccionada : '%';

    this.xAPI.funcion = environment.xApi.CONSULTAR_MAYOR_ANALITICO;
    this.xAPI.parametros = `${sInicio},${sFin},${cuentaId}`;
    this.xAPI.valores = '';

    this.ngxService.startLoader('load-cont');

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data: any) => {
        this.ngxService.stopLoader('load-cont');

        if (!data.Cuerpo || data.Cuerpo.length === 0) {
          this.toasService.warning("No se encontraron datos para el período seleccionado", "Fideicomiso");
          this.mostrarResultados = false;
          return;
        }

        this.procesarDatos(data.Cuerpo);
        this.mostrarResultados = true;
      },
      (error) => {
        this.ngxService.stopLoader('load-cont');
        console.error('Error consultando mayor analítico', error);
        this.toasService.error("Error al consultar el mayor analítico", "Fideicomiso");
      }
    );
  }

  procesarDatos(datos: any[]) {
    const cuentasMap = new Map<number, CuentaAnalitico>();

    datos.forEach(row => {
      const idCuenta = row.id_cuenta;

      if (!cuentasMap.has(idCuenta)) {
        cuentasMap.set(idCuenta, {
          id_cuenta: idCuenta,
          codigo_cuenta: row.codigo_cuenta,
          nombre_cuenta: row.nombre_cuenta,
          saldo_inicial: parseFloat(row.saldo_inicial) || 0,
          movimientos: [],
          total_debe: 0,
          total_haber: 0,
          saldo_final: 0
        });
      }

      const cuenta = cuentasMap.get(idCuenta);

      if (row.fecha_operacion) {
        cuenta.movimientos.push({
          fecha_operacion: row.fecha_operacion,
          id_comprobante: row.id_comprobante || 0,
          descripcion_comprobante: row.descripcion_comprobante || '',
          referencia: row.referencia || '',
          debe: parseFloat(row.debe) || 0,
          haber: parseFloat(row.haber) || 0,
          saldo_corrido: 0
        });
      }
    });

    this.cuentasConMovimientos = Array.from(cuentasMap.values());

    this.calcularRunningBalance();

    this.cuentasConMovimientos.sort((a, b) =>
      a.codigo_cuenta.localeCompare(b.codigo_cuenta)
    );

    this.totalGeneralDebe = this.cuentasConMovimientos.reduce((sum, c) => sum + c.total_debe, 0);
    this.totalGeneralHaber = this.cuentasConMovimientos.reduce((sum, c) => sum + c.total_haber, 0);
    this.totalGeneralSaldoInicial = this.cuentasConMovimientos.reduce((sum, c) => sum + c.saldo_inicial, 0);
    this.totalGeneralSaldoFinal = this.cuentasConMovimientos.reduce((sum, c) => sum + c.saldo_final, 0);
  }

  calcularRunningBalance() {
    this.cuentasConMovimientos.forEach(cuenta => {
      let saldo = cuenta.saldo_inicial;

      cuenta.movimientos.forEach(mov => {
        saldo = saldo + mov.debe - mov.haber;
        mov.saldo_corrido = saldo;
      });

      cuenta.saldo_final = saldo;
      cuenta.total_debe = cuenta.movimientos.reduce((sum, m) => sum + m.debe, 0);
      cuenta.total_haber = cuenta.movimientos.reduce((sum, m) => sum + m.haber, 0);
    });

    this.totalGeneralDebe = this.cuentasConMovimientos.reduce((sum, c) => sum + c.total_debe, 0);
    this.totalGeneralHaber = this.cuentasConMovimientos.reduce((sum, c) => sum + c.total_haber, 0);
  }

  getFechaHoy(): string {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  imprimir() {
    const fechaInicioStr = new Date(this.fechaInicio).toLocaleDateString('es-VE');
    const fechaFinStr = new Date(this.fechaFin).toLocaleDateString('es-VE');
    const cuentaStr = this.cuentaSeleccionada || 'Todas las cuentas';

    let filasCuentasHTML = this.cuentasConMovimientos.map(cuenta => {
      const filasMovimientos = cuenta.movimientos.map(mov => `
        <tr>
          <td style="padding: 10px 16px; font-size: 12px; color: #0F172A; border-bottom: 1px solid #E4E5E7;">${this.formatFecha(mov.fecha_operacion)}</td>
          <td style="padding: 10px 16px; font-size: 12px; color: #0F172A; border-bottom: 1px solid #E4E5E7;">${mov.id_comprobante}</td>
          <td style="padding: 10px 16px; font-size: 12px; color: #0F172A; border-bottom: 1px solid #E4E5E7;">${mov.descripcion_comprobante}</td>
          <td style="padding: 10px 16px; font-size: 12px; color: #0F172A; text-align: right; border-bottom: 1px solid #E4E5E7;">${mov.debe > 0 ? mov.debe.toFixed(2) : ''}</td>
          <td style="padding: 10px 16px; font-size: 12px; color: #0F172A; text-align: right; border-bottom: 1px solid #E4E5E7;">${mov.haber > 0 ? mov.haber.toFixed(2) : ''}</td>
          <td style="padding: 10px 16px; font-size: 12px; color: #0F172A; text-align: right; border-bottom: 1px solid #E4E5E7;">${mov.saldo_corrido.toFixed(2)}</td>
        </tr>
      `).join('');

      return `
        <div style="margin-bottom: 24px; page-break-inside: avoid;">
          <div style="background: #1E293B; color: #fff; padding: 8px 16px; font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; border-radius: 4px 4px 0 0;">
            ${cuenta.codigo_cuenta} - ${cuenta.nombre_cuenta}
          </div>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #E4E5E7; border-top: none;">
            <thead>
              <tr style="background: #F8FAFC;">
                <th style="padding: 10px 16px; font-size: 11px; font-weight: 600; color: #64748B; text-align: left; border-bottom: 1px solid #E4E5E7;">Fecha</th>
                <th style="padding: 10px 16px; font-size: 11px; font-weight: 600; color: #64748B; text-align: left; border-bottom: 1px solid #E4E5E7;">Comprobante</th>
                <th style="padding: 10px 16px; font-size: 11px; font-weight: 600; color: #64748B; text-align: left; border-bottom: 1px solid #E4E5E7;">Descripción</th>
                <th style="padding: 10px 16px; font-size: 11px; font-weight: 600; color: #64748B; text-align: right; border-bottom: 1px solid #E4E5E7;">Débito</th>
                <th style="padding: 10px 16px; font-size: 11px; font-weight: 600; color: #64748B; text-align: right; border-bottom: 1px solid #E4E5E7;">Crédito</th>
                <th style="padding: 10px 16px; font-size: 11px; font-weight: 600; color: #64748B; text-align: right; border-bottom: 1px solid #E4E5E7;">Saldo</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background: #F1F5F9;">
                <td colspan="3" style="padding: 10px 16px; font-size: 12px; font-weight: 600; color: #1E293B; border-bottom: 1px solid #E4E5E7;">SALDO INICIAL</td>
                <td style="padding: 10px 16px; font-size: 12px; color: #0F172A; text-align: right; border-bottom: 1px solid #E4E5E7;"></td>
                <td style="padding: 10px 16px; font-size: 12px; color: #0F172A; text-align: right; border-bottom: 1px solid #E4E5E7;"></td>
                <td style="padding: 10px 16px; font-size: 12px; font-weight: 600; color: #1E293B; text-align: right; border-bottom: 1px solid #E4E5E7;">${cuenta.saldo_inicial.toFixed(2)}</td>
              </tr>
              ${filasMovimientos}
            </tbody>
            <tfoot>
              <tr style="background: #F1F5F9; font-weight: 700;">
                <td colspan="3" style="padding: 10px 16px; font-size: 12px; color: #1E293B; border-top: 2px solid #1E293B;">TOTALES</td>
                <td style="padding: 10px 16px; font-size: 12px; color: #1E293B; text-align: right; border-top: 2px solid #1E293B;">${cuenta.total_debe.toFixed(2)}</td>
                <td style="padding: 10px 16px; font-size: 12px; color: #1E293B; text-align: right; border-top: 2px solid #1E293B;">${cuenta.total_haber.toFixed(2)}</td>
                <td style="padding: 10px 16px; font-size: 12px; color: #1E293B; text-align: right; border-top: 2px solid #1E293B;">${cuenta.saldo_final.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
    }).join('');

    const contenido = `
      <div style="font-family: 'IBM Plex Sans', sans-serif; color: #0F172A; padding: 20px 30px;">

        <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 3px solid #1E293B; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <img src="./assets/img/brand/logo.png" alt="Logo" style="height: 50px;">
            <div>
              <p style="margin: 0; font-size: 14px; font-weight: 700; color: #1E293B; letter-spacing: 0.5px;">
                BANCO DE LA FUERZA ARMADA NACIONAL BOLIVARIANA
              </p>
              <p style="margin: 2px 0 0 0; font-size: 11px; font-weight: 500; color: #64748B; letter-spacing: 1px; text-transform: uppercase;">
                Dirección de Fideicomiso
              </p>
            </div>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 10px; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px;">Fecha de impresión</p>
            <p style="margin: 2px 0 0 0; font-size: 12px; font-weight: 600; color: #334155;">${this.getFechaHoy()}</p>
          </div>
        </div>

        <div style="text-align: center; margin-bottom: 28px;">
          <p style="margin: 0; font-size: 11px; font-weight: 500; color: #2563EB; text-transform: uppercase; letter-spacing: 2px;">
            Mayor Analítico
          </p>
          <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 700; color: #1E293B;">
            ${fechaInicioStr} - ${fechaFinStr}
          </p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748B;">
            Cuenta: ${cuentaStr}
          </p>
        </div>

        ${filasCuentasHTML}

        <div style="margin-top: 20px;">
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #E4E5E7; border-radius: 4px;">
            <thead>
              <tr style="background: #1E293B;">
                <th colspan="6" style="padding: 10px 16px; font-size: 11px; font-weight: 600; color: #fff; text-align: center; letter-spacing: 1px; text-transform: uppercase;">TOTALES GENERALES</th>
              </tr>
              <tr style="background: #F8FAFC;">
                <th style="padding: 10px 16px; font-size: 11px; font-weight: 600; color: #64748B; text-align: left; border-bottom: 1px solid #E4E5E7; width: 30%;">Concepto</th>
                <th style="padding: 10px 16px; font-size: 11px; font-weight: 600; color: #64748B; text-align: right; border-bottom: 1px solid #E4E5E7; width: 14%;">Saldo Inicial</th>
                <th style="padding: 10px 16px; font-size: 11px; font-weight: 600; color: #64748B; text-align: right; border-bottom: 1px solid #E4E5E7; width: 14%;">Debe</th>
                <th style="padding: 10px 16px; font-size: 11px; font-weight: 600; color: #64748B; text-align: right; border-bottom: 1px solid #E4E5E7; width: 14%;">Haber</th>
                <th style="padding: 10px 16px; font-size: 11px; font-weight: 600; color: #64748B; text-align: right; border-bottom: 1px solid #E4E5E7; width: 14%;">Saldo Final</th>
                <th style="padding: 10px 16px; font-size: 11px; font-weight: 600; color: #64748B; text-align: right; border-bottom: 1px solid #E4E5E7; width: 14%;">Diferencia</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px 16px; font-size: 12px; font-weight: 600; color: #1E293B; border-bottom: 1px solid #E4E5E7;">Saldo Inicial</td>
                <td style="padding: 10px 16px; font-size: 12px; color: #0F172A; text-align: right; border-bottom: 1px solid #E4E5E7;">${this.totalGeneralSaldoInicial.toFixed(2)}</td>
                <td style="padding: 10px 16px; font-size: 12px; color: #0F172A; text-align: right; border-bottom: 1px solid #E4E5E7;"></td>
                <td style="padding: 10px 16px; font-size: 12px; color: #0F172A; text-align: right; border-bottom: 1px solid #E4E5E7;"></td>
                <td style="padding: 10px 16px; font-size: 12px; color: #0F172A; text-align: right; border-bottom: 1px solid #E4E5E7;"></td>
                <td style="padding: 10px 16px; font-size: 12px; color: #0F172A; text-align: right; border-bottom: 1px solid #E4E5E7;"></td>
              </tr>
              <tr>
                <td style="padding: 10px 16px; font-size: 12px; font-weight: 600; color: #1E293B; border-bottom: 1px solid #E4E5E7;">Total Período</td>
                <td style="padding: 10px 16px; font-size: 12px; color: #0F172A; text-align: right; border-bottom: 1px solid #E4E5E7;"></td>
                <td style="padding: 10px 16px; font-size: 12px; color: #0F172A; text-align: right; border-bottom: 1px solid #E4E5E7;">${this.totalGeneralDebe.toFixed(2)}</td>
                <td style="padding: 10px 16px; font-size: 12px; color: #0F172A; text-align: right; border-bottom: 1px solid #E4E5E7;">${this.totalGeneralHaber.toFixed(2)}</td>
                <td style="padding: 10px 16px; font-size: 12px; color: #0F172A; text-align: right; border-bottom: 1px solid #E4E5E7;"></td>
                <td style="padding: 10px 16px; font-size: 12px; font-weight: 700; color: #1E293B; text-align: right; border-bottom: 1px solid #E4E5E7;">${(this.totalGeneralDebe - this.totalGeneralHaber).toFixed(2)}</td>
              </tr>
              <tr style="background: #F1F5F9; font-weight: 700;">
                <td style="padding: 10px 16px; font-size: 12px; color: #1E293B; border-top: 2px solid #1E293B;">Saldo Final</td>
                <td style="padding: 10px 16px; font-size: 12px; color: #1E293B; text-align: right; border-top: 2px solid #1E293B;"></td>
                <td style="padding: 10px 16px; font-size: 12px; color: #1E293B; text-align: right; border-top: 2px solid #1E293B;"></td>
                <td style="padding: 10px 16px; font-size: 12px; color: #1E293B; text-align: right; border-top: 2px solid #1E293B;"></td>
                <td style="padding: 10px 16px; font-size: 12px; color: #1E293B; text-align: right; border-top: 2px solid #1E293B;">${this.totalGeneralSaldoFinal.toFixed(2)}</td>
                <td style="padding: 10px 16px; font-size: 12px; color: #1E293B; text-align: right; border-top: 2px solid #1E293B;"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-top: 75px; display: flex; flex-direction: column; align-items: center;">
          <hr style="width: 40%; border: none; border-top: 1px solid #94A3B8; margin-bottom: 8px;">
          <p style="font-size: 11px; font-weight: 600; color: #64748B; margin: 0; letter-spacing: 1px; text-transform: uppercase;">FIRMA AUTORIZADA</p>
        </div>

      </div>
    `;

    this._imprimir.createHtmlSectionForPrint(contenido, 0);
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '';
    const parts = fecha.substring(0, 10).split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
}
