import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { DateTimeHelper } from '@core/helpers';

import jsPDF from 'jspdf';
import autoTable, { CellDef, RowInput } from 'jspdf-autotable';

import { GridValuesHelper } from '../../timesheets/helpers';
import { PrintInvoiceData, PrintInvoiceMeta } from '../interfaces';

@Injectable()
export class InvoicePrintingService {
  printInvoice(data: PrintInvoiceData[]): void {
    const doc = this.createDoc();
    const logo = this.createImage();

    data.forEach((invoice, index: number) => {
      if (index !== 0) {
        doc.addPage();
      }

      this.addInvoiceHeader(doc, invoice.meta);
      this.addOrgInvoiceBody(doc, invoice, logo);
    });

    this.addPageFooter(doc);
    doc.save();
  }

  printAgencyInvoice(data: PrintInvoiceData[]): void {
    const doc = this.createDoc();
    const logo = this.createImage();


    data.forEach((invoice, index: number) => {
      if (index !== 0) {
        doc.addPage();
      }

      this.addAgencyInvoiceHeader(doc, invoice.meta);
      this.addAgencyInvoiceBody(doc, invoice, logo);
    });
    
    this.addPageFooter(doc);
    doc.save();
  }

  private addInvoiceHeader(doc: jsPDF, metaData: PrintInvoiceMeta): void {
    autoTable(doc, {
      margin: { top: 45, left: 20, right: 20, bottom: 0 },
      body: [
        [
          {
            content: `Hallmark Healthcare Solutions, Inc
200 Motor Parkway, Suite D#26
Hauppauge, NY 11788`,
            styles: {
              fontSize: 10,
              halign: 'left',
              fontStyle: 'bold',
              cellWidth: 300,
            },
          }, 
          {
            content: `Invoice No: ${metaData.formattedInvoiceNumber}
Invoice Date: ${GridValuesHelper.formatDate(metaData.invoiceDate, 'MM/dd/yyyy')}
Net Payment Terms: ${metaData.paymentTerms}
Due Date: ${GridValuesHelper.formatDate(metaData.dueDate, 'MM/dd/yyyy')}`,
            styles: {
              fontSize: 10,
              halign: 'right',
              fontStyle: 'bold',
              cellWidth: 'auto',
            },
          },
        ],
      ],
      theme: 'plain',
    });

    autoTable(doc, {
      margin: { top: 5, left: 50, right: 4 },
      body: [
        [
          {
            content: 'To,',
            styles: {
              fontSize: 10,
              halign: 'left',
              fontStyle: 'bold',
              overflow: 'linebreak',
            },
          },
        ],
        [
          {
            content: metaData.unitName,
            styles: {
              fontSize: 10,
              halign: 'left',
              fontStyle: 'bold',
              overflow: 'linebreak',
              cellPadding: { left: 10 },
            },
          },
        ],
        [
          {
            content: metaData.unitAddress,
            styles: {
              fontSize: 10,
              halign: 'left',
              fontStyle: 'normal',
              cellWidth: 'wrap',
              overflow: 'linebreak',
              cellPadding: { left: 10, top: 5, right: 15 },
            }, 
          },
        ],
      ],
      theme: 'plain',
    });
  }

  private addAgencyInvoiceHeader(doc: jsPDF, metaData: PrintInvoiceMeta): void {
    autoTable(doc, {
      margin: { top: 45, left: 20, right: 20, bottom: 0 },
      body: [
        [
          {
            content: `${metaData.unitName}
${metaData.unitAddress}`,
            styles: {
              fontSize: 10,
              halign: 'left',
              fontStyle: 'bold',
              cellWidth: 300,
            },
          }, 
          {
            content: `Invoice No: ${metaData.formattedInvoiceNumber}
Invoice Date: ${GridValuesHelper.formatDate(metaData.invoiceDate, 'MM/dd/yyyy')}
Net Payment Terms: ${metaData.paymentTerms}
Due Date: ${GridValuesHelper.formatDate(metaData.dueDate, 'MM/dd/yyyy')}`,
            styles: {
              fontSize: 10,
              halign: 'right',
              fontStyle: 'bold',
              cellWidth: 'auto',
            },
          },
        ],
      ],
      theme: 'plain',
    });

    autoTable(doc, {
      margin: { top: 5, left: 50, right: 4 },
      body: [
        [
          {
            content: 'To,',
            styles: {
              fontSize: 10,
              halign: 'left',
              fontStyle: 'bold',
              overflow: 'linebreak',
            },
          },
        ],
        [
          {
            content: `Hallmark Healthcare Solutions, Inc`,
            styles: {
              fontSize: 10,
              halign: 'left',
              fontStyle: 'bold',
              overflow: 'linebreak',
              cellPadding: { left: 10 },
            },
          },
        ],
        [
          {
            content: `200 Motor Parkway, Suite D#26
Hauppauge, NY 11788`,
            styles: {
              fontSize: 10,
              halign: 'left',
              fontStyle: 'normal',
              cellWidth: 'wrap',
              overflow: 'linebreak',
              cellPadding: { left: 10, top: 5, right: 15 },
            }, 
          },
        ],
      ],
      theme: 'plain',
    });
  }

  private addOrgInvoiceBody(doc: jsPDF, data: PrintInvoiceData, img: HTMLImageElement): void {
    const bodyRows: RowInput[] = data.invoiceRecords.map((record) => {
      const formatedValue = record.total > 0 ? GridValuesHelper.formatAbsNumber(record.value, '1.2-2')
      : `(${GridValuesHelper.formatAbsNumber(record.value, '1.2-2')})`;

      return [
        {
          content: formatDate(DateTimeHelper.toUtcFormat(record.weekDate), 'MM/dd/YYYY', 'en-US', 'utc'),
          styles: {
            halign: 'left',
          },
        },
        {
          content: DateTimeHelper.formatDateUTC(record.timeIn, 'MM/dd/YYYY HH:mm'),
          styles: {
            halign: 'left',
          },
        },
        DateTimeHelper.formatDateUTC(record.timeOut, 'MM/dd/YYYY HH:mm'),
        record.billRateConfigName,
        record.costCenterFormattedName,
        record.formattedJobId,
        `${record.candidateFirstName}, ${record.candidateLastName}`,
        record.agencyName,
        record.skillName,
        {
          content: formatedValue,
          styles: {
            halign: 'right',
          },
        },
        {
          content: GridValuesHelper.formatAbsCurrency(record.rate),
          styles: {
            halign: 'right',
          },
        },
        {
          content: GridValuesHelper.formatAbsCurrency(record.total),
          styles: {
            halign: 'right',
          },
        },
      ];
    });

    const totalRows: RowInput[] = [
      [
        {
          content: '',
          colSpan: 12,
        },
      ],
      [
        {
          content: 'Invoice Amount:',
          colSpan: 11,
          styles: { halign: 'right', fontStyle: 'bold' },
        },
        {
          content: GridValuesHelper.formatAbsCurrency(data.totals.amount),
          styles: { halign: 'right', fontStyle: 'normal' },
        },
      ],
    ];

    const summaryRows: RowInput[] = [
      [
        {
          content: 'Summary',
          colSpan: 12,
          styles: {
            fillColor: '#CFCFCF',
            fontStyle: 'bold',
            halign: 'center',
          },
        },
      ],
      [
        {
          content: 'Location',
          colSpan: 3,
          styles: {
            fillColor: '#CFCFCF',
            lineColor: '#181919',
            halign: 'left',
            minCellWidth: 80,
          },
        },
        {
          content: 'Department',
          colSpan: 3,
          styles: {
            fillColor: '#CFCFCF',
            lineColor: '#181919',
            halign: 'left',
            minCellWidth: 80,
          },
        },
        {
          content: 'Skill',
          styles: {
            fillColor: '#CFCFCF',
            lineColor: '#181919',
            halign: 'left',
          },
        },
        { 
          content: 'Hours/Miles',
          styles: {
            fillColor: '#CFCFCF',
            lineColor: '#181919',
            halign: 'left',
          },
        },
        { 
          content: 'Total Amount',
          styles: {
            fillColor: '#CFCFCF',
            lineColor: '#181919',
            halign: 'right',
          },
        },
        {
          content: 'Addl. Details',
          colSpan: 3,
          styles: {
            fillColor: '#CFCFCF',
            lineColor: '#181919',
            halign: 'left',
            minCellWidth: 150,
          },
        },
      ],
    ];

    bodyRows.push(...totalRows);

    data.summary.forEach((summary) => {
      summary.items.forEach((detail, idx: number) => {
        const loactionIdText = detail.locationIExternalId  ? `${detail.locationIExternalId}-` : '';
        const departmentIdText = detail.invoiceDepartmentId ? `-${detail.invoiceDepartmentId}` : '';
        const skillGlText = detail.skillGLNumber ? `-${detail.skillGLNumber}` : '';
        const additionalDetails = `${loactionIdText}${detail.departmentName}${departmentIdText}${skillGlText}`;
        const formatedValue = detail.total > 0 ? GridValuesHelper.formatAbsNumber(detail.value, '1.2-2')
        : `(${GridValuesHelper.formatAbsNumber(detail.value, '1.2-2')})`;

        const sum: CellDef[] = [
          idx === 0 ? {
            content: summary.locationName, 
            colSpan: 3,
            rowSpan: summary.items.length,
            styles: {
              halign: 'left',
              fontStyle: 'normal',
              lineColor: '#181919',
            },
          } :  {},
          {
            content: detail.departmentName,
            colSpan: 3,
            styles: {
              halign: 'left',
              fontStyle: 'normal',
              lineColor: '#181919',
            },
          },
          {
            content: detail.skillName,
            styles: {
              halign: 'left',
              fontStyle: 'normal',
              lineColor: '#181919',
            },
          },
          {
            content: formatedValue,
            styles: {
              halign: 'right',
              fontStyle: 'normal',
              lineColor: '#181919',
            },
          },
          {
            content: GridValuesHelper.formatAbsCurrency(detail.total),
            styles: {
              halign: 'right',
              fontStyle: 'normal',
              lineColor: '#181919',
            },
          },
          {
            content: additionalDetails,
            colSpan: 3,
            styles: {
              halign: 'left',
              fontStyle: 'normal',
              lineColor: '#181919',
            },
          },
        ];

        if (!sum[0]?.content) {
          sum.splice(0, 1);
        }

        summaryRows.push(sum);
      });
    });

    summaryRows.push([
      {
        content: 'Total',
        colSpan: 3,
        styles: {
          halign: 'left',
          fontStyle: 'bold',
          lineColor: '#181919',
        },
      },
      {
        content: '',
        colSpan: 3,
        styles: {
          lineColor: '#181919',
        },
      },
      {
        content: '',
        styles: {
          lineColor: '#181919',
        },
      },
      {
        content: GridValuesHelper.formatAbsNumber(data.totals.total, '1.2-2'),
        styles: {
          fontStyle: 'bold',
          halign: 'right',
          lineColor: '#181919',
        },
      },
      {
        content: GridValuesHelper.formatAbsCurrency(data.totals.amount),
        styles: {
          fontStyle: 'bold',
          halign: 'right',
          lineColor: '#181919',
        },
      },
      {
        content: '',
        colSpan: 4,
        styles: {
          lineColor: '#181919',
        },
      },
    ]);

    summaryRows.push([
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
    ]);

    summaryRows.push([
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: 'Remit Adress:',
        colSpan: 2,
        styles: {
          halign: 'center',
          fillColor: '#F5F5F5',
        },
      },
      {
        content: data.meta.remitAddress,
        colSpan: 2,
        styles: {
          halign: 'left',
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          halign: 'left',
          fillColor: '#F5F5F5',
        },
      }, 
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
    ]);

    autoTable(doc, {
      margin: { top: 50, left: 20, right: 20 },
      tableLineColor: '#181919',
      tableLineWidth: 1,
      head: [['Week End', 'Time in', 'TimeOut', 'Bill Rate Type', 'Cost Center', 'Job ID', 'Candidate Name',
      'Agency', 'Skill', 'Hours/Miles', 'Bill Rate', 'Total']],
      headStyles: {
        fillColor: '#CFCFCF',
        fontStyle: 'bold',
        fontSize: 10,
        overflow: 'linebreak',
        halign: 'center',
        valign: 'middle',
        lineColor: '#181919',
        lineWidth: 1,
        cellPadding: 2,
      },
      body: bodyRows,
      bodyStyles: {
        lineColor: '#181919',
        lineWidth: 1,
        fontSize: 10,
        overflow: 'linebreak',
        cellPadding: 2,
      },
      theme: 'plain',
      didDrawPage: ()=> {
        doc.addImage(img, 'png', 20, 15, 80, 20);
      },
    });

    autoTable(doc, {
      margin: { top: 50, left: 20, right: 20 },
      tableLineColor: '#181919',
      tableLineWidth: 1,
      pageBreak: 'avoid',
      rowPageBreak: 'avoid',
      head: [['Week End', 'Time in', 'TimeOut', 'Bill Rate Type', 'Cost Center', 'Job ID', 'Candidate Name',
      'Agency', 'Skill', 'Hours/Miles', 'Bill Rate', 'Total']],
      showHead: 'never',
      headStyles: {
        fillColor: '#CFCFCF',
        fontStyle: 'bold',
        fontSize: 10,
        overflow: 'linebreak',
        halign: 'center',
        valign: 'middle',
        lineColor: '#181919',
        lineWidth: 1,
        cellPadding: 2,
      },
      body: summaryRows,
      bodyStyles: {
        lineColor: '#D9D9D9',
        lineWidth: 0.8,
        fontSize: 10,
        fontStyle: 'bold',
        cellPadding: 2,
        overflow: 'linebreak',
      },
      theme: 'plain',
      didDrawPage: ()=> {
        doc.addImage(img, 'png', 20, 15, 80, 20);
      },
    });
  }

  private addAgencyInvoiceBody(doc: jsPDF, data: PrintInvoiceData, img: HTMLImageElement): void {
    const bodyRows: RowInput[] = data.invoiceRecords.map((record) => {
      const formatedValue = record.total > 0 ? GridValuesHelper.formatAbsNumber(record.value, '1.2-2')
      : `(${GridValuesHelper.formatAbsNumber(record.value, '1.2-2')})`;

      return [
        {
          content: formatDate(DateTimeHelper.toUtcFormat(record.weekDate), 'MM/dd/YYYY', 'en-US', 'utc'),
          styles: {
            halign: 'left',
          },
        },
        {
          content: formatDate(DateTimeHelper.toUtcFormat(record.timeIn), 'MM/dd/YYYY HH:mm', 'en-US', 'utc'),
          styles: {
            halign: 'left',
          },
        },
        formatDate(DateTimeHelper.toUtcFormat(record.timeOut), 'MM/dd/YYYY HH:mm', 'en-US', 'utc'),
        record.billRateConfigName,
        record.costCenterFormattedName,
        record.formattedJobId,
        `${record.candidateFirstName}, ${record.candidateLastName}`,
        record.organizationName,
        record.skillName,
        {
          content: formatedValue,
          styles: {
            halign: 'right',
          },
        },
        {
          content: GridValuesHelper.formatAbsCurrency(record.rate),
          styles: {
            halign: 'right',
          },
        },
        {
          content: `${GridValuesHelper.formatNumber(record.fee, '1.2-2')}`,
          styles: {
            halign: 'right',
          },
        },
        {
          content: GridValuesHelper.formatAbsCurrency(record.total),
          styles: {
            halign: 'right',
          },
        },
      ];
    });

    const totalRows: RowInput[] = [
      [
        {
          content: '',
          colSpan: 13,
        },
      ],
      [
        {
          content: 'Invoice Amount:',
          colSpan: 12,
          styles: { halign: 'right', fontStyle: 'bold' },
        },
        {
          content: GridValuesHelper.formatAbsCurrency(data.totals.amount),
          styles: { halign: 'right', fontStyle: 'normal' },
        },
      ],
      [
        {
          content: 'Fee:',
          colSpan: 12,
          styles: { halign: 'right', fontStyle: 'bold' },
        },
        {
          content: GridValuesHelper.formatAbsCurrency(data.totals.feeTotal),
          styles: { halign: 'right', fontStyle: 'normal' },
        },
      ],
    ];

    bodyRows.push(...totalRows);

    const summaryRows: RowInput[] = [
      [
        {
          content: 'Summary',
          colSpan: 13,
          styles: {
            fillColor: '#CFCFCF',
            fontStyle: 'bold',
            halign: 'center',
          },
        },
      ],
      [
        {
          content: 'Location',
          colSpan: 3,
          styles: {
            fillColor: '#CFCFCF',
            lineColor: '#181919',
            halign: 'left',
          },
        },
        {
          content: 'Department',
          colSpan: 2,
          styles: {
            fillColor: '#CFCFCF',
            lineColor: '#181919',
            halign: 'left',
          },
        },
        {
          content: 'Skill',
          styles: {
            fillColor: '#CFCFCF',
            lineColor: '#181919',
            halign: 'left',
          },
        },
        { 
          content: 'Hours/Miles',
          styles: {
            fillColor: '#CFCFCF',
            lineColor: '#181919',
            halign: 'left',
          },
        },
        {
          content: 'Fee',
          styles: {
            fillColor: '#CFCFCF',
            lineColor: '#181919',
            halign: 'right',
          },
        },
        { 
          content: 'Total Amount',
          styles: {
            fillColor: '#CFCFCF',
            lineColor: '#181919',
            halign: 'right',
          },
        },
        {
          content: 'Addl. Details',
          colSpan: 4,
          styles: {
            fillColor: '#CFCFCF',
            lineColor: '#181919',
            halign: 'left',
          },
        },
      ],
    ];

    data.summary.forEach((summary) => {
      summary.items.forEach((detail, idx: number) => {
        const loactionIdText = detail.locationIExternalId  ? `${detail.locationIExternalId}-` : '';
        const departmentIdText = detail.invoiceDepartmentId ? `-${detail.invoiceDepartmentId}` : '';
        const skillGlText =detail.skillGLNumber ? `-${detail.skillGLNumber}` : '';
        const additionalDetails = `${loactionIdText}${detail.departmentName}${departmentIdText}${skillGlText}`;
        const formatedValue = detail.total > 0 ? GridValuesHelper.formatAbsNumber(detail.value, '1.2-2')
        : `(${GridValuesHelper.formatAbsNumber(detail.value, '1.2-2')})`;

        
        const sum: CellDef[] = [
          idx === 0 ? {
            content: summary.locationName, 
            colSpan: 3,
            rowSpan: summary.items.length,
            styles: {
              halign: 'left',
              fontStyle: 'normal',
              lineColor: '#181919',
            },
          } :  {},
          {
            content: detail.costCenterFormattedName,
            colSpan: 2,
            styles: {
              halign: 'left',
              fontStyle: 'normal',
              lineColor: '#181919',
            },
          },
          {
            content: detail.skillName,
            styles: {
              halign: 'left',
              fontStyle: 'normal',
              lineColor: '#181919',
            },
          },
          {
            content: formatedValue,
            styles: {
              halign: 'right',
              fontStyle: 'normal',
              lineColor: '#181919',
            },
          },
          {
            content: GridValuesHelper.formatAbsCurrency(detail.feeTotal),
            styles: {
              halign: 'right',
              fontStyle: 'normal',
              lineColor: '#181919',
            },
          },
          {
            content: GridValuesHelper.formatAbsCurrency(detail.calculatedTotal),
            styles: {
              halign: 'right',
              fontStyle: 'normal',
              lineColor: '#181919',
            },
          },
          {
            content: additionalDetails,
            colSpan: 4,
            styles: {
              halign: 'left',
              fontStyle: 'normal',
              lineColor: '#181919',
            },
          },
        ];

        if (!sum[0]?.content) {
          sum.splice(0, 1);
        }

        summaryRows.push(sum);
      });
    });

    summaryRows.push([
      {
        content: 'Total',
        colSpan: 3,
        styles: {
          halign: 'left',
          fontStyle: 'bold',
          lineColor: '#181919',
        },
      },
      {
        content: '',
        colSpan: 2,
        styles: {
          lineColor: '#181919',
        },
      },
      {
        content: '',
        styles: {
          lineColor: '#181919',
        },
      },
      {
        content: GridValuesHelper.formatAbsNumber(data.totals.total, '1.2-2'),
        styles: {
          fontStyle: 'bold',
          halign: 'right',
          lineColor: '#181919',
        },
      },
      {
        content: GridValuesHelper.formatAbsCurrency(data.totals.feeTotal),
        styles: {
          fontStyle: 'bold',
          halign: 'right',
          lineColor: '#181919',
        },
      },
      {
        content: GridValuesHelper.formatAbsCurrency(data.totals.calculatedTotal),
        styles: {
          fontStyle: 'bold',
          halign: 'right',
          lineColor: '#181919',
        },
      },
      {
        content: '',
        colSpan: 5,
        styles: {
          lineColor: '#181919',
        },
      },
    ]);

    summaryRows.push([
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
    ]);

    summaryRows.push([
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: 'Remit Adress:',
        colSpan: 2,
        styles: {
          halign: 'center',
          fillColor: '#F5F5F5',
        },
      },
      {
        content: data.meta.remitAddress,
        colSpan: 2,
        styles: {
          halign: 'left',
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          halign: 'left',
          fillColor: '#F5F5F5',
        },
      }, 
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
      {
        content: '',
        styles: {
          fillColor: '#F5F5F5',
        },
      },
    ]);

    autoTable(doc, {
      margin: { top: 50, left: 20, right: 20 },
      tableLineColor: '#181919',
      tableLineWidth: 1,
      head: [['Week End', 'Time in', 'TimeOut', 'Bill Rate Type', 'Cost Center', 'Job ID', 'Candidate Name',
      'Organization', 'Skill', 'Hours/Miles', 'Bill Rate', 'Fee, %', 'Total']],
      headStyles: {
        fillColor: '#CFCFCF',
        fontStyle: 'bold',
        fontSize: 10,
        overflow: 'linebreak',
        halign: 'center',
        valign: 'middle',
        lineColor: '#181919',
        lineWidth: 1,
        cellPadding: 2,
      },
      body: bodyRows,
      bodyStyles: {
        lineColor: '#181919',
        lineWidth: 1,
        fontSize: 10,
        cellPadding: 2,
      },
      theme: 'plain',
      didDrawPage: ()=> {
        doc.addImage(img, 'png', 20, 15, 80, 20);
      },
    });

    autoTable(doc, {
      margin: { top: 50, left: 20, right: 20 },
      tableLineColor: '#181919',
      tableLineWidth: 1,
      pageBreak: 'avoid',
      rowPageBreak: 'avoid',
      head: [['Week End', 'Time in', 'TimeOut', 'Bill Rate Type', 'Cost Center', 'Job ID', 'Candidate Name',
      'Organization', 'Skill', 'Hours/Miles', 'Bill Rate', 'Fee, %', 'Total']],
      showHead: 'never',
      headStyles: {
        fillColor: '#CFCFCF',
        fontStyle: 'bold',
        fontSize: 10,
        overflow: 'linebreak',
        halign: 'center',
        valign: 'middle',
        lineColor: '#181919',
        lineWidth: 1,
        cellPadding: 2,
      },
      body: summaryRows,
      bodyStyles: {
        lineColor: '#D9D9D9',
        lineWidth: 0.8,
        fontSize: 10,
        fontStyle: 'bold',
        cellPadding: 2,
      },
      theme: 'plain',
      didDrawPage: ()=> {
        doc.addImage(img, 'png', 20, 15, 80, 20);
      },
    });
  }

  private addPageFooter(doc: jsPDF): void {
    const pages = doc.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const numxPos = pageWidth - 80;
    const numYpos =  pageHeight - 10;
    const year = new Date().getFullYear();
    const printDate = formatDate(new Date(), 'MM/dd/yyyy', 'en-US');

    doc.setFontSize(10);

    for (let i = 0; i < pages; i++) {
      doc.setPage(i);
      const page = doc.getCurrentPageInfo().pageNumber;
      doc.text(`Page No. ${page} of ${pages}`, numxPos, numYpos);
      doc.text(`©${year} Copyright Reserved by Einstein ll`, pageWidth /2 - 45, numYpos);
      doc.text(`Print Date: ${printDate}`, 21, numYpos);
    }
  }

  private createImage(): HTMLImageElement {
    const image = new Image();
    image.src = 'assets/Report_Logo.png';

    return image;
  }

  private createDoc(): jsPDF {
    return new jsPDF({ orientation: 'portrait', unit: 'px', format: [729, 744] });
  }
}
