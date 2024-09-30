from flask import Flask, jsonify
import os
from sqlalchemy import create_engine, MetaData, Table, text



app = Flask(__name__)

# Path to the folder containing guild databases
DATABASE_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'databases')

# API to list all available guild databases
@app.route('/api/guilds', methods=['GET'])
def list_guilds():
    guilds = []
    if os.path.exists(DATABASE_FOLDER):
        for db_file in os.listdir(DATABASE_FOLDER):
            if db_file.endswith('.db'):
                guild_name = db_file.replace('.db', '')
                guilds.append({'name': guild_name, 'db_file': db_file})
    return jsonify(guilds), 200




@app.route('/api/guilds/<guild_db>/channels/<channel_name>', methods=['GET'])
def get_channel_messages(guild_db, channel_name):
    db_path = os.path.join(DATABASE_FOLDER, guild_db)
    
    if not os.path.exists(db_path):
        return jsonify({'error': 'Guild database not found'}), 404
    
    # Connect to the SQLite database
    try:
        print(f"Attempting to connect to database: {db_path}")
        engine = create_engine(f'sqlite:///{db_path}')
        connection = engine.connect()
        
        # Manually load the table
        print(f"Loading table: {channel_name}")
        metadata = MetaData()
        channel_table = Table(channel_name, metadata, autoload_with=engine)

        # Fetch the messages from the specified channel (table)
        query = channel_table.select().limit(100)
        result = connection.execute(query)

        # Convert the result to dictionaries using _asdict() for compatibility
        messages = []
        for row in result:
            print("Fetched row:", row)  # Log the raw row for inspection
            messages.append(row._asdict())  # Use _asdict() method to convert row to dictionary

        connection.close()
        print(f"Messages fetched successfully from {channel_name}")
        return jsonify(messages), 200

    except Exception as e:
        print(f"Error fetching messages from channel {channel_name}: {e}")
        return jsonify({'error': 'Could not retrieve messages'}), 500





@app.route('/api/guilds/<guild_db>/users/<user_id>', methods=['GET'])
def get_user_profile(guild_db, user_id):
    db_path = os.path.join(DATABASE_FOLDER, guild_db)
    
    if not os.path.exists(db_path):
        return jsonify({'error': 'Guild database not found'}), 404
    
    try:
        engine = create_engine(f'sqlite:///{db_path}')
        connection = engine.connect()

        # Fetch user total messages
        result = connection.execute(f"SELECT user_name, COUNT(*) as total_messages FROM _all_messages WHERE user_id = ? GROUP BY user_id", (user_id,))
        user_data = result.fetchone()

        if not user_data:
            return jsonify({'error': 'User not found'}), 404
        
        user_profile = {
            'user_name': user_data[0],
            'total_messages': user_data[1],
            'channels': []
        }

        # Fetch messages per channel
        result = connection.execute(f"SELECT channel_name, COUNT(*) as message_count FROM _all_messages WHERE user_id = ? GROUP BY channel_id", (user_id,))
        for row in result:
            user_profile['channels'].append({
                'channel_name': row[0],
                'message_count': row[1]
            })

        connection.close()
        return jsonify(user_profile), 200
    except Exception as e:
        print(f"Error fetching user profile: {e}")
        return jsonify({'error': 'Could not retrieve user profile'}), 500




@app.route('/api/guilds/<guild_db>/users', methods=['GET'])
def get_users(guild_db):
    db_path = os.path.join(DATABASE_FOLDER, guild_db)
    
    if not os.path.exists(db_path):
        return jsonify({'error': 'Guild database not found'}), 404
    
    try:
        engine = create_engine(f'sqlite:///{db_path}')
        connection = engine.connect()

        # Fetch all table names (channel names)
        metadata = MetaData()
        metadata.reflect(bind=engine)
        tables = metadata.tables.keys()

        # Aggregate user message counts across all channel tables
        users = {}
        for table_name in tables:
            # Query each channel table to get user_id, user_name, and message count
            query = text(f"SELECT user_id, user_name, COUNT(*) as message_count FROM {table_name} GROUP BY user_id")
            result = connection.execute(query)
            
            for row in result:
                user_id = row[0]
                user_name = row[1]
                message_count = row[2]
                
                # Update the user's total message count across all channels
                if user_id not in users:
                    users[user_id] = {
                        'user_id': user_id,
                        'user_name': user_name,
                        'total_messages': message_count
                    }
                else:
                    users[user_id]['total_messages'] += message_count

        # Convert the users dictionary to a list
        users_list = list(users.values())

        connection.close()
        return jsonify(users_list), 200
    except Exception as e:
        print(f"Error fetching users: {e}")
        return jsonify({'error': f'Could not retrieve users: {str(e)}'}), 500




# API to fetch channels (tables) for a selected guild
@app.route('/api/guilds/<guild_db>/channels', methods=['GET'])
def get_guild_channels(guild_db):
    db_path = os.path.join(DATABASE_FOLDER, guild_db)
    if not os.path.exists(db_path):
        return jsonify({'error': 'Guild database not found'}), 404

    # Connect to the SQLite database
    try:
        engine = create_engine(f'sqlite:///{db_path}')
        connection = engine.connect()
        metadata = MetaData()
        metadata.reflect(bind=engine)
        
        # Get the table names, which represent the channels
        channels = [{'name': table_name} for table_name in metadata.tables.keys()]
        connection.close()

        return jsonify(channels), 200
    except Exception as e:
        print(f"Error accessing database: {e}")
        return jsonify({'error': 'Could not retrieve channels'}), 500

if __name__ == '__main__':
    print("Starting Flask server on port 5001...")
    app.run(debug=True, port=5001)
