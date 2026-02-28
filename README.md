# ASF-Prometheus-Exporter
Small Node.js application that provides a Prometheus metric endpoint with data from the ArchiSteamFarm API.
The official [ASF MonitoringPlugin](https://github.com/JustArchiNET/ArchiSteamFarm/wiki/MonitoringPlugin) only supports the generic version of ASF, this will work with any version aslong as you can access its API.

## THIS APP AND REPO ARE STILL W.I.P, information and setup might change any time

# Requirements
I won't explain how to install and setup anything of the required software. If you don't already have the software, use Google.
- [ArchiSteamFarm](https://github.com/JustArchiNET/ArchiSteamFarm) - Duh...
- [Prometheus](https://prometheus.io/) - This is *not* a Prometheus tutorial, so I won't go into any details on how to use it. Basic understanding of what Prometheus is and how to use it is required.
- [PM2](https://pm2.keymetrics.io/) - PM2 will keep the application running and restart it if it crashes. It is similar to Docker and has its own metrics (if you want to look into these). Maybe in the future I will replace it with a proper Docker container.
- [Node.js](https://nodejs.org/en/) - Tested with version `23.11.1`. I recommend using the latest LTS version.

# Getting Started

## 1. Get the app
You have two options:
### (Recommended) `git clone`
Clone the repository onto a server using `git clone https://github.com/n0eL1405/ASF-Prometheus-Exporter.git`. Git is required for this.

### Download the files
Download the repository and store it somewhere on a server.

## 2. Setup the configs
Generate the `config.yaml` and `.env` with `npm run setup`.  
Set all the properties you need.
#### **.env**
| Property          | Description                                                                                                       | Optional                |
|-------------------|-------------------------------------------------------------------------------------------------------------------|-------------------------|
| `ASF_IPCPASSWORD` | IPC Password for ASF. [More information](https://github.com/JustArchiNET/ArchiSteamFarm/wiki/IPC#authentication). | ❌ (if you're using one) |
| `UPTIMEKUMA_KEY`  | Key-part of the Push-URL for Uptime Kuma Push-Monitor. [More information on Uptime Kuma](#uptime-kuma).           | ✅                       |

#### **config.yaml**
| Property            | Description                                                                                                                                                                                                  | Optional |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `app.port`          | Port the exporter will use to expose the Prometheus metrics to.                                                                                                                                              | ❌        |
| `asf.ip`            | IP of the server ASF is running on. If the exporter and ASF are running on the same mashine, leave it to `127.0.0.1`.                                                                                        | ❌        |
| `asf.port`          | Port ASF is running on. If not sure and/or nothing is changes, leave it to default `1242`. If it's not working, see [ASF Wiki](https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Setting-up#using-asf-ui). | ❌        |
| `prometheus.prefix` | Prefix for the Prmetheus metrics. Not required but highly recommended, see [Prometheus docs](https://prometheus.io/docs/practices/naming/).                                                                  | ✅        |
| `uptimekuma.ip`     | IP of the server Uptime Kuma is running on. If the exporter and Uptime Kuma are running on the same mashine, use `127.0.0.1`. [More information on Uptime Kuma](#uptime-kuma).                               | ✅        |
| `uptimekuma.port`   | Port Uptime Kuma is running on. If not sure and/or nothing is changes, leave it to default `3001`. [More information on Uptime Kuma](#uptime-kuma).                                                          | ✅        |

## 3. Start
When everything is set up, use `npm run start` to start the exporter. After the first start, you should be able to start/stop/restart the app using PM2. For more information, see [PM2 documentation](https://pm2.keymetrics.io/docs/usage/quick-start/#managing-processes).

## 4. Prometheus config
Add a job to your Prometheus config to scrape the exporter. The target should be the IP of the server the exporter is running on and the port you set in the config.  

Example:
```yaml
scrape_configs:
  - job_name: 'ASF'
    static_configs:
      - targets: ['192.168.178.69:6789']
```

## 5. Done
Have fun with your ASF metrics!

# Update
Updating depends on the selected method to get the app:  
If you used git, you can simply run `npm run update` to pull the latest changes from the repository, install the dependencies and restart the app. There could be some user input required, follow the instructions or use Google if it's Git-related.  
If you just downloaded the files, you have to copy and overwrite the files, install the dependencies and restart the app manually. Be careful to not overwrite `config.yaml` and `.env`, otherwise you could potentially lose your configuration.

# Current metrics

See [Prom-CLient](https://github.com/siimon/prom-client) and [ASF API](https://github.com/JustArchiNET/ArchiSteamFarm/wiki/IPC#asf-api) for references to implement your own metrics.  
Except the first metric, every other metric will fetch the information from the ASF API when called.
The data for `build_info` will be fetched on startup and updates every 10 minutes.

### `build_info`
Gives the build variant and version of ASF as label values. See [ASF Wiki](https://github.com/JustArchiNET/ArchiSteamFarm/wiki/MonitoringPlugin#enabling-the-plugin).

### `total_numbers_of_bots`
Total number of bots on the ASF instance.

### `games_remaining_to_farm`
Total number of remaining games to farm.

### `cards_remaining_to_farm`
Total number of cards remaining to farm.

### `bots_currently_farming`
Total number of bots currently farming.

# Uptime Kuma
I recommend using [Uptime Kuma](https://github.com/louislam/uptime-kuma) to monitor the status of the application.  

To use Uptime Kuma, create a new Push-Monitor and get the marked Parts from the URL:  
'http://`192.168.178.69`:`3001`/api/push/`sdiDAsdjwASD5Asd5Rad`?status=up&msg=OK&ping='  

The first and second part are the IP and port of Uptime Kuma.  
The third part is the key of the monitor. You set in the `.env`.  
Let everything else as is and you're done! For more information on what to do with Uptime Kuma, see [Uptime Kuma docs](https://github.com/louislam/uptime-kuma/wiki/).

# Future development / planned features
- [ ] Use a proper Docker container instead of PM2
- [ ] Add (nearly) all metrics from the official ASF MonitoringPlugin
- [ ] Implement caching of data from API (e.g. making `Bots/ASF` API call every 15 seconds and only return the latest fetched data when function is called)