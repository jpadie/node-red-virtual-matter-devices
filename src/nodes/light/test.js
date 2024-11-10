
class test {
    constructor() {
        this.context = {
            hue: 200,
            saturation: 80,
            brightness: 100
        };
    }
    async getColorName(r, g, b) {
        const c2n = await import("color-2-name")
        let colorString = `rgb(${r}, ${g}, ${b})`;
        console.log("color string");
        console.log(colorString);
        let c = c2n.closest(colorString, colourList);
        console.log("color name)")
        console.log(c);
        return c.name;
    }
    convertHSVtoRGB(h, s, v) {
        s /= 100;
        v /= 100;
        let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
        return { r: f(5) * 255, g: f(3) * 255, b: f(1) * 255 };
    }
    async getStatusText() {
        if (Object.hasOwn(this.context, "colorName") && this.context.colorName) {
            //
        } else {
            const col = this.convertHSVtoRGB(this.context.hue, this.context.saturation, this.context.brightness)
            let c = this.getColorName(col.r, col.g, col.b);
            console.log("color name from get status text");
            console.log(c);
            this.context.colorName = c;
            // this.saveContext();
        }
        return this.context.colorName;
    }

}

const t = new test;
console.log(t.getStatusText());
