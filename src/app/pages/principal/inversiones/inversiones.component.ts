import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { ApiService, IAPICore } from "src/app/services/apicore/api.service";
import { Inversion } from "src/app/services/banfanb/inversiones.service";
import { UtilService } from "src/app/services/util/util.service";

@Component({
  selector: "app-inversiones",
  templateUrl: "./inversiones.component.html",
  styleUrls: ["./inversiones.component.scss"],
})
export class InversionesComponent implements OnInit {
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

  public lstInversiones = [];
  public lstInstrumento = [];
  public lstEmisor = [];
  public lstCustodia = [];

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
  };

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

  public fecha_emision : any
  public fecha_compra : any
  public fecha_vencimiento : any

  constructor(
    private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private util: UtilService
  ) {}

  ngOnInit(): void {
    this.ListarInver();
    this.ListarCustodia();
    this.ListarEmisor();
    this.ListarInstrumento();
  }

  tabActive(event) {
    this.selectedIndex = event.index;
    if (!this.active) {
      // this.Limpiar();
      //this.contrato_search = 'none'
      //this.GenerarSemillero()
      // this.Listar()
    } else {
      this.active = !this.active;
    }
  }

  ListarEmisor() {
    this.xAPI.funcion = "FID_CEmisor";
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
        console.log(error);
      }
    );
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
    //this.contrato_search = ''
    // this.fechainicio.setValue(this.Contrato.Saldos.fechainicio)
    // this.myOficina.setValue(this.Contrato.oficinatutora.toUpperCase())
    // this.lstEjecutivos = this.Contrato.Ejecutivo
    // this.getTipoFideicomiso()
    // this.saldo_inicio = this.Contrato.Saldos.saldoinicio.toString()
    // this.planFideicomiso.identificador = parseInt(this.Contrato.numero)
    // this.tabSaldos = true


    // console.log(this.planFideicomiso)

  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.lstEmisor.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  ListarCustodia() {
    this.xAPI.funcion = "FID_CCustodia";
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
        console.log(error);
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
    this.xAPI.funcion = "FID_CInstrumento";
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
        console.log(error);
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
    this.lstInversiones = [];
    this.xAPI.funcion = "FID_CInversiones";
    this.xAPI.parametros = '';
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.msj == undefined)
          this.lstInversiones = data.Cuerpo;
      },
      (error) => {
        console.log(error);
        this.LimpiarInver();
      }
    );
  }

  ConsultarInver() {
    this.xAPI.funcion = "FID_CInversion";
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
        console.log(error);
        this.LimpiarInver();
      }
    );
  }

  SeleccionarInversiones() {
    this.ListarInver();
    this.inver_insert = "none";
    this.inver_search = '';
  }

  GuardarInversiones() {
    if (this.Inversiones.codigo_isin == "") {
      this._snackBar.open("Debe verificar todos los campos...", "Ok");
      return;
    }
    this.ngxService.startLoader("load-inver");

    this.Inversiones.tipo_moneda = parseInt(this.tipo_moneda)
    this.Inversiones.estatus = parseInt(this.estatus)
    this.Inversiones.tipo_inversion = parseInt(this.tipo_inversion)
    this.Inversiones.fecha_emision = this.util.ConvertirFechaDB(this.fecha_emision)
    this.Inversiones.fecha_compra = this.util.ConvertirFechaDB(this.fecha_compra)
    this.Inversiones.fecha_vencimiento = this.util.ConvertirFechaDB(this.fecha_vencimiento)

    this.xAPI.funcion =
      this.Inversiones.identificador == 0 ? "FID_IInversion" : "FID_UInversion";
    this.xAPI.parametros = "";
    this.xAPI.valores = JSON.stringify(this.Inversiones);
    console.log(this.Inversiones);
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        this.apiService.Mensaje('Proceso exitoso', 'Felicitaciones', 'success', 'inversion')
        this.ngxService.stopLoader('load-inver')
        this.LimpiarInver()
      },
      (error) => {
        console.log(error)
      }
    )
  }

  CalcularCostosAdquisicion() {
    this.Inversiones.costo_adquisicion =
      this.Inversiones.valor_nominal * (this.Inversiones.precio_compra / 100);
    this.Descuento();
  }

  Descuento() {
    this.Inversiones.descuento =
      this.Inversiones.valor_nominal - this.Inversiones.costo_adquisicion;
  }

  AmortizacionDiaria() {
    this.Inversiones.amortizacion_diaria =
      this.Inversiones.descuento / this.Inversiones.plazo_vencimiento;
  }

  InteresesCaidos() {
    if (this.Inversiones.dias_caidos > 0) {
      let diasCaidos = this.Inversiones.dias_caidos;
      let inv = this.Inversiones;

      let intereses =
        (inv.valor_nominal * (inv.tasa_cupon / 100) * diasCaidos) /
        inv.base_calculo;
      this.Inversiones.intereses_caidos = intereses;
    }
  }

  RendicionCupon() {
    let inv = this.Inversiones;
    let rendicion =
      (inv.valor_nominal * inv.tasa_cupon * (inv.plazo_cupon / 100)) /
      inv.base_calculo;
    this.Inversiones.rendimiento_cupon = rendicion;
    this.InteresDiarioCupon();
  }

  InteresDiarioCupon() {
    let inv = this.Inversiones;
    let rendicion =
      (inv.valor_nominal * inv.tasa_cupon * (1 / 100)) / inv.base_calculo;
    this.Inversiones.interes_diario = rendicion;
  }

  RendimientoAlVencimiento() {
    let inv = this.Inversiones;
    let rendicion =
      (inv.valor_nominal * (inv.tasa_cupon / 100) * inv.plazo_vencimiento) /
      inv.base_calculo;
    this.Inversiones.rendimiento_vencimiento = rendicion;
    this.AmortizacionDiaria();
  }
}
