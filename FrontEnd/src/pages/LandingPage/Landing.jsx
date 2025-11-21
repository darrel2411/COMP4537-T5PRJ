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
import en from "./en";

function Landing() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [randomBirdImage, setRandomBirdImage] = useState("");

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
    fetchRandomBirdImage();
  }, [user]);

  const fetchRandomBirdImage = () => {
    // Using a random bird image from Unsplash Source API (no auth required)
    // This generates a random bird image each time
    const birdImages = [
      "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1549608276-5786777e6587?w=800&h=600&fit=crop",
    ];

    // Pick a random bird image
    const randomIndex = Math.floor(Math.random() * birdImages.length);
    setRandomBirdImage(birdImages[randomIndex]);
  };

  const onPick = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setResult(null);
    setError("");
    if (f) setPreview(URL.createObjectURL(f));
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
      <div className="flex justify-end px-4 pt-4">
        <Sheet>
          <SheetTrigger className="px-4 py-2">Profile</SheetTrigger>

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
                    <FieldDescription>Email cannot be changed</FieldDescription>
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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
        {/* Random Bird Image in the center */}
        <div className="mb-8">
          {randomBirdImage ? (
            <img
              src={randomBirdImage}
              alt="Random bird"
              className="max-w-md w-full h-auto rounded-lg shadow-lg object-cover"
              style={{ maxHeight: "500px" }}
            />
          ) : (
            <div className="max-w-md w-full h-96 bg-gray-200 rounded-lg shadow-lg flex items-center justify-center">
              <p className="text-gray-500">Loading bird image...</p>
            </div>
          )}
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
          {preview && (
            <div className="mt-4 w-full max-w-md">
              <img
                src={preview}
                alt="Preview"
                className="w-full rounded-lg shadow-md"
              />
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
                    setPreview("");
                    setFile(null);
                    setResult(null);
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
