let espStub;

const baudRates = 115200;

const bufferSize = 512;
const colors = ["#00a7e9", "#f89521", "#be1e2d"];
const measurementPeriodId = "0001";

const maxLogLength = 100;
const log = document.getElementById("log");
const butConnect = document.getElementById("butConnect");
const butDisconnect = document.getElementById("butDisconnect");
const butClear = document.getElementById("butClear");
const butErase = document.getElementById("butErase");
const butProgram = document.getElementById("butProgram");
const autoscroll = document.getElementById("autoscroll");
const lightSS = document.getElementById("light");
const darkSS = document.getElementById("dark");
const darkMode = document.getElementById("darkmode");
const offsets = document.querySelectorAll(".upload .offset");
const firmware = document.querySelectorAll(".upload .firmware input");
const progress = document.querySelectorAll(".upload .progress-bar");

const appDiv = document.getElementById("app");

document.addEventListener("DOMContentLoaded", () => {
    butConnect.addEventListener("click", clickConnect);
    butDisconnect.addEventListener("click", clickDisconnect);
    butClear.addEventListener("click", clickClear);
    butErase.addEventListener("click", clickErase);
    butProgram.addEventListener("click", clickProgram);
    autoscroll.addEventListener("click", clickAutoscroll);
    darkMode.addEventListener("click", clickDarkMode);
    
    for (let i = 0; i < firmware.length; i++) {
        firmware[i].addEventListener("change", () => checkFirmware(i));
    }
    
    for (let i = 0; i < offsets.length; i++) {
        offsets[i].addEventListener("change", checkProgrammable);
    }

    window.addEventListener("error", function (event) {
        console.log("Got an uncaught error: ", event.error);
    });

    if ("serial" in navigator) {
        document.getElementById("notSupported").classList.add("hidden");
    }

    loadAllSettings();
    updateTheme();
    logMsg("ESP Web Flasher loaded.");
});

function logMsg(text) {
    log.innerHTML += text + "<br>";

    if (log.textContent.split("\n").length > maxLogLength + 1) {
        let logLines = log.innerHTML.replace(/(\n)/gm, "").split("<br>");
        log.innerHTML = logLines.splice(-maxLogLength).join("<br>\n");
    }

    if (autoscroll.checked) {
        log.scrollTop = log.scrollHeight;
    }
}

function annMsg(text) {
    logMsg(`<font color='#FF9999'>${text}</font>`);
}

function compMsg(text) {
    logMsg(`<font color='#2ED832'>${text}</font>`);
}

function initMsg(text) {
    logMsg(`<font color='#F72408'>${text}</font>`);
}

function errorMsg(text) {
    logMsg('<span class="error-message">Error:</span> ' + text);
    console.error(text);
}

function updateTheme() {
    document.querySelectorAll("link[rel=stylesheet].alternate").forEach((styleSheet) => {
        styleSheet.disabled = true;
    });

    if (darkMode.checked) {
        darkSS.disabled = false;
    } else {
        lightSS.disabled = false;
    }
}

function formatMacAddr(macAddr) {
    return macAddr.map((value) => value.toString(16).toUpperCase().padStart(2, "0")).join(":");
}

async function clickConnect() {
    if (espStub) {
        await clickDisconnect();
        return;
    }

    const esploaderMod = await window.esptoolPackage;
    const esploader = await esploaderMod.connect({
        log: logMsg,
        debug: console.log,
        error: errorMsg
    });

    try {
        await esploader.initialize();
        logMsg(`Connected to ${esploader.chipName} @ ${baudRates} bps`);
        logMsg(`MAC Address: ${formatMacAddr(esploader.macAddr())}`);

        espStub = await esploader.runStub();
        toggleUIConnected(true);
        toggleUIToolbar(true);

        espStub.addEventListener("disconnect", () => {
            toggleUIConnected(false);
            espStub = undefined;
        });
    } catch (err) {
        console.error('Initialization error:', err);
        await esploader.disconnect();
        throw err;
    }
}

async function clickDisconnect() {
    if (espStub) {
        await espStub.disconnect();
        await espStub.port.close();
    }
    toggleUIConnected(false);
    espStub = undefined;
}

async function clickAutoscroll() {
    saveSetting("autoscroll", autoscroll.checked);
}

async function clickDarkMode() {
    updateTheme();
    saveSetting("darkmode", darkMode.checked);
}

async function clickErase() {
    initMsg(` !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! `);
    initMsg(` !!! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CAUTION!!! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; !!! `);
    initMsg(` !!! &nbsp;&nbsp;THIS WILL ERASE THE FIRMWARE ON&nbsp; !!! `);
    initMsg(` !!! &nbsp;&nbsp;&nbsp;YOUR DEVICE! THIS CAN NOT BE &nbsp;&nbsp; !!! `);
    initMsg(` !!! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; UNDONE! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; !!! `);
    initMsg(` !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! `);
    
    if (window.confirm("This will erase the entire flash. Click OK to continue.")) {
        butErase.disabled = true;
        butProgram.disabled = true;
        try {
            logMsg("Erasing flash memory. Please wait...");
            let stamp = Date.now();
            await espStub.eraseFlash();
            logMsg(`Finished. Took <font color="yellow">${Date.now() - stamp}ms</font> to erase.`);
            compMsg(" ---> ERASING PROCESS COMPLETED!");
        } catch (e) {
            errorMsg(e);
        } finally {
            butErase.disabled = false;
            butProgram.disabled = false;
        }
    }
}

async function clickProgram() {
    const readUploadedFileAsArrayBuffer = (inputFile) => {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onerror = () => {
                reader.abort();
                reject(new DOMException("Problem parsing input file."));
            };
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.readAsArrayBuffer(inputFile);
        });
    };

    butErase.disabled = true;
    butProgram.disabled = true;

    initMsg(` `);
    initMsg(` !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! `);
    initMsg(` !!!&nbsp;&nbsp; FLASHING STARTED! DO NOT UNPLUG &nbsp;!!! `);
    initMsg(` !!!&nbsp;&nbsp;&nbsp;&nbsp; UNTIL FLASHING IS COMPLETE!! &nbsp;&nbsp;!!! `);
    initMsg(` !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! `);
    initMsg(` `);

    for (let i = 0; i < firmware.length; i++) {
        if (firmware[i].files.length > 0) {
            progress[i].classList.remove("hidden");
            let binfile = firmware[i].files[0];
            let contents = await readUploadedFileAsArrayBuffer(binfile);
            try {
                let offset = parseInt(offsets[i].value, 16);
                const progressBar = progress[i].querySelector("div");
                await espStub.flashData(
                    contents,
                    (bytesWritten, totalBytes) => {
                        progressBar.style.width = Math.floor((bytesWritten / totalBytes) * 100) + "%";
                    },
                    offset
                );
                annMsg(` ---> Finished flashing ${binfile.name}.`);
                await sleep(100);
            } catch (e) {
                errorMsg(e);
            }
        }
    }

    butErase.disabled = false;
    butProgram.disabled = false;
    compMsg(" ---> FLASHING PROCESS COMPLETED!");
    logMsg("Restart the board or disconnect to use the device.");
}

async function clickClear() {
    log.innerHTML = "";
}

function autoScrollLog() {
    const log = document.querySelector('#app.connected #log');
    if (log) {
        // Check if the user has scrolled up
        const isScrolledToBottom = log.scrollHeight - log.clientHeight <= log.scrollTop + 1;
        
        if (isScrolledToBottom) {
            log.scrollTop = log.scrollHeight;
        }
    }
}

function addLogMessage(message) {
    const log = document.querySelector('#app.connected #log');
    if (log) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        log.appendChild(messageElement);
        autoScrollLog();
    }
}

// Add this event listener to handle manual scrolling
document.querySelector('#app.connected #log').addEventListener('scroll', function() {
    // If user scrolls up, don't auto-scroll on new messages
    this.setAttribute('data-user-scrolled', this.scrollTop + this.clientHeight < this.scrollHeight);
});


function toggleUIToolbar(show) {
    appDiv.classList.toggle("connected", show);
    butErase.disabled = !show;
    butProgram.disabled = !show;
}

function toggleUIConnected(connected) {
    butConnect.style.display = connected ? "none" : "inline-block";
    butDisconnect.style.display = connected ? "inline-block" : "none";
    if (!connected) {
        toggleUIToolbar(false);
    }
}

function loadAllSettings() {
    autoscroll.checked = loadSetting("autoscroll", true);
    darkMode.checked = loadSetting("darkmode", false);
}

function loadSetting(setting, defaultValue) {
    let value = JSON.parse(window.localStorage.getItem(setting));
    return (value === null) ? defaultValue : value;
}

function saveSetting(setting, value) {
    window.localStorage.setItem(setting, JSON.stringify(value));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function checkFirmware(index) {
    let filename = firmware[index].value.split("\\").pop();
    let label = firmware[index].parentNode.querySelector("span");
    let icon = firmware[index].parentNode.querySelector("svg");
    if (filename != "") {
        label.innerHTML = filename.length > 17 ? filename.substring(0, 14) + "&hellip;" : filename;
        icon.classList.add("hidden");
    } else {
        label.innerHTML = "Choose a file&hellip;";
        icon.classList.remove("hidden");
    }
    checkProgrammable();
}

function checkProgrammable() {
    butProgram.disabled = !Array.from(firmware).some(input => input.files.length > 0);
}