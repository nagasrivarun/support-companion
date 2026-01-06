import { Database } from '@/integrations/supabase/types';

type Message = Database['public']['Tables']['messages']['Row'];
type Conversation = Database['public']['Tables']['conversations']['Row'];

interface TranscriptData {
  conversation: Conversation;
  messages: Message[];
}

const formatSenderType = (type: string): string => {
  switch (type) {
    case 'customer':
      return 'Customer';
    case 'bot':
      return 'SupportBot';
    case 'agent':
      return 'Agent';
    default:
      return type;
  }
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

export const exportToCSV = (data: TranscriptData): void => {
  const { conversation, messages } = data;
  
  // CSV header
  const headers = ['Timestamp', 'Sender', 'Message'];
  
  // CSV rows
  const rows = messages.map((msg) => [
    formatDate(msg.created_at),
    formatSenderType(msg.sender_type),
    // Escape quotes and wrap in quotes for CSV
    `"${msg.content.replace(/"/g, '""')}"`,
  ]);

  // Build CSV content
  const csvContent = [
    `# Conversation Transcript`,
    `# Customer: ${conversation.customer_name}`,
    `# Email: ${conversation.customer_email || 'Not provided'}`,
    `# Started: ${formatDate(conversation.created_at)}`,
    `# Status: ${conversation.status}`,
    '',
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `transcript-${conversation.customer_name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDF = (data: TranscriptData): void => {
  const { conversation, messages } = data;

  // Build HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Chat Transcript - ${conversation.customer_name}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          color: #333;
        }
        .header {
          border-bottom: 2px solid #6366f1;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #6366f1;
          margin: 0 0 10px 0;
          font-size: 24px;
        }
        .meta {
          color: #666;
          font-size: 14px;
          line-height: 1.6;
        }
        .messages {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .message {
          padding: 12px 16px;
          border-radius: 12px;
          max-width: 80%;
        }
        .message.customer {
          background: #f1f5f9;
          align-self: flex-start;
        }
        .message.bot {
          background: #e0e7ff;
          align-self: flex-start;
        }
        .message.agent {
          background: #6366f1;
          color: white;
          align-self: flex-end;
        }
        .sender {
          font-weight: 600;
          font-size: 12px;
          margin-bottom: 4px;
          opacity: 0.8;
        }
        .content {
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
        }
        .timestamp {
          font-size: 11px;
          margin-top: 6px;
          opacity: 0.6;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #666;
          font-size: 12px;
          text-align: center;
        }
        @media print {
          body { padding: 20px; }
          .message { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Chat Transcript</h1>
        <div class="meta">
          <div><strong>Customer:</strong> ${conversation.customer_name}</div>
          <div><strong>Email:</strong> ${conversation.customer_email || 'Not provided'}</div>
          <div><strong>Started:</strong> ${formatDate(conversation.created_at)}</div>
          <div><strong>Status:</strong> ${conversation.status}</div>
        </div>
      </div>
      
      <div class="messages">
        ${messages
          .map(
            (msg) => `
          <div class="message ${msg.sender_type}">
            <div class="sender">${formatSenderType(msg.sender_type)}</div>
            <div class="content">${msg.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            <div class="timestamp">${formatDate(msg.created_at)}</div>
          </div>
        `
          )
          .join('')}
      </div>
      
      <div class="footer">
        Generated on ${new Date().toLocaleString()}
      </div>
    </body>
    </html>
  `;

  // Open print dialog
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
