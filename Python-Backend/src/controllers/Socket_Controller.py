
import socketio

connections = {}
messages = {}
socket_to_user = {}
socket_to_client = {}
socket_video_state = {}
socket_to_profile_pic = {}

def register_socket_events(sio):
    @sio.event
    async def connect(sid, environ):
        print(f"Client connected: {sid}")

    @sio.event
    async def disconnect(sid):
        print(f"Client disconnected: {sid}")
        # Find which room the user was in
        for room, clients in list(connections.items()):
            if sid in clients:
                # Notify others in the room
                for client_id in clients:
                    if client_id != sid:
                        await sio.emit('user-left', sid, room=client_id)
                
                # Remove user from room
                connections[room].remove(sid)
                if not connections[room]:
                    del connections[room]
                
                # Try cleaning up socket_to_user and others
                if sid in socket_to_user:
                    del socket_to_user[sid]
                if sid in socket_to_client:
                    del socket_to_client[sid]
                if sid in socket_video_state:
                    del socket_video_state[sid]
                if sid in socket_to_profile_pic:
                    del socket_to_profile_pic[sid]
                    
                break

    @sio.on('join-personal-room')
    async def handle_join_personal_room(sid, username):
        print(f"User {username} joining personal room: {username}")
        await sio.enter_room(sid, username)

    @sio.on('join-call')
    async def handle_join_call(sid, path, username="Guest", client_id=None, profile_picture=None):
        if path not in connections:
            connections[path] = set() # Use set to avoid duplicates
            
        # Check if client was already in the room with an old ghost socket
        if client_id:
            old_sids = [s for s in connections[path] if socket_to_client.get(s) == client_id]
            for old_sid in old_sids:
                connections[path].remove(old_sid)
                for client in list(connections[path]):
                    await sio.emit('user-left', old_sid, room=client)
                
                socket_to_user.pop(old_sid, None)
                socket_to_client.pop(old_sid, None)
                socket_video_state.pop(old_sid, None)
                socket_to_profile_pic.pop(old_sid, None)
        
        connections[path].add(sid)
        socket_to_user[sid] = username
        if client_id:
            socket_to_client[sid] = client_id
        socket_video_state[sid] = True # Default true
        socket_to_profile_pic[sid] = profile_picture
        
        room_users = {client: {
            "name": socket_to_user.get(client, "Guest"),
            "video": socket_video_state.get(client, True),
            "profile_picture": socket_to_profile_pic.get(client)
        } for client in connections[path]}
        
        # Notify others in the room
        for client_id in connections[path]:
            await sio.emit('user-joined', (sid, list(connections[path]), room_users), room=client_id)
        
        # Send chat history to new user
        if path in messages:
            for msg in messages[path]:
                await sio.emit('chat-message', (msg['data'], msg['sender'], msg['socket-id-sender']), room=sid)

    @sio.on('signal')
    async def handle_signal(sid, toId, message):
        await sio.emit('signal', (sid, message), room=toId)

    @sio.on('video-toggle')
    async def handle_video_toggle(sid, state):
        socket_video_state[sid] = state
        matching_room = None
        for room, clients in connections.items():
            if sid in clients:
                matching_room = room
                break
        
        if matching_room:
            for client_id in connections[matching_room]:
                if client_id != sid:
                    await sio.emit('video-toggle', (sid, state), room=client_id)

    @sio.on('chat-message')
    async def handle_chat_message(sid, data, sender):
        # Find the room match
        matching_room = None
        for room, clients in connections.items():
            if sid in clients:
                matching_room = room
                break
        
        if matching_room:
            if matching_room not in messages:
                messages[matching_room] = []
            
            messages[matching_room].append({
                'sender': sender,
                'data': data,
                'socket-id-sender': sid
            })
            
            # Broadcast to everyone in the room using room argument
            # We use the path/room name as the room ID
            for client_id in connections[matching_room]:
                await sio.emit('chat-message', (data, sender, sid), room=client_id)

    @sio.on('caption-message')
    async def handle_caption_message(sid, data, sender):
        matching_room = None
        for room, clients in connections.items():
            if sid in clients:
                matching_room = room
                break
        
        if matching_room:
            for client_id in connections[matching_room]:
                if client_id != sid: # Don't send back to the speaker
                    await sio.emit('caption-message', (data, sender, sid), room=client_id)

    @sio.on('screen-toggle')
    async def handle_screen_toggle(sid, state):
        matching_room = None
        for room, clients in connections.items():
            if sid in clients:
                matching_room = room
                break
        
        if matching_room:
            for client_id in connections[matching_room]:
                if client_id != sid:
                    await sio.emit('screen-toggle', (sid, state), room=client_id)
