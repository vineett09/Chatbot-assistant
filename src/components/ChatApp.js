import { useState, useEffect } from "react";
import ClientChat from "./ClientChat";
import AssistantChat from "./AssistantChat";
import "../styles/ChatApp.css";

// Sample data representing previous interactions
const sampleData = {
  productInfo:
    "Our product XYZ offers advanced features with a 30-day free trial. Pricing starts at $49.99/month with annual billing available. We also have enterprise plans with custom pricing for larger teams.",
  returnPolicy:
    "We offer a 14-day money-back guarantee on all purchases. Refunds are processed within 5-7 business days after approval. For physical products, items must be returned in original packaging.",
  shippingInfo:
    "Free shipping on orders over $50. Standard shipping takes 3-5 business days. Express shipping (1-2 days) is available for an additional $15. International shipping varies by destination.",
  contactHours:
    "Our support team is available Monday to Friday, 9 AM to 6 PM EST. Weekend support is limited to email only. Premium support plans with 24/7 coverage are available for enterprise customers.",
  technicalSupport:
    "For technical issues, please provide your system details and error messages. Our technical team typically responds within 4 hours on business days. For critical issues, you can escalate through our priority support channel.",
  warrantyInfo:
    "All hardware products come with a standard 1-year limited warranty. Extended warranty options are available for purchase. Software subscriptions include ongoing support for the duration of your subscription.",
  bulkOrders:
    "For orders of 10+ licenses or devices, we offer special volume pricing. Please contact our sales team at sales@example.com for a custom quote. Bulk orders typically receive a 10-20% discount depending on volume.",
};

// Quick response templates
const quickResponses = [
  {
    id: 1,
    text: "Thank you for reaching out to us. How may I assist you today?",
  },
  {
    id: 2,
    text: "I understand your concern. Let me help resolve this for you.",
  },
  { id: 3, text: "Could you please provide more details about your issue?" },
  {
    id: 4,
    text: "I'll need to check on that for you. Could you please hold for a moment?",
  },
  { id: 5, text: "Is there anything else you'd like help with today?" },
];

// Message categories/tags
const messageCategories = [
  { id: 1, name: "Pricing", color: "#0ea5e9" },
  { id: 2, name: "Technical", color: "#8b5cf6" },
  { id: 3, name: "Shipping", color: "#10b981" },
  { id: 4, name: "Returns", color: "#f59e0b" },
  { id: 5, name: "General", color: "#6b7280" },
];

export default function ChatApp() {
  const [darkMode, setDarkMode] = useState(false);
  const [clientInput, setClientInput] = useState("");
  const [showAssistant, setShowAssistant] = useState(true);

  // Handle dark mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  return (
    <div className={`chat-container ${darkMode ? "dark-theme" : ""}`}>
      <ClientChat
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        quickResponses={quickResponses}
        messageCategories={messageCategories}
        clientInput={clientInput}
        setClientInput={setClientInput}
        showAssistant={showAssistant}
        setShowAssistant={setShowAssistant}
      />
      {showAssistant && (
        <AssistantChat
          sampleData={sampleData}
          setClientInput={setClientInput}
          setShowAssistant={setShowAssistant}
        />
      )}
    </div>
  );
}
