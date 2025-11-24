import { Link } from "react-router-dom";

function ProfilePicture({ pictureUrl, size, intitial = null, username = null }) {
    const sizeClasses = {
        xs: "w-8 h-8",
        sm: "w-12 h-12",
        md: "w-24 h-24",
        lg: "w-32 h-32",
        xl: "w-40 h-40"
    }

    const sizeClass = sizeClasses[size] || sizeClasses.md;

    const content = (
        <>
            {pictureUrl ? (
                <img
                    src={pictureUrl}
                    alt="Preview"
                    className={`${sizeClass} ml-auto mr-auto rounded-full object-cover border-2 border-gray-300`}
                />
            ) : (
                <div className={`${sizeClass} ml-auto mr-auto rounded-full bg-gray-200 flex items-center justify-center text-gray-500`}>
                    {intitial ? intitial : "BirdQuest"}
                </div>
            )}
        </>
    );

    if (username) {
        return (
            <Link to={`/profile/${username}`} className="inline-block">
                {content}
            </Link>
        );
    }

    return content;
}

export default ProfilePicture;