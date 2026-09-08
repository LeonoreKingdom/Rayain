import { processDueBlasts } from "../lib/blasts/worker";

async function main() {
  const results = await processDueBlasts();
  const processed = results.filter((result) => result.status === "processed").length;
  console.log(`Blast worker selesai: ${processed} blast diproses, ${results.length - processed} dilewati.`);
}

main().catch((error) => {
  console.error("Blast worker gagal.", error);
  process.exitCode = 1;
});
