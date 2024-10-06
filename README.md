## [CYM Web Flasher](https://fr4nkfletcher.github.io/Adafruit_WebSerial_ESPTool/)

Adafruit WebSerial tools fork for flashing ESP32Marauder to the Cheap Yellow Display and other variants.

<p align="center">
  <img src="https://github.com/Fr4nkFletcher/Adafruit_WebSerial_ESPTool/blob/main/assets/sc0000.png" alt="Flashing Marauder Automatically">
</p>
<p align="center">
  <i>Method 1: Automatic flashing process</i>
</p>

---

<p align="center">
  <img src="https://github.com/Fr4nkFletcher/Adafruit_WebSerial_ESPTool/blob/main/assets/sc0001.png" alt="Manual Flashing">
</p>
<p align="center">
  <i>Method 2: Manual flashing process with custom bootloader, partitions, and firmware settings</i>
</p>
## [Manual Flasher](https://fr4nkfletcher.github.io/Adafruit_WebSerial_ESPTool/manual.html)
---

### Flashing ESP32Marauder and other projects: Two Methods

This flasher provides two ways to flash the ESP32Marauder firmware or whatever you want onto your device:

1. **Automatic Flashing**  
   As shown in the first image, this method allows you to flash the ESP32Marauder firmware without the need to manually specify the bootloader, partitions, or firmware addresses in memory. The tool handles everything automatically, streamlining the flashing process.

2. **Manual Flashing**  
   In the second image, you can see the manual process of flashing where you have the option to choose and configure the bootloader, partitions, and firmware. This method provides more control, allowing you to specify the addresses in memory where each component should be flashed. This is particularly useful for advanced users who want to fine-tune their setup.

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
