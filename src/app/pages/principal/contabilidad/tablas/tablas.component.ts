import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { ApiService, IAPICore } from "src/app/services/apicore/api.service";
import { IConfiguracionCuenta, ILConfiguracionCuenta, LConfiguracionCuenta } from "src/app/services/banfanb/contabilidad.service";
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';


@Component({
  selector: "app-tablas",
  templateUrl: "./tablas.component.html",
  styleUrls: ["./tablas.component.scss"],
})
export class TablasComponent implements OnInit {
  public ELEMENT_DATA: LConfiguracionCuenta[] = [];
  displayedColumns: string[] = [
    "cuenta",
    "descripcion",
    "instrumento",
    "tipo",
    "definicion",
    "accion",
  ];
  dataSource: any;


  public ELEMENT_DATA_CUENTA: ILConfiguracionCuenta[] = [];
  displayedColumnsCuenta: string[] = [
    "codigo",
    "cuenta",
    "concepto",
    "definicion",
  ];
  dataSourceCuenta: any;

  public ILCuenta: ILConfiguracionCuenta = {
    cuenta: '',
    codigo: '',
    instrumento: '',
    concepto: '',
    definicion: ''
  }
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public txtCuenta: string;
  public cmbTotalizadora: string;

  public lstCuenta = [];
  public xAPI: IAPICore = {
    funcion: "",
    parametros: "",
  };

  public ICuenta : IConfiguracionCuenta = {
    accion: "",
    cuenta: 0,
    instrumento: 0,
    tipo: ""
  }

  public focus: boolean = false;
  public active: boolean = false;

  public porta_insert: string = "";
  public porta_search: string = "none";
  public selectedIndex = 0;
  public buscar = "";

  public cuenta : string = ''
  public concepto : string = ''
  public definicion : string = ''

  myCuentas = new FormControl('');
  Cuentas: string[] = [];
  filteredCuentas: Observable<string[]>;

  public lstCuentas = []
  public lstXC = []
  public lstXI = []


  public instrumento: string = '';
  myInstrumento = new FormControl('');
  filInstrumento: Observable<string[]>;
  public lstInstrumento = [];

  public blcod : boolean = false
  public txtInstrumento : boolean = false
  
  public posicion: number = 0

  constructor(
    private apiService: ApiService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    // this.Listar()
    this.cargarContenido()
    this.cargarCuentas()
    this.ListarInstrumento()
  }

  Buscar(e) {}

  tabActive(event) {
    this.selectedIndex = event.index;
    if (!this.active) {
      this.Limpiar();
      this.txtCuenta = "";
    } else {
      this.active = !this.active;
    }
  }

  atras() {
    this.porta_insert = "";
    this.porta_search = "none";
  }

  editar(e) {
    this.porta_insert = "";
    this.porta_search = "none";
    console.log(e);
  }

  Limpiar() {
    this.ICuenta = {
      accion: "",
      cuenta: 0,
      instrumento: 0,
      tipo: ""
    }
    this.cuenta = ''
    this.instrumento = ''
    this.definicion = ''
    this.concepto = ''
    this.myCuentas.setValue('')
    this.txtInstrumento = false
    this.ELEMENT_DATA_CUENTA = []
    this.dataSourceCuenta = new MatTableDataSource<ILConfiguracionCuenta>(this.ELEMENT_DATA_CUENTA)
    this.dataSourceCuenta.paginator = this.paginator
  }

  agregar(){
    let codigo = 0

    this.lstXC.forEach(e => {
      if ( this.cuenta.substring(0,23) == e.substring(0,23)){
        codigo = parseInt( e.split('|')[2].toString() )
      }
    });
    this.ILCuenta = {
      cuenta: this.cuenta,
      codigo: codigo.toString(),
      instrumento: this.instrumento,
      concepto: this.concepto,
      definicion: this.definicion
    }
    this.ELEMENT_DATA_CUENTA.push(this.ILCuenta)
    console.log(this.ILCuenta)

    this.dataSourceCuenta = new MatTableDataSource<ILConfiguracionCuenta>(this.ELEMENT_DATA_CUENTA)
    this.dataSourceCuenta.paginator = this.paginator
    this.cuenta = ''
    this.myCuentas.setValue('')
    this.txtInstrumento = true
  }

  Guardar() {
    this.ngxService.startLoader('load-config')
    
    this.ICuenta.accion = this.ELEMENT_DATA_CUENTA[this.posicion].definicion
    this.ICuenta.instrumento = parseInt( this.instrumento.split('|')[0].toString() )
    this.ICuenta.tipo =   this.ELEMENT_DATA_CUENTA[this.posicion].concepto
    this.ICuenta.cuenta =  parseInt(this.ELEMENT_DATA_CUENTA[this.posicion].codigo)

    
    this.lstCuentas = []
    this.xAPI.funcion = "FID_IConfiguracionCuenta"
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(this.ICuenta)

    
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {   
        if(this.ELEMENT_DATA_CUENTA.length - 1 == this.posicion ) {
          this.Limpiar()
          this.apiService.Mensaje('Proceso exitoso', 'Felicitaciones', 'success', 'inversion')
          this.ngxService.stopLoader('load-config')
        }else{
          this.posicion++
          this.Guardar()
        }
       
      },
      (err) => {
        console.error(err)
      }
    )
  }


  cargarCuentas(): any {

    this.lstCuentas = []
    this.xAPI.funcion = "FID_CCuentas"
    this.xAPI.parametros = ''
    this.xAPI.valores = ""
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstCuentas = data.Cuerpo
        
        this.lstCuentas.forEach(e => {
          let cta =
          e.codigo_padre +
          "." +
          e.parte +
          "." +
          e.moneda +
          "." +
          e.nivel_1 +
          "." +
          e.nivel_2 +
          "." +
          e.nivel_3 +
          "." +
          e.nivel_4 +
          "." +
          e.nivel_5;
          let valor = cta  + ' | ' + e.descripcion.toUpperCase()  
          this.Cuentas.push(valor)
          this.lstXC.push(valor + '|' + e.id)
        });

        this.filteredCuentas = this.myCuentas.valueChanges.pipe(
          startWith(''),
          map(value => this._filterCuentas(value || '')),
        );
      },
      (err) => {
        console.error(err)
      }
    )
  }

 
  private _filterCuentas(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.Cuentas.filter(option => option.toLowerCase().includes(filterValue));
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



  cargarContenido(): any {
    this.ELEMENT_DATA = [];
    this.xAPI.funcion = "FID_CConfiguracionCuentas";
    this.xAPI.parametros = "";
    this.xAPI.valores = "";
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data.Cuerpo != undefined) {
          // console.log(data.Cuerpo)
          data.Cuerpo.forEach((e) => {
            this.ELEMENT_DATA.push({
              cuenta: e.cuenta,
              descripcion: e.descripcion,
              instrumento: e.instrumento,
              tipo: e.tipo,
              definicion: e.accion,
              accion: this.getNaturaleza(e.accion),

            });
          });
          // this.ELEMENT_DATA = data.Cuerpo;
          //console.log(this.ELEMENT_DATA);

          this.dataSource = new MatTableDataSource<LConfiguracionCuenta>(
            this.ELEMENT_DATA
          );
          this.dataSource.paginator = this.paginator;
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }

  getTipoCuenta(tipo: string): string {
    let str = "INVERSION";
    switch (tipo) {
      case "I":
        str = "INTERESES";
        break;
      case "C":
        str = "COMPRA";
        break;
      case "V":
        str = "VENCIMIENTO";
        break;
      case "A":
        str = "APERTURA";
        break;
      case "G":
        str = "COBRO DE CUPON";
        break;
      case "X":
        str = "COMPRA / VENTA";
        break;
      default:
        break;
    }
    return str;
  }

  getNaturaleza(nat : string) : string{
    return nat=='D'?'DISMINUYE': 'AUMENTA'
  }


}
