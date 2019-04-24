# Environment Monitor IoT Dashboard

This is a simple Node.js azure website that shows how to visualize data from eventhub as a real-time graph using [d3js.org](https://d3js.org/) charts.

## Acknowledgements

This code was modified from the sample [ThingLabs-IoT-Dashboard](https://github.com/irjudson/ThingLabs-IoT-Dashboard).

## Installing to Azure Web App with FTP

1. From the Azure Portal, using the "Node JS Empty Web App" Template create a Node.js Web App 
2. From Web App -> Properties copy the ftp user and ftps url
2. From Web App - > Application Settings add the following application settings

    | key | Value |
    |---|---|
    | WEBSITE_NODE_DEFAULT_VERSION |8.1.4 |
    | EVENTHUB_CONNSTRING | Event Hub Connection String for sensor data  |
    | EVENTHUBNAME | defaults to 'charts'|
    | SENSOR_STATE_TABLE_CONNSTRING | SensorState Table Storage connection string |

3.  From Appliction Settings turn on **Web sockets**

3.  Create Deployment Creditials
    * Azure Portal -> Your Web App -> Deployment Creditials


4. Using your faviourite FTP program (eg FileZilla), copy application including package.json, and web.config. Do not the node_modues directory or the package-lock.json file
5. Install NPM Modules into the Web App
    * Azure Portal -> Web App -> Advanced Tools -> Go -> Debug Console -> CMD
    * cd sites/wwwroot
    * run 'npm install'. This will install packages listed in the package.json file
6.  Diagnostics
    * Web App -> Diagnostics, enable Application Logging
    * Web App -> Live Stream to review issues


## Stream Analytics Job

```SQL
WITH ProcessedData as (
    SELECT
        MAX(Celsius) MaxTemperature,
        MIN(Celsius) MinTemperature,
        AVG(Celsius) AvgTemperature,
        Geo as location,
        DeviceId as deviceId,
        System.Timestamp AS Timestamp
    FROM
        [inputdata]
    GROUP BY
        TumblingWindow (second, 15), DeviceId, Geo
)

SELECT * INTO [outputdata] FROM ProcessedData
```

## Stream Analytics Event Queue Output

Notes.

1. The output type for Event hub from the Stream Analytics job must be 'Array'
2. The node.js solutions assumes the event hub name is 'thinglabseventhub'

![Stream Analytics Event Hub Output](https://raw.githubusercontent.com/gloveboxes/Environmental-Data-IoT-Dashboard/master/resources/StreamAnalyticsEventHubOutput.png)

## Node.js Tip. Updating NPM Packages to the latest verison

Check out npm-check-updates to help with this workflow.

### Install npm-check-updates

1. Run **npm-check-updates** to list what packages are out of date (basically the same thing as running npm outdated)
2. Run **npm-check-updates -u** to update all the versions in your package.json (this is the magic sauce)
3. Run **npm update** as usual to install the new versions of your packages based on the updated package.json