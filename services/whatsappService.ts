// A mock service to simulate WhatsApp Business API interactions.

const WHATSAPP_BOT_NUMBER = '+14155238886'; // A placeholder number, often used for sandboxes

/**
 * Simulates sending an order status update via WhatsApp.
 * In a real app, this would be a backend API call.
 * @param customerPhoneNumber The recipient's phone number.
 * @param message The message to send.
 */
export const sendOrderStatusUpdate = (customerPhoneNumber: string, message: string): Promise<{ success: boolean; messageId: string }> => {
    console.log(`[WHATSAPP_API_MOCK] Sending message to ${customerPhoneNumber}: "${message}"`);
    
    // Simulate network delay and return a mock success response.
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                success: true,
                messageId: `whatsapp_${Date.now()}`
            });
        }, 500);
    });
};

/**
 * Opens a WhatsApp chat window with a pre-filled message for customer inquiries.
 * This uses the public "click to chat" feature.
 * @param message The pre-filled message.
 */
export const initiateWhatsAppChat = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    // Use the wa.me link format for initiating chats
    const whatsappUrl = `https://wa.me/${WHATSAPP_BOT_NUMBER.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
};
