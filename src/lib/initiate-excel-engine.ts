import * as XLSX from 'xlsx';
import * as fs from 'fs';

export const initiateExcelEngine = () => {
    XLSX.set_fs(fs); 

}