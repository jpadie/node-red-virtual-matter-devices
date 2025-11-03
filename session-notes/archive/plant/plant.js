const { PlantConfigNode } = require('./plantConfig');

module.exports = function(RED) {
    function PlantNode(config) {
        RED.nodes.createNode(this, config);
        
        this.name = config.name || "Plant Controller";
        this.plantConfig = config.plantConfig;
        this.minOnTime = config.minOnTime || 300;
        this.minOffTime = config.minOffTime || 300;
        this.changeoverDelay = config.changeoverDelay || 300;
        
        this.lastModeChange = null;
        this.lastOffTime = null;
        this.lastHeatTime = null;
        this.lastCoolTime = null;
        
        let node = this;
        
        // Get plant config node
        this.configNode = RED.nodes.getNode(this.plantConfig);
        if (!this.configNode) {
            this.error("No Plant Config node selected");
            return;
        }
        
        // Initialize plant state
        this.updatePlantState();
        
        this.on('input', function(msg, send, done) {
            try {
                if (msg.payload && typeof msg.payload === 'object') {
                    let updated = false;
                    
                    // Handle plantMode change
                    if (msg.payload.hasOwnProperty('plantMode')) {
                        if (this.setPlantMode(msg.payload.plantMode)) {
                            updated = true;
                        }
                    }
                    
                    // Handle lockout change
                    if (msg.payload.hasOwnProperty('lockout')) {
                        if (this.setLockout(msg.payload.lockout)) {
                            updated = true;
                        }
                    }
                    
                    // Handle changeover delay change
                    if (msg.payload.hasOwnProperty('changeoverDelaySec')) {
                        if (this.setChangeoverDelay(msg.payload.changeoverDelaySec)) {
                            updated = true;
                        }
                    }
                    
                    if (updated) {
                        this.updatePlantState();
                        this.sendPlantState();
                    }
                }
                
                if (done) done();
            } catch (err) {
                this.error("Plant node error: " + err.message);
                if (done) done(err);
            }
        });
        
        this.on('close', function() {
            // Cleanup if needed
        });
    }
    
    PlantNode.prototype.setPlantMode = function(mode) {
        if (!['heat', 'cool', 'off'].includes(mode)) {
            this.warn("Invalid plant mode: " + mode);
            return false;
        }
        
        let currentState = this.configNode.getState();
        let currentMode = currentState.plantMode;
        
        // Check if mode change is allowed
        if (currentMode === mode) {
            return false; // No change needed
        }
        
        // Check changeover delay
        if (this.lastModeChange && (currentMode === 'heat' || currentMode === 'cool')) {
            let timeSinceChange = Date.now() - this.lastModeChange;
            if (timeSinceChange < this.changeoverDelay * 1000) {
                this.warn(`Changeover delay not met. Need ${this.changeoverDelay}s, got ${Math.round(timeSinceChange/1000)}s`);
                return false;
            }
        }
        
        // Check minimum off time
        if (currentMode !== 'off') {
            let lastOffTime = currentMode === 'heat' ? this.lastHeatTime : this.lastCoolTime;
            if (lastOffTime) {
                let timeSinceOff = Date.now() - lastOffTime;
                if (timeSinceOff < this.minOffTime * 1000) {
                    this.warn(`Minimum off time not met. Need ${this.minOffTime}s, got ${Math.round(timeSinceOff/1000)}s`);
                    return false;
                }
            }
        }
        
        // Set the mode
        this.configNode.setMode(mode);
        this.lastModeChange = Date.now();
        
        if (mode === 'heat') {
            this.lastHeatTime = Date.now();
        } else if (mode === 'cool') {
            this.lastCoolTime = Date.now();
        }
        
        this.log(`Plant mode changed to: ${mode}`);
        return true;
    };
    
    PlantNode.prototype.setLockout = function(lockout) {
        if (typeof lockout !== 'boolean') {
            this.warn("Lockout must be boolean");
            return false;
        }
        
        this.configNode.setLockout(lockout);
        this.log(`Plant lockout set to: ${lockout}`);
        return true;
    };
    
    PlantNode.prototype.setChangeoverDelay = function(delay) {
        if (typeof delay !== 'number' || delay < 0) {
            this.warn("Changeover delay must be a positive number");
            return false;
        }
        
        this.configNode.setChangeoverDelay(delay);
        this.changeoverDelay = delay;
        this.log(`Changeover delay set to: ${delay}s`);
        return true;
    };
    
    PlantNode.prototype.updatePlantState = function() {
        if (this.configNode) {
            this.plantState = this.configNode.getState();
        }
    };
    
    PlantNode.prototype.sendPlantState = function() {
        if (this.plantState) {
            let payload = {
                ...this.plantState,
                lastChanged: new Date().toISOString(),
                messageSource: "Plant"
            };
            
            this.send({ payload: payload });
        }
    };
    
    PlantNode.prototype.getStatus = function() {
        if (!this.plantState) {
            return { fill: "red", shape: "ring", text: "No config" };
        }
        
        let state = this.plantState;
        let color = "green";
        let text = state.plantMode;
        
        if (state.lockout) {
            color = "red";
            text += " (Locked)";
        } else if (state.plantMode === 'off') {
            color = "grey";
        }
        
        return { fill: color, shape: "dot", text: text };
    };
    
    RED.nodes.registerType("matter-plant", PlantNode);
};
