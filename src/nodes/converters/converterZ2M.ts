type: module
import type { Node, NodeAPI } from 'node-red';


module.exports = (RED: NodeAPI): void => {

    function matter2Z2M(this: Node, config: any) {

        RED.nodes.createNode(this, config);

        let isTruish = (value) => {
            return ["1", 1, true].includes(value);
        }

        let refine = (value, decimals = 0) => {
            if (decimals == 0) {
                return Math.round(value);
            } else {
                return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
            }
        }
        this.on("input", (msg: any, send, done) => {
            switch (config.conversionType) {
                case "toZ2M":
                    convertToZ2M(msg, send, done);
                    break;
                case "fromZ2M":
                    convertFromZ2M(msg, send, done);
                    break;
            }
        });

        let convertFromZ2M = (msg: any, send, done) => {
            if (!Object.hasOwn(msg, "payload")) {
                if (done) {
                    done();
                }
                return;
            }

            let updates: any = {};
            let key: string;
            let value: any;

            for ([key, value] of Object.entries(msg.payload)) {
                switch (key) {

                    case "temperature":
                        updates = Object.assign(updates, { localTemperature: refine(value, 2) })
                        break;

                    case "humidity":
                        updates = Object.assign(updates, { humidity: refine(value, 2) })
                        break;

                    case "current_heating_setpoint":
                        updates = Object.assign(updates, { occupiedHeatingSetpoint: refine(value, 2) })
                        break;

                    case "brightness":
                        /* Z2M stores brightness as a value out of 255.  
                        /* we need to convert to a percentage */
                        value /= 2.55
                        value = refine(value); //convert to int
                        updates = Object.assign(updates, { brightness: value });
                        break;
                    case "color":
                        /* prefer hue and saturation */
                        /* hue is stored and received as degrees
                        /* saturation is stored and received as a percentage
                        */
                        let hasHue = false;
                        for (let item in ["hue", "saturation"]) {
                            if (Object.hasOwn(msg.payload.color, item)) {
                                hasHue = true;
                                value = Math.round(value);//insist on int
                                updates = Object.assign(updates, { [item]: value });
                            }
                        }
                        if (!hasHue) {
                            for (let c in ["x", "y"]) {
                                if (Object.hasOwn(msg.payload.color, c)) {
                                    value = refine(msg.payload.color[c], 3);
                                    updates = Object.assign(updates, { [`color${c.toUpperCase()}`]: value })
                                }
                            }
                        }
                        break;

                    case "state":
                        Object.assign(updates, { onoff: value == "ON" ? 1 : 0 });
                        break;

                }
            }

            if (Object.keys(updates).length > 0) {
                send({ payload: updates });
                if (done) {
                    done();
                }
                return;
            } else {
                if (done) {
                    done()
                }
            }
        }
        let convertToZ2M = (msg: any, send, done) => {
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

            let updates: any = {};
            let key: string;
            let value: any;

            for ([key, value] of Object.entries(msg.payload)) {
                value = Number(value);
                if (!value) {
                    continue;
                }
                switch (key) {

                    case "occupiedHeatingSetpoint":
                        updates = Object.assign(updates, { current_heating_setpoint: refine(value, 2) })
                        break;
                    case "brightness":
                        value *= 2.55
                        value = Math.round(value); //convert to int
                        updates = Object.assign(updates, { brightness: value });
                        break;
                    case "colorX":
                    case "colorY":
                        const colorX = refine(msg.payload.colorX, 3);
                        const colorY = refine(msg.payload.colorY, 3);
                        if (!Object.hasOwn(updates, "color")) {
                            updates.color = {};
                        }
                        updates.color = Object.assign(updates.color, { x: colorX, y: colorY });
                        break;
                    case "hue":
                        /* hue is stored as a value in degrees */
                        if (!Object.hasOwn(updates, "color")) {
                            updates.color = {};
                        }
                        updates.color = Object.assign(updates.color, { hue: refine(value) });
                        break;

                    case "saturation":
                        /* saturation is stored as a percentage value */
                        if (!Object.hasOwn(updates, "color")) {
                            updates.color = {};
                        }
                        updates.color = Object.assign(updates.color, { saturation: refine(value) });
                        break;

                    case "onoff":
                        Object.assign(updates, { state: isTruish(value) ? "ON" : "OFF" });
                        break;

                }
            }

            if (Object.keys(updates).length > 0) {
                send({ payload: updates });
                if (done) {
                    done();
                }
                return;
            } else {
                if (done) {
                    done()
                }
            }
        }

    }
    RED.nodes.registerType('matter2Z2M', matter2Z2M);
}