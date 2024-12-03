"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colorLight = void 0;
const behaviors_1 = require("@matter/main/behaviors");
const main_1 = require("@matter/main");
const dimmableLight_js_1 = require("./dimmableLight.js");
const devices_1 = require("@matter/main/devices");
const behaviors_2 = require("@matter/main/behaviors");
const colourList_js_1 = require("./colourList.js");
class colorLight extends dimmableLight_js_1.dimmableLight {
    constructor(node, config, _name = '') {
        let name = config.name || _name || "Color Light";
        super(node, config, name);
        this.attributes = {
            ...this.attributes,
            colorControl: {
                managedTransitionTimeHandling: true,
                options: {
                    executeIfOff: true,
                },
                colorCapabilities: {
                    hueSaturation: true,
                    xy: true,
                    enhancedHue: true,
                    colorLoop: false,
                    colorTemperature: false
                },
            }
        };
        this.mapping = {
            ...this.mapping,
            colorX: { colorControl: "currentX", multiplier: 65536, unit: "", min: 0, max: 0xFEFF, matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 3 } },
            colorY: { colorControl: "currentY", multiplier: 65536, unit: "", min: 0, max: 0xFEFF, matter: { valueType: "int" }, context: { valueType: "float", valueDecimals: 3 } },
            hue: { colorControl: "currentHue", multiplier: 254 / 360, unit: "deg", min: 0, max: 254, matter: { valueType: "int" }, context: { valueType: "int" } },
            saturation: { colorControl: "currentSaturation", multiplier: 255 / 100, unit: "%", min: 0, max: 254, matter: { valueType: "int" }, context: { valueType: "int" } }
        };
        this.attributes.bridgedDeviceBasicInformation.serialNumber = `clLt-${this.node.id}`.substring(0, 32);
        this.setDefault("hue", 0);
        this.setDefault("saturation", 0);
        this.setDefault("colorX", 0);
        this.setDefault("colorY", 0);
        this.setDefault("colorSpace", "xyY");
    }
    getVerbose(item, value) {
        switch (item) {
            default:
                return super.getVerbose(item, value);
        }
    }
    convertHSVtoXY(hue, saturation, brightness) {
        let { r, g, b } = this.convertHSVtoRGB(hue, saturation, brightness);
        let { x, y } = this.convertRGBtoXY(r, g, b);
        return { x: x, y: y };
    }
    convertXYtoRGB(vX, vY) {
        vY = vY || 0.00000000001;
        const Y = 1;
        const X = (Y / vY) * vX;
        const Z = (Y / vY) * (1 - vX - vY);
        let rgb = [
            X * 1.656492 - Y * 0.354851 - Z * 0.255038,
            -X * 0.707196 + Y * 1.655397 + Z * 0.036152,
            X * 0.051713 - Y * 0.121364 + Z * 1.011530
        ];
        rgb = rgb.map(x => x <= 0.0031308 ? 12.92 * x : (1.0 + 0.055) * Math.pow(x, 1.0 / 2.4) - 0.055);
        rgb = rgb.map(x => Math.max(0, x));
        const max = Math.max(...rgb);
        if (max > 1) {
            rgb = rgb.map(x => x / max);
        }
        rgb = rgb.map(x => Math.round(x * 255));
        return { r: rgb[0], g: rgb[1], b: rgb[2] };
    }
    convertRGBtoXY(red, green, blue) {
        let redC = (red / 255);
        let greenC = (green / 255);
        let blueC = (blue / 255);
        let redN = (redC > 0.04045) ? Math.pow((redC + 0.055) / (1.0 + 0.055), 2.4) : (redC / 12.92);
        let greenN = (greenC > 0.04045) ? Math.pow((greenC + 0.055) / (1.0 + 0.055), 2.4) : (greenC / 12.92);
        let blueN = (blueC > 0.04045) ? Math.pow((blueC + 0.055) / (1.0 + 0.055), 2.4) : (blueC / 12.92);
        let X = redN * 0.664511 + greenN * 0.154324 + blueN * 0.162028;
        let Y = redN * 0.283881 + greenN * 0.668433 + blueN * 0.047685;
        let Z = redN * 0.000088 + greenN * 0.072310 + blueN * 0.986039;
        let x = X / (X + Y + Z);
        let y = Y / (X + Y + Z);
        return { x: x, y: y };
    }
    convertHSVtoRGB(h, s, v) {
        s /= 100;
        v /= 100;
        let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
        return { r: f(5) * 255, g: f(3) * 255, b: f(1) * 255 };
    }
    async getColorName(r, g, b) {
        const c2n = await import("color-2-name");
        let colorString = `rgb(${r}, ${g}, ${b})`;
        let c = c2n.closest(colorString, colourList_js_1.colourList);
        return c.name;
    }
    convertXYtoHSV(x, y) {
        let rgb = Object.values(this.convertXYtoRGB(x, y));
        let rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
        rgb.map(x => x / 255);
        v = Math.max(...rgb);
        diff = v - Math.min(...rgb);
        diffc = c => (v - c) / 6 / diff + 1 / 2;
        percentRoundFn = num => Math.round(num * 100) / 100;
        if (diff == 0) {
            h = s = 0;
        }
        else {
            s = diff / v;
            rr = diffc(rgb[0]);
            gg = diffc(rgb[1]);
            bb = diffc(rgb[2]);
            if (rgb[0] === v) {
                h = bb - gg;
            }
            else if (rgb[1] === v) {
                h = (1 / 3) + rr - bb;
            }
            else if (rgb[2] === v) {
                h = (2 / 3) + gg - rr;
            }
            if (h < 0) {
                h += 1;
            }
            else if (h > 1) {
                h -= 1;
            }
        }
        return {
            h: Math.round(h * 360),
            s: percentRoundFn(s * 100),
            v: percentRoundFn(v * 100)
        };
    }
    async preProcessOutputReport(report) {
        if (Object.hasOwn(report, "hue") || Object.hasOwn(report, "saturation")) {
            const rgb = this.convertHSVtoRGB(this.context.hue, this.context.saturation, this.context.brightness);
            this.context.colorName = await this.getColorName(rgb.r, rgb.g, rgb.b);
            this.saveContext();
        }
        else {
            if (Object.hasOwn(report, "colorX")) {
                report.colorY = this.context.colorY;
                const rgb = this.convertXYtoRGB(report.colorX, report.colorY);
                const color = await this.getColorName(rgb.r, rgb.g, rgb.b);
                this.context.colorName = color;
                this.saveContext();
            }
            else if (Object.hasOwn(report, "colorY")) {
                report.colorX = this.context.colorX;
                const rgb = this.convertXYtoRGB(report.colorX, report.colorY);
                this.context.colorName = await this.getColorName(rgb.r, rgb.g, rgb.b);
                this.saveContext();
            }
        }
        return report;
    }
    async getStatusText() {
        if (Object.hasOwn(this.context, "colorName") && this.context.colorName) {
        }
        else {
            let col, c;
            switch (this.context.colorSpace) {
                case "xyY":
                    col = this.convertXYtoRGB(this.context.colorX, this.context.colorY);
                    c = await this.getColorName(col.r, col.g, col.b);
                    break;
                case "hsv":
                    col = this.convertHSVtoRGB(this.context.hue, this.context.saturation, this.context.brightness);
                    c = await this.getColorName(col.r, col.g, col.b);
                    break;
                default:
                    c = "unknown";
            }
            this.context.colorName = c;
            this.saveContext();
        }
        return `${super.getStatusText()} Color: ${this.context.colorName}`;
    }
    async setStatus() {
        const text = await this.getStatusText();
        this.node.status({
            fill: "green",
            shape: "dot",
            text: text
        });
    }
    preProcessNodeRedInput(item, value) {
        let { a, b } = super.preProcessNodeRedInput(item, value);
        if (a === "color") {
            if (Object.hasOwn(b, "hue") && Object.hasOwn(b, "saturation")) {
                delete b.colorX;
                delete b.colorY;
                if (this.context.colorSpace != "hsv") {
                    this.context.colorSpace = "hsv";
                    this.saveContext();
                }
            }
            else if (Object.hasOwn(b, "colorX") && Object.hasOwn(b, "colorY")) {
                delete b.hue;
                delete b.saturation;
                if (this.context.colorSpace != "xyY") {
                    this.context.colorSpace = "xyY";
                    this.saveContext();
                }
            }
        }
        return { a: a, b: b };
    }
    async deploy() {
        try {
            this.endpoint = await new main_1.Endpoint(devices_1.DimmableLightDevice.with(behaviors_1.BridgedDeviceBasicInformationServer, behaviors_2.ColorControlServer.with("EnhancedHue", "Xy", "HueSaturation")), this.attributes);
        }
        catch (e) {
            this.node.error(e);
            console.trace();
        }
    }
}
exports.colorLight = colorLight;
//# sourceMappingURL=colorCapableLight.js.map