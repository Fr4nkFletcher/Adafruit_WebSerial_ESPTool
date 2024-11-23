## [CYM Web Flasher](https://fr4nkfletcher.github.io/Adafruit_WebSerial_ESPTool/)

A fork of Adafruit’s WebSerial tool for flashing ESP32Marauder onto the Cheap Yellow Display and similar devices.

---

### Flashing Methods

#### 1. Automatic Flashing
This method flashes your chosen ESP32 Marauder firmware version to your selected Model.
<p align="center">
  <img src="https://github.com/Fr4nkFletcher/Adafruit_WebSerial_ESPTool/blob/main/assets/sc00000.jpg" alt="Flashing Marauder Automatically">
</p>

#### 2. Manual Flashing
Specifies the bootloader, partitions, bootapp, and firmware to upload your chosen project.

<p align="center">
  <img src="https://github.com/Fr4nkFletcher/Adafruit_WebSerial_ESPTool/blob/main/assets/scman1.png" alt="Manual Flashing">
</p>

For manual flashing, visit:  [Manual Flasher](https://fr4nkfletcher.github.io/Adafruit_WebSerial_ESPTool/manual.html)

For further instructions, check out @Blough's [tutorial](https://github.com/witnessmenow/ESP-Web-Tools-Tutorial).

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
