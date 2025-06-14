const puppeteer = require("puppeteer");

async function consultarHSCode(hsCode) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // 1) Abrir la página
  await page.goto("https://muisca.dian.gov.co/WebArancel/DefMenuConsultas.faces");

  // 2) Click en "General"
  await page.waitForSelector('input[name$="btnGeneral"]');
  await page.click('input[name$="btnGeneral"]');

  // 3) Escribir el código HS
  await page.waitForSelector('input[name$="codNomenclatura"]');
  await page.type('input[name$="codNomenclatura"]', hsCode);

  // 4) Click en "Buscar" y esperar navegación
  await Promise.all([
    page.click('input[name$="btnBuscar"]'),
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]);

  // 5) Comprobar tabla de resultados
  const tablaExiste = await page.$("table[id$='dtDatos']");
  if (!tablaExiste) {
    console.log("⚠️ No hay requisitos especiales para este código arancelario.");
    await browser.close();
    return;
  }

  // 6) Extraer datos de la tabla
  const data = await page.evaluate(() => {
    const filas = Array.from(document.querySelectorAll("table[id$='dtDatos'] tr"));
    return filas.map(fila => {
      const cols = Array.from(fila.querySelectorAll("td"));
      return cols.map(col => col.innerText.trim());
    });
  });

  console.log("✅ Resultados encontrados:");
  console.log(data);
  await browser.close();
}

consultarHSCode("8471300000")
  .catch(err => console.error("❌ Error al consultar la DIAN:", err));
