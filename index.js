const puppeteer = require("puppeteer");

async function consultarHSCode(hsCode) {
  // Lanzamos Chrome ya instalado en Render
  const browser = await puppeteer.launch({
    headless: true,
    // ejecutable preinstalado en Render
    executablePath: "/usr/bin/chromium-browser",
    // evita sandbox, obligatorio en entornos compartidos
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // Paso 1: Abrir la página
  await page.goto(
    "https://muisca.dian.gov.co/WebArancel/DefMenuConsultas.faces"
  );

  // Paso 2: Hacer clic en el botón "General"
  await page.waitForSelector('input[name$="btnGeneral"]');
  await page.click('input[name$="btnGeneral"]');

  // Paso 3: Esperar el campo de código y rellenarlo
  await page.waitForSelector('input[name$="codNomenclatura"]');
  await page.type('input[name$="codNomenclatura"]', hsCode);

  // Paso 4: Pulsar "Buscar" y esperar navegación
  await Promise.all([
    page.click('input[name$="btnBuscar"]'),
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]);

  // Paso 5: Comprobar si hay tabla de resultados
  const tabla = await page.$("table[id$='dtDatos']");
  if (!tabla) {
    console.log("⚠️ No hay requisitos especiales para este código.");
    await browser.close();
    return;
  }

  // Paso 6: Extraer datos
  const datos = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll("table[id$='dtDatos'] tr"),
      (tr) => Array.from(tr.querySelectorAll("td"), (td) => td.innerText.trim())
    );
  });

  console.log("✅ Resultados encontrados:");
  console.log(datos);

  await browser.close();
}

// Ejemplo de uso:
consultarHSCode("8471300000").catch((err) => {
  console.error("❌ Error al consultar la DIAN:", err);
});
