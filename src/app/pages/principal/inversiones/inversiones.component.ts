import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { ApiService, IAPICore } from "src/app/services/apicore/api.service";
import { Inversion, InversionesService, MovInversion } from "src/app/services/banfanb/inversiones.service";
import { UtilService } from "src/app/services/util/util.service";
import { NgbModal, NgbDateStruct, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap'
import { Location } from '@angular/common';

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
  }

  public movimiento: MovInversion = {
    estatus: 0,
    llave: "",
    debe: 0,
    haber: 0,
    usuario: "",
    cuenta: 0,
    inversion: 0
  }
  public inver_insert: string = '';
  public inver_search: string = "none";
  public emisor: string = '';
  public custodia: string = '';
  public instrumento: string = '';
  public fecha_emi: any
  public fecha_com: any
  public fecha_ven: any

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

  public fecha_emision : NgbDate | null
  public fecha_compra : NgbDate | null
  public fecha_vencimiento : NgbDate | null

  constructor(
    private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    public formatter: NgbDateParserFormatter,
  ) {}

  ngOnInit(): void {
    this.ListarCustodia();
    this.ListarEmisor();
    this.ListarInstrumento();
    this.ListarInver();
  }

  tabActive(event) {
    this.selectedIndex = event.index;
    if (this.selectedIndex == 0)this.LimpiarInver()
    if (!this.active) {
      
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

    this.fecha_emision = NgbDate.from(this.formatter.parse(e.fecha_emision))
    this.fecha_compra = NgbDate.from(this.formatter.parse(e.fecha_compra))
    this.fecha_vencimiento = NgbDate.from(this.formatter.parse(e.fecha_vencimiento))


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
    this.ngxService.startLoader("load-inver");
    this.lstInversiones = [];
    this.xAPI.funcion = "FID_CInversiones";
    this.xAPI.parametros = '';
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.msj == undefined)
          this.lstInversiones = data.Cuerpo;
          this.ngxService.stopLoader("load-inver");
      },
      (error) => {
        console.log(error);
        this.LimpiarInver();
        this.ngxService.stopLoader("load-inver");
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
    this.Inversiones.fecha_emision = typeof this.fecha_emi == 'object' ? this.util.ConvertirFecha(this.fecha_emi) : this.Inversiones.fecha_emision.substring(0, 10)
    this.Inversiones.fecha_compra = typeof this.fecha_emi == 'object' ? this.util.ConvertirFecha(this.fecha_com) : this.Inversiones.fecha_compra.substring(0, 10)
    this.Inversiones.fecha_vencimiento = typeof this.fecha_emi == 'object' ? this.util.ConvertirFecha(this.fecha_ven) : this.Inversiones.fecha_vencimiento.substring(0, 10)

    this.xAPI.funcion =
      this.Inversiones.identificador == 0 ? "FID_IInversion" : "FID_UInversion"
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(this.Inversiones)
    console.log(this.Inversiones)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        
        if (this.Inversiones.identificador == 0 ) await this.AsientoInversion(this.Inversiones)
        
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
      this.Inversiones.intereses_caidos = intereses;
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
    this.movimiento.cuenta = 3
    this.movimiento.debe = 0
    this.movimiento.haber = Inv.costo_adquisicion
    this.movimiento.fecha_precierre = "1900-01-01"
    this.movimiento.fecha_cierre = "1900-01-01"

    this.xAPI.funcion = "FID_IMovInversion";
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
            this._snackBar.open("Movimientos de Inversion Generado...", "Ok");
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
}
