const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const os = require('os');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

io.on('connection', (socket) => {
  console.log('User connected to terminal:', socket.id);

  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.cwd(), // Starting directory
    env: process.env
  });

  ptyProcess.onData((data) => {
    socket.emit('output', data);
  });

  socket.on('input', (data) => {
    ptyProcess.write(data);
  });

  socket.on('resize', ({ cols, rows }) => {
    ptyProcess.resize(cols, rows);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from terminal:', socket.id);
    ptyProcess.kill();
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Terminal backend running on port ${PORT}`);
});
