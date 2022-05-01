from tcp_listener import *
from http.client import responses
from re import L
from flask import Flask, Response, render_template
from flask_socketio import SocketIO, emit
import socket
import sys

def start_server():
    HOST = "127.0.0.1"  # Standard loopback interface address (localhost)
    PORT = 65432  # Port to listen on (non-privileged ports are > 1023)

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, PORT))
        s.listen()
        conn, addr = s.accept()
        with conn:
            print(f"Connected by {addr}")
            while True:
                data = conn.recv(128)
                # if not data:
                #     break
                conn.sendall(data)
            
            
if __name__ == '__main__':
    start_server()
    # disconnect()
    