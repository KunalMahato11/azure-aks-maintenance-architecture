const http = require("http");
const https = require("https");

const server = http.createServer((req, res) => {
    let hostURL = req.url;
    hostURL = hostURL.substring(1, hostURL.length);

    if (!hostURL) {
        res.end("Please provide a host URL after / in the proxy URL. Example: http://localhost:3000/evergreenescape.com ");
        return;
    }

    let options = {}
    const AppGatewayIP = "172.0.0.1";

    if (hostURL.includes('.com')) {
        options = {
            hostname: AppGatewayIP, // App Gateway Private IP
            port: 443,
            method: "GET",
            headers: {
                host: hostURL,
            }
        };
    } else {
        // .com is not included in the hostURL
        // handle the chain request for images, css, js, etc.
        let referer = req.headers.referer;
        referer = referer.split("/");
        const refererLen = referer.length;
        referer = referer[refererLen - 1];

        options = {
            hostname: AppGatewayIP,
            port: 443,
            method: "GET",
            path: `/${hostURL}`,
            headers: {
                host: referer,
            }
        }
    }

    // Forward the request to Azure Application Gateway
    const proxy = https.request(options, (response) => {
        res.writeHead(response.statusCode, response.headers);
        response.pipe(res, { end: true });
    });

    req.pipe(proxy, { end: true });
});


server.listen(process.env.PORT || 3000, () => {
    console.log("Proxy server is running on port 3000.");
})