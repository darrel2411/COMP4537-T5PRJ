import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Navbar from "@/components/Navbar/Navbar";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { WeatherBadge } from "@/components/Weather/WeatherBadge";
import { User as ProfileIcon, BarChart3 } from "lucide-react";

import en from "./en";

function Landing() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const LOGO_URL = "/logo.png";

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [displayImage, setDisplayImage] = useState(LOGO_URL);

  // for profile settings purpose
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const fileInputRef = useRef(null);
  const API_BASE = import.meta.env.VITE_API_BASE;

  // Fetch a random bird image when component mounts
  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  const onPick = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setResult(null);
    setError("");
    if (f) {
      const url = URL.createObjectURL(f);
      setDisplayImage(url);
    } else {
      // no file selected, fall back to logo
      setDisplayImage(LOGO_URL);
    }
  };

  const handleTakePhoto = () => {
    // Trigger file input which will allow user to choose camera or file
    // On mobile devices, this will show options for camera or file picker
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (!file) return setError("Please choose an image first.");
    setUploadLoading(true);
    setError("");
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch(`${API_BASE}/api/analyze-bird`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Server ${res.status}: ${text || "upload failed"}`);
      }
      const data = await res.json().catch(() => ({}));
      setResult(data);

      // update user stats in context
      setUser((prev) => {
        if (!prev) return prev;

        // score coming from backend response
        const newScore = data.score; // fallback if backend didn’t send it

        return {
          ...prev,
          apiConsumption: (prev.apiConsumption ?? 0) + 1,
          score: newScore,
        };
      });

      // hide Predict / Cancel buttons after a successful upload
      setFile(null);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/delete-user/${user.email}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));
      console.log("Delete response:", { status: res.status, data });

      if (!res.ok || !data.ok) {
        throw new Error(data.msg || "Failed to delete user");
      }

      setUser(null);
      alert("Account deleted successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to delete account");
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setProfileError("");
    setProfileSuccess("");
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    const payload = {};

    if (name && name !== user.name) {
      payload.name = name.trim();
    }

    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    if (Object.keys(payload).length === 0) {
      setProfileError("Nothing to update.");
      return;
    }

    setSavingProfile(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const res = await fetch(
        `${API_BASE}/user/${encodeURIComponent(user.email)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.msg || "Failed to update profile");
      }

      // update context name if changed
      if (payload.name) {
        setUser((prev) => (prev ? { ...prev, name: payload.name } : prev));
      }

      setProfileSuccess("Profile updated successfully.");
      setIsEditing(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setProfileError(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* row with Popover on the left, Profile on the right */}
      <div className="flex items-center px-4 pt-4">
        {/* Left side: Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="rounded-full h-16 w-16 border-gray-300 shadow-sm flex items-center justify-center  animate-pulse"
              aria-label="Open stats"
            >
              <BarChart3 className="h-8 w-8" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Stats</h4>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="width">Score</Label>
                  <Input
                    id="width"
                    value={user.score}
                    className="col-span-2 cursor-not-allowed"
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="width">Calls</Label>
                  <Input
                    id="width"
                    value={`${user?.apiConsumption ?? 0} / 20`}
                    className="col-span-2 cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Right side: Profile sheet */}
        <div className="ml-auto">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full h-16 w-16 border-gray-300 shadow-sm flex items-center justify-center"
                aria-label="Open profile settings"
              >
                <ProfileIcon className="h-8 w-8" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-center text-3xl font-semibold">
                  Profile Settings
                </SheetTitle>
                <SheetDescription className="text-center">
                  Manage your profile information and account settings.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-6">
                {/* Profile fields */}
                <div className="space-y-4">
                  <FieldSeparator />

                  <FieldGroup className="pt-4 space-y-4">
                    {/* Email – read only */}
                    <Field>
                      <FieldLabel>Email</FieldLabel>
                      <Input
                        value={user?.email || ""}
                        readOnly
                        className="bg-gray-100 cursor-not-allowed"
                      />
                      <FieldDescription>
                        Email cannot be changed
                      </FieldDescription>
                    </Field>

                    {/* Name – controlled, disabled when not editing */}
                    <Field>
                      <FieldLabel>Name</FieldLabel>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={!isEditing}
                        required
                      />
                    </Field>

                    {/* Passwords – controlled, disabled when not editing */}
                    <Field>
                      <FieldLabel>Current Password</FieldLabel>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={!isEditing}
                        placeholder="************"
                      />
                    </Field>

                    <Field>
                      <FieldLabel>New Password</FieldLabel>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={!isEditing}
                        placeholder="************"
                      />
                      <FieldDescription>
                        Leave password fields empty if you only want to change
                        your name.
                      </FieldDescription>
                    </Field>
                  </FieldGroup>

                  {/* error / success messages */}
                  {profileError && (
                    <p className="mt-1 text-sm text-red-600">{profileError}</p>
                  )}
                  {profileSuccess && (
                    <p className="mt-1 text-sm text-green-600">
                      {profileSuccess}
                    </p>
                  )}

                  {/* actions */}
                  <div className="mt-4 flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={handleEditProfile}
                      disabled={isEditing}
                    >
                      Edit
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleSaveProfile}
                      disabled={!isEditing || savingProfile}
                    >
                      {savingProfile ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>

                {/* Danger zone */}
                {user && (
                  <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold text-destructive">
                        Danger zone
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        This action cannot be undone. Deleting your account will
                        permanently remove your data from our servers.
                      </p>
                    </div>

                    <Button
                      variant="destructive"
                      onClick={handleDeleteUser}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? "Deleting..." : "Delete Account"}
                    </Button>
                  </section>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center min-h-[calc(80vh-4rem)] px-4 py-8">
        {/* Greeting banner */}
        <div className="w-full max-w-2xl mb-8">
          <div className="rounded-2xl bg-linear-to-r from-blue-500 to-indigo-500 px-6 py-4 shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">
                {user ? `Hi, ${user.name}!` : "Welcome back!"}
              </p>
              <p className="mt-1 text-sm text-white">
                Ready to spot your next bird? Upload a photo and we’ll help you
                identify it.
              </p>
            </div>
            {/* Weather widget on the right (hidden on very small screens) */}
            <div className="hidden sm:block">
              <WeatherBadge />
            </div>
          </div>
        </div>
        {/* Center image: logo or user photo */}
        <div className="mb-8 max-w-md w-full">
          <img
            src={displayImage}
            alt="Bird preview"
            className="w-full max-w-md max-h-[500px] rounded-lg shadow-lg object-contain bg-gray-100"
          />
        </div>

        {/* Take a Photo Button */}
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={handleTakePhoto}
            className="px-8 py-3 text-lg font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            Take a photo
          </Button>

          {/* Hidden file input - supports both camera and file upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onPick}
            className="hidden"
          />

          {/* Preview of selected image */}
          {file && (
            <div className="mt-4 w-full max-w-md">
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploadLoading || loading}
                  className="flex-1"
                >
                  {uploadLoading ? en.MESSAGE.UPLOADING : en.MESSAGE.PREDICT}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                    setDisplayImage(LOGO_URL);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

          {result && (
            <div className="mt-4 w-full max-w-md bg-white p-4 rounded-lg shadow-md">
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Landing;
