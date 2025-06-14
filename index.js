const puppeteer = require("puppeteer");

async function consultarHSCode(hsCode) {
  // Arranca Chromium sin sandbox (necesario en Render)
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();

  // Paso 1: Abrir la página de consulta
  await page.goto("https://muisca.dian.gov.co/WebArancel/DefMenuConsultas.faces");

  // Paso 2: Hacer clic en "General"
  await page.waitForSelector('input[name$="btnGeneral"]');
  await page.click('input[name$="btnGeneral"]');

  // Paso 3: Esperar el campo y escribir el código
  await page.waitForSelector('input[name$="codNomenclatura"]');
  await page.type('input[name$="codNomenclatura"]', hsCode);

  // Paso 4: Clic en "Buscar" y esperar respuesta
  await Promise.all([
    page.click('input[name$="btnBuscar"]'),
    page.waitForNavigation({ waitUntil: "networkidle2" })
  ]);

  // Paso 5: Verificar si hay tabla de resultados
  const tabla = await page.$("table[id*='dtDatos']");
  if (!tabla) {
    console.warn("⚠️ No se encontró tabla de resultados.");
    console.log("✅ No hay requisitos especiales para este código.");
    await browser.close();
    return;
  }

  // Paso 6: Extraer datos de la tabla
  const data = await page.evaluate(() => {
    const filas = Array.from(document.querySelectorAll("table[id*='dtDatos'] tr"));
    return filas.map(fila =>
      Array.from(fila.querySelectorAll("td")).map(td => td.innerText.trim())
    );
  });

  await browser.close();
  console.log("✅ Resultados encontrados:");
  console.log(data);
}

// Prueba con un código de ejemplo
consultarHSCode("8471300000").catch(err => {
  console.error("❌ Error al consultar la DIAN:", err);
});
