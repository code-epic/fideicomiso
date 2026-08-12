import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Observable, Subject } from "rxjs";
import { debounceTime, map, startWith } from "rxjs/operators";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { ApiService, IAPICore } from "src/app/services/apicore/api.service";
import { Inversion, MovInversion } from "src/app/services/banfanb/inversiones.service";
import { UtilService } from "src/app/services/util/util.service";
import { NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap'
import { MatDialog } from "@angular/material/dialog";
import { environment } from "src/environments/environment";
import { WzportafolioComponent } from "./wzportafolio/wzportafolio.component";

@Component({
  selector: 'app-consultainversiones',
  templateUrl: './consultainversiones.component.html',
  styleUrls: ['./consultainversiones.component.scss']
})
export class ConsultainversionesComponent implements OnInit, OnDestroy {

  @ViewChild('filex', { static: true }) filex: TemplateRef<any>;

  private buscar$ = new Subject<void>();

  public Inversiones: Inversion = {
    identificador: 0,
    id_instrumento: -1,
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

  public lstInversiones = [];
  public lstInversionesFiltro = [];
  public lstInstrumento = [];
  public lstEmisor = [];
  public lstCustodia = [];
  public buscar: string = "";
  public focus: boolean = false;
  public filtroInstrumento: string = "";
  public fecha_desde: Date | NgbDate | null = null;
  public fecha_hasta: Date | NgbDate | null = null;

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
  }

  public movimiento: MovInversion = {
    estatus: 0,
    llave: "",
    debe: 0,
    haber: 0,
    usuario: "",
    cuenta: 0,
    inversion: 0,
    fecha_operacion: ""
  }
  public inver_insert: string = '';
  public inver_search: string = "none";
  public emisor: string = '';
  public custodia: string = '';
  public instrumento: string = '';

  myEmisor = new FormControl('');
  filEmisor: Observable<string[]>;

  myCustodia = new FormControl('');
  filCustodia: Observable<string[]>;

  myInstrumento = new FormControl('');
  filInstrumento: Observable<string[]>;

  public selectedIndex = 0
  public tipo_moneda = '1'
  public estatus = '1'
  public tipo_inversion = '1'
  public active: boolean = false

  public fecha_emi: any
  public fecha_com: any
  public fecha_ven: any

  public fecha_emision : NgbDate | null
  public fecha_compra : NgbDate | null
  public fecha_vencimiento : NgbDate | null
  public xinver : string = ''


  constructor(
    private apiService: ApiService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog, 
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    public formatter: NgbDateParserFormatter,
  ) {}

  ngOnInit(): void {
    this.buscar$.pipe(debounceTime(300)).subscribe(() => this.BuscarInversion());
    this.ListarCustodia();
    this.ListarEmisor();
    this.ListarInstrumento();
    this.ListarInver();
  }

  ngOnDestroy(): void {
    this.buscar$.complete();
  }

  onBuscarKey(e: KeyboardEvent) {
    const k = e.key;
    if (['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'CapsLock'].includes(k) || k.startsWith('Arrow')) {
      return;
    }
    this.buscar$.next();
  }

  soloNumerico(event: KeyboardEvent, enteros: boolean = false): boolean {
    const permitidas = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'F5'];
    if (permitidas.includes(event.key)) return true;
    if (event.ctrlKey || event.metaKey) return true;
    if (event.key === '-' || event.key === '+' || event.key === 'e' || event.key === 'E') {
      event.preventDefault();
      return false;
    }
    if (enteros && event.key === '.') {
      event.preventDefault();
      return false;
    }
    if (event.key.length === 1 && !/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  soloCodigo(event: KeyboardEvent): boolean {
    const permitidas = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'F5'];
    if (permitidas.includes(event.key)) return true;
    if (event.ctrlKey || event.metaKey) return true;
    if (event.key.length === 1 && !/^[A-Za-z0-9.\- ]$/.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  soloFecha(event: KeyboardEvent): boolean {
    const permitidas = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'F5'];
    if (permitidas.includes(event.key)) return true;
    if (event.ctrlKey || event.metaKey) return true;
    if (event.key.length === 1 && !/^[0-9/]$/.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  trackByIdentificador(index: number, e: any): number {
    return e ? e.identificador : index;
  }

  get resultados(): string {
    if (!this.lstInversiones.length) return '';
    return `Mostrando ${this.lstInversionesFiltro.length} de ${this.lstInversiones.length} inversiones`;
  }

  tabActive(event) {
    this.selectedIndex = event.index;
    if (this.selectedIndex == 0)this.LimpiarInver()
    if (!this.active) {
    } else {
      this.active = !this.active;
    }
  }

  ListarEmisor() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_EMISOR
    this.xAPI.parametros = '';
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.msj == undefined) {
          data.forEach((e) => {
            let valor = e.codigo + " - " + e.nombre + e.domicilio;
            this.lstEmisor.push(valor);
          });
        }
        this.filEmisor = this.myEmisor.valueChanges.pipe(
          startWith(''),
          map((value) => this._filter(value || ''))
        );
      },
      (error) => {
        console.error(error);
      }
    );
  }



  abrirDialogoPortafolio(inversion: any): void {
    this.dialog.open(WzportafolioComponent, {
      width: '900px',
      height: 'auto',
      data: inversion
    });
  }

  getZFill(numero : any) : string{

    return this.util.zfill(numero , 4) 
  }

  editar(e) {
    this.Inversiones = e
    this.selectedIndex = 1
    this.active = true
    this.tipo_moneda = this.Inversiones.tipo_moneda.toString()
    this.estatus = this.Inversiones.estatus.toString()
    this.tipo_inversion = this.Inversiones.tipo_inversion.toString()
    this.Inversiones.numero =  this.getZFill( this.Inversiones.identificador )

    this.fecha_emision = NgbDate.from(this.formatter.parse(e.fecha_emision))
    this.fecha_compra = NgbDate.from(this.formatter.parse(e.fecha_compra))
    this.fecha_vencimiento = NgbDate.from(this.formatter.parse(e.fecha_vencimiento))
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.lstEmisor.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  ListarCustodia() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_CUSTODIA
    this.xAPI.parametros = '';
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.msj == undefined) {
          data.forEach((e) => {
            let valor = e.codigo + " - " + e.nombre + e.domicilio;
            this.lstCustodia.push(valor);
          });
        }
        this.filCustodia = this.myCustodia.valueChanges.pipe(
          startWith(''),
          map((value) => this._filterCustodia(value || ''))
        );
      },
      (error) => {
        console.error(error);
      }
    );
  }

  private _filterCustodia(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.lstCustodia.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  ListarInstrumento() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_INSTRUMENTO
    this.xAPI.parametros = '';
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.msj == undefined) {
          data.forEach((e) => {
            let valor = e.codigo + " - " + e.nombre;
            this.lstInstrumento.push(valor);
          });
        }
        this.filInstrumento = this.myInstrumento.valueChanges.pipe(
          startWith(''),
          map((value) => this._filterInstrumento(value || ''))
        );
      },
      (error) => {
        console.error(error);
      }
    );
  }

  private _filterInstrumento(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.lstInstrumento.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  editarInver(e) {
    this.Inversiones = e;
    this.inver_insert = '';
    this.inver_search = "none";
  }

  LimpiarInver() {
    this.Inversiones = {
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
    this.tipo_moneda = '1'
    this.estatus = '1'
    this.tipo_inversion = '1'
  }

  ListarInver() {
    this.ngxService.startLoader("load-inver");
    this.lstInversiones = [];
    this.lstInversionesFiltro = [];
    this.xAPI.funcion = environment.xApi.CONSULTAR_INVERSIONES;
    this.xAPI.parametros = '';
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.msj == undefined) {
          this.lstInversiones = data.Cuerpo;
          this.BuscarInversion();
        }
        this.ngxService.stopLoader("load-inver");
      },
      (error) => {
        console.error(error);
        this.LimpiarInver();
        this.ngxService.stopLoader("load-inver");
      }
    );
  }

  getFechaStr(f: any): string {
    if (!f) return '';
    if (f instanceof Date) {
      const y = f.getFullYear();
      const m = (f.getMonth() + 1).toString().padStart(2, '0');
      const d = f.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    if (typeof f === 'object' && f.year) {
      return this.formatter.format(f);
    }
    if (typeof f === 'string') {
      return f.substring(0, 10);
    }
    return '';
  }

  BuscarInversion() {
    let resultado = [...this.lstInversiones];

    // 1. Filtro por Instrumento
    if (this.filtroInstrumento && this.filtroInstrumento.trim() !== '') {
      const instSelected = this.filtroInstrumento.toLowerCase().trim();
      const parts = instSelected.split(' - ');
      const codePart = parts[0] ? parts[0].trim() : '';
      const namePart = parts[1] ? parts[1].trim() : instSelected;

      resultado = resultado.filter((e) => {
        const instName = (e.instrumento || '').toLowerCase();
        const instId = (e.id_instrumento || '').toString();
        return (
          instName.includes(namePart) ||
          instId === codePart ||
          instSelected.includes(instName)
        );
      });
    }

    // 2. Filtro por Búsqueda (ISIN, Monto o Nº)
    if (this.buscar && this.buscar.trim() !== '') {
      const val = this.buscar.toLowerCase().trim();
      resultado = resultado.filter((e) => {
        const num = this.getZFill(e.identificador || 0).toLowerCase();
        const isin = (e.codigo_isin || '').toString().toLowerCase();
        const valorNominal = (e.valor_nominal || '').toString().toLowerCase();

        return (
          num.includes(val) ||
          isin.includes(val) ||
          valorNominal.includes(val)
        );
      });
    }

    // 3. Filtro por Rango de Fechas (Fecha Emisión)
    const fDesdeStr = this.getFechaStr(this.fecha_desde);
    const fHastaStr = this.getFechaStr(this.fecha_hasta);

    if (fDesdeStr) {
      resultado = resultado.filter((e) => {
        const fEmision = (e.fecha_emision || '').substring(0, 10);
        return fEmision >= fDesdeStr;
      });
    }

    if (fHastaStr) {
      resultado = resultado.filter((e) => {
        const fEmision = (e.fecha_emision || '').substring(0, 10);
        return fEmision <= fHastaStr;
      });
    }

    this.lstInversionesFiltro = resultado;
  }

  limpiarBusquedaText() {
    this.buscar = '';
    this.BuscarInversion();
  }

  limpiarFiltros() {
    this.buscar = '';
    this.filtroInstrumento = '';
    this.fecha_desde = null;
    this.fecha_hasta = null;
    this.lstInversionesFiltro = [...this.lstInversiones];
  }

  ConsultarInver() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_INVERSION
    this.xAPI.parametros = this.Inversiones.identificador.toString();
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.msj == undefined) {
          this.Inversiones = data[0];
        } else {
          let aux = this.Inversiones.identificador;
          this.LimpiarInver();
          this.Inversiones.identificador = aux;
        }
      },
      (error) => {
        console.error(error);
        this.LimpiarInver();
      }
    );
  }

  SeleccionarInversiones() {
    this.ListarInver();
    this.inver_insert = "none";
    this.inver_search = '';
  }

  private obtenerFechaEfectiva(fechaNgb: any, fechaFija: any): any {
    return fechaNgb && typeof fechaNgb === 'object' && fechaNgb.year ? fechaNgb : fechaFija;
  }

  private normalizarFechaISO(f: any): string {
    if (!f) return '';
    if (f.year) {
      return `${f.year}-${String(f.month).padStart(2, '0')}-${String(f.day).padStart(2, '0')}`;
    }
    if (typeof f === 'string') {
      return f.substring(0, 10);
    }
    if (f instanceof Date) {
      const y = f.getFullYear();
      const m = String(f.getMonth() + 1).padStart(2, '0');
      const d = String(f.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return '';
  }

  private compararFechasISO(a: any, b: any): number {
    const fa = this.normalizarFechaISO(a);
    const fb = this.normalizarFechaISO(b);
    if (!fa || !fb) return 0;
    return fa < fb ? -1 : fa > fb ? 1 : 0;
  }

  GuardarInversiones() {
    if (!this.Inversiones.codigo_isin || String(this.Inversiones.codigo_isin).trim() === "") {
      this._snackBar.open("Debe indicar el código del instrumento.", "Ok");
      return;
    }
    if (!this.Inversiones.instrumento || String(this.Inversiones.instrumento).trim() === "") {
      this._snackBar.open("Debe indicar el instrumento.", "Ok");
      return;
    }
    if (this.Inversiones.valor_nominal === null || this.Inversiones.valor_nominal === undefined || this.Inversiones.valor_nominal <= 0) {
      this._snackBar.open("El valor nominal debe ser mayor que cero.", "Ok");
      return;
    }
    if (this.Inversiones.precio_compra === null || this.Inversiones.precio_compra === undefined || this.Inversiones.precio_compra < 0) {
      this._snackBar.open("Debe indicar un precio de compra válido (mayor o igual a cero).", "Ok");
      return;
    }
    if (this.Inversiones.base_calculo === null || this.Inversiones.base_calculo === undefined || this.Inversiones.base_calculo <= 0) {
      this._snackBar.open("La base de cálculo debe ser mayor que cero.", "Ok");
      return;
    }
    if (this.Inversiones.tasa_cupon !== null && this.Inversiones.tasa_cupon !== undefined && this.Inversiones.tasa_cupon < 0) {
      this._snackBar.open("La tasa de cupón no puede ser negativa.", "Ok");
      return;
    }
    const fechaEmision = this.obtenerFechaEfectiva(this.fecha_emi, this.Inversiones.fecha_emision);
    const fechaVencimiento = this.obtenerFechaEfectiva(this.fecha_ven, this.Inversiones.fecha_vencimiento);
    if (fechaEmision && fechaVencimiento && this.compararFechasISO(fechaVencimiento, fechaEmision) < 0) {
      this._snackBar.open("La fecha de vencimiento no puede ser anterior a la de emisión.", "Ok");
      return;
    }
    this.ngxService.startLoader("load-inver");

    this.Inversiones.tipo_moneda = parseInt(this.tipo_moneda)
    this.Inversiones.estatus = parseInt(this.estatus)
    this.Inversiones.tipo_inversion = parseInt(this.tipo_inversion)
    this.Inversiones.codigo_isin = parseInt(this.Inversiones.codigo_isin)
    this.Inversiones.fecha_emision = typeof this.fecha_emi == 'object' ? this.util.ConvertirFecha(this.fecha_emi) : this.Inversiones.fecha_emision.substring(0, 10)
    this.Inversiones.fecha_compra = typeof this.fecha_emi == 'object' ? this.util.ConvertirFecha(this.fecha_com) : this.Inversiones.fecha_compra.substring(0, 10)
    this.Inversiones.fecha_vencimiento = typeof this.fecha_emi == 'object' ? this.util.ConvertirFecha(this.fecha_ven) : this.Inversiones.fecha_vencimiento.substring(0, 10)

    const instrumentoSeleccionado = this.myInstrumento.value;
    if (instrumentoSeleccionado) {
      const idInstrumento = parseInt(instrumentoSeleccionado.split(" - ")[0]);
      this.Inversiones.id_instrumento = isNaN(idInstrumento) ? -1 : idInstrumento;
    } else {
      this.Inversiones.id_instrumento = -1; // Valor por defecto si no hay selección
    }


    this.xAPI.funcion = this.Inversiones.identificador == 0 ? environment.xApi.INSERTAR_INVESION : environment.xApi.ACTUALIZAR_INVERSION
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(this.Inversiones)

    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        if (this.Inversiones.identificador > 0 ) {
          await this.AsientoInversion(this.Inversiones)
        }else {
          this.LimpiarInver()
          this.apiService.Mensaje('Proceso exitoso', 'Felicitaciones', 'success', 'inversion')
          this.ngxService.stopLoader('load-inver')
        }
      },
      (error) => {
        console.error(error)
      }
    )
  }


  CalcularCostosAdquisicion() {
    let mt = this.Inversiones.valor_nominal * (this.Inversiones.precio_compra / 100)
    this.Inversiones.costo_adquisicion = parseFloat(mt.toFixed(2));

    if ( this.Inversiones.precio_compra > 100) {
      this.Inversiones.descuento = 0
      this.Prima()
    }else{
      this.Inversiones.primas = 0
      this.Descuento()
    }
  }

  Descuento() {
    let mt = this.Inversiones.valor_nominal - this.Inversiones.costo_adquisicion
    this.Inversiones.descuento = parseFloat(mt.toFixed(2))
  }

  Prima() {
    let mt = ( this.Inversiones.valor_nominal - this.Inversiones.costo_adquisicion ) * - 1
    this.Inversiones.primas = parseFloat(mt.toFixed(2))
  }

  AmortizacionDiaria() {
    let mt = this.Inversiones.descuento / this.Inversiones.plazo_vencimiento
    if (this.Inversiones.primas  > 0 ) {
      mt = this.Inversiones.primas / this.Inversiones.plazo_vencimiento
    }
    
    this.Inversiones.amortizacion_diaria = parseFloat(mt.toFixed(2))
      
  }

  InteresesCaidos() {
    if (this.Inversiones.dias_caidos > 0) {
      let diasCaidos = this.Inversiones.dias_caidos;
      let inv = this.Inversiones;

      let intereses =
        (inv.valor_nominal * (inv.tasa_cupon / 100) * diasCaidos) /
        inv.base_calculo;

      this.Inversiones.intereses_caidos = parseFloat(intereses.toFixed(2));;
    }
  }

  RendicionCupon() {
    let inv = this.Inversiones;
    let rendicion =
      (inv.valor_nominal * inv.tasa_cupon * (inv.plazo_cupon / 100)) /
      inv.base_calculo;
    this.Inversiones.rendimiento_cupon = parseFloat(rendicion.toFixed(2));
    this.InteresDiarioCupon();
  }

  InteresDiarioCupon() {
    let inv = this.Inversiones;
    let rendicion =
      (inv.valor_nominal * inv.tasa_cupon * (1 / 100)) / inv.base_calculo;
    this.Inversiones.interes_diario = parseFloat(rendicion.toFixed(2));
  }

  RendimientoAlVencimiento() {
    let inv = this.Inversiones;
    let rendicion =
      (inv.valor_nominal * (inv.tasa_cupon / 100) * inv.plazo_vencimiento) /
      inv.base_calculo;
    this.Inversiones.rendimiento_vencimiento = parseFloat(rendicion.toFixed(2));
    this.AmortizacionDiaria();
  }



  //5 inversiones en papeles comerciales
  //6 deposito para microcredito
  //3 disponibilidad en cuenta operativa
  AsientoInversion(Inv: Inversion) {
    // let cuenta = Inv.instrumento == "57"
    this.movimiento.inversion = Inv.identificador
    this.movimiento.fecha_operacion = this.Inversiones.fecha_emision
    this.movimiento.cuenta = 3
    this.movimiento.debe = 0
    this.movimiento.haber = Inv.costo_adquisicion
    this.movimiento.fecha_precierre = "1900-01-01"
    this.movimiento.fecha_cierre = "1900-01-01"

    this.xAPI.funcion = environment.xApi.INSERTAR_MOVIMIENTOS_INVERSION
    this.xAPI.parametros = "";
    this.xAPI.valores = JSON.stringify(this.movimiento);

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.movimiento.cuenta = 5,
        this.movimiento.debe = Inv.costo_adquisicion,
        this.movimiento.haber = 0

        this.xAPI.valores = JSON.stringify(this.movimiento);
        this.apiService.Ejecutar(this.xAPI).subscribe(
          (data) => {

            this._snackBar.open("Movimientos de Inversion Generado...", "Ok")
            this.apiService.Mensaje('Proceso exitoso', 'Felicitaciones', 'success', 'inversion')
            this.ngxService.stopLoader('load-inver')
            this.LimpiarInver()
          },
          (error) => {
            this._snackBar.open(
              "No se ha generado el movimiento.. 712.",
              "Error"
            );
          }
        )
      },
      (error) => {
        this._snackBar.open("No se ha generado el movimiento 711...", "Error");
      }
    );
  }

  folder(){
    
  }

  getMoneda(e) : string {
    return this.util.ConvertirMoneda(e);
  }

  getFecha(f) : string {
    return this.util.ConvertirFechaHumana(f) 
  }


}
