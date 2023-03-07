import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Maestro } from 'src/app/services/util/tabla.service';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { MensajeService } from 'src/app/services/util/mensaje.service';




@Component({
  selector: 'app-tabla',
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.scss']
})
export class TablaComponent implements OnInit {

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: ''
  }


  public ELEMENT_DATA: Maestro[] = [];


  displayedColumns: string[] = ['codigo', 'nombre', 'observacion', 'fecha'];

  dataSource: any

  public nombre: string = ""

  public observacion: string = ""

  @ViewChild(MatPaginator) paginator: MatPaginator;

  //@Input ('columnas') displayedColumns: string[];

  @Input() API: string // = ['codigo', 'nombre', 'descripcion'];

  constructor(private apiService: ApiService,
    private msj: MensajeService) {

  }

  ngOnInit(): void {
    this.msj.contenido$.subscribe(e => {
      console.log(e)
    })
  }


  async ngOnChanges() {

    /*  */

  }


  ngAfterViewInit() {



  }


  Guardar() {
    const contenido = {
      'tabla': this.API,
      'nombre': this.nombre,
      'observacion': this.observacion,
      'version': '0.0.1',
      'autor': 'ADMIN'
    }

    this.xAPI.funcion = "SEC_IData"
    this.xAPI.parametros = ""
    this.xAPI.valores = JSON.stringify(contenido)
    // this.apiService.Ejecutar(this.xAPI).subscribe(
    //   (data) => {
    //     console.log(data)
    //     this.apiService.Mensaje('Proceso exitoso', 'Felicitaciones', 'success', 'Data')
    //   },
    //   (err) => {
    //     console.error(err)
    //   }
    // )
    console.log(this.API)

    this.nombre = ''
    this.observacion = ''
  }


  cargarContenido(): any {

    this.ELEMENT_DATA = []
    this.xAPI.funcion = "SEC_CData"
    this.xAPI.parametros = this.API
    this.xAPI.valores = ""
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {

        this.ELEMENT_DATA = data.Cuerpo
        this.dataSource = new MatTableDataSource<Maestro>(this.ELEMENT_DATA)
        this.dataSource.paginator = this.paginator
      },
      (err) => {
        console.error(err)
      }
    )
  }

}
