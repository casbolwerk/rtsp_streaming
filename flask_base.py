from flask import Flask, Response, render_template
from flask_socketio import SocketIO, emit
import cv2
# from xvfbwrapper import Xvfb
from io import BytesIO
import time
from PIL import Image

from tcp_listener import *

'''
Main launcher file
Launches a webpage that displays camera frames
These camera frames are first fed to the predictor
'''

# Server
HOST = '0.0.0.0'
PORT = 5000
DEBUG_MODE = False
ASYNC_MODE = 'threading'

# Server
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'

# Websocket communication
socketio = SocketIO(app, async_mode=ASYNC_MODE, ping_interval=10, ping_timeout=120, logger=False)

# tcp_connected = False

# NANO_ADDRESS = "10.42.0.1"  # Standard loopback interface address (localhost)
# TCP_PORT = 9000

# Create a TCP/IP socket
# tcp_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
connect()

# Virtual display to provide stream even vithout display attached to the jetson nano
# vdisplay = Xvfb(width=410, height=410, colordepth=16)
# vdisplay.start()

engine_status = 0
socket_status = 0
device_index = 0

@socketio.on('reloadEngine')
def reload_engine(message):
    global engine_status
    print('Reloading engine...')
    engine_name = str(message['engine'])

    engine_status = 'None'
    
    post_reload_model(engine_name)


@socketio.on('sendConfidence')
def change_confidence(message):
    global confidence_status
    print('Changing confidence...')
    confidence = float(message['confidence'])

    post_change_confidence(confidence)


@socketio.on('getModels')
def get_models(message):
    global model_status
    print('Getting models...')

    models = request_models()
    
    socketio.emit('SendModels', {'models': models})
    

@socketio.on('connect')
def on_connection(message):
    print('CONNECTED')


@app.route('/')
def projects():
    return render_template("index.html")


if __name__ == '__main__':
    socketio.run(app, host=HOST, port=PORT, debug=DEBUG_MODE)
