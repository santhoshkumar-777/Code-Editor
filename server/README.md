# Terminal Backend Server

This is the backend server for the Code Editor's real terminal.

## Setup

1.  Make sure you are in the `/server` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    npm start
    ```

The server will run on `http://localhost:3001` and provide a real bash/powershell terminal via Socket.io.

> [!IMPORTANT]
> To run `node-pty` on macOS, you may need the Xcode Command Line Tools installed:
> `xcode-select --install`
