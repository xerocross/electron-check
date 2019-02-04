const electron = require('electron');
const path = require('path');
const fs = require('fs');
const ipc = electron.ipcRenderer;

class Store {
    constructor(opts) {
        const userDataPath = (electron.app || electron.remote.app).getPath('userData');
        this.path = path.join(userDataPath, opts.configName + '.json');
        this.data = parseDataFile(this.path, opts.defaults);
        
    }
    get(key) {
        return this.data[key];
    }

    save () {
        ipc.send("save-data-file", JSON.stringify(this.data));
        ipc.on("save-data-file", function(event, arg) {
            if (arg == true) {
                alert("saved");
            } else {
                alert("couldn't save");
            }
        })
    }

    remove(key) {
        delete this.data[key];
        this.save();
    }

    set(key, val) {
        this.data[key] = val;
        this.save();
        // try {
        //     fs.writeFileSync(this.path, JSON.stringify(this.data));
        // } 
        // catch (e) {
        //     console.log(e);
        // }
    }
}

function parseDataFile(filePath, defaults) {
    // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
    // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
    
    try {
        let data = JSON.parse(fs.readFileSync(filePath));
        return data;
    } catch(error) {
        return defaults;
    }
}

module.exports = Store;