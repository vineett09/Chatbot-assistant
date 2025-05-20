import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Search,
  Filter,
  Moon,
  Sun,
  Paperclip,
  Tag,
  PenTool,
  X,
} from "lucide-react";

export default function ClientChat({
  darkMode,
  setDarkMode,
  quickResponses,
  messageCategories,
  clientInput,
  setClientInput,
  showAssistant,
  setShowAssistant,
}) {
  // State for client-employee chat
  const [clientMessages, setClientMessages] = useState([
    {
      sender: "client",
      text: "Hello, I have a question about your product pricing.",
      timestamp: new Date(Date.now() - 120000).toISOString(),
      category: "Pricing",
    },
    {
      sender: "employee",
      text: "Hi there! I'd be happy to help with pricing information. What specifically would you like to know?",
      timestamp: new Date(Date.now() - 60000).toISOString(),
      category: "Pricing",
    },
  ]);

  // Input state
  const [searchQuery, setSearchQuery] = useState("");
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // UI state management
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [suggestedResponses, setSuggestedResponses] = useState([]);

  // Refs for scroll management and quick responses panel
  const clientChatRef = useRef(null);
  const quickResponsesRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (clientChatRef.current) {
      clientChatRef.current.scrollTop = clientChatRef.current.scrollHeight;
    }
  }, [clientMessages]);

  // Handle click outside to close panels
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        quickResponsesRef.current &&
        !quickResponsesRef.current.contains(event.target)
      ) {
        setShowQuickResponses(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setShowQuickResponses(false);
        setShowCategorySelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  // Generate contextual suggestions based on last client message
  useEffect(() => {
    if (clientMessages.length > 0) {
      const lastClientMessage = [...clientMessages]
        .reverse()
        .find((msg) => msg.sender === "client");

      if (lastClientMessage) {
        const text = lastClientMessage.text.toLowerCase();
        let contextualSuggestions = [];

        if (
          text.includes("pricing") ||
          text.includes("cost") ||
          text.includes("payment")
        ) {
          contextualSuggestions = [
            "Here's our detailed pricing structure for the products mentioned.",
            "Would you like me to explain our payment options and billing cycles?",
            "We do offer discounts for annual subscriptions. Would you like to know more?",
          ];
        } else if (text.includes("ship") || text.includes("delivery")) {
          contextualSuggestions = [
            "We offer standard shipping (3-5 days) and express shipping (1-2 days).",
            "Your location affects shipping costs. Could you confirm your shipping address?",
            "For orders over $50, we provide free standard shipping.",
          ];
        } else if (text.includes("return") || text.includes("refund")) {
          contextualSuggestions = [
            "Our return policy allows returns within 14 days of purchase.",
            "I'd be happy to help process your return. Could you provide your order number?",
            "Refunds are typically processed within 5-7 business days after approval.",
          ];
        }

        setSuggestedResponses(contextualSuggestions);
      }
    }
  }, [clientMessages]);

  // Filter quick responses based on search
  const filteredQuickResponses = quickResponses.filter((response) =>
    response.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter client messages based on search and category
  const filteredClientMessages = clientMessages.filter((msg) => {
    const matchesSearch = msg.text
      .toLowerCase()
      .includes(clientSearchQuery.toLowerCase());
    const matchesCategory =
      !currentCategory || msg.category === currentCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle client chat submission
  const handleClientSubmit = () => {
    if (clientInput.trim() === "") return;

    const newMessage = {
      sender: "employee",
      text: clientInput,
      timestamp: new Date().toISOString(),
      category: currentCategory || "General",
    };

    if (selectedFile) {
      newMessage.attachment = {
        name: selectedFile.name,
        type: selectedFile.type,
      };
    }

    setClientMessages([...clientMessages, newMessage]);
    setClientInput("");
    setSelectedFile(null);
    setShowQuickResponses(false);
  };

  // Handle quick response selection
  const handleQuickResponseSelect = (response) => {
    setClientInput(response.text);
    setShowQuickResponses(false);
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setCurrentCategory(category);
    setShowCategorySelector(false);
  };

  // Handle suggested response selection
  const handleSuggestedResponseSelect = (response) => {
    setClientInput(response);
  };

  // Handle key press events for inputs
  const handleKeyPress = (e, submitFunction) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitFunction();
    }
  };

  // Format timestamp
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Reset filtered/selected states
  const resetFilters = () => {
    setClientSearchQuery("");
    setCurrentCategory("");
    setShowSearchBar(false);
  };

  return (
    <div className="chat-section client-section">
      <div className="chat-header client-header">
        <div className="header-left">
          <h2>Client Conversation</h2>
        </div>
        <div className="header-actions">
          {showSearchBar ? (
            <div className="header-search-container">
              <input
                type="text"
                placeholder="Search messages..."
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                className="header-search-input"
              />
              <button
                className="header-icon-button"
                onClick={() => setShowSearchBar(false)}
                aria-label="Close search"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <button
                className="header-icon-button"
                onClick={() => setShowSearchBar(true)}
                aria-label="Search messages"
              >
                <Search size={16} />
              </button>
              <button
                className="header-icon-button"
                onClick={() => setShowCategorySelector(!showCategorySelector)}
                aria-label="Filter by category"
              >
                <Filter size={16} />
              </button>
              <button
                className="header-icon-button"
                onClick={() => setDarkMode(!darkMode)}
                aria-label={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                className="header-icon-button"
                onClick={() => setShowAssistant(!showAssistant)}
                aria-label={showAssistant ? "Hide assistant" : "Show assistant"}
              >
                <Bot size={16} />
              </button>
            </>
          )}
          <div className="status-indicator client-status">Active</div>
        </div>
      </div>

      {/* Category filter dropdown */}
      {showCategorySelector && (
        <div className="category-selector">
          <div className="category-header">
            <span>Filter by category</span>
            <button
              className="reset-button"
              onClick={resetFilters}
              aria-label="Reset filters"
            >
              Reset
            </button>
          </div>
          <div className="category-list">
            {messageCategories.map((category) => (
              <div
                key={category.id}
                className={`category-item ${
                  currentCategory === category.name ? "selected" : ""
                }`}
                onClick={() => handleCategorySelect(category.name)}
                style={{
                  "--category-color": category.color,
                }}
              >
                <span className="category-color-dot"></span>
                <span>{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active filters display */}
      {(clientSearchQuery || currentCategory) && (
        <div className="active-filters">
          <span>Active filters:</span>
          {currentCategory && (
            <div className="filter-tag">
              <span>Category: {currentCategory}</span>
              <button
                onClick={() => setCurrentCategory("")}
                className="filter-remove"
                aria-label={`Remove ${currentCategory} filter`}
              >
                <X size={12} />
              </button>
            </div>
          )}
          {clientSearchQuery && (
            <div className="filter-tag">
              <span>Search: "{clientSearchQuery}"</span>
              <button
                onClick={() => setClientSearchQuery("")}
                className="filter-remove"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            </div>
          )}
          <button
            onClick={resetFilters}
            className="filter-clear-all"
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="messages-container" ref={clientChatRef}>
        {filteredClientMessages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-content">
              <div className="message-header">
                <span className="sender-label">
                  {msg.sender === "client" ? "Client" : "You"}
                </span>
                <div className="message-metadata">
                  {msg.category && (
                    <span
                      className="message-category"
                      style={{
                        backgroundColor:
                          messageCategories.find(
                            (cat) => cat.name === msg.category
                          )?.color + "20",
                        color: messageCategories.find(
                          (cat) => cat.name === msg.category
                        )?.color,
                      }}
                    >
                      {msg.category}
                    </span>
                  )}
                  <span className="message-timestamp">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
              <p className="message-text">{msg.text}</p>
              {msg.attachment && (
                <div className="message-attachment">
                  <div className="attachment-icon">
                    <Paperclip size={14} />
                  </div>
                  <span className="attachment-name">{msg.attachment.name}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Suggested responses */}
      {suggestedResponses.length > 0 && (
        <div className="suggested-responses">
          <div className="suggested-header">
            <span>Suggested Responses</span>
          </div>
          <div className="suggested-list">
            {suggestedResponses.map((response, i) => (
              <button
                key={i}
                className="suggested-item"
                onClick={() => handleSuggestedResponseSelect(response)}
              >
                {response}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="input-container">
        {selectedFile && (
          <div className="selected-file">
            <span className="file-name">{selectedFile.name}</span>
            <button
              className="file-remove"
              onClick={() => setSelectedFile(null)}
              aria-label="Remove selected file"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="input-wrapper">
          <textarea
            value={clientInput}
            onChange={(e) => setClientInput(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, handleClientSubmit)}
            placeholder="Type your response to client..."
            className="message-input"
            rows={3}
            aria-label="Client response input"
          />

          <div className="input-buttons">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: "none" }}
              aria-label="Attach file"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="input-button templates-button"
              title="Attach file"
              aria-label="Attach file"
            >
              <Paperclip size={18} />
            </button>
            <button
              onClick={() => setShowCategorySelector(!showCategorySelector)}
              className="input-button templates-button"
              title="Categorize message"
              aria-label="Categorize message"
            >
              <Tag size={18} />
            </button>
            <button
              onClick={() => setShowQuickResponses(!showQuickResponses)}
              className="input-button templates-button"
              title="Quick responses"
              aria-label="Open quick responses"
            >
              <PenTool size={18} />
            </button>
            <button
              onClick={handleClientSubmit}
              className="input-button send-button"
              disabled={!clientInput.trim()}
              aria-label="Send client message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>

        {/* Quick responses dropdown */}
        {showQuickResponses && (
          <div className="quick-responses" ref={quickResponsesRef}>
            <div className="quick-responses-header">
              <div className="search-wrapper">
                <Search className="search-icon" size={16} />
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search quick responses"
                />
              </div>
            </div>
            <div className="quick-responses-list">
              {filteredQuickResponses.length > 0 ? (
                filteredQuickResponses.map((response) => (
                  <div
                    key={response.id}
                    className="quick-response-item"
                    onClick={() => handleQuickResponseSelect(response)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleQuickResponseSelect(response)
                    }
                    aria-label={`Select quick response: ${response.text}`}
                  >
                    <p className="quick-response-text">{response.text}</p>
                  </div>
                ))
              ) : (
                <div className="no-results">No matching templates found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
