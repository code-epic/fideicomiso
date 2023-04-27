import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Maestro } from 'src/app/services/util/tabla.service';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { MensajeService } from 'src/app/services/util/mensaje.service';

@Component({
  selector: 'app-contabilidad',
  templateUrl: './contabilidad.component.html',
  styleUrls: ['./contabilidad.component.scss']
})

export class ContabilidadComponent implements OnInit {

 

  constructor(private apiService: ApiService,
    private msj: MensajeService) {

  }

  ngOnInit(): void {
  }


}




