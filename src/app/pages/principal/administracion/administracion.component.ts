import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';


@Component({
  selector: 'app-administracion',
  templateUrl: './administracion.component.html',
  styleUrls: ['./administracion.component.scss']
})

export class AdministracionComponent implements OnInit {

  public xAPI: IAPICore = {
    funcion: '',
    parametros: ''
  }


  public producto : string = "0"


  @ViewChild('hechicero', { static: true }) hechicero: TemplateRef<any>;

  public lstMaestro : any

  constructor( private apiService: ApiService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService) { }

  ngOnInit(): void {
  }

  ListarProductos(): void {
    this.xAPI.funcion = "CCEC_CMaestro"
    this.xAPI.parametros = "%"
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstMaestro = data.Cuerpo
      },
      (err) => {
        console.error(err)
      }
    )

  }

  openDialog(): void {
    const dialogRef = this.dialog.open(this.hechicero, {
      width: '850px',
      data: {},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // this.animal = result;
    });
  }

  seleccionNavegacion(e){
    
  }

}
