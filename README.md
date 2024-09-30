
This project is a full-stack web application that allows users to view Discord-like chat logs stored in a database. It includes functionality for browsing messages, searching by terms and users, navigating channels, viewing user profiles, and infinite scrolling of chat history.

The project consists of two main parts:

- **Backend**: A Flask server that provides an API to serve chat data from an SQLite database.
- **Frontend**: A React application styled with Material UI that displays the chat interface and enables interaction with the data.

---

## **Features**

- **Channel Browsing**: Users can browse multiple guilds and channels with a Discord-like UI.
- **Message Search**: Messages can be searched by keywords, users, and across channels.
- **Infinite Scrolling**: Messages are loaded in batches as the user scrolls, with infinite scrolling upwards to load older messages.
- **User Profiles**: Clicking on a user in the sidebar shows their message statistics across channels.
- **Material UI**: Provides a modern, responsive interface with dark mode-like styling.

---

## **Project Structure**

graphql


---

## **Backend Setup (Flask)**

### **Prerequisites**

- **Python 3.7+**
- **SQLite3**
- **pip** (Python package installer)

### **Setup Instructions**

1. **Clone the repository**:
    
    bash
    
    `git clone https://github.com/your-repo/discord-chat-viewer.git cd discord-chat-viewer/backendmeow`
    
2. **Install dependencies**: Ensure you are in the `backendmeow` folder, then run:
    
    bash
    
    `pip install -r requirements.txt`
    
3. **Ensure you have the necessary databases**: The SQLite databases should be placed in the `backendmeow/databases/` folder. Each database corresponds to a guild, and each channel is a table within the database.
    
4. **Run the Flask server**: Start the Flask server:
    
    bash
    `python app.py`
    
    The server will be running at `http://localhost:5001` by default.
    
5. **Test the API**: You can use `curl` or Postman to test the API endpoints. For example:
    
    bash
    `curl http://localhost:5001/api/guilds`
    

### **API Endpoints**

|Endpoint|Method|Description|
|---|---|---|
|`/api/guilds`|GET|Get all available guilds (databases).|
|`/api/guilds/{guildId}/channels`|GET|Get all channels in a specified guild.|
|`/api/guilds/{guildId}/channels/{channelId}`|GET|Get messages in a specified channel (supports pagination with `page` query param).|
|`/api/guilds/{guildId}/users`|GET|Get all users in the guild, ordered by message count.|
|`/api/guilds/{guildId}/users/{userId}`|GET|Get detailed information about a specific user.|

---

## **Frontend Setup (React)**

### **Prerequisites**

- **Node.js 14+**
- **npm** (Node package manager)

### **Setup Instructions**

1. **Navigate to the frontend directory**:
    
    bash
    `cd ../supermeow`
    
2. **Install dependencies**: Run the following command to install all the required packages:
    
    bash
    `npm install`
    
3. **Start the React development server**: Once all dependencies are installed, run the following to start the development server:
    
    bash
    
    `npm start`
    
    This will start the React app at `http://localhost:3000`.
    
4. **Proxy to the Backend**: In the `package.json` file, there is a proxy configured to forward API requests to the Flask backend:
    
    json
    
    `"proxy": "http://localhost:5001"`
    
5. **Usage**: Open a browser and navigate to `http://localhost:3000`. You should see the web app with guilds, channels, and messages.
    

---

## **Key Components**

### **ChannelView.js**

This component handles the display of channels and messages:

- **Infinite Scroll**: Messages load as you scroll, with older messages loading when you scroll upwards.
- **Search Functionality**: The search bar allows filtering messages by content or username.
- **User Sidebar**: Shows users in the guild, sorted by the total number of messages sent.

### **UserProfile.js**

When a user is clicked from the sidebar, this component displays detailed information about the user:

- **Total Messages**: Displays the total number of messages sent by the user.
- **Messages by Channel**: Shows a breakdown of messages sent by the user in each channel.

---

## **Known Issues**

- **User Profile Not Found**: If a user profile page shows "User not found," it may be due to missing data or the user not being present in the database.
- **Styling**: There may be minor styling inconsistencies (e.g., extra whitespace) that can be adjusted by fine-tuning the layout and CSS.

---

## **Future Enhancements**

- **Message Analytics**: Add advanced analytics features like user activity over time, channel usage, etc.
- **Message Reactions**: Display reactions to messages if present in the database.
- **More Customization**: Allow custom themes and more flexible layouts for the web app.

---

## **Contributing**

Feel free to submit issues or pull requests if you'd like to contribute to improving this project. Make sure to follow the existing style and add necessary documentation for any new features.

---

## **License**

This project is licensed under the MIT License.

---

### **Credits**

- **Material UI**: Used for styling the frontend.
- **SQLite**: Used to store and manage chat data.
- **Flask**: Backend server to handle API requests.
- **React**: Frontend framework for the user interface.

---