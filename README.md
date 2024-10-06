## [CYM Web Flasher](https://fr4nkfletcher.github.io/Adafruit_WebSerial_ESPTool/)

A fork of Adafruit’s WebSerial tool for flashing ESP32Marauder onto the Cheap Yellow Display and similar devices.

---

### Flashing Methods

#### 1. Automatic Flashing
This method flashes the ESP32Marauder firmware without needing to manually configure the bootloader, partitions, firmware, or memory addresses.
<p align="center">
  <img src="https://github.com/Fr4nkFletcher/Adafruit_WebSerial_ESPTool/blob/main/assets/sc00000.jpg" alt="Flashing Marauder Automatically">
</p>

#### 2. Manual Flashing
Allows advanced users to specify the bootloader, partitions, and firmware, allowing you to upload the project of your choosing.

<p align="center">
  <img src="https://github.com/Fr4nkFletcher/Adafruit_WebSerial_ESPTool/blob/main/assets/scman.jpg" alt="Manual Flashing">
</p>

For manual flashing, visit:  
[Manual Flasher](https://fr4nkfletcher.github.io/Adafruit_WebSerial_ESPTool/manual.html)

---
## Local Development

```
git clone https://github.com/Fr4nkFletcher/Adafruit_WebSerial_ESPTool
cd Adafruit_WebSerial_ESPTool
npm install
./script/develop
```
- Open http://localhost:5004/

## Origin

This project was originally written by Melissa LeBlanc-Williams. Nabu Casa ported the code over to TypeScript and in March 2022 took over maintenance from Adafruit. In July 2022, the Nabucasa stopped maintaining the project in favor of an official, but very early release of Espressif's esptool-js. Due to the instability of the tool, Adafruit updated their fork with Nabucasa's changes in November 2022 and took over maintenance once again.


Many thanks to the maintainers over at [FZEEFlasher](https://github.com/FZEEFlasher/fzeeflasher.github.io)
