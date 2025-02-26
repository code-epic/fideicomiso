import { Component, OnInit, ViewChild } from "@angular/core";
import { Semillero } from "src/app/services/banfanb/semillero";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { ApiService, IAPICore } from "src/app/services/apicore/api.service";
import { UtilService } from "src/app/services/util/util.service";
import {
  FID_IDetalleComprobante,
  FID_IComprobante,
  IComprobante,
} from "src/app/services/banfanb/comprobante.service";
import { Contrato } from "src/app/services/banfanb/contrato.service";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { ToastrService } from "ngx-toastr";
import { ComprobanteDialogComponent } from "./comprobante-dialog/comprobante-dialog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-comprobante",
  templateUrl: "./comprobante.component.html",
  styleUrls: ["./comprobante.component.scss"],
})
export class ComprobanteComponent implements OnInit {
  public ELEMENT_DATA: IComprobante[] = [];
  displayedColumns: string[] = [
    "cuenta",
    "fecha",
    "descripcion",
    "debe",
    "haber",
    "accion"
  ];
  dataSource: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  public Contrato: Contrato = {
    numero: "",
    rif: "",
    razonsocial: "",
    plan: "",
    estatus: "2",
    tipo: "",
    empresa: "",
    fideicomiso: "",
    reporte: "",
    codigo: "",
    plananterior: "",
    grupoanterior: "",
    segmento: "",
    subsegmento: "",
    oficinatutora: "",
    fecha: new Date(),
    clasificacion: "1",
    Direccion: undefined,
    Ejecutivo: undefined,
    Politicas: undefined,
    Saldos: undefined,
  };
  public lstTipoFideicomiso = [
    {
      key: "ADMINISTRACION",
      val: [
        { key: "0", val: "OBRAS" },
        { key: "1", val: "PRESTACIONES SOCIALES" },
        { key: "2", val: "FONDO DE AHORRO" },
        { key: "3", val: "OTROS" },
      ],
    },
    {
      key: "INVERSION",
      val: [
        { key: "0", val: "PERSONAL" },
        { key: "1", val: "JURIDICO" },
        { key: "2", val: "GUBERNAMENTAL" },
      ],
    },
    { key: "MIXTO", val: [{ key: "0", val: "JURIDICO" }] },
  ];

  public lstTipoFid = [];

  public lstContratos = [];
  public razonsocial = '';
  public semillero: Semillero = {
    codigo: 0,
    plan: '',
    descripcion: '',
    fecha: new Date(),
    autor: '',
  };

  public Comprobante: FID_IComprobante = {
    plan: 0,
    codigo: '',
    descripcion: '',
    detalle: '',
    fecha_operacion: '',
    fecha_ejercicio: '',
    debe: 0,
    haber: 0,
    llave: 'M'
  };

  public IDComprobante: FID_IDetalleComprobante = {
    comprobante: 0,
    cuenta: 0,
    debe: 0,
    haber: 0,
    fecha_operacion: '',
    fecha_ejercicio: '',
  };

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
  };

  public fechacreacion = new FormControl(new Date());
  public fechaejercicio = new FormControl(new Date());

  public lstComprobante = [];

  public lst = [];

  public porta_search = false;
  public porta_insert = true;
  public focus: boolean = false;
  public active: boolean = false;
  public buscar = "";
  public selectedIndex = 0;
  public debe: number = 0.0;
  public haber: number = 0.0;
  public saldo_debe: string = "0.00";
  public saldo_haber: string = "0.00";
  public lstCuenta = [];

  public cuenta: string = "";
  myCuentas = new FormControl("");
  Cuentas: string[] = [];
  filteredCuentas: Observable<string[]>;

  constructor(
    private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private toastrService: ToastrService,
    private util: UtilService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    //this.fechacreacion.setValue(this.Contrato.Saldos.fechacreacion)
    this.cargarContenido();
    this.GenerarSemillero();
    this.ListarComprobantes();
  }

  CompletarCeros(e : string ) : string{
    return this.util.zfill(e, 4)
  }

  
  ListarComprobantes() {
    this.xAPI.funcion = "FID_CComprobantes";
    this.xAPI.parametros = "";
    this.xAPI.valores = "";
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        // console.log(data.Cuerpo)
        this.lst = data.Cuerpo;
        
      },
      (err) => {}
    );
  }

  ConsultarComprobante() {}

  ConsultarContrato() {
    this.xAPI.funcion = "FID_CContrato";
    this.xAPI.parametros = this.Comprobante.plan.toString();
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null) {
          this.Contrato = data[0];
          // this.fechacreacion.setValue(this.Contrato.Saldos.fechainicio)

          this.getTipoFideicomiso();
        } else {
          let aux = this.Comprobante.plan;
          this.Limpiar();
          this.Comprobante.plan = aux;
        }
      },
      (error) => {
        console.log(error);
        this.Limpiar();
      }
    );
  }

  getTipoFideicomiso() {
    let codigo = this.Contrato.plan;
    // console.log(codigo)

    this.lstTipoFid = [];
    this.lstTipoFideicomiso.forEach((e) => {
      if (e.key == codigo) {
        this.lstTipoFid = e.val;
      }
    });

    // console.log(this.lstTipoFid)
  }

  Buscar(e) {}

  editar(e) {
    console.log(e)
    this.Comprobante = e
    this.ELEMENT_DATA = JSON.parse( e.definicion).map(ev => {
      ev.fecha = e.fecha_operacion
      ev.codigo = ev.cuenta
      ev.cuenta = ev.detalle
      
      return ev
    });
    console.log(this.ELEMENT_DATA)
    this.dataSource = new MatTableDataSource<IComprobante>(this.ELEMENT_DATA);
    this.dataSource.paginator = this.paginator;
    this.selectedIndex = 1
    this.active = true
    this.TotalizarElement()
  }

  tabActive(event) {
    this.selectedIndex = event.index;
    if (!this.active) {
      this.Limpiar();

      this.GenerarSemillero();
      // this.Listar()
    } else {
      this.ListarComprobantes();
      this.active = !this.active;
    }
  }

  Limpiar() {
    this.Comprobante = {
      plan: 0,
      codigo: '',
      descripcion: '',
      detalle: '',
      fecha_operacion: '',
      fecha_ejercicio: '',
      debe: 0,
      haber: 0,
      llave: 'M'
    };
  }

  Consultar() {}

  Seleccionar() {}

  GenerarSemillero() {
    this.xAPI.funcion = "FID_CSemilleroContable";
    this.xAPI.parametros = "";
    this.xAPI.valores = {};
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        if (data != null) {
          let codigo = parseInt(data[0].codigo) + 1;
          this.Comprobante.codigo = this.util.zfill(codigo, 4);
        } else {
          this.Comprobante.codigo = "0001";
        }
      },
      (error) => {
        console.log(error);
        //this.Limpiar()
      }
    );
  }

  cargarContenido(): any {
    this.lstComprobante = [];
    this.xAPI.funcion = "FID_CCuentas";
    this.xAPI.parametros = "";
    this.xAPI.valores = "";
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstComprobante = data.Cuerpo;

        this.lstComprobante.forEach((e) => {
          if (e.totalizadora == "0") {
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
            let valor = cta + " | " + e.descripcion.toUpperCase();
            this.Cuentas.push(valor);

            this.lstCuenta.push({ id: e.id, cuenta: cta });
          }
        });

        this.filteredCuentas = this.myCuentas.valueChanges.pipe(
          startWith(""),
          map((value) => this._filterCuentas(value || ""))
        );
      },
      (err) => {
        console.error(err);
      }
    );
  }

  private _filterCuentas(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.Cuentas.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  addElement() {
    // this.saldo_debe = parseFloat(this.saldo_debe * 1
    // this.saldo_haber = this.saldo_haber * 1

    if (this.debe <= 0 && this.haber <= 0) {
      this._snackBar.open("Por favor verifique los campos ", "ok");
      return;
    }

    let fecha = new Date(this.fechaejercicio.value).toISOString();
    let cta = this.cuenta.split("|");
    let debe = parseFloat(this.debe.toString())
    let haber = parseFloat(this.haber.toString())

    let detalle = {
      cuenta: cta[0].trim(),
      descripcion: cta[1].trim(),
      debe: parseFloat(debe.toFixed(2)),
      haber: parseFloat(haber.toFixed(2)),
      fecha: fecha.substr(0, 10),
      referencia: '',
      auxiliar: '',
      cc: '',
      tipo: '',
      estatus: false,
    };
    // if ( this.IComprobante.plan == '' ) {
    //   this._snackBar.open('Por favor seleccione un plan o fideicomiso','ok')
    //   return
    // }

    let sd = parseFloat(this.saldo_debe) + debe
    let sh = parseFloat(this.saldo_haber) + haber
    this.saldo_debe = sd.toFixed(2);
    this.saldo_haber = sh.toFixed(2);

    this.ELEMENT_DATA.push(detalle);

    this.dataSource = new MatTableDataSource<IComprobante>(this.ELEMENT_DATA);
    this.dataSource.paginator = this.paginator;
    this.cuenta = "";
    this.myCuentas.setValue("");
    this.debe = 0;
    this.haber = 0;
  }


  eliminar(e) {
    let pos = 0

    for (let i = 0; i < this.ELEMENT_DATA.length; i++) {
      const ev = this.ELEMENT_DATA[i];
      console.log(e.cuenta, ' ', ev.cuenta)
      if (e.cuenta.trim() == ev.cuenta.trim()){
        pos = i
      }
    }

    this.ELEMENT_DATA.splice(pos, 1);
    this.dataSource = new MatTableDataSource<IComprobante>(this.ELEMENT_DATA);
    this.dataSource.paginator = this.paginator;

    this.TotalizarElement()

  }

  TotalizarElement(){
    let debe = 0;
    let haber = 0;
    this.ELEMENT_DATA.map((e) => {
      debe += parseFloat(e.debe.toString());
      haber += parseFloat(e.haber.toString());
    });
    this.saldo_debe = debe.toFixed(2);
    this.saldo_haber = haber.toFixed(2);
  }


  getComprobante() {
    let debe = 0;
    let haber = 0;
    this.ELEMENT_DATA.map((e) => {
      debe += parseFloat(e.debe.toString());
      haber += parseFloat(e.haber.toString());
    });

    this.Comprobante.detalle =
      this.Contrato.rif + ' - ' + this.Contrato.razonsocial.toUpperCase();
    this.Comprobante.fecha_operacion = this.util.ConvertirFechaDB(
      this.fechaejercicio.value
    );
    this.Comprobante.fecha_ejercicio = this.util.ConvertirFechaDB(
      this.fechacreacion.value
    );

    this.Comprobante.debe = debe;
    this.Comprobante.haber = haber;
    console.log(this.Comprobante);
  }

  async Guardar() {
    if (this.saldo_debe != this.saldo_haber) {
      let saldo = parseFloat(this.saldo_debe) - parseFloat(this.saldo_haber)
      let msj = 'Existe una diferencia de Bs. ' + (saldo * -1) 
      if( parseFloat(this.saldo_debe) > parseFloat(this.saldo_haber) ) msj = 'Existe una diferencia de Bs. '  + saldo 
      this.apiService.Mensaje(msj, 'Advertencia', 'warning', 'comprobante')
      return
    }
    
    Swal.fire({
      title: 'Esta seguro que desea realizar la operación',
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.Acepar()
      }
    })

  }

  Acepar(){
    
    this.getComprobante();
    this.ngxService.startLoader('load-cont');
    this.xAPI.funcion = 'FID_IComprobante';
    this.xAPI.parametros = '';
    this.xAPI.valores = JSON.stringify(this.Comprobante);
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async (data) => {
        // console.log(data);
        await this.GuardarDetalle(data.msj);
        this.ngxService.stopLoader('load-cont');
        this.ELEMENT_DATA = [];
        this.dataSource = new MatTableDataSource<IComprobante>(this.ELEMENT_DATA);
        this.dataSource.paginator = this.paginator;
        this.Limpiar()
      },
      (err) => {}
    );
  }

  async GuardarDetalle(comprobante: number) {
    this.IDComprobante.comprobante = comprobante;
    await this.ELEMENT_DATA.map(async (e) => {
      this.IDComprobante.debe = e.debe;
      this.IDComprobante.haber = e.haber;
      this.IDComprobante.fecha_ejercicio = this.util.ConvertirFechaDB(
        this.fechaejercicio.value
      );
      this.IDComprobante.fecha_operacion = this.util.ConvertirFechaDB(
        this.fechacreacion.value
      );
      this.IDComprobante.cuenta = this.getIDCuenta(e.cuenta);
      this.xAPI.funcion = 'FID_IDetalleComprobante';
      this.xAPI.parametros = '';
      this.xAPI.valores = JSON.stringify(this.IDComprobante);

      await this.apiService.Ejecutar(this.xAPI).subscribe(
        (data) => {
          console.log('detalle insertado ', data);
        },
        (err) => {}
      );
    });
  }

  getIDCuenta(cuenta: string): number {
    let fd = 0;
    this.lstCuenta.forEach((e) => {
      if (e.cuenta == cuenta) {
        fd = e.id;
        return;
      }
    });

    return fd;
  }

  getMoneda(e) : string {
    return this.util.ConvertirMoneda(e.debe);
  }
  
  getFecha(f) : string {
    return this.util.ConvertirFechaHumana(f) 
  }

  eliminarComprobante(id, detalle){
    
    Swal.fire({
      title: `¿Estás seguro que desea eliminar? \n\n ${detalle} `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteData(id)
      }
    })

  }

  deleteData(id) {
    this.ngxService.startLoader('load-cont');
    this.xAPI.funcion = 'FID_EComprobante'
    this.xAPI.parametros = `${id}`
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        this.toastrService.success(
          'Se ha eliminado comprobante con exito',
          `Fideicomiso`
        );
        this.ngxService.stopLoader('load-cont')
        this.ListarComprobantes()
      },
      err => {
        this.toastrService.error(
          'No se ha logrado eliminar el comprobante',
          `Fideicomiso`
        );
        this.ngxService.stopLoader('load-cont');
      }
    )
  }

  abrirDialogo(){
    this.dialog.open(ComprobanteDialogComponent, {
      width: '60%',
      data: {datos: this.ELEMENT_DATA}
    });
  }

}



