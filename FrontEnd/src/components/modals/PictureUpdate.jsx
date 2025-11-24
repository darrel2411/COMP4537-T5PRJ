import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import ProfilePicture from "@/components/user/ProfilePicture";
import { useUser } from "@/context/UserContext";

function PictureUpdate({ open, setOpen }) {
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

        try {
            const response = await fetch(`${API_BASE}/uploadImage`, {
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
                setOpen(false);
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
        <Dialog open={open} onClose={setOpen} className="relative z-10">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                    >
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <div className='flex gap-3'>
                                        <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                                            <ExclamationTriangleIcon aria-hidden="true" className="size-6" />
                                        </div>
                                        <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                                            Update profile picture
                                        </DialogTitle>
                                    </div>
                                    <div className="grid place-items-center mt-2 space-y-4">
                                        <div className='' id="imageProfile">
                                            <ProfilePicture pictureUrl={previewUrl} />
                                        </div>


                                        <label
                                            htmlFor="profileImage"
                                            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                                        >
                                            Choose Image
                                        </label>
                                        <input
                                            id="profileImage"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />

                                        {error && (
                                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                                {error}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 gap-3 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">

                            <Button onClick={handleSubmit}>
                                {loading ? 'Changing Profile Picture...' : 'Change Profile Picture'}
                            </Button>
                            <Button onClick={() => {
                                setOpen(false);
                                setPreviewUrl(user?.img_url);
                                setSelectedImage(null);
                            }} variant='outline'>
                                Cancel
                            </Button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}

export default PictureUpdate;