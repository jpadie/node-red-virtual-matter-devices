# WHAT

This project builds nearly all devices currently supported by the matter protocol and makes them available in a node-red environment.

In this way the project creates a bridge between Matter controllers (e.g. Alexa, Apple, Google Home) and whatever you can dream up (e.g. purely virtual devices or zigbee, tasmota or whatever device type you can communicate with).

Whilst it can be seen as "just" a bridge, this project enables a very easy method of creating virtual or synthetic devices which controllers will recognise; making it ideal for testing matter development.

# STATUS

READY FOR TESTING

I DON'T SUGGEST USING THIS PROJECT IN A PRODUCTION ENVIRONMENT AT THE MOMENT.  

Reference is made to version 1.3 of the Matter Specification found [here](https://csa-iot.org/wp-content/uploads/2024/05/matter-1-3-device-library-specification.pdf)

This project heavily leans almost entirely on the fantastic work by Ingo Fischer, Greg Lauckhart and the development team on [Matter.js](https://github.com/project-chip/matter.js); not to mention the tireless help that they provide via Discord.

Version 1.4 of the Matter Specification has been recently published (in November 2024) and will be supported in due course.


# To Dos

Some devices and features remain work in progress.  See Supported Devices below for more details.


# Errors, Issues & Feature Requests

Please log all errors, issues and feature requests via [github](https://github.com/jpadie/node-red-virtual-matter-devices/issues).

# Supported Devices

## Sensors

All Sensor device types in the spec are supported with the following exceptions:

Smoke CO Alarm - work in progress
On/Off Sensor - not sure of the value of this in a synthetic environment

## Lights

On/Off, dimmable and extended colour lights are supported.

## Actuators

### Water valves and pumps

Water valves are supported.  Pumps are a work in progress.

### Pluggable Devices

On/Off plugs and dimmable plugs are supported 
Energy monitoring is supported by this project but not currently supported by the main commercial controller ecosystems.

## HVAC Devices

Air Purifiers, Fans and Thermostats* are supported.

Thermostat schedules are a work in progress and will be implemented when fully supported by Matter and by the more popular ecosystems.  In the meantime you can easily emulate schedules in node-red.

## Closure Devices

Window Coverings and Door locks are supported. 

## Appliances

All appliances in the spec are currently work in progress.

## Energy devices

EVSE devices are work in progress. 
Energy monitoring is an optional add-in to on/off plugs and dimmable plugs.

## Further devices

If anyone needs a particular device synthesised or features added then please get in touch via github or via the Matter Integrators discord server. 

# Basic Usage

## Installation 
To install, navigate to your node-red folder (typically ~/.node-red) and run this command

    npm i @jpadie/node-red-virtual-matter-devices

Once out of testing this project will (hopefully) be available via the Node-Red package manager.  


## Getting started

Place a Status node on your canvas.  This is not a hard requirement but the status node will show the QR Code you need for commissioning in its edit dialog and if you don't have a status node then you will have to obtain the commissioning QR code from the log.

Add device nodes as you want.  Most devices need some configuration in the editor dialog (double click the node).

It will help you to give each device a unique and meaningful name, although most controller ecoysystems support changing the name in their UI.  

## Status Node

The status node will provide information about the commissioning and status of the matter server.  

If the Matter Hub is not commissioned, a QR code is displayed in the edit dialog.  Flash this code (or use the manual pairing code) into your controller app and the pairing should occur automatically.  Many controllers complain that a device is not standards compliant ("certified"). This warning can be ignored and relates to the developer VendorID being used (certified VendorIDs are prohibitively expensive for opensource projects). 

If you run into unsolvable trouble and want to do a "factory reset" then this can be done by clicking ReInit in the Edit Dialog of the Status Node (*but read below first*).  

A ReInit:
1.  takes the Matter Hub offline;
2.  decommissions it; and
3.  recreates the Matter Hub and adds the synthetic devices afresh.

You will need to recommission the Matter Hub after a ReInit. 

NB Only do this as a last resort after checking all the detailed logs (make sure that node-red logging is set to Debug).  

## Outputs

### General

You can specify that a device provides regular telemetry and specify the telemetry period (in seconds).  If telemetry is enabled then the output will contain an object of all parameters that the device is tracking and in some cases a verbose form of those parameters for readability.  In addition a "lastHeardFrom" timestamp is provided so that you can keep track of devices that might have gone offline.  

You can also specify that a device node passes through all messages that it receives on its input. This is useful for debugging but be careful to avoid infinite loops (i.e. you get an update from z2m (or other physical device platforms), transform it and pass it to Matter, the message is received on the output and you feed it back to z2m and so the cycle continues).  To help protect against this a messageSource key:value is added to the output messages and you can use this as a filter.  

Lastly you will also see an output whenever the Matter controller (eg. Google Home) sends a change instruction.  In this case the device will send a message for every parameter that is changed.  Be careful here as some ecosystems can't react to a single data point - e.g. you cannot provide color:{x:0.5} to z2m as it has no y value.  I have provided fixes for some of these anomalies but it is still up to you to provide the correct inputs to your chosen platforms.

### Thermostats

The thermostat device type is an outlier in that it provides two outputs. 

The upper output is as the general case above.

The lower output emits an onoff value that shows whether the thermostat should be calling for heat/cool.  You can use this if you are assembling a virtual thermostat out of some temperature sensors for input and relays/actuators/modbus commands for output.  

## Inputs
All device nodes support an input.  The input must be in the payload object and the key:values must be supported by this project (unsupported keys will be ignored but there is a risk that an incorrectly formatted value for a correct key will get through and have unexpected results).  Supported formats are shown below.

NB If you are taking an input from Tasmota or Zigbee2Mqtt or other physical device/platform you will need an intermediate node to transform that data to the right format for Matter.  For example, z2m provides colour data in an object that looks like this:

    {
        color: {
            x: [0,1],
            y: [0,1],
            hue: [0,360],
            saturation: [0,100]
        }
    }

whereas this project accepts x and y values as colorX and colorY and as a direct child of the payload object.  

# Sensor Inputs
Your sensor will need one or more of the following inputs, depending on what sensor you have configured.

    {
            occupancy:          boolean,
            flowRate:           float,      // in m3/hr
            pressure:           float,      // in kPa
            localTemperature:   float,      // in centigrade    *
            humidity:           float,      // in %RH           *
            rain:               boolean,
            contact:            boolean,
            illuminance:        float,      //in lux
            waterFreezeDetector boolean,
            waterLeakDetector   boolean,
            airQuality          number,     [0-6] Unknown = 0.  Good = 1 - Extremely Poor 6
            COLevel             float,     //in ppm             *
            CO2Level            float,     //in ppm             *
            NO2Level            float,     //in ppm             *
            ozoneLevel          float,     //in ppm             *
            TVOCLevel           float,     //in ppm             *
            PM1Level            float,      //in ug/m3          *
            PM25Level           float,      //in ug/m3          *
            PM10Level           float,      //in ug/m3          *
            formaldehydeLevel   float,      //in ug/m3          *
            radonLevel          float,      //in Bq/m3          *
        }


## Lights

Your light will need one or more of the following inputs, depending on what sensor you have configured.

    {
        onoff: boolean,
        brightness: [0,100],
        colorX: [0,1],
        colorY: [0,1],
        hue: [0,360],
        saturation: [0,100]
    }

The device should show (in its status) an approximate name for the colour you have picked.

## Actuators

### Water valves

To open or close a valve you should set its current state.  Optionally you can also set a duration after which the valve will automatically close.

    {
        valveState: [0,1],      //0 = closed, 1 = open
        openDuration: int,      //in seconds
        flowRate: float*         //m3/hr  - if your device supports flow rates in the config.
    }

The telemetry will also report the time remaining on an openDuration timer 

    {
        remainingDuration: int  //number of seconds left to auto close, if set
    }

### Pumps

Pumps are currently not supported as I've not been able to find any real world devices to exemplify how the logic might work.  

For simple on/off type pumps, consider using an on/off pluggable.


### Pluggables
For pluggables (on/off and dimmable) see the Lights examples above
Energy monitoring can be enabled and if it is enabled the input/outputs will include the following possibilities

    {
        current: float, //amps
        voltage: float, //volts
        power: float, //W
        frequency: float, //Hz
        energy: float //Wh
    }

### Other actuators
These are works in progress.

## Closures

### Window Coverings
Depending on the configuration you can provide a tilt or a lift or both values.  Lift is the equivalent of open/close for lateral devices (curtains and awnings).

    {
        tilt: [0,100],
        lift: [0,100]
    }

### Door Locks

Door locks support a lockstate value and a mode.  The lock states are "translated" into words in the output but for input you must provide the integer value

    0:  Not Fully Locked
    1:  Locked
    2:  Unlocked
    3:  Unlatched
    
Mode values are below.  For their meaning, see the matter specification:

    0:  Normal
    1:  Vacation
    2:  Privacy
    3:  No remote unlocking
    4:  Passage
    
Example input

    {
        lock:   1,  //lock the door
        mode:   0   //normal mode
    }

## HVAC Types

Currently supported HVAC types are the thermostat, fan and air purifier 

### Thermostat

For a thermostat one of more of the inputs below will be supported, depending on your configuration:

    {
        localTemperature: [0,100]
        systemMode: [0, 3, 4] (0 = Off, 3 = Cool, 4 = Heat) 
        occupiedHeatingSetpoint: [6,30],
        occupiedCoolingSetpoint: [16,30],
        unoccupiedHeatingSetpoint: [6,30],
        unoccupiedCoolingSetpoint: [6,30],
        occupied: [0,1]  (1 = occupied, 0 = unoccupied),
        occupiedSetback: [0,20] 
        unoccupiedSetback: [0,20]
        humidity: [0,100]
        outdoorTemperature: float
    }

All temperature values should be supplied in degrees celsius. 

NB If you provide a value for systemMode that is not permitted by your configuration you may well crash your node-red instance.  

Setback is a way of expressing hysteresis. In heating mode, when the device starts it will heat the room to the setpoint and then turn off until the room temperature falls below the setpoint by the amount of the setback value.  

NB be careful setting a setback value too high if you are using wet underfloor heating.  the thermal mass would usually mean a value of 0.2 - 0.5C would be better.



### Fans

Fans these days are "complicated" and support different configurations.  Depending on what you have chosen, you can provide one or more of the following parameters

    {
        fanMode:            [0,3] (0 = Off, 1 = Slow, 2 = Medium, 3 = Fast)
        percentSetting:     [0,100] 
        percentCurrent^**:  [0,100]
        airFlow:            [0.1] (0 = Forward, 1 = Reverse)
        speedSetting^***:   [0,100]
        speedCurrent^**:    [0,100]
        rockUpDown:         [0,1] (0 = Off, 1 = On)
        rockLeftRight:      [0,1] (0 = Off, 1 = On)
        rockRound:          [0,1] (0 = Off, 1 = On)
        sleepWind:          [0,1] (0 = Off, 1 = On)
        naturalWind:        [0,1] (0 = Off, 1 = On)

    }

^**     these are not inputs.  i.e. you should not "set" the value of these even if the device is synthetic.  It is intended that physical devices are able to estimate or derive their current position from moment to moment and update their state.

^***    this returns the speed as a percentage of speedMax.  In general it probably makes more sense (and follows tradition) to use the fanMode input to control fan speed. 


### Air Purifiers

Depending on the configuration of your air purifier one or more of these parameters can be provided IN ADDITION to those for a fan (see above) 

    {
        hepaChanged: [0,2] (0 = OK, 1 = Warning, 2 = Critical)
        hepaCondition: [0,100] (percent good)
        hepaDegradationDirection: [0,1] (0 = Up, 1 = Down)
        activatedCarbonChanged: [0,2] (0 = OK, 1 = Warning, 2 = Critical)
        activatedCarbonCondition: [0, 100] (percent good)
        activatedCarbonDegradationDirection: [0,1] (0 = Up, 1 = Down)

    }
    

# Help! Node-Red won't start

Your first port of call should be the log.  Checking your settings.js file and make sure that logging is set.  

1.  Stop the node-red process.  If Node-Red is being run from the terminal then just use CTRL+C.  If it is being run as a service then use this command

    sudo service nodered stop

2.  Edit settings.js (typically in ~/.node-red/).  Use these settings

    logging : {
        console: {
            level: "trace",
            metrics: false,
            audit: false
        }
    }

3.  save the settings file. 

4.  restart Node-Red and see what the errors are that are logged just before the process crashes.  Typically you will be able to identify the node/device that is causing an issue from the ID.  Make a node of this ID

5.  Start Node-Red in safe mode

    node-red --safe

6.  in the Node-Red browser search for the ID that you noted down and remove the node.  If the issue persists then please raise an issue and be sure to provide information how you have configured that device.