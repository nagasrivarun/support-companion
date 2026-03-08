import { useState } from "react";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import {
  RotateCcw,
  RefreshCw,
  CreditCard,
  Package,
  ShieldCheck,
  Truck,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";

const returnOptions = [
  {
    id: "full-refund",
    title: "Full Refund",
    description: "Get a complete refund to your original payment method within 5-7 business days.",
    icon: CreditCard,
    timeline: "5-7 business days",
  },
  {
    id: "exchange",
    title: "Exchange Product",
    description: "Swap your product for a different size, colour, or variant at no extra cost.",
    icon: RefreshCw,
    timeline: "3-5 business days",
  },
  {
    id: "store-credit",
    title: "Store Credit",
    description: "Receive store credit worth 110% of your purchase — a bonus for choosing credit!",
    icon: ShieldCheck,
    timeline: "Instant",
  },
  {
    id: "replacement",
    title: "Free Replacement",
    description: "Received a defective or damaged item? We'll ship a brand-new replacement for free.",
    icon: Package,
    timeline: "2-4 business days",
  },
  {
    id: "partial-refund",
    title: "Partial Refund",
    description: "Keep the product and get a partial refund if it has minor defects you can live with.",
    icon: CreditCard,
    timeline: "3-5 business days",
  },
  {
    id: "pickup-return",
    title: "Free Pickup Return",
    description: "Schedule a free doorstep pickup — our courier will collect the item from your address.",
    icon: Truck,
    timeline: "Pickup in 1-2 days",
  },
  {
    id: "warranty-claim",
    title: "Warranty Claim",
    description: "File a warranty claim for products covered under manufacturer or extended warranty.",
    icon: AlertTriangle,
    timeline: "7-14 business days",
  },
];

const returnReasons = [
  "Product not as described",
  "Wrong item received",
  "Damaged or defective product",
  "Size doesn't fit",
  "Changed my mind",
  "Better price available elsewhere",
  "Product arrived too late",
];

const Returns = () => {
  const { user } = useAuth();
  const [orderNumber, setOrderNumber] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedType, setSelectedType] = useState("full-refund");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please log in to submit a return request.");
      return;
    }
    if (!orderNumber.trim() || !productTitle.trim() || !selectedReason) {
      toast.error("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("return_requests" as any).insert({
        user_id: user.id,
        order_number: orderNumber.trim(),
        product_title: productTitle.trim(),
        return_reason: selectedReason,
        return_type: selectedType,
        description: description.trim() || null,
      } as any);

      if (error) throw error;

      setSubmitted(true);
      toast.success("Return request submitted successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit return request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <RotateCcw className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-foreground mb-3">Returns & Refunds</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Not satisfied? No worries. We offer 7 flexible return options within 30 days of delivery.
            Your satisfaction is our priority.
          </p>
        </div>
      </section>

      {/* 7 Return Options */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            7 Ways to Return or Get Resolution
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {returnOptions.map((opt) => (
              <Card
                key={opt.id}
                className="p-5 hover:shadow-lg transition-shadow border-border group"
              >
                <opt.icon className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-foreground mb-1">{opt.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{opt.description}</p>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {opt.timeline}
                </span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Return Request Form */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
              Submit a Return Request
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              Fill out the form below and our team will process your return within 24 hours.
            </p>

            {!user ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Please log in to submit a return request.
                </p>
                <Link to="/auth">
                  <Button>Log In / Sign Up</Button>
                </Link>
              </Card>
            ) : submitted ? (
              <Card className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Request Submitted!</h3>
                <p className="text-muted-foreground mb-4">
                  We've received your return request for order <strong>{orderNumber}</strong>. 
                  Our team will review it and get back to you within 24 hours.
                </p>
                <Button onClick={() => { setSubmitted(false); setOrderNumber(""); setProductTitle(""); setSelectedReason(""); setDescription(""); }}>
                  Submit Another
                </Button>
              </Card>
            ) : (
              <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="orderNumber">Order Number *</Label>
                      <Input
                        id="orderNumber"
                        placeholder="ORD-20260308-XXXX"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        required
                        maxLength={50}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productTitle">Product Name *</Label>
                      <Input
                        id="productTitle"
                        placeholder="e.g. Classic White T-Shirt"
                        value={productTitle}
                        onChange={(e) => setProductTitle(e.target.value)}
                        required
                        maxLength={200}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Reason for Return *</Label>
                    <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
                      {returnReasons.map((reason) => (
                        <div key={reason} className="flex items-center space-x-2">
                          <RadioGroupItem value={reason} id={reason} />
                          <Label htmlFor={reason} className="font-normal cursor-pointer">
                            {reason}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Resolution *</Label>
                    <RadioGroup value={selectedType} onValueChange={setSelectedType}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {returnOptions.map((opt) => (
                          <div
                            key={opt.id}
                            className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedType === opt.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => setSelectedType(opt.id)}
                          >
                            <RadioGroupItem value={opt.id} id={`type-${opt.id}`} />
                            <Label htmlFor={`type-${opt.id}`} className="font-normal cursor-pointer text-sm">
                              {opt.title}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Additional Details (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the issue or provide any additional information..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={1000}
                      rows={4}
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-4 w-4" />
                        Submit Return Request
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Policy Summary */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-xl font-bold text-foreground mb-4">Return Policy Summary</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>Returns accepted within <strong>30 days</strong> of delivery.</li>
            <li>Products must be unused, unworn, and in original packaging with tags.</li>
            <li>Refunds are processed within 5-7 business days after we receive the return.</li>
            <li>Exchange and replacement requests are fulfilled within 3-5 business days.</li>
            <li>Sale items and personalised products are final sale — no returns.</li>
            <li>Free pickup available for all return types across India.</li>
            <li>Warranty claims require proof of purchase and product serial number.</li>
          </ul>
        </div>
      </section>

      <ChatWidget />
    </div>
  );
};

export default Returns;
