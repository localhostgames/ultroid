import Server from 'bare-server-node';
import http from 'http';
import nodeStatic from 'node-static';

const bare = new Server('/bare/', '');
const serve = new nodeStatic.Server('Site/');
const server = http.createServer();

server.on('request', (request, response) => {
    if (bare.route_request(request, response)) return true;
    
    if (request.url === '/shutdown' && request.method === 'POST') {
        // Handle server shutdown
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end('Shutting down...');
        
        // Close the server
        server.close(() => {
            console.log('Server has been shut down.');
            // Forcefully exit the process
            process.exit(0);
        });
        
        // Close all open connections
        server.getConnections((err, count) => {
            if (!err && count > 0) {
                console.log(`Closing ${count} open connections...`);
                server.closeAllConnections();
            }
        });

        if (request.url === '/health' && request.method === 'GET') {
            // Health check endpoint
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ status: 'OK' }));
            return;
        }

        return;
    }

    if (request.url.startsWith("/announc."))
    {
        console.log("ANNOUNCING!");

        
    }
    
    console.log(request.url);
    serve.serve(request, response);
});

server.on('upgrade', (req, socket, head) => {
    if (bare.route_upgrade(req, socket, head)) return;
    socket.end();
});

server.listen(process.env.PORT || 8080);

// Utility function to close all connections
server.closeAllConnections = () => {
    for (const socket of server._connections || []) {
        socket.destroy();
    }
};
