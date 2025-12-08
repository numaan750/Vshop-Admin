import React, { useState, useEffect, useContext } from "react";
import {
  Trash2,
  Mail,
  User,
  Clock,
  Search,
  Eye,
  CheckCheck,
} from "lucide-react";
import { AppContext } from "@/context/Appcontext";
import { toast, Toaster } from "react-hot-toast";

const AdminContactPanel = () => {
  const { getcontect, deletecontect, markContactAsRead } =
    useContext(AppContext);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedContact, setSelectedContact] = useState(null);

  // Mock data - Replace with actual API call
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await getcontect();
      // ✅ Backend returns data directly now
      if (response.success) {
        setContacts(response.data);
      } else if (Array.isArray(response)) {
        // If backend returns array directly
        setContacts(response);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        const response = await deletecontect(id);
        if (response.success) {
          setContacts(contacts.filter((c) => c._id !== id));
          setSelectedContact(null);
          toast.success("Message deleted successfully", {
            duration: 3000,
            icon: "🗑️",
          });
        }
      } catch (error) {
        toast.error("Failed to delete message");
        console.error("Error deleting contact:", error);
      }
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await markContactAsRead(id);
      if (response.success) {
        setContacts(
          contacts.map((c) => (c._id === id ? { ...c, read: true } : c))
        );
        toast.success("Message marked as read ✓", {
          duration: 2000,
          position: "top-right",
        });
      } else {
        toast.error("Failed to mark as read");
        console.error("Failed to mark as read:", response.message);
      }
    } catch (error) {
      toast.error("Error marking message as read");
      console.error("Error marking as read:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "unread" && !contact.read) ||
      (filterStatus === "read" && contact.read);

    return matchesSearch && matchesFilter;
  });

  const unreadCount = contacts.filter((c) => !c.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Contact Messages
              </h1>
              <p className="text-gray-600 mt-1">
                {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={fetchContacts}
              className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Refresh
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 cursor-pointer py-2 rounded-lg transition ${
                  filterStatus === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All ({contacts.length})
              </button>
              <button
                onClick={() => setFilterStatus("unread")}
                className={`px-4  cursor-pointer py-2 rounded-lg transition ${
                  filterStatus === "unread"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilterStatus("read")}
                className={`px-4 cursor-pointer py-2 rounded-lg transition ${
                  filterStatus === "read"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Read ({contacts.length - unreadCount})
              </button>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="grid gap-4">
          {filteredContacts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No messages found</p>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact._id}
                className={`bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition ${
                  !contact.read ? "border-l-4 border-blue-600" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {contact.name}
                          </h3>
                          {!contact.read && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>{contact.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {contact.createdAt
                                ? formatDate(contact.createdAt)
                                : "Just now"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 mt-3 line-clamp-2">
                      {contact.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {/* Eye Button - View Detail */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContact(contact);
                        if (!contact.read) markAsRead(contact._id);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5 cursor-pointer" />
                    </button>

                    {/* Mark as Read Button */}
                    {!contact.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(contact._id);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Mark as Read"
                      >
                        <CheckCheck className="w-5 h-5 cursor-pointer" />
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(contact._id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 cursor-pointer" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Modal */}
        {selectedContact && (
          <div
            className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedContact(null)}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedContact.name}
                    </h2>
                    <p className="text-gray-600">{selectedContact.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-500 cursor-pointer hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Clock className="w-4 h-4" />
                <span>
                  {selectedContact.createdAt
                    ? formatDate(selectedContact.createdAt)
                    : "Just now"}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Message:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedContact.message}
                </p>
              </div>

              <div className="flex gap-3">
                <a
                  href={`mailto:${selectedContact.email}?subject=Re: Your Contact Message`}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center"
                >
                  Reply via Email
                </a>
                <button
                  onClick={() => {
                    handleDelete(selectedContact._id);
                    setSelectedContact(null);
                  }}
                  className="px-4 py-2 cursor-pointer bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContactPanel;
