import { ChatWidget } from "@/components/chat/ChatWidget";
import { CommerceWidget } from "@/components/commerce/CommerceWidget";
import { FAQ } from "@/components/home/FAQ";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center max-w-2xl px-6">
          <h1 className="mb-4 text-4xl font-bold text-gradient">Customer Support Hub</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Get help from our AI assistant or shop with our Commerce Assistant
          </p>
          <div className="flex flex-col gap-4 text-left bg-card/50 rounded-xl p-6 border border-border">
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 rounded-full bg-primary mt-1.5" />
              <div>
                <h3 className="font-semibold text-foreground">Support Chat</h3>
                <p className="text-sm text-muted-foreground">Click the chat bubble on the bottom right for customer support</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 rounded-full bg-pink-500 mt-1.5" />
              <div>
                <h3 className="font-semibold text-foreground">Shopping Assistant</h3>
                <p className="text-sm text-muted-foreground">Click the shopping bag on the bottom left to find products</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQ />
      
      {/* Support Chat Widget */}
      <ChatWidget />
      
      {/* Commerce Shopping Widget */}
      <CommerceWidget />
    </div>
  );
};

export default Index;
