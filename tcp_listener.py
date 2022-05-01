from http.client import responses
from re import L
from flask import Flask, Response, render_template
from flask_socketio import SocketIO, emit
import socket
import sys

# JAVA
# private final String ADDRESS = "10.42.0.1";
# private final int PORT = 9000;
# private final InetSocketAddress address = new InetSocketAddress(ADDRESS, PORT);

tcp_connected = False

# nano ip address and port number for tcp listening
# NANO_ADDRESS = '10.0.0.54'
# PORT = 9000
NANO_ADDRESS = "192.168.1.22"  # Standard loopback interface address (localhost)
NANO_ADDRESS = "127.0.0.1"  # Standard loopback interface address (localhost)
PORT = 9000
DEBUG_MODE = False
ASYNC_MODE = 'threading'

# Server
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'

# Create a TCP/IP socket
tcp_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# if a message contains any of these strings, there should be listened for a response
response_messages = ['?', 'network', 'threshold', 'transfer', 'delete']
    

def setup_listener():
    # nano ip address and port number for tcp listening
    # NANO_ADDRESS = '192.168.2.147'
    # PORT = 9000
    NANO_ADDRESS = "192.168.1.22"  # Standard loopback interface address (localhost)
    PORT = 9000
    DEBUG_MODE = False
    ASYNC_MODE = 'threading'

    # Server
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'secret!'

    # Create a TCP/IP socket
    tcp_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)



# JAVA
# @Override
# public synchronized Result<Boolean> connect() {
#     try {
#         if (!tcpConnected) {
#             Log.d(TAG, Thread.currentThread().getName() + "|||--stream connect: starting...");
#             socket = new Socket();
#             socket.setReuseAddress(true);
#             socket.connect(address);
#             in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
#             out = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));
#         } else {
#             Log.e(TAG, Thread.currentThread().getName() + "|||--stream connect: TCP already connected");
#         }
#     } catch (IOException e) {
#         e.printStackTrace();
#         try {
#             Thread.sleep(500);
#         } catch (InterruptedException interruptedException) {
#             interruptedException.printStackTrace();
#         }
#         return connect();
#     }
#     tcpConnected = true;
#     return new Result.Success<>(true);
# }

def connect():
    global tcp_connected
    try:
        if not tcp_connected:
            print('Tcp connecting')
            # tcp socket communication
            # Bind the socket to the port
            server_address = (NANO_ADDRESS, PORT)
            print(f'starting up on {server_address} port {PORT}')
            tcp_socket.connect(server_address)
            tcp_connected = True
    except IOError as e:
        return IOError(e)

def disconnect():
    global tcp_connected
    print('closing socket')
    tcp_socket.close()
    tcp_connected = False


# JAVA
# @Override
# public synchronized Result<String> sendCmd(String msg) {
#     if (!tcpConnected) {
#         Log.e(TAG, Thread.currentThread().getName() + "|||--tcp sendCmd: tcp not connected. msg=" + msg);
#         return new Result.Error<>(new IOException("tcp not connected"));
#     }

#     char[] arr = new char[128]; // Changed length of arr from 32 to 128 bytes, according to Marcel
#     for (int i = 0; i < msg.length(); i++) {
#         arr[i] = msg.charAt(i);
#     }
#     arr[arr.length - 1] = '\0'; // string end in C++

#     try {

#         out.write(arr);
#         out.flush();
#     } catch (IOException e) {
#         return new Result.Error<>(e);
#     }

#     if (msg.contains("?") || msg.contains("network") || msg.contains("threshold") || msg.contains("transfer") || msg.contains("delete")) {
#         return receiveResponse();
#     }
#     return new Result.Success<>(msg);
# }

def send_command(msg):
    global tcp_connected
    if not tcp_connected:
        print('tcp not connected')
        return IOError('tcp not connected')
    
    print('build message')
    message = [' '] * 128
    for ind, char in enumerate(msg):
        message[ind] = char
    message[len(message) - 1] = '\0' # end of string in C++
    message = ''.join(message).encode('utf-8')
    print(f'final message {message}')
    print(len(message))
    print(sys.getsizeof(message))
    
    try:
        bytes = tcp_socket.send(message)
        print(bytes)
        return True
    except IOError as e:
        return IOError(e)

def send_receive_command(msg):
    send_command(msg)
    
    if any(response_string in msg for response_string in response_messages):
        # listen for response message
        print('expecting response from server...')
        response = tcp_socket.recv(128)
        print(response)
        
    return response
    
def request_models():
    '''
    Should request all models currently available and send them to webpage
    '''
    msg = f'--list=?'
    response = send_receive_command(msg)
    
    return response
    
def request_detection_info():
    '''
    Should request info from current detections being done
    '''
    while True:
        response = send_receive_command(msg)
        
    return response
    
def post_reload_model(model):
    '''
    Should post request to change model to different model
    Command that server expects contains --network
    '''
    msg = f'--network={model}'
    send_receive_command(msg)
    
def post_change_confidence(value):
    '''
    Should post request to change confidence value used for detection
    '''
    msg = f'--threshold={str(value)}'
    send_command(msg)
    
if __name__ == '__main__':
    connect()
    msg = 'test if this works at all'
    post_reload_model(msg)
    # disconnect()
    