import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { LAporteInicial, LIncremento } from 'src/app/services/banfanb/contabilidad.service';
import { UtilService } from 'src/app/services/util/util.service';

@Component({
  selector: 'app-incrementos',
  templateUrl: './incrementos.component.html',
  styleUrls: ['./incrementos.component.scss']
})
export class IncrementosComponent implements OnInit {

  public Incremento: any
  public blprocesar: boolean = false
  public fechai: any
  public idplan: number = 0
  public fideicomiso: string = ''
  public plan = ''
  public rif = ''

  public monto = ''

  public ELEMENT_DATA: LIncremento[] = [];
  displayedColumns: string[] = [
    "codigo",
    "plan",
    "tipo",
    "monto",
  ];

  dataSource: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;


  public xAPI: IAPICore = {
    funcion: '',
    parametros: ''
  }

  public fechaultimo = ''

  public max: number = 0

  minDate: Date;
  maxDate: Date;




  constructor(private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    public formatter: NgbDateParserFormatter,) { }



  // Establecer el rango de fechas
  setDateRange(startDate: Date, endDate: Date) {
    this.minDate = startDate;
    this.maxDate = endDate;
  }

  // Manejar el evento de entrada de fecha
  onDateInput(event: MatDatepickerInputEvent<Date>) {
    const selectedDate = event.value;
    if (selectedDate < this.minDate || selectedDate > this.maxDate) {
      // Limpiar la selección si está fuera del rango
      // Puedes mostrar un mensaje o tomar otra acción aquí
    }
  }


  ngOnInit(): void {
    // let d = new Date().toISOString().substring(0, 10).split('-')
    // this.fechaultimo = d[2] + '/' + d[1] + '/' + d[0]
    this.UltimoCierre()
  }

  UltimoCierre() {

    this.xAPI.funcion = "FID_CUltimoCierre"
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null) {
          let fecha = data.Cuerpo[0].fecha_cierre
          let d = fecha.split('-')
          this.fechaultimo = d[2] + '/' + d[1] + '/' + d[0]
          this.minDate = new Date(this.fechaultimo)
          this.maxDate = new Date(2024, 12, 31)
        }
        this.ngxService.stopLoader('load-cont')
      },
      (error) => {
        this.ngxService.stopLoader('load-cont')
        console.log(error)
      }
    )
  }

  Seleccionar() { }

  ConsultarContrato() {
    this.ngxService.startLoader('load-cont')
    this.plan = this.util.zfill(this.plan, 4)

    this.xAPI.funcion = "FID_CContrato"
    this.xAPI.parametros = this.plan
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null) {
          let Contrato = data[0]
          this.rif = Contrato.rif + '-' + Contrato.razonsocial
          this.fideicomiso = Contrato.plan
          this.idplan = parseInt(this.plan)

        }
        this.ngxService.stopLoader('load-cont')
      },
      (error) => {
        this.ngxService.stopLoader('load-cont')
        console.log(error)
      }
    )
  }

  Add() {
    this.ELEMENT_DATA.push({
      id: this.idplan,
      codigo: this.plan,
      tipo: this.fideicomiso.toUpperCase(),
      plan: this.rif.toUpperCase(),
      monto: this.monto,
      fecha: this.util.ConvertirFechaDB(this.fechai)
    })

    this.dataSource = new MatTableDataSource<LIncremento>(this.ELEMENT_DATA)
    this.dataSource.paginator = this.paginator;

    this.monto = ''
    this.fechai = ''
    this.rif = ''
    this.plan = ''
    this.blprocesar = true
  }


  Procesar() {
    this.max = this.ELEMENT_DATA.length
    this.insertData(0)
  }

  close() {
    this.ngxService.stopLoader('load-cont')
    this.ELEMENT_DATA = []
    this.dataSource = new MatTableDataSource<LIncremento>(
      this.ELEMENT_DATA
    );
    this.dataSource.paginator = this.paginator;
    this.blprocesar = false
    this.apiService.Mensaje('Proceso exitoso', 'Se han creado los comprobantes', 'info', 'comprobante')
  }

  insertData(cant: number) {

    if (cant == this.max) {
      this.close()
      return
    }
    // console.log(this.ELEMENT_DATA)
    let monto = parseFloat(this.ELEMENT_DATA[cant].monto)
    let idplan = this.ELEMENT_DATA[cant].id
    let fecha = this.ELEMENT_DATA[cant].fecha
    let Comprobante = {
      plan: idplan,
      codigo: this.ELEMENT_DATA[cant].codigo,
      descripcion: "INCREMENTO DE CAPITAL",
      detalle: `${this.ELEMENT_DATA[cant].plan}`,
      fecha_operacion: fecha,
      fecha_ejercicio: fecha,
      debe: monto,
      haber: monto,
    }

    this.xAPI.funcion = "FID_IComprobante"
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(Comprobante)
    cant++
    // console.log(this.xAPI)

    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        console.log(data)

        this.xAPI.funcion = "FID_IIncremento"
        this.xAPI.parametros = `${data.msj},${monto},${fecha},${idplan}`,
          this.xAPI.valores = ''
        this.apiService.Ejecutar(this.xAPI).subscribe(
          data => {
            this.insertData(cant)
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



  getMoneda(e): string {
    let data = this.util.ConvertirMoneda(e)
    return data
  }

}
