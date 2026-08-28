from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os
import socket
import sys
import threading
import webbrowser


HOST = "127.0.0.1"
PORT = 8000
GAME_URL = f"http://{HOST}:{PORT}"


def port_is_in_use():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as check_socket:
        return check_socket.connect_ex((HOST, PORT)) == 0


def main():
    os.chdir(Path(__file__).resolve().parent)

    if port_is_in_use():
        print(f"이미 실행 중인 서버가 있습니다: {GAME_URL}")
        webbrowser.open(GAME_URL)
        input("브라우저를 확인한 뒤 Enter 키를 누르면 창이 닫힙니다.")
        return

    try:
        server = ThreadingHTTPServer((HOST, PORT), SimpleHTTPRequestHandler)
    except OSError as error:
        print(f"서버를 시작하지 못했습니다: {error}")
        input("Enter 키를 누르면 창이 닫힙니다.")
        sys.exit(1)

    print("RP(Random Polygon) 실행 서버를 시작합니다.")
    print(f"브라우저가 열리지 않으면 {GAME_URL} 으로 접속하세요.")
    print("게임을 하는 동안 이 창을 닫지 마세요.")

    threading.Timer(0.5, lambda: webbrowser.open(GAME_URL)).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
