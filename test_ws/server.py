# pip install Flask, flask-cors
# https://www.makeuseof.com/tag/python-javascript-communicate-json/

import threading
from flask import Flask, request, jsonify
from flask_cors import CORS
import websockets
import asyncio

CONNECTIONS = set()

async def register(websocket):
    CONNECTIONS.add(websocket)
    print("joined")
    try:
        await websocket.wait_closed()
    finally:
        CONNECTIONS.remove(websocket)

# Set up Flask
app = Flask(__name__)
# Set up Flask to bypass CORS at the front end:
cors = CORS(app)

# All data
all_data = []

#Create the receiver API POST endpoint:
@app.route("/receiver", methods=["POST"])
def postME():
   data = request.get_json()
   new_user = data[0]['userName']
   i=0
   exists = False
   for entry in all_data:
       if (entry[0]['userName'] == new_user):
           all_data[i][0]['value'] = data[0]['value']
           print('updated')
           exists=True
       i = i+1
   if not exists:
    all_data.append(data)
    print('added')

   data = jsonify(data)
   # schedule send_to_all to run in the event loop
   asyncio.run_coroutine_threadsafe(send_to_all(), flask_loop)
    
   return data

async def main():
    async with websockets.serve(register, "localhost", 5678):
        await asyncio.Future() # run forever

async def send_to_all():
    message = str(all_data)
    websockets.broadcast(CONNECTIONS, message)
    
# run flask in separate thread
def run_flask():
    app.run()

# Run the app:
if __name__ == "__main__":
    # Create and set an event loop for the main thread
    flask_loop = asyncio.new_event_loop()
    asyncio.set_event_loop(flask_loop)

    # Start Flask in a separate thread
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.start()

    # Start the asyncio event loop
    flask_loop.run_until_complete(main())

