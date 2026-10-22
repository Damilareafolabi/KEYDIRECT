"""
KeyDirect Real Estate - Real-Time WebSocket Consumers (Django Channels)
Parent Company: SimeonJrStudios
Leadership: CEO Afolabi Oluwadamilare Simeon
"""

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class PropertyChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer handling real-time peer-to-peer chats
    between Renters and Verified Property Owners / Agents.
    Includes anti-scam escrow warning injects and instant broadcast.
    """

    async def connect(self):
        self.property_id = self.scope['url_route']['kwargs']['property_id']
        self.user = self.scope['user']
        
        # Room group name
        self.room_group_name = f'chat_property_{self.property_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        # Send trust & anti-scam system greeting
        await self.send(text_data=json.dumps({
            'type': 'system_notice',
            'message': 'KeyDirect Security Protocol: Never transfer booking or inspection fees off-platform. Direct Owner verification is guaranteed by SimeonJrStudios.',
            'verified_badge': True,
        }))

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """
        Receives WebSocket frame from client
        """
        data = json.loads(text_data)
        message_type = data.get('type', 'chat_message')
        
        if message_type == 'chat_message':
            message_text = data.get('message', '').strip()
            receiver_id = data.get('receiver_id')

            if not message_text:
                return

            # Save to database asynchronously
            saved_message = await self.save_message(
                sender=self.user,
                receiver_id=receiver_id,
                property_id=self.property_id,
                text=message_text
            )

            # Broadcast to property chat room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'broadcast_message',
                    'message_id': str(saved_message['id']),
                    'sender_id': str(self.user.id) if self.user.is_authenticated else 'demo-user',
                    'sender_name': self.user.get_full_name() if self.user.is_authenticated else 'Guest Renter',
                    'sender_role': getattr(self.user, 'role', 'Renter'),
                    'message': message_text,
                    'timestamp': saved_message['timestamp']
                }
            )
        elif message_type == 'typing':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'broadcast_typing',
                    'sender_name': self.user.get_full_name() if self.user.is_authenticated else 'User',
                    'is_typing': data.get('is_typing', True)
                }
            )

    async def broadcast_message(self, event):
        """
        Handler for messages broadcasted to group
        """
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message_id': event['message_id'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'sender_role': event['sender_role'],
            'message': event['message'],
            'timestamp': event['timestamp']
        }))

    async def broadcast_typing(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing_indicator',
            'sender_name': event['sender_name'],
            'is_typing': event['is_typing']
        }))

    @database_sync_to_async
    def save_message(self, sender, receiver_id, property_id, text):
        from backend.models import ChatMessage, CustomUser, Property
        from django.utils import timezone
        
        # In case of demo/anonymous test user
        if not sender.is_authenticated:
            return {
                'id': 'temp-msg-id',
                'timestamp': timezone.now().strftime('%H:%M')
            }

        receiver = CustomUser.objects.filter(id=receiver_id).first()
        prop = Property.objects.filter(id=property_id).first()

        msg = ChatMessage.objects.create(
            sender=sender,
            receiver=receiver or sender,
            property=prop,
            message_text=text
        )
        return {
            'id': msg.id,
            'timestamp': msg.timestamp.strftime('%H:%M')
        }


class RealtimeFeedConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time live feed updates:
    - New verified direct-owner listings
    - Price drops & status changes
    - Digital Billboard ticker broadcasts
    """
    async def connect(self):
        self.feed_group_name = 'keydirect_live_listings_feed'
        await self.channel_layer.group_add(self.feed_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.feed_group_name, self.channel_name)

    async def listing_published(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_listing',
            'property': event['property_data']
        }))
