"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = (RED) => {
    try {
        RED.httpAdmin.get('/matter2Tasmota/discover', async (req, res) => {
            const host = req.query.host;
            const port = Number(req.query.port || 80);
            const user = req.query.user || '';
            const password = req.query.password || '';
            if (!host) {
                res.status(400).json({ ok: false, error: 'host is required' });
                return;
            }
            const http = await import('http');
            const https = await import('https');
            const dns = await import('dns');
            const { execFile } = await import('child_process');
            const tryExec = (cmd, args) => new Promise((resolve, reject) => {
                execFile(cmd, args, { timeout: 1500 }, (err, stdout) => {
                    if (err)
                        return reject(err);
                    resolve(stdout || '');
                });
            });
            const resolveHost = async (name) => {
                const candidates = [name];
                if (!name.includes('.'))
                    candidates.push(`${name}.local`);
                for (const cand of candidates) {
                    try {
                        const { address } = await dns.promises.lookup(cand);
                        if (address)
                            return address;
                    }
                    catch { }
                }
                for (const cand of candidates) {
                    try {
                        const out = await tryExec('avahi-resolve', ['-n', cand]);
                        const parts = out.trim().split(/\s+/);
                        const ip = parts.pop();
                        if (ip && /^(\d+\.){3}\d+$/.test(ip))
                            return ip;
                    }
                    catch { }
                }
                for (const cand of candidates) {
                    try {
                        const out = await tryExec('getent', ['hosts', cand]);
                        const ip = out.trim().split(/\s+/)[0];
                        if (ip && /^(\d+\.){3}\d+$/.test(ip))
                            return ip;
                    }
                    catch { }
                }
                throw new Error(`Host resolution failed for ${name}`);
            };
            let targetHost = host;
            try {
                targetHost = await resolveHost(host);
            }
            catch (e) {
                res.status(404).json({ ok: false, error: e?.message || 'host not found' });
                return;
            }
            const fetchJson = (url) => new Promise((resolve, reject) => {
                const mod = url.startsWith('https:') ? https : http;
                const reqH = mod.get(url, { timeout: 1500 }, (r) => {
                    let data = '';
                    r.setEncoding('utf8');
                    r.on('data', (chunk) => data += chunk);
                    r.on('end', () => {
                        try {
                            resolve(JSON.parse(data));
                        }
                        catch (e) {
                            reject(e);
                        }
                    });
                });
                reqH.on('timeout', () => { reqH.destroy(); reject(new Error('timeout')); });
                reqH.on('error', reject);
            });
            const qp = (cmnd) => {
                const usp = new URLSearchParams();
                usp.append('cmnd', cmnd);
                if (user)
                    usp.append('user', user);
                if (password)
                    usp.append('password', password);
                return usp.toString();
            };
            try {
                const base = `http://${targetHost}:${port}/cm`;
                const status6 = await fetchJson(`${base}?${qp('Status 6')}`);
                const status5 = await fetchJson(`${base}?${qp('Status 5')}`);
                const status11 = await fetchJson(`${base}?${qp('Status 11')}`).catch(() => ({}));
                const mqt = status6?.StatusMQT || {};
                const net = status5?.StatusNET || {};
                const sts = status11?.StatusSTS || {};
                const mac = net.Mac || '';
                const topic = mqt.Topic || '';
                const fullTopic = mqt.FullTopic || '';
                const caps = {
                    dimmer: typeof sts.Dimmer !== 'undefined',
                    hsb: typeof sts.HSBColor !== 'undefined' || typeof sts.Color !== 'undefined',
                    ct: typeof sts.CT !== 'undefined'
                };
                res.json({ ok: true, mac, topic, fullTopic, caps });
            }
            catch (e) {
                res.status(500).json({ ok: false, error: String(e?.message || e) });
            }
        });
    }
    catch {
    }
    function matter2Tasmota(config) {
        RED.nodes.createNode(this, config);
        for (const item in config) {
            if (!isNaN(+config[item])) {
                config[item] = +config[item];
            }
        }
        this.debug(`Tasmota Converter Config: ${JSON.stringify(config, null, 2)}`);
        const nodeCtx = this.context ? this.context() : null;
        let hsPending = { h: undefined, s: undefined, v: undefined };
        let hsTimer = null;
        const isTruish = (value) => ["1", 1, true, "true", "ON", "on"].includes(value);
        const refine = (value, decimals = 0) => {
            if (decimals === 0)
                return Math.round(value);
            return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
        };
        const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
        const xyToHsv = (x, y, briPct) => {
            const Y = clamp(briPct / 100, 0, 1);
            const z = 1.0 - x - y;
            const X = (Y / y) * x;
            const Z = (Y / y) * z;
            let r = X * 3.2406 + Y * -1.5372 + Z * -0.4986;
            let g = X * -0.9689 + Y * 1.8758 + Z * 0.0415;
            let b = X * 0.0557 + Y * -0.2040 + Z * 1.0570;
            r = r <= 0.0031308 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055;
            g = g <= 0.0031308 ? 12.92 * g : 1.055 * Math.pow(g, 1 / 2.4) - 0.055;
            b = b <= 0.0031308 ? 12.92 * b : 1.055 * Math.pow(b, 1 / 2.4) - 0.055;
            r = clamp(r, 0, 1);
            g = clamp(g, 0, 1);
            b = clamp(b, 0, 1);
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            const delta = max - min;
            let h = 0;
            if (delta !== 0) {
                if (max === r)
                    h = 60 * (((g - b) / delta) % 6);
                else if (max === g)
                    h = 60 * ((b - r) / delta + 2);
                else
                    h = 60 * ((r - g) / delta + 4);
            }
            if (h < 0)
                h += 360;
            const s = max === 0 ? 0 : delta / max;
            const v = max;
            return { h: refine(h), s: refine(s * 100), v: refine(v * 100) };
        };
        let httpPollTimer = null;
        const startHttpPolling = async () => {
            try {
                const transport = (config.transport || 'mqtt').toLowerCase();
                if (config.direction !== 'fromTasmota' || transport !== 'http')
                    return;
                const httpHost = config.host;
                const httpPort = Number(config.port || 80);
                const httpUser = config.httpUser;
                const httpPassword = config.httpPassword;
                const enabled = config.httpPoll === true || config.httpPoll === 'true';
                const intervalMs = Math.max(500, Number(config.httpPollIntervalMs || 3000));
                if (!enabled) {
                    this.debug(`HTTP polling disabled`);
                    return;
                }
                if (!httpHost) {
                    this.warn(`HTTP polling enabled but no host configured`);
                    return;
                }
                if (httpPollTimer)
                    clearInterval(httpPollTimer);
                const http = await import('http');
                const https = await import('https');
                const buildUrl = (cmd) => {
                    const usp = new URLSearchParams();
                    usp.append('cmnd', cmd);
                    if (httpUser)
                        usp.append('user', httpUser);
                    if (httpPassword)
                        usp.append('password', httpPassword);
                    return `http://${httpHost}:${httpPort}/cm?${usp.toString()}`;
                };
                const fetchJson = (url) => new Promise((resolve, reject) => {
                    const mod = url.startsWith('https:') ? https : http;
                    const reqH = mod.get(url, { timeout: 2000 }, (r) => {
                        let data = '';
                        r.setEncoding('utf8');
                        r.on('data', (chunk) => data += chunk);
                        r.on('end', () => { try {
                            resolve(JSON.parse(data));
                        }
                        catch (e) {
                            reject(e);
                        } });
                    });
                    reqH.on('timeout', () => { reqH.destroy(); reject(new Error('timeout')); });
                    reqH.on('error', reject);
                });
                this.debug(`Starting HTTP polling of ${httpHost}:${httpPort} interval=${intervalMs}ms`);
                httpPollTimer = setInterval(async () => {
                    try {
                        const url = buildUrl('Status 11');
                        const json = await fetchJson(url);
                        const sts = json?.StatusSTS || {};
                        convertFromTasmota({ payload: sts }, this.send.bind(this), undefined);
                    }
                    catch (e) {
                        this.debug(`HTTP poll error: ${e?.message || e}`);
                    }
                }, intervalMs);
            }
            catch (e) {
                this.warn(`startHttpPolling error: ${e?.message || e}`);
            }
        };
        startHttpPolling();
        this.on("input", (msg, send, done) => {
            try {
                this.debug(`matter2Tasmota input: keys=${Object.keys(msg || {}).join(',')} direction=${config.direction}`);
                if (Object.hasOwn(msg, 'payload')) {
                    const preview = typeof msg.payload === 'object' ? JSON.stringify(msg.payload).slice(0, 300) : String(msg.payload).slice(0, 300);
                    this.debug(`payload preview: ${preview}`);
                }
                else {
                    this.warn(`No payload on incoming msg`);
                }
            }
            catch { }
            switch (config.direction) {
                case "toTasmota":
                    convertToTasmota(msg, send, done);
                    break;
                case "fromTasmota":
                    convertFromTasmota(msg, send, done);
                    break;
            }
        });
        this.on('close', () => {
            if (httpPollTimer) {
                clearInterval(httpPollTimer);
                httpPollTimer = null;
            }
        });
        const convertFromTasmota = (msg, send, done) => {
            if (!Object.hasOwn(msg, "payload")) {
                this.warn(`fromTasmota: ignored msg without payload`);
                if (done)
                    done();
                return;
            }
            const payload = msg.payload;
            const updates = {};
            this.debug(`fromTasmota: received payload keys=${Object.keys(payload).join(',')}`);
            if (Object.hasOwn(payload, "POWER")) {
                updates.onoff = payload.POWER === "ON" ? 1 : 0;
            }
            if (Object.hasOwn(payload, "Dimmer")) {
                updates.brightness = refine(Number(payload.Dimmer));
            }
            if (Object.hasOwn(payload, "HSBColor")) {
                const parts = String(payload.HSBColor).split(",").map((x) => Number(x));
                if (parts.length === 3) {
                    updates.hue = refine(parts[0]);
                    updates.saturation = refine(parts[1]);
                    if (!Object.hasOwn(updates, "brightness")) {
                        updates.brightness = refine(parts[2]);
                    }
                }
            }
            if (Object.hasOwn(payload, "CT")) {
                updates.colorTemperatureMireds = refine(Number(payload.CT));
            }
            this.debug(`fromTasmota: mapped updates=${JSON.stringify(updates)}`);
            if (Object.keys(updates).length > 0) {
                send({ payload: updates });
                this.debug(`fromTasmota: emitted updates`);
            }
            if (done)
                done();
        };
        const convertToTasmota = (msg, send, done) => {
            if (!Object.hasOwn(msg, "payload")) {
                this.warn(`toTasmota: ignored msg without payload`);
                if (done)
                    done();
                return;
            }
            if (!Object.hasOwn(msg.payload, "messageSource") || typeof msg.payload.messageSource !== "string" || msg.payload.messageSource !== "Matter") {
                this.debug(`toTasmota: ignored msg with messageSource=${msg?.payload?.messageSource}`);
                if (done)
                    done();
                return;
            }
            const device = config.deviceTopic || "DEVICE";
            const useBacklog = Boolean(config.useBacklog);
            const transport = (config.transport || 'mqtt').toLowerCase();
            const fullTopic = (config.fullTopic || '%prefix%/%topic%/');
            const httpHost = config.host;
            const httpPort = Number(config.port || 80);
            const httpUser = config.httpUser;
            const httpPassword = config.httpPassword;
            const transitionSeconds = typeof msg.payload.transitionTime === 'number' ? msg.payload.transitionTime : undefined;
            const messages = [];
            const hasHue = Object.hasOwn(msg.payload, "hue");
            const hasSat = Object.hasOwn(msg.payload, "saturation");
            const pctFromBrightness = (b) => clamp(refine(Number(b)), 0, 100);
            const buildMqttTopic = (prefix, command) => {
                let base = fullTopic.replace('%prefix%', prefix).replace('%topic%', device);
                if (!base.endsWith('/'))
                    base += '/';
                return `${base}${command}`;
            };
            const buildHttpUrl = (cmd, value) => {
                const cmnd = value ? `${cmd} ${value}` : cmd;
                const usp = new URLSearchParams();
                usp.append('cmnd', cmnd);
                if (httpUser)
                    usp.append('user', httpUser);
                if (httpPassword)
                    usp.append('password', httpPassword);
                return `http://${httpHost}:${httpPort}/cm?${usp.toString()}`;
            };
            this.debug(`toTasmota: building commands transport=${transport} device=${device} fullTopic=${fullTopic}`);
            let backlogParts = [];
            if (Object.hasOwn(msg.payload, "onoff")) {
                const on = isTruish(msg.payload.onoff) ? "ON" : "OFF";
                if (transport === 'http') {
                    if (useBacklog)
                        backlogParts.push(`POWER ${on}`);
                    else
                        messages.push({ method: 'GET', url: buildHttpUrl('Power', on) });
                }
                else {
                    const topic = buildMqttTopic('cmnd', 'POWER');
                    if (useBacklog)
                        backlogParts.push(`POWER ${on}`);
                    else
                        messages.push({ topic, payload: on });
                }
            }
            let dimmerPct;
            if (Object.hasOwn(msg.payload, "brightness")) {
                dimmerPct = pctFromBrightness(msg.payload.brightness);
                // If we're also updating hue or saturation, we'll send V via HSBColor; avoid separate Dimmer
                if (!(hasHue || hasSat)) {
                    if (transport === 'http') {
                        if (useBacklog)
                            backlogParts.push(`Dimmer ${dimmerPct}`);
                        else
                            messages.push({ method: 'GET', url: buildHttpUrl('Dimmer', String(dimmerPct)) });
                    }
                    else {
                        const topic = buildMqttTopic('cmnd', 'Dimmer');
                        if (useBacklog)
                            backlogParts.push(`Dimmer ${dimmerPct}`);
                        else
                            messages.push({ topic, payload: String(dimmerPct) });
                    }
                }
            }
            if (hasHue || hasSat) {
                // Accumulate H/S/V and coalesce into a single HSBColor after a short debounce
                const incomingH = hasHue ? clamp(refine(Number(msg.payload.hue)), 0, 360) : undefined;
                const incomingS = hasSat ? clamp(refine(Number(msg.payload.saturation)), 0, 100) : undefined;
                const incomingV = dimmerPct !== undefined ? clamp(refine(Number(dimmerPct)), 0, 100) : undefined;
                if (incomingH !== undefined)
                    hsPending.h = incomingH;
                if (incomingS !== undefined)
                    hsPending.s = incomingS;
                if (incomingV !== undefined)
                    hsPending.v = incomingV;
                if (hsTimer)
                    clearTimeout(hsTimer);
                const self = this;
                hsTimer = setTimeout(() => {
                    try {
                        const lastH = (nodeCtx && nodeCtx.get) ? (nodeCtx.get('lastHue') ?? 0) : 0;
                        const lastS = (nodeCtx && nodeCtx.get) ? (nodeCtx.get('lastSaturation') ?? 0) : 0;
                        const lastV = (nodeCtx && nodeCtx.get) ? (nodeCtx.get('lastBrightness') ?? 100) : 100;
                        const H = typeof hsPending.h === 'number' ? hsPending.h : lastH;
                        const S = typeof hsPending.s === 'number' ? hsPending.s : lastS;
                        const V = typeof hsPending.v === 'number' ? hsPending.v : (dimmerPct !== undefined ? dimmerPct : lastV);
                        // Persist
                        if (nodeCtx && nodeCtx.set) {
                            nodeCtx.set('lastHue', H);
                            nodeCtx.set('lastSaturation', S);
                            nodeCtx.set('lastBrightness', V);
                        }
                        const buildMqttTopicLocal = (prefix, command) => {
                            let base = (config.fullTopic || '%prefix%/%topic%/').replace('%prefix%', prefix).replace('%topic%', (config.deviceTopic || 'DEVICE'));
                            if (!base.endsWith('/'))
                                base += '/';
                            return `${base}${command}`;
                        };
                        const buildHttpUrlLocal = (cmd, value) => {
                            const cmnd = value ? `${cmd} ${value}` : cmd;
                            const usp = new URLSearchParams();
                            usp.append('cmnd', cmnd);
                            if (config.httpUser)
                                usp.append('user', config.httpUser);
                            if (config.httpPassword)
                                usp.append('password', config.httpPassword);
                            return `http://${config.host}:${Number(config.port || 80)}/cm?${usp.toString()}`;
                        };
                        const value = `${H},${S},${V}`;
                        const transportLocal = (config.transport || 'mqtt').toLowerCase();
                        if (transportLocal === 'http') {
                            self.send({ method: 'GET', url: buildHttpUrlLocal('HSBColor', value) });
                        }
                        else {
                            const topic = buildMqttTopicLocal('cmnd', 'HSBColor');
                            self.send({ topic, payload: value });
                        }
                    }
                    catch (e) {
                        // ignore
                    }
                    finally {
                        hsPending = { h: undefined, s: undefined, v: undefined };
                        hsTimer = null;
                    }
                }, 80);
            }
            if (Object.hasOwn(msg.payload, "colorX") && Object.hasOwn(msg.payload, "colorY") && !Object.hasOwn(msg.payload, "hue")) {
                const x = Number(msg.payload.colorX);
                const y = Number(msg.payload.colorY);
                const vPct = Number(dimmerPct ?? pctFromBrightness(msg.payload.brightness ?? 100));
                const hsv = xyToHsv(x, y, vPct);
                const value = `${hsv.h},${hsv.s},${hsv.v}`;
                if (transport === 'http') {
                    if (useBacklog)
                        backlogParts.push(`HSBColor ${value}`);
                    else
                        messages.push({ method: 'GET', url: buildHttpUrl('HSBColor', value) });
                }
                else {
                    const topic = buildMqttTopic('cmnd', 'HSBColor');
                    if (useBacklog)
                        backlogParts.push(`HSBColor ${value}`);
                    else
                        messages.push({ topic, payload: value });
                }
            }
            const ctKey = Object.hasOwn(msg.payload, "colorTemperatureMireds") ? "colorTemperatureMireds" : (Object.hasOwn(msg.payload, "colorTemperature") ? "colorTemperature" : undefined);
            if (ctKey) {
                const mireds = clamp(refine(Number(msg.payload[ctKey])), 100, 1000);
                if (transport === 'http') {
                    if (useBacklog)
                        backlogParts.push(`CT ${mireds}`);
                    else
                        messages.push({ method: 'GET', url: buildHttpUrl('CT', String(mireds)) });
                }
                else {
                    const topic = buildMqttTopic('cmnd', 'CT');
                    if (useBacklog)
                        backlogParts.push(`CT ${mireds}`);
                    else
                        messages.push({ topic, payload: String(mireds) });
                }
            }
            if (useBacklog && (transitionSeconds !== undefined)) {
                const speed = clamp(refine(transitionSeconds * 10), 1, 40);
                backlogParts.unshift(`Fade 1`, `Speed ${speed}`);
            }
            if (useBacklog && backlogParts.length > 0) {
                if (transport === 'http') {
                    messages.push({ method: 'GET', url: buildHttpUrl('Backlog', backlogParts.join('; ')) });
                }
                else {
                    const topic = buildMqttTopic('cmnd', 'Backlog');
                    messages.push({ topic, payload: backlogParts.join("; ") });
                }
            }
            if (messages.length > 0) {
                this.debug(`toTasmota: emitting ${messages.length} message(s): ${JSON.stringify(messages).slice(0, 800)}`);
                if (messages.length === 1)
                    send(messages[0]);
                else
                    send(messages);
            }
            if (done)
                done();
        };
    }
    RED.nodes.registerType('matter2Tasmota', matter2Tasmota);
};
//# sourceMappingURL=converterTasmota.js.map