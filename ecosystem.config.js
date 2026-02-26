module.exports = {
    apps: [
        {
            name: "ASF_Prometheus_Exporter",
            script: "./index.js",
            instances: 1,
            max_memory_restart: "500M",
            // Logging
            out_file: "./out.log",
            error_file: "./error.log",
            merge_logs: true,
            log_date_format: "DD-MM-YY HH:mm:ss",
            log_type: "format",
            watch: false,
            ignore_watch: [
                "./node_modules",
                "./.DS_Store",
                "./package.json",
                "./package-lock.json",
                "./yarn.lock",
                "./error.log",
                "./out.log",
                "./app.log",
                "./*.log",
                "./.git",
            ]
        },
    ],
};