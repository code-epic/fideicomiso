import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { FID_IComprobante } from 'src/app/services/banfanb/comprobante.service';
import { LAporteInicial } from 'src/app/services/banfanb/contabilidad.service';
import { UtilService } from 'src/app/services/util/util.service';

@Component({
  selector: 'app-aporteinicial',
  templateUrl: './aporteinicial.component.html',
  styleUrls: ['./aporteinicial.component.scss']
})
export class AporteinicialComponent implements OnInit {

  public lstAsientos = []
  public fechaultimo = ''
  public fechai: any
  public bcuentat: boolean = false
  public blprocesar: boolean = false
  public ELEMENT_DATA: LAporteInicial[] = [];
  displayedColumns: string[] = [
    "codigo",
    "plan",
    "monto",
  ];
  dataSource: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public acum_debe = 0
  public acum_haber = 0
  public max = 0

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
  }

  public Comprobante: FID_IComprobante = {
    plan: 0,
    codigo: "",
    descripcion: "",
    detalle: "",
    fecha_operacion: "",
    fecha_ejercicio: "",
    debe: 0,
    haber: 0,
    llave: ''
  };


  constructor(private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    public formatter: NgbDateParserFormatter,) { }

  ngOnInit(): void {
    let d = new Date().toISOString().substring(0, 10).split('-')
    this.fechaultimo = d[2] + '/' + d[1] + '/' + d[0]
  }



  Listar() { }

  Calcular() {

    if (this.fechai == undefined) {
      this._snackBar.open('Recuerde seleccionar una fecha', 'OK')
      return
    }
    let fini = this.util.ConvertirFechaDB(this.fechai)
    this.ngxService.startLoader('load-cont')
    this.xAPI.funcion = "FID_CAporteInicial"
    this.xAPI.parametros = fini
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        // console.log(data)
        data.Cuerpo.map(e => {
          this.ELEMENT_DATA.push({
            id: e.id,
            codigo: e.fideicomiso.toUpperCase(),
            plan: e.observacion.toUpperCase(),
            monto: e.monto_apertura
          });
        })

        this.dataSource = new MatTableDataSource<LAporteInicial>(
          this.ELEMENT_DATA

        );
        this.dataSource.paginator = this.paginator;
        this.blprocesar = true
        this.ngxService.stopLoader('load-cont')
      },
      (error) => {
        console.log(error)
        this.ngxService.stopLoader('load-cont')
      }
    )
  }


  Procesar() {
    this.max = this.ELEMENT_DATA.length;
    this.InsertData(0)
  }

  InsertData(cant: number) {
    if (cant == this.max) {
      this.ngxService.stopLoader('load-cont')
      this.ELEMENT_DATA = []
      this.dataSource = new MatTableDataSource<LAporteInicial>(
        this.ELEMENT_DATA
      );
      this.dataSource.paginator = this.paginator;
      this.blprocesar = false
      this.apiService.Mensaje('Proceso exitoso', 'Se han creado los comprobantes', 'info', 'comprobante')
      return
    }
    let monto = parseFloat(this.ELEMENT_DATA[cant].monto)
    let idplan = this.ELEMENT_DATA[cant].id.toString()
    let detalle = this.ELEMENT_DATA[cant].plan.split('|')

    this.Comprobante = {
      plan: this.ELEMENT_DATA[cant].id,
      codigo: "",
      descripcion: "APORTE INICIAL",
      detalle: `${detalle[0]} - ${detalle[1]}`,
      fecha_operacion: this.util.ConvertirFechaDB(this.fechai),
      fecha_ejercicio: this.util.ConvertirFechaDB(this.fechai),
      debe: monto,
      haber: monto,
      llave: 'M'
    }

    this.xAPI.funcion = "FID_IComprobante"
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(this.Comprobante)
    cant++
    // console.log(this.xAPI)
    // this.InsertData(cant)

    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        console.log(data)

        this.xAPI.funcion = "FID_IAporteInicial"
        this.xAPI.parametros = data.msj + ',' + idplan
        this.xAPI.valores = ''
        this.apiService.Ejecutar(this.xAPI).subscribe(
          data => {
            this.InsertData(cant)
          },
          (error) => {
            console.log(error)
            this.ngxService.stopLoader('load-cont')
          }
        )
        // this.InsertData(cant)
      },
      (error) => {
        console.log(error)
        this.ngxService.stopLoader('load-cont')
      }
    )

  }
}
