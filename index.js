
const puppeteer = require('puppeteer');

async function consultarHSCode(hsCode) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const url = 'https://muisca.dian.gov.co/WebArancel/DefMenuConsultas.faces';
  await page.goto(url, { waitUntil: 'networkidle2' });

  await page.waitForSelector('table');
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    const generalLink = links.find(link => link.textContent.trim() === 'General');
    if (generalLink) generalLink.click();
  });

  await page.waitForSelector('input[id*=codNomenclatura]');
  await page.click('input[id*=codNomenclatura]');
  await page.type('input[id*=codNomenclatura]', hsCode);
  await page.keyboard.press('Enter');

  let data = [];
  try {
    await page.waitForSelector('table[id*=dtDatos]', { timeout: 30000 });
    data = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table[id*=dtDatos] tr'));
      return rows.map(row => {
        const cols = row.querySelectorAll('td');
        return Array.from(cols).map(col => col.innerText.trim());
      });
    });
  } catch (error) {
    console.log('⚠️ No se encontró ninguna tabla de resultados después de enviar el formulario.');
  }

  await browser.close();

  if (data.length > 1) {
    console.log('🔍 Datos capturados de la DIAN:');
    console.table(data);
  } else {
    console.log('✅ No hay requisitos especiales para este código arancelario.');
  }
}

consultarHSCode('8471300000');
