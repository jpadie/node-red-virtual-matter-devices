let colours = [
    {
        name: "white",
        hs: {
            hue: 0,
            saturation: 0
        },
        rgb: {

        }

    },
    {
        name: "red",
        hs: {
            hue: 0,
            saturation: 100
        },
        rgb: {

        }
    },
    {
        name: "Crimson",
        hs: {
            hue: 346,
            saturation: 91
        },
        rgb: {

        }
    },
    {
        name: "Salmon",
        hs: {
            hue: 16,
            saturation: 52
        },
        rgb: {

        }
    },
    {
        name: "Orange",
        hs: {
            hue: 38,
            saturation: 100
        },
        rgb: {

        }
    },
    {
        name: "Gold",
        hs: {
            hue: 49,
            saturation: 100
        },
        rgb: {

        }
    },
    {
        name: "Yellow",
        hs: {
            hue: 59,
            saturation: 100
        },
        rgb: {

        }
    },
    {
        name: "Green",
        hs: {
            hue: 119,
            saturation: 100
        },
        rgb: {

        }
    },
    {
        name: "Turquoise",
        hs: {
            hue: 172,
            saturation: 72
        },
        rgb: {

        }
    },
    {
        name: "Cyan",
        hs: {
            hue: 179,
            saturation: 100
        },
        rgb: {

        }
    },
    {
        name: "Sky Blue",
        hs: {
            hue: 195,
            saturation: 42
        },
        rgb: {

        }
    },
    {
        name: "Blue",
        hs: {
            hue: 239,
            saturation: 100
        },
        rgb: {

        }
    },
    {
        name: "Purple",
        hs: {
            hue: 275,
            saturation: 86
        },
        rgb: {

        }
    },
    {
        name: "Magenta",
        hs: {
            hue: 298,
            saturation: 100
        },
        rgb: {

        }
    },
    {
        name: "Pink",
        hs: {
            hue: 346,
            saturation: 50
        },
        rgb: {

        }
    },
    {
        name: "Lavender",
        hs: {
            hue: 253,
            saturation: 50
        },
        rgb: {

        }
    },
]

let convertHSVtoRGB = (h, s, v) => {
    s /= 100;
    v /= 100;
    let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return { r: Math.round(f(5) * 255), g: Math.round(f(3) * 255), b: Math.round(f(1) * 255) };
}

let convertRGBtoXY = (red, green, blue) => {
    let redC = (red / 255)
    let greenC = (green / 255)
    let blueC = (blue / 255)
    //console.log(redC, greenC, blueC)


    let redN = (redC > 0.04045) ? Math.pow((redC + 0.055) / (1.0 + 0.055), 2.4) : (redC / 12.92)
    let greenN = (greenC > 0.04045) ? Math.pow((greenC + 0.055) / (1.0 + 0.055), 2.4) : (greenC / 12.92)
    let blueN = (blueC > 0.04045) ? Math.pow((blueC + 0.055) / (1.0 + 0.055), 2.4) : (blueC / 12.92)
    //console.log(redN, greenN, blueN)

    let X = redN * 0.664511 + greenN * 0.154324 + blueN * 0.162028;

    let Y = redN * 0.283881 + greenN * 0.668433 + blueN * 0.047685;

    let Z = redN * 0.000088 + greenN * 0.072310 + blueN * 0.986039;
    //console.log(X, Y, Z)

    let x = X / (X + Y + Z);

    let y = Y / (X + Y + Z);
    return { x: Math.round(x * 1000) / 1000, y: Math.round(y * 1000) / 1000 };
}

colours.forEach((col, index, array) => {
    let rgb = convertHSVtoRGB(col.hs.hue, col.hs.saturation, 100);
    array[index].rgb = rgb;
})

colours.forEach((col, index, array) => {
    let xy = convertRGBtoXY(col.rgb.r, col.rgb.g, col.rgb.b);
    array[index] = Object.assign(array[index], { xy: xy });
})

console.log(colours);