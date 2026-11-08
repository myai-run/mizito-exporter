import 'dotenv/config'
import { startTheExtraction } from "./exporter.js";
import { initiateExcelEngine } from './lib/initiate-excel-engine.js';

initiateExcelEngine();
await startTheExtraction();
