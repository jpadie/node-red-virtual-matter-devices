module.exports = {
    PlantConfigNode: function(config) {
        const RED = require('node-red');
        
        RED.nodes.createNode(this, config);
        
        this.plantMode = 'off';
        this.lockout = false;
        this.changeoverDelaySec = 300;
        this.minOnTime = 300;
        this.minOffTime = 300;
        this.listeners = new Set();
        
        let node = this;
        
        // Initialize with config values if provided
        if (config.plantMode) this.plantMode = config.plantMode;
        if (config.lockout !== undefined) this.lockout = config.lockout;
        if (config.changeoverDelaySec) this.changeoverDelaySec = config.changeoverDelaySec;
        if (config.minOnTime) this.minOnTime = config.minOnTime;
        if (config.minOffTime) this.minOffTime = config.minOffTime;
    },
    
    PlantConfigNode.prototype = {
        getState: function() {
            return {
                plantMode: this.plantMode,
                lockout: this.lockout,
                changeoverDelaySec: this.changeoverDelaySec,
                minOnTime: this.minOnTime,
                minOffTime: this.minOffTime,
                lastUpdated: this.lastUpdated || new Date().toISOString()
            };
        },
        
        setMode: function(mode) {
            if (!['heat', 'cool', 'off'].includes(mode)) {
                throw new Error(`Invalid plant mode: ${mode}`);
            }
            
            this.plantMode = mode;
            this.lastUpdated = new Date().toISOString();
            this.broadcast();
        },
        
        setLockout: function(lockout) {
            if (typeof lockout !== 'boolean') {
                throw new Error('Lockout must be boolean');
            }
            
            this.lockout = lockout;
            this.lastUpdated = new Date().toISOString();
            this.broadcast();
        },
        
        setChangeoverDelay: function(delay) {
            if (typeof delay !== 'number' || delay < 0) {
                throw new Error('Changeover delay must be a positive number');
            }
            
            this.changeoverDelaySec = delay;
            this.lastUpdated = new Date().toISOString();
            this.broadcast();
        },
        
        setMinOnTime: function(time) {
            if (typeof time !== 'number' || time < 0) {
                throw new Error('Min on time must be a positive number');
            }
            
            this.minOnTime = time;
            this.lastUpdated = new Date().toISOString();
            this.broadcast();
        },
        
        setMinOffTime: function(time) {
            if (typeof time !== 'number' || time < 0) {
                throw new Error('Min off time must be a positive number');
            }
            
            this.minOffTime = time;
            this.lastUpdated = new Date().toISOString();
            this.broadcast();
        },
        
        broadcast: function() {
            let state = this.getState();
            this.listeners.forEach(callback => {
                try {
                    callback(state);
                } catch (err) {
                    console.error('Error in plant config listener:', err);
                }
            });
        },
        
        subscribe: function(callback) {
            if (typeof callback !== 'function') {
                throw new Error('Callback must be a function');
            }
            
            this.listeners.add(callback);
            
            // Return unsubscribe function
            return () => {
                this.listeners.delete(callback);
            };
        },
        
        getStatus: function() {
            let color = 'green';
            let text = this.plantMode;
            
            if (this.lockout) {
                color = 'red';
                text += ' (Locked)';
            } else if (this.plantMode === 'off') {
                color = 'grey';
            }
            
            return { fill: color, shape: 'dot', text: text };
        }
    }
};
