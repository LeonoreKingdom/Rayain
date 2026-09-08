import { processDueBlasts } from "../lib/blasts/worker";

const results = processDueBlasts();
const processed = results.filter((result) => result.status === "processed").length;
console.log(`Blast worker selesai: ${processed} blast diproses, ${results.length - processed} dilewati.`);
