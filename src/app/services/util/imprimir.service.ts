import { Inject, Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root'
})
export class ImprimirService {

    createHtmlSectionForPrint(printContents: any, i: number = 0, xsize : string = '') {
        const printWindow = window.open('', '_blank');
        printWindow?.document.write(`
            <html>
            
            <body>${printContents}</body>
            </html>
        `);

        if (i === 0) {
            printWindow.document.head.innerHTML = ` 
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
            <style type="text/css">
            @page { 
                size: letter portrait;
                margin: 15mm 20mm;
                ${xsize}
            }
            @media print {
                body { padding: 0; margin: 0; }
                div, table, thead, tbody, tfoot, tr, th, td, p { font-family: "Roboto", sans-serif; }
                section { page-break-before: always; }
            }

            body { 
                font-family: "Roboto", sans-serif;
                font-size: 14px;
                line-height: 1.5;
                color: #333;
                margin: 0;
                padding: 15mm 20mm;
            }

            h1 { font-size: 18px; font-weight: 500; margin: 0; padding: 12px 24px; background-color: #fafafa; border-bottom: 1px solid #e0e0e0; }
            </style>`
        } else {

            printWindow.document.head.innerHTML = ` 
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
            <style type="text/css">
                @media print {
                    @page { 
                        size: landscape; 
                    
                    }
            table{
                border-collapse: collapse;
                font-size: 10.5px;
                width: 100%;
            }
            
            div,table,thead,tbody,tfoot,tr,th,td,p { font-family:"Roboto"; font-size:x-small }

            .titulo th {
                border: 1px solid black;
            }
            
            .cabecera th {
                border: 1px solid black;
                text-align: center;
                background-color: rgb(182, 167, 167);
            }
            
            tr td {
                border: 1px solid black;
                text-align: center;
            }
            
            
            td, th{
                padding: 0.5rem;
            }
            
            .right {
                text-align: right;
            }
            
            .bgblue {
                background-color: rgb(182, 167, 167);
                color: white;
            }
            
            .none {
                border:none ;
            }
            
            .linea {
                background-color: rgb(255, 255, 255);
            }
            
            .yellow {
            background-color: rgb(97, 97, 75);
            }
        }

        table{
                border-collapse: collapse;
                font-size: 10.5px;
                width: 100%;
            }
            
            div,table,thead,tbody,tfoot,tr,th,td,p { font-family:"Roboto"; font-size:x-small }

            .titulo th {
                border: 1px solid black;
            }
            
            .cabecera th {
                border: 1px solid black;
                text-align: center;
                background-color: rgb(182, 167, 167);
            }
            
            tr td {
                border: 1px solid black;
                text-align: center;
            }
            
            
            td, th{
                padding: 0.5rem;
            }
            
            .right {
                text-align: right;
            }
            
            .bgblue {
                background-color: rgb(182, 167, 167);
                color: white;
            }
            
            .none {
                border:none ;
            }
            
            .linea {
                background-color: rgb(255, 255, 255);
            }
            
            .yellow {
            background-color: rgb(97, 97, 75);
            }
            `
        }

        setTimeout(() => {
            printWindow?.document.close();
            printWindow?.print();
            printWindow?.close();
        }, 1000); //1 second

    }
}
