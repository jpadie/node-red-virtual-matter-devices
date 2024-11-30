"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
type: module;
module.exports = (RED) => {
    function matter2Z2M(config) {
        RED.nodes.createNode(this, config);
        let isTruish = (value) => {
            return ["1", 1, true].includes(value);
        };
        let refine = (value, decimals = 0) => {
            if (decimals == 0) {
                return Math.round(value);
            }
            else {
                return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
            }
        };
        this.on("input", (msg, send, done) => {
            switch (config.conversionType) {
                case "toZ2M":
                    if (config.numberOfGangs > 1) {
                        convertToZ2M(msg, send, done, config.gang);
                    }
                    else {
                        convertToZ2M(msg, send, done);
                    }
                    break;
                case "fromZ2M":
                    for (let i = 1; i <= config.numberOfGangs; i++) {
                        convertFromZ2M(msg, send, done, i);
                    }
                    break;
            }
        });
        let convertFromZ2M = (msg, send, done, i = 1) => {
            if (!Object.hasOwn(msg, "payload")) {
                if (done) {
                    done();
                }
                return;
            }
            let updates = {};
            let key;
            let value;
            let j = 0;
            let Updates = [];
            this.debug(`Z2M->Matter:  Number of gangs: ${i}`);
            while (j <= i) {
                j++;
                let suffix = i == 1 ? "" : `_l${j}`;
                for ([key, value] of Object.entries(msg.payload)) {
                    this.debug(`Z2M->Matter: Item: ${key} Value: ${value}`);
                    switch (key) {
                        case "temperature" + suffix:
                            updates = Object.assign(updates, { localTemperature: refine(value, 2) });
                            break;
                        case "humidity" + suffix:
                            updates = Object.assign(updates, { humidity: refine(value, 2) });
                            break;
                        case "current_heating_setpoint" + suffix:
                            updates = Object.assign(updates, { occupiedHeatingSetpoint: refine(value, 2) });
                            break;
                        case "brightness" + suffix:
                            value /= 2.55;
                            value = refine(value);
                            updates = Object.assign(updates, { brightness: value });
                            break;
                        case "color" + suffix:
                            let hasHue = false;
                            for (let item in ["hue", "saturation"]) {
                                if (Object.hasOwn(msg.payload.color, item)) {
                                    hasHue = true;
                                    value = Math.round(value);
                                    updates = Object.assign(updates, { [item]: value });
                                }
                            }
                            if (!hasHue) {
                                for (let c in ["x", "y"]) {
                                    if (Object.hasOwn(msg.payload.color, c)) {
                                        value = refine(msg.payload.color[c], 3);
                                        updates = Object.assign(updates, { [`color${c.toUpperCase()}`]: value });
                                    }
                                }
                            }
                            break;
                        case "state" + suffix:
                            Object.assign(updates, { onoff: value == "ON" ? 1 : 0 });
                            break;
                    }
                }
                Updates.push(updates);
            }
            this.debug(`Z2M->Matter ${JSON.stringify(Updates, null, 2)}`);
            if (Object.keys(Updates).length > 0) {
                send(...Updates);
                if (done) {
                    done();
                }
                return;
            }
            else {
                if (done) {
                    done();
                }
            }
        };
        let convertToZ2M = (msg, send, done, i = 0) => {
            if (!Object.hasOwn(msg, "payload")) {
                if (done) {
                    done();
                }
                return;
            }
            if (!Object.hasOwn(msg.payload, "messageSource")) {
                if (done) {
                    done();
                }
                return;
            }
            if (typeof msg.payload.messageSource != "string") {
                if (done) {
                    done();
                }
                return;
            }
            if (msg.payload.messageSource.toLowerCase() != "matter") {
                if (done) {
                    done();
                }
                return;
            }
            this.debug(`Matter->Z2M: NumGangs: ${config.numberOfGangs}; Gang of Interest: ${config.gang}`);
            let updates = {};
            let key;
            let value;
            let suffix = i == 0 ? "" : `_l${i}`;
            for ([key, value] of Object.entries(msg.payload)) {
                this.debug(`Matter->Z2M: Item: ${key} ; Value: ${value}`);
                value = Number(value);
                if (!value) {
                    continue;
                }
                switch (key) {
                    case "occupiedHeatingSetpoint":
                        updates = Object.assign(updates, { ["current_heating_setpoint" + suffix]: refine(value, 2) });
                        break;
                    case "brightness":
                        value *= 2.55;
                        value = Math.round(value);
                        updates = Object.assign(updates, { ["brightness" + suffix]: value });
                        break;
                    case "colorX":
                    case "colorY":
                        const colorX = refine(msg.payload.colorX, 3);
                        const colorY = refine(msg.payload.colorY, 3);
                        if (!Object.hasOwn(updates, "color")) {
                            updates["color" + suffix] = {};
                        }
                        updates.color = Object.assign(updates["color" + suffix], { x: colorX, y: colorY });
                        break;
                    case "hue":
                        if (!Object.hasOwn(updates, "color")) {
                            updates["color" + suffix] = {};
                        }
                        updates["color" + suffix] = Object.assign(updates["color" + suffix], { hue: refine(value) });
                        break;
                    case "saturation":
                        if (!Object.hasOwn(updates, "color")) {
                            updates["color" + suffix] = {};
                        }
                        updates["color" + suffix] = Object.assign(updates["color" + suffix], { saturation: refine(value) });
                        break;
                    case "onoff":
                        Object.assign(updates, { ["state" + suffix]: isTruish(value) ? "ON" : "OFF" });
                        break;
                }
            }
            this.debug(`Matter->Z2M: Update: ${JSON.stringify(updates, null, 2)}`);
            if (Object.keys(updates).length > 0) {
                send({ payload: updates });
                if (done) {
                    done();
                }
                return;
            }
            else {
                if (done) {
                    done();
                }
            }
        };
    }
    RED.nodes.registerType('matter2Z2M', matter2Z2M);
};
//# sourceMappingURL=converterZ2M.js.map