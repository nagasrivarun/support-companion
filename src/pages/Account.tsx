import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User, Package, MapPin, Plus, Trash2, Loader2, 
  LogOut, Edit2, Check, X, Home, Building
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Address {
  id: string;
  label: string;
  full_name: string;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

const countries = [
  "India", "United States", "United Kingdom", "Canada", 
  "Australia", "Germany", "France", "UAE"
];

const Account = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    is_default: false
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAddresses();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setProfile(data);
      setEditName(data?.full_name || "");
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from("customer_addresses")
        .select("*")
        .eq("user_id", user!.id)
        .order("is_default", { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: editName.trim() })
        .eq("user_id", user!.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, full_name: editName.trim() } : null);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!addressForm.full_name || !addressForm.address_line1 || !addressForm.city || 
        !addressForm.state || !addressForm.postal_code) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      if (editingAddress) {
        const { error } = await supabase
          .from("customer_addresses")
          .update({
            ...addressForm,
            phone: addressForm.phone || null,
            address_line2: addressForm.address_line2 || null
          })
          .eq("id", editingAddress.id);

        if (error) throw error;
        toast.success("Address updated successfully");
      } else {
        const { error } = await supabase
          .from("customer_addresses")
          .insert({
            user_id: user!.id,
            ...addressForm,
            phone: addressForm.phone || null,
            address_line2: addressForm.address_line2 || null
          });

        if (error) throw error;
        toast.success("Address added successfully");
      }

      setShowAddressDialog(false);
      setEditingAddress(null);
      resetAddressForm();
      fetchAddresses();
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const { error } = await supabase
        .from("customer_addresses")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success("Address deleted");
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      // Remove default from all addresses
      await supabase
        .from("customer_addresses")
        .update({ is_default: false })
        .eq("user_id", user!.id);

      // Set new default
      const { error } = await supabase
        .from("customer_addresses")
        .update({ is_default: true })
        .eq("id", id);

      if (error) throw error;
      fetchAddresses();
      toast.success("Default address updated");
    } catch (error) {
      console.error("Error setting default address:", error);
      toast.error("Failed to update default address");
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      label: "Home",
      full_name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
      is_default: false
    });
  };

  const openEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      label: address.label,
      full_name: address.full_name,
      phone: address.phone || "",
      address_line1: address.address_line1,
      address_line2: address.address_line2 || "",
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default
    });
    setShowAddressDialog(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Account</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="addresses" className="gap-2">
              <MapPin className="h-4 w-4" />
              Addresses
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingProfile ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={user.email || ""} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Enter your name"
                          />
                          <Button size="icon" onClick={handleUpdateProfile} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </Button>
                          <Button size="icon" variant="outline" onClick={() => setIsEditing(false)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input value={profile?.full_name || "Not set"} disabled />
                          <Button size="icon" variant="outline" onClick={() => setIsEditing(true)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View your past orders and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    When you make a purchase, your orders will appear here
                  </p>
                  <Button onClick={() => navigate("/shop")}>
                    Start Shopping
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Saved Addresses</CardTitle>
                  <CardDescription>Manage your delivery addresses</CardDescription>
                </div>
                <Dialog open={showAddressDialog} onOpenChange={(open) => {
                  setShowAddressDialog(open);
                  if (!open) {
                    setEditingAddress(null);
                    resetAddressForm();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
                      <DialogDescription>
                        Enter the delivery address details
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Label</Label>
                          <Select
                            value={addressForm.label}
                            onValueChange={(value) => setAddressForm(prev => ({ ...prev, label: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Home">
                                <div className="flex items-center gap-2">
                                  <Home className="h-4 w-4" /> Home
                                </div>
                              </SelectItem>
                              <SelectItem value="Work">
                                <div className="flex items-center gap-2">
                                  <Building className="h-4 w-4" /> Work
                                </div>
                              </SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Country *</Label>
                          <Select
                            value={addressForm.country}
                            onValueChange={(value) => setAddressForm(prev => ({ ...prev, country: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map(country => (
                                <SelectItem key={country} value={country}>{country}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input
                          value={addressForm.full_name}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, full_name: e.target.value }))}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Address Line 1 *</Label>
                        <Input
                          value={addressForm.address_line1}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, address_line1: e.target.value }))}
                          placeholder="Street address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Address Line 2</Label>
                        <Input
                          value={addressForm.address_line2}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, address_line2: e.target.value }))}
                          placeholder="Apartment, suite, etc."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>City *</Label>
                          <Input
                            value={addressForm.city}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="City"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>State *</Label>
                          <Input
                            value={addressForm.state}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                            placeholder="State/Province"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Postal Code *</Label>
                        <Input
                          value={addressForm.postal_code}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, postal_code: e.target.value }))}
                          placeholder="Postal/ZIP code"
                        />
                      </div>
                      <Button onClick={handleSaveAddress} className="w-full" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          editingAddress ? "Update Address" : "Add Address"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {isLoadingAddresses ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No saved addresses</p>
                    <p className="text-sm text-muted-foreground">
                      Add an address for faster checkout
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`p-4 rounded-lg border ${
                          address.is_default ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {address.label === "Home" ? (
                              <Home className="h-4 w-4 text-muted-foreground" />
                            ) : address.label === "Work" ? (
                              <Building className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="font-medium text-foreground">{address.label}</span>
                            {address.is_default && (
                              <Badge variant="secondary" className="text-xs">Default</Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => openEditAddress(address)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteAddress(address.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p className="font-medium text-foreground">{address.full_name}</p>
                          {address.phone && <p>{address.phone}</p>}
                          <p>{address.address_line1}</p>
                          {address.address_line2 && <p>{address.address_line2}</p>}
                          <p>{address.city}, {address.state} {address.postal_code}</p>
                          <p>{address.country}</p>
                        </div>
                        {!address.is_default && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => handleSetDefault(address.id)}
                          >
                            Set as Default
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ChatWidget />
    </div>
  );
};

export default Account;
