import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Clipboard,
  Check,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Brain,
  X,
} from "lucide-react";

const analyzeSentiment = (text) => {
  const positiveWords = [
    "happy",
    "glad",
    "great",
    "excellent",
    "good",
    "thanks",
    "thank",
    "love",
    "like",
    "awesome",
    "perfect",
  ];
  const negativeWords = [
    "unhappy",
    "bad",
    "terrible",
    "awful",
    "hate",
    "dislike",
    "poor",
    "disappointed",
    "issue",
    "problem",
    "wrong",
    "not working",
  ];

  text = text.toLowerCase();

  let positiveScore = positiveWords.filter((word) =>
    text.includes(word)
  ).length;
  let negativeScore = negativeWords.filter((word) =>
    text.includes(word)
  ).length;

  if (positiveScore > negativeScore) return "positive";
  if (negativeScore > positiveScore) return "negative";
  return "neutral";
};

const keywordMatcher = (input, keywords) => {
  input = input.toLowerCase();

  // Check for exact matches
  if (keywords.some((keyword) => input.includes(keyword))) return true;

  // Check for similar forms
  const variations = {
    price: [
      "pricing",
      "prices",
      "cost",
      "costs",
      "payment",
      "pay",
      "paid",
      "fee",
      "fees",
    ],
    ship: [
      "shipping",
      "shipped",
      "delivery",
      "deliver",
      "delivered",
      "sending",
      "send",
    ],
    return: [
      "returns",
      "refund",
      "refunds",
      "money back",
      "exchange",
      "exchanged",
    ],
    warranty: [
      "warranties",
      "guarantee",
      "guarantees",
      "coverage",
      "repair",
      "repairs",
    ],
    problem: [
      "issue",
      "issues",
      "error",
      "errors",
      "trouble",
      "troubles",
      "bug",
      "bugs",
      "glitch",
    ],
  };

  for (const [root, vars] of Object.entries(variations)) {
    if (keywords.includes(root) && vars.some((v) => input.includes(v)))
      return true;
  }

  return false;
};

export default function AssistantChat({
  sampleData,
  setClientInput,
  setShowAssistant,
}) {
  // State for employee-assistant chat
  const [assistantMessages, setAssistantMessages] = useState([
    {
      sender: "employee",
      text: "How should I explain our pricing structure?",
      timestamp: new Date(Date.now() - 30000).toISOString(),
      sentiment: "neutral",
    },
    {
      sender: "assistant",
      text: "You can tell the client: Our product XYZ offers advanced features with a 30-day free trial. Pricing starts at $49.99/month with annual billing available. We also have enterprise plans with custom pricing for larger teams.",
      timestamp: new Date(Date.now() - 20000).toISOString(),
    },
  ]);

  // Input state
  const [assistantInput, setAssistantInput] = useState("");
  const [isCopied, setIsCopied] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [conversationContext, setConversationContext] = useState({
    lastTopics: [],
    clientConcerns: [],
    frequentQueries: {},
    followUpSuggestions: [],
  });
  const [useEnhancedAI, setUseEnhancedAI] = useState(true);
  const [showFollowUps, setShowFollowUps] = useState(false);

  const assistantChatRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (assistantChatRef.current) {
      assistantChatRef.current.scrollTop =
        assistantChatRef.current.scrollHeight;
    }
  }, [assistantMessages]);

  // Effect to update conversation context based on messages
  useEffect(() => {
    if (assistantMessages.length > 0) {
      updateConversationContext();
    }
  }, [assistantMessages]);

  // Update conversation context based on message history
  const updateConversationContext = () => {
    // Only process the last 5 messages to keep context recent
    const recentMessages = assistantMessages.slice(-5);

    // Extract topics from recent messages
    const topicKeywords = {
      pricing: ["price", "cost", "payment", "discount", "subscription"],
      shipping: ["ship", "delivery", "mail", "package", "tracking"],
      returns: ["return", "refund", "exchange", "money back"],
      technical: [
        "issue",
        "problem",
        "error",
        "broken",
        "doesn't work",
        "help",
      ],
      warranty: ["warranty", "guarantee", "coverage", "protection"],
    };

    let topics = [];
    let concerns = [];
    let queryFreq = { ...conversationContext.frequentQueries };

    recentMessages.forEach((msg) => {
      if (msg.sender === "employee") {
        const text = msg.text.toLowerCase();

        // Detect topics
        for (const [topic, keywords] of Object.entries(topicKeywords)) {
          if (keywordMatcher(text, keywords)) {
            topics.push(topic);
            // Update query frequency
            queryFreq[topic] = (queryFreq[topic] || 0) + 1;
          }
        }

        // Detect potential concerns
        if (msg.sentiment === "negative") {
          concerns.push({
            text: msg.text,
            timestamp: msg.timestamp,
          });
        }
      }
    });

    // Generate follow-up suggestions based on current context
    let followUps = generateFollowUpSuggestions(topics, queryFreq);

    setConversationContext({
      lastTopics: [...new Set(topics)].slice(0, 3),
      clientConcerns: concerns,
      frequentQueries: queryFreq,
      followUpSuggestions: followUps,
    });
  };

  // Generate contextual follow-up questions
  const generateFollowUpSuggestions = (topics, queryFreq) => {
    const followUpMap = {
      pricing: [
        "Can you tell me more about our volume discounts?",
        "Are there any special promotions I should mention?",
        "What payment methods do we accept?",
      ],
      shipping: [
        "What's our shipping policy for international orders?",
        "How do I help track a delayed shipment?",
        "What are our expedited shipping options?",
      ],
      returns: [
        "What's our policy on damaged items?",
        "How long does the refund process take?",
        "What's the return window for our products?",
      ],
      technical: [
        "What are common troubleshooting steps I can suggest?",
        "How do I escalate a technical issue?",
        "Do we have any known bugs to be aware of?",
      ],
      warranty: [
        "What does our extended warranty cover?",
        "What's the process for a warranty claim?",
        "How long is our standard warranty period?",
      ],
    };

    let suggestions = [];

    // Get the most frequent topic
    let mostFrequentTopic = null;
    let highestFreq = 0;

    for (const [topic, freq] of Object.entries(queryFreq)) {
      if (freq > highestFreq) {
        highestFreq = freq;
        mostFrequentTopic = topic;
      }
    }

    // Add suggestions based on recent topics
    topics.forEach((topic) => {
      if (followUpMap[topic]) {
        suggestions.push(
          followUpMap[topic][
            Math.floor(Math.random() * followUpMap[topic].length)
          ]
        );
      }
    });

    // Add suggestion from most frequent topic if not already covered
    if (
      mostFrequentTopic &&
      !topics.includes(mostFrequentTopic) &&
      followUpMap[mostFrequentTopic]
    ) {
      suggestions.push(followUpMap[mostFrequentTopic][0]);
    }

    return [...new Set(suggestions)].slice(0, 3);
  };

  const handleAssistantSubmit = () => {
    if (assistantInput.trim() === "") return;

    const sentiment = analyzeSentiment(assistantInput);

    // Add employee's question to the assistant chat
    setAssistantMessages([
      ...assistantMessages,
      {
        sender: "employee",
        text: assistantInput,
        timestamp: new Date().toISOString(),
        sentiment: sentiment,
      },
    ]);

    setIsLoading(true);
    setTimeout(() => {
      let response =
        "I don't have specific information about that query. Consider asking for more details from the client or check our knowledge base.";

      const input = assistantInput.toLowerCase();

      if (useEnhancedAI) {
        // Check for topic-specific responses using enhanced keyword matching
        if (keywordMatcher(input, ["price", "cost", "payment", "discount"])) {
          response = sampleData.productInfo;
        } else if (keywordMatcher(input, ["return", "refund", "exchange"])) {
          response = sampleData.returnPolicy;
        } else if (
          keywordMatcher(input, ["ship", "delivery", "mail", "package"])
        ) {
          response = sampleData.shippingInfo;
        } else if (
          keywordMatcher(input, [
            "hours",
            "support",
            "contact",
            "help",
            "reach",
          ])
        ) {
          response = sampleData.contactHours;
        } else if (
          keywordMatcher(input, [
            "technical",
            "issue",
            "problem",
            "bug",
            "error",
            "fix",
          ])
        ) {
          response = sampleData.technicalSupport;
        } else if (
          keywordMatcher(input, [
            "warranty",
            "guarantee",
            "coverage",
            "protection",
          ])
        ) {
          response = sampleData.warrantyInfo;
        } else if (
          keywordMatcher(input, [
            "bulk",
            "volume",
            "discount",
            "wholesale",
            "many",
          ])
        ) {
          response = sampleData.bulkOrders;
        }

        // Consider sentiment for more empathetic responses
        if (sentiment === "negative" && !response.includes("I'm sorry")) {
          response = "I'm sorry to hear that. " + response;
        }

        // Check conversation history for context enhancement
        const hasDiscussedPricing =
          conversationContext.lastTopics.includes("pricing");
        const hasDiscussedReturns =
          conversationContext.lastTopics.includes("returns");

        // Add contextual information based on conversation history
        if (hasDiscussedPricing && keywordMatcher(input, ["ship"])) {
          response +=
            " And remember that free shipping applies to orders over $50, which could be relevant to the pricing we discussed earlier.";
        } else if (hasDiscussedReturns && keywordMatcher(input, ["warranty"])) {
          response +=
            " This warranty policy works alongside our return policy that we discussed previously.";
        }
      } else {
        // Fall back to simple keyword matching if enhanced AI is off
        if (
          input.includes("price") ||
          input.includes("cost") ||
          input.includes("payment")
        ) {
          response = sampleData.productInfo;
        } else if (input.includes("return") || input.includes("refund")) {
          response = sampleData.returnPolicy;
        } else if (input.includes("ship") || input.includes("delivery")) {
          response = sampleData.shippingInfo;
        } else if (
          input.includes("hours") ||
          input.includes("support") ||
          input.includes("contact")
        ) {
          response = sampleData.contactHours;
        } else if (
          input.includes("technical") ||
          input.includes("issue") ||
          input.includes("problem")
        ) {
          response = sampleData.technicalSupport;
        } else if (
          input.includes("warranty") ||
          input.includes("guarantee") ||
          input.includes("coverage")
        ) {
          response = sampleData.warrantyInfo;
        } else if (
          input.includes("bulk") ||
          input.includes("volume") ||
          input.includes("discount")
        ) {
          response = sampleData.bulkOrders;
        }
      }

      setAssistantMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: response,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Show follow-up suggestions after assistant responds
      if (useEnhancedAI) {
        setShowFollowUps(true);
      }

      setIsLoading(false);
    }, 1000);

    setAssistantInput("");
  };

  // Handle copy assistant response to client input
  const setAsPendingResponse = (text, index) => {
    setClientInput(text);
    setIsCopied(index);
    setTimeout(() => setIsCopied(null), 2000);
  };

  // Handle selection of follow-up question
  const handleFollowUpSelect = (question) => {
    setAssistantInput(question);
    setShowFollowUps(false);
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

  return (
    <div className="chat-section assistant-section">
      <div className="chat-header assistant-header">
        <div>
          <h2>AI Copilot</h2>
        </div>
        <div className="header-actions">
          <button
            className={`toggle-ai-button ${useEnhancedAI ? "ai-enabled" : ""}`}
            onClick={() => setUseEnhancedAI(!useEnhancedAI)}
            title={
              useEnhancedAI ? "Enhanced AI enabled" : "Enhanced AI disabled"
            }
            aria-label={
              useEnhancedAI ? "Disable enhanced AI" : "Enable enhanced AI"
            }
          >
            <Brain size={16} />
            <span>{useEnhancedAI ? "Smart Mode" : "Basic Mode"}</span>
          </button>
          {/* Add this close button */}
        </div>

        <div className="status-indicator assistant-status">AI Powered</div>
        <button
          className="header-icon-button close-assistant"
          onClick={() => setShowAssistant(false)}
          aria-label="Close assistant"
        >
          <X size={16} />
        </button>
      </div>

      <div className="messages-container" ref={assistantChatRef}>
        {assistantMessages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-content">
              <div className="message-header">
                <span className="sender-label">
                  {msg.sender === "assistant" ? "Assistant" : "You"}
                </span>
                {msg.sentiment && (
                  <span
                    className={`sentiment-indicator sentiment-${msg.sentiment}`}
                  >
                    {msg.sentiment === "positive" && <ThumbsUp size={12} />}
                    {msg.sentiment === "negative" && <ThumbsDown size={12} />}
                    {msg.sentiment === "neutral" && (
                      <span className="sentiment-dot"></span>
                    )}
                  </span>
                )}
                <span className="message-timestamp">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <p className="message-text">{msg.text}</p>
              {msg.sender === "assistant" && (
                <div className="message-actions">
                  <button
                    className={`copy-button ${
                      isCopied === index ? "copied" : ""
                    }`}
                    onClick={() => setAsPendingResponse(msg.text, index)}
                    aria-label={
                      isCopied === index
                        ? "Added to composer"
                        : "Add to composer"
                    }
                  >
                    {isCopied === index ? (
                      <>
                        <Check size={14} className="copy-button-icon" />
                        Added to composer{" "}
                      </>
                    ) : (
                      <>
                        <Clipboard size={14} className="copy-button-icon" />
                        Add to composer{" "}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="typing-indicator">
            <RefreshCw size={18} className="typing-icon" />
            <span className="typing-text">Assistant is typing...</span>
          </div>
        )}
      </div>

      {/* Follow-up suggestions */}
      {showFollowUps && conversationContext.followUpSuggestions.length > 0 && (
        <div className="follow-up-suggestions">
          <div className="follow-up-header">
            <span>You might want to ask:</span>
            <button
              className="close-follow-ups"
              onClick={() => setShowFollowUps(false)}
              aria-label="Close suggestions"
            >
              <AlertCircle size={14} />
            </button>
          </div>
          <div className="follow-up-list">
            {conversationContext.followUpSuggestions.map((question, i) => (
              <button
                key={i}
                className="follow-up-item"
                onClick={() => handleFollowUpSelect(question)}
              >
                <ChevronRight size={14} className="follow-up-icon" />
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            value={assistantInput}
            onChange={(e) => setAssistantInput(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, handleAssistantSubmit)}
            placeholder="Ask assistant for help..."
            className="message-input assistant-input"
            rows={3}
            aria-label="Assistant query input"
          />
          <button
            onClick={handleAssistantSubmit}
            className="input-button assistant-send"
            disabled={!assistantInput.trim()}
            aria-label="Send assistant query"
          >
            <MessageSquare size={18} />
          </button>
        </div>

        <div className="quick-buttons">
          <button
            className="quick-button"
            onClick={() =>
              setAssistantInput("Tell me about our pricing options")
            }
            title="Ask about pricing"
            aria-label="Ask about pricing options"
          >
            <ChevronRight size={14} className="quick-button-icon" />
            Pricing
          </button>
          <button
            className="quick-button"
            onClick={() => setAssistantInput("What's our return policy?")}
            title="Ask about returns"
            aria-label="Ask about return policy"
          >
            <ChevronRight size={14} className="quick-button-icon" />
            Returns
          </button>
          <button
            className="quick-button"
            onClick={() => setAssistantInput("Explain our shipping options")}
            title="Ask about shipping"
            aria-label="Ask about shipping options"
          >
            <ChevronRight size={14} className="quick-button-icon" />
            Shipping
          </button>
          <button
            className="quick-button"
            onClick={() => setAssistantInput("How to handle technical issues?")}
            title="Ask about technical support"
            aria-label="Ask about technical support"
          >
            <ChevronRight size={14} className="quick-button-icon" />
            Tech Support
          </button>
        </div>
      </div>
    </div>
  );
}
