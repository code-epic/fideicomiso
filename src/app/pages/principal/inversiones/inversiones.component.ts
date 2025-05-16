import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { ApiService, IAPICore } from "src/app/services/apicore/api.service";
import { UtilService } from "src/app/services/util/util.service";

@Component({
  selector: "app-inversiones",
  templateUrl: "./inversiones.component.html",
  styleUrls: ["./inversiones.component.scss"],
})
export class InversionesComponent implements OnInit {
  constructor() {}

  ngOnInit(): void { }
}
