import { Button } from "@/components/ui/button";
import ProfilePicture from "@/components/user/ProfilePicture";
import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { Spinner } from "../ui/spinner";

const PictureUpdateForm = () => {
    const { user, setUser } = useUser();
    const [error, setError] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_BASE = import.meta.env.VITE_API_BASE;

    useEffect(() => {
        setPreviewUrl(user?.img_url);
    }, [user?.img_url]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file)); // preview image before upload
        }
    };

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        if (!selectedImage) return alert("Please select an image first.");

        const formData = new FormData();
        formData.append("image", selectedImage); // field name matches upload.single('image')
        formData.append("userId", user.userId);

        try {
            const response = await fetch(`${API_BASE}/uploadProfileImage`, {
                method: "POST",
                body: formData, // Don't set Content-Type manually — the browser will do it
                credentials: "include", // send cookies
            });

            const data = await response.json();

            if (response.ok && data.img_url) {
                setUser((prev) => ({
                    ...prev,
                    img_url: data.img_url,
                }));
                setSelectedImage(null);
                setPreviewUrl(user.img_url);
            } else {
                setError(data.msg);
            }
        } catch (error) {
            console.error("Error uploading profile picture:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col ml-auto mr-auto space-y-2 w-[300px]">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <ProfilePicture
                pictureUrl={previewUrl}
                size={"lg"}
            />
            <div className="flex ml-auto mr-auto space-x-2">
                <label
                    htmlFor="profileImage"
                    className={`bg-gray-800 text-white px-4 py-2  rounded-md hover:bg-gray-700 w-40 text-center
                            ${loading ? "opacity-50 pointer-events-none" : ""}`}
                >
                    Update Image
                </label>
                <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                {
                    selectedImage && (
                        <Button className="bg-green-600 hover:bg-green-700 h-10" onClick={handleSubmit}>
                            {loading ? <Spinner/> : <span>Save</span>}
                        </Button>
                    )
                }

            </div>
        </div>
    );

}

export default PictureUpdateForm;