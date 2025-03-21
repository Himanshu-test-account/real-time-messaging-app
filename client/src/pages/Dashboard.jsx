import ContactList from "../components/Dashboard/ContactList";
import Sidebar from "../components/Dashboard/Sidebar";
import UserStatus from "../components/Dashboard/UserStatus";
import ChatArea from "../components/Chat/ChatArea";
import { useChatStore } from "../stores/chatStore"; // Import Zustand store

const Dashboard = () => {
  const currentUser = useChatStore((state) => state.currentUser); // Get user from Zustand store

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-grow p-6 space-y-4">
        {/* Dashboard Header */}
        <h1 className="text-3xl font-semibold text-gray-800">
          Welcome to the Dashboard
        </h1>

        {/* Top Section */}
        <div className="flex space-x-4">
          {/* Contact List */}
          <div className="w-1/4 bg-white shadow-md rounded-lg p-4">
            <ContactList />
          </div>

          {/* User Status */}
          <div className="w-1/4 bg-white shadow-md rounded-lg p-4">
            <UserStatus />
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow bg-white shadow-md rounded-lg p-4">
          <ChatArea user={currentUser} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
