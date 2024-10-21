let espStub;

const baudRates = 115200;

const bufferSize = 512;
const colors = ["#00a7e9", "#f89521", "#be1e2d"];
const measurementPeriodId = "0001";

const maxLogLength = 100;
const log = document.getElementById("log");
const butConnect = document.getElementById("butConnect");
const butClear = document.getElementById("butClear");
const butErase = document.getElementById("butErase");
const butProgram = document.getElementById("butProgram");
const autoscroll = document.getElementById("autoscroll");
const lightSS = document.getElementById("light");
const darkSS = document.getElementById("dark");
const darkMode = document.getElementById("darkmode");
const modelSelect = document.getElementById("modelSelect");
//const versionSelect = document.getElementById("versionSelect");
//const variantSelect = document.getElementById("variantSelect");
const offsets = [0x1000, 0x8000, 0xE000, 0x10000];
const offsets2 = [0x0, 0x8000, 0xE000, 0x10000];

const appDiv = document.getElementById("app");

document.getElementById('butConnect').addEventListener('click', function() {
    var icon = this.querySelector('i');
    if (icon.classList.contains('green-icon')) {
        icon.classList.remove('green-icon');
    } else {
        icon.classList.add('green-icon');
    }
});



document.addEventListener("DOMContentLoaded", () => {
    butConnect.addEventListener("click", () => {
        clickConnect().catch(async (e) => {
            console.error(e);
            errorMsg(e.message || e);
            if (espStub) {
                await espStub.disconnect();
            }
            toggleUIConnected(false);
        });
    });
    butClear.addEventListener("click", clickClear);
    butErase.addEventListener("click", clickErase);
    butProgram.addEventListener("click", clickProgram);
    butClear.addEventListener("click", clickClear);
    autoscroll.addEventListener("click", clickAutoscroll);
    darkMode.addEventListener("click", clickDarkMode);
    window.addEventListener("error", function (event) {
        console.log("Got an uncaught error: ", event.error);
    });

    const notSupported = document.getElementById("notSupported");
    if ("serial" in navigator) {
        notSupported.classList.add("hidden"); 
    } else {
        notSupported.classList.remove("hidden");
    }

    modelSelect.addEventListener("change", () => {
        const selectedModel = modelSelect.value;
        // Handle model change if needed
    });


    modelSelect.addEventListener("change", checkDropdowns);
  
    function checkDropdowns() {
        const isAnyDropdownNull = [modelSelect.value, versionSelect.value, variantSelect.value].includes("NULL");
        const isBoardNotS2 = (modelSelect.value !== "S2" && modelSelect.value !== "S2SD");
        const isBlackMagicSelected = variantSelect.value === "BlackMagic";

        if (isAnyDropdownNull || (isBoardNotS2 && isBlackMagicSelected)) {
            butProgram.disabled = false;
        } else {
            butProgram.disabled = false;
        }
    }

    modelSelect.addEventListener('change', checkDropdowns);


    checkDropdowns();
    logMsg("ESP Web Flasher loaded.");
});

function logMsg(text) {
    log.innerHTML += text + "<br>";

    if (log.textContent.split("\n").length > maxLogLength + 1) {
        let logLines = log.innerHTML.replace(/(\n)/gm, "").split("<br>");
        log.innerHTML = logLines.splice(-maxLogLength).join("<br>\n");
    }

    
    log.scrollTop = log.scrollHeight;
    
}


function annMsg(text) {
    log.innerHTML += `<font color='#FF9999'>` + text + `<br></font>`;

    if (log.textContent.split("\n").length > maxLogLength + 1) {
        let logLines = log.innerHTML.replace(/(\n)/gm, "").split("<br>");
        log.innerHTML = logLines.splice(-maxLogLength).join("<br>\n");
    }

    log.scrollTop = log.scrollHeight;
    
}
function compMsg(text) {
    log.innerHTML += `<font color='#2ED832'>` + text + `<br></font>`;

    if (log.textContent.split("\n").length > maxLogLength + 1) {
        let logLines = log.innerHTML.replace(/(\n)/gm, "").split("<br>");
        log.innerHTML = logLines.splice(-maxLogLength).join("<br>\n");
    }

    log.scrollTop = log.scrollHeight;
    
}
function initMsg(text) {
    log.innerHTML += `<font color='#F72408'>` + text + `<br></font>`;

    if (log.textContent.split("\n").length > maxLogLength + 1) {
        let logLines = log.innerHTML.replace(/(\n)/gm, "").split("<br>");
        log.innerHTML = logLines.splice(-maxLogLength).join("<br>\n");
    }

        log.scrollTop = log.scrollHeight;

}

function debugMsg(...args) {
    function getStackTrace() {
        let stack = new Error().stack;
        stack = stack.split("\n").map((v) => v.trim());
        stack.shift();
        stack.shift();

        let trace = [];
        for (let line of stack) {
            line = line.replace("at ", "");
            trace.push({
                func: line.substr(0, line.indexOf("(") - 1),
                pos: line.substring(line.indexOf(".js:") + 4, line.lastIndexOf(":")),
            });
        }

        return trace;
    }

    let stack = getStackTrace();
    stack.shift();
    let top = stack.shift();
    let prefix =
        '<span class="debug-function">[' + top.func + ":" + top.pos + "]</span> ";
    for (let arg of args) {
        if (typeof arg == "string") {
            logMsg(prefix + arg);
        } else if (typeof arg == "number") {
            logMsg(prefix + arg);
        } else if (typeof arg == "boolean") {
            logMsg(prefix + (arg ? "true" : "false"));
        } else if (Array.isArray(arg)) {
            logMsg(prefix + "[" + arg.map((value) => toHex(value)).join(", ") + "]");
        } else if (typeof arg == "object" && arg instanceof Uint8Array) {
            logMsg(
                prefix +
                "[" +
                Array.from(arg)
                    .map((value) => toHex(value))
                    .join(", ") +
                "]"
            );
        } else {
            logMsg(prefix + "Unhandled type of argument:" + typeof arg);
            console.log(arg);
        }
        prefix = "";
    }
}

function errorMsg(text) {
    logMsg('<span class="error-message">Error:</span> ' + text);
    console.log(text);
}

function enableStyleSheet(node, enabled) {
    node.disabled = !enabled;
}

function formatMacAddr(macAddr) {
    return macAddr
        .map((value) => value.toString(16).toUpperCase().padStart(2, "0"))
        .join(":");
}

function updateTheme() {
  // Disable all themes
  document
    .querySelectorAll("link[rel=stylesheet].alternate")
    .forEach((styleSheet) => {
      enableStyleSheet(styleSheet, false);
    });

  if (darkMode.checked) {
    enableStyleSheet(darkSS, true);
  } else {
    enableStyleSheet(lightSS, true);
  }
}

async function clickAutoscroll() {
  saveSetting("autoscroll", autoscroll.checked);
}

async function clickConnect() {
    if (espStub) {
        await espStub.disconnect();
        await espStub.port.close();
        toggleUIConnected(false);
        espStub = undefined;
        return;
    }

    try {
        // Connection logic
        checkDropdowns();
    } catch (err) {
        console.error('Error during connection setup:', err);
        butProgram.disabled = false; // Ensure button is disabled on error
    }

    const esploaderMod = await window.esptoolPackage;
    const esploader = await esploaderMod.connect({
        log: logMsg,
        debug: debugMsg,
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
        throw err; // Re-throw the error to handle it elsewhere if needed
    }
}



async function changeBaudRate() {
    saveSetting("baudrate", baudRate.value);
    if (espStub) {
        let baud = parseInt(baudRate.value);
        if (baudRates.includes(baud)) {
            await espStub.setBaudrate(baud);
        }
    }
}


function createProgressBarDialog() {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
        @keyframes blink {
            50% { opacity: 0; }
        }
        .blinking-text {
            animation: blink 1s linear infinite;
        }
    `;
    document.head.appendChild(styleSheet);

    const progressBarDialog = document.createElement("div");
    progressBarDialog.id = "progressBarDialog";
    progressBarDialog.style.position = "fixed";
    progressBarDialog.style.left = "50%";
    progressBarDialog.style.top = "50%";
    progressBarDialog.style.transform = "translate(-50%, -50%)";
    progressBarDialog.style.padding = "40px"; 
    progressBarDialog.style.backgroundColor = "#333333";
    progressBarDialog.style.border = "2px solid #6272a4";
    progressBarDialog.style.borderRadius = "10px";
    progressBarDialog.style.color = "white";
    progressBarDialog.style.zIndex = "1000";
    progressBarDialog.style.fontSize = "1.5em"; 
    progressBarDialog.style.maxWidth = "350px"; // Set a maximum width for the dialog
    progressBarDialog.style.width = "50%";
    progressBarDialog.style.boxSizing = "border-box"; // Include padding in width calculation
    progressBarDialog.style.overflow = "hidden"; // Prevent content from spilling out
    progressBarDialog.innerHTML = `
        <div class="blinking-text" style="margin-bottom: 10px; color: #f8f8f2; animation: blink-animation 1.5s steps(2, start) infinite;">Flashing...</div>
<style>
  @keyframes blink-animation {
    to {
        visibility: hidden;
    }
}
</style>
<div id="progressBar" style="width: 100%; background-color: #44475a; border: 1px solid #e0e0e0; border-radius: 4px;">
    <div id="progress" style="width: 0%; height: 20px; background-color: #6272a4; border-radius: 4px; transition: width 0.5s ease;"></div>
</div>
<div style="margin-top: 10px; color: #FF9999; font-style: italic; font-size: 16px;">Flashing process will take at least 2 minutes.</div>
    `;

    document.body.appendChild(progressBarDialog);
    return progressBarDialog;
}


async function clickDarkMode() {
  updateTheme();
  saveSetting("darkmode", darkMode.checked);
}


async function clickErase() {
    initMsg(` `);
    initMsg(` !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! `);
    initMsg(` !!! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CAUTION!!! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; !!! `);
    initMsg(` !!! &nbsp;&nbsp;THIS WILL ERASE THE FIRMWARE ON&nbsp; !!! `);
    initMsg(` !!! &nbsp;&nbsp;&nbsp;YOUR DEVICE! THIS CAN NOT BE &nbsp;&nbsp; !!! `);
    initMsg(` !!! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; UNDONE! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; !!! `);
    initMsg(` !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! `);
    initMsg(` `);
    if (window.confirm("This will erase the entire flash. Click OK to continue.")) {
        butErase.disabled = true;
        butProgram.disabled = true;
        try {
            logMsg("Erasing flash memory. Please wait...");
            let stamp = Date.now();
            await espStub.eraseFlash();
            logMsg(`Finished. Took <font color="yellow">` + (Date.now() - stamp) + `ms</font> to erase.`);
            compMsg(" ");
            compMsg(" ---> ERASING PROCESS COMPLETED!");
            compMsg(" ");
        } catch (e) {
            errorMsg(e);
        } finally {

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
     const selectedModel = modelSelect.value;
     const selectedVersion = versionSelect.value;
    //const selectedVariant = variantSelect.value;
     const progressBarDialog = createProgressBarDialog();
     const progress = document.getElementById("progress"); 

    let selectedFiles;

    if (selectedModel === "CYD") {
        selectedFiles = selectedVersion === "latest" ? MCYDlatestFiles : MCYDpreviousFiles;
    } else if (selectedModel === "CYDNOGPS") {
        selectedFiles = selectedVersion === "latest" ? MCYDNOGPSlatestFiles : MCYDNOGPSpreviousFiles;
    } else if (selectedModel === "CYD2USB") {
        selectedFiles = selectedVersion === "latest" ? MCYD2USBlatestFiles : MCYD2USBpreviousFiles;
    } else if (selectedModel === "CYD2USBNOGPS") {
        selectedFiles = selectedVersion === "latest" ? MCYD2USBNOGPSlatestFiles : MCYD2USBNOGPSpreviousFiles;
    } else if (selectedModel === "CYD24NOGPS") {
        selectedFiles = selectedVersion === "latest" ? MCYD24NOGPSlatestFiles : MCYD24NOGPSpreviousFiles;
    } else if (selectedModel === "CYD24GPS") {
        selectedFiles = selectedVersion === "latest" ? MCYD24GPSlatestFiles : MCYD24GPSpreviousFiles;
    }
   
    const flashMessages = document.getElementById("flashMessages");
    
    butErase.disabled = true;
    butProgram.disabled = true;

    const fileTypes = ['bootloader', 'partitions', 'firmware'];
    initMsg(` `);
    initMsg(` !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! `);
    initMsg(` !!!&nbsp;&nbsp; FLASHING STARTED! DO NOT UNPLUG &nbsp;!!! `);
    initMsg(` !!!&nbsp;&nbsp;&nbsp;&nbsp; UNTIL FLASHING IS COMPLETE!! &nbsp;&nbsp;!!! `);
    initMsg(` !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! `);
    initMsg(` `);
    const flashingMessages = document.getElementById("flashMessages");
    flashingMessages.innerHTML = "";

    totalSize = 0; 
    flashedSize = 0;
    
    for (let fileType of fileTypes) {
        let fileResource = selectedFiles[fileType];
        let response = await fetch(fileResource, { method: 'HEAD' });
        let fileSize = response.headers.get('content-length');
    
        if (fileSize) {
            totalSize += parseInt(fileSize, 10);
        } else {
            console.error(`Failed to get size for file type: ${fileType}`);
        }
    }
        
    const updateProgressBar = (cumulativeFlashedSize) => {
        if (cumulativeFlashedSize > totalSize) {
            console.error(`Cumulative flashed size exceeds total size: ${cumulativeFlashedSize} / ${totalSize}`);
        } else {
            flashedSize = cumulativeFlashedSize; 
        }
    
        const progressPercentage = Math.min((flashedSize / totalSize) * 100, 100);
        //console.log(`Flashing progress: ${progressPercentage.toFixed(2)}%`); 
       
        // Update the progress bar in the UI
        const progressBar = document.getElementById("progress");
        if (progressBar) {
            progressBar.style.width = `${progressPercentage}%`;
        }
    };
    
    for (let fileType of fileTypes) {
        let fileResource = selectedFiles[fileType];

        let offset;
                    if (selectedModel === "CYD") {
            offset = [0x1000, 0x8000, 0x10000][fileTypes.indexOf(fileType)];
        } else if (selectedModel === "CYDNOGPS") {
            offset = [0x1000, 0x8000, 0x10000][fileTypes.indexOf(fileType)];
        } else if (selectedModel === "CYD2USB") {
            offset = [0x1000, 0x8000, 0x10000][fileTypes.indexOf(fileType)];
        } else if (selectedModel === "CYD2USBNOGPS") {
            offset = [0x1000, 0x8000, 0x10000][fileTypes.indexOf(fileType)];        
        } else if (selectedModel === "CYD24GPS") {
            offset = [0x1000, 0x8000, 0x10000][fileTypes.indexOf(fileType)];
        } else if (selectedModel === "CYD24NOGPS") {
            offset = [0x1000, 0x8000, 0x10000][fileTypes.indexOf(fileType)];        
        }

        try {
            let binfile = new File([await fetch(fileResource).then(r => r.blob())], fileType + ".bin");
            let contents = await readUploadedFileAsArrayBuffer(binfile);

            await espStub.flashData(
                contents,
                (cumulativeFlashedSize) => updateProgressBar(cumulativeFlashedSize),
                offset
            );

            updateProgressBar(totalSize); 

            annMsg(` ---> Finished flashing ${fileType}.`);
            annMsg(` `);

            await sleep(100);
        } catch (e) {
            errorMsg(e);
        }
    }

    progressBarDialog.remove();

    butErase.disabled = false;
    butProgram.disabled = false;
    flashMessages.style.display = "none";
    compMsg(" ---> FLASHING PROCESS COMPLETED!");
    compMsg(" ");
    logMsg("Restart the board or disconnect to use the device.");
}
        
async function clickClear() {
    log.innerHTML = "";
}

function convertJSON(chunk) {
    try {
        let jsonObj = JSON.parse(chunk);
        return jsonObj;
    } catch (e) {
        return chunk;
    }
}

function toggleUIToolbar(show) {
    isConnected = show;
    if (show) {
        appDiv.classList.add("connected");
    } else {
        appDiv.classList.remove("connected");
    }
    butErase.disabled = !show;
}

function toggleUIConnected(connected) {
    let label = "Connect";
    let iconClass = "fas fa-plug"; // Default icon for "Connect"
    let iconHtml = `<i class="${iconClass}"></i>`;

    if (connected) {
        label = "Disconnect";
        iconClass = "far fa-window-close red-icon"; // Change icon for "Disconnect" and apply red color
        iconHtml = `<i class="${iconClass}"></i>`; // Redefine the icon HTML with the red class
    } else {
        toggleUIToolbar(false);
    }

    // Update the button's HTML with the new icon and label
    document.getElementById('butConnect').innerHTML = `${iconHtml} ${label}`;
}

function loadSetting(setting, defaultValue) {
    let value = JSON.parse(window.localStorage.getItem(setting));
    if (value == null) {
        return defaultValue;
    }

    return value;
}

function saveSetting(setting, value) {
    window.localStorage.setItem(setting, JSON.stringify(value));
}

function ucWords(text) {
    return text
        .replace("_", " ")
        .toLowerCase()
        .replace(/(?<= )[^\s]|^./g, (a) => a.toUpperCase());
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


