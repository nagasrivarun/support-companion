import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { useToast } from "@/hooks/use-toast";

export function LovableLoginButton() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLovableLogin = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("lovable", {
        redirect_uri: window.location.origin,
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: result.error.message || "Failed to sign in with Lovable.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleLovableLogin}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M12 2a5.5 5.5 0 0 1 5.5 5.5c0 .63-.11 1.24-.3 1.81A5.5 5.5 0 0 1 19 19.2a5.5 5.5 0 0 1-8.7 1.3A5.5 5.5 0 0 1 4.3 8.7 5.5 5.5 0 0 1 12 2Z"
          />
        </svg>
      )}
      Sign in with Lovable
    </Button>
  );
}
