#!/usr/bin/env bash
set -ex

# Instala Google Chrome (versión estable)
wget -O /tmp/chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
apt-get update
apt-get install -y /tmp/chrome.deb

# Instala Puppeteer Chrome (por si acaso)
npx puppeteer browsers install chrome
