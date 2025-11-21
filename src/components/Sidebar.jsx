import { SignIn, UserProfile, useUser, UserAvatar } from "@clerk/clerk-react"
import { LucideAirplay, LucideShoppingBag, LucideMail, LucideUser, LucideSettings, LucideGamepad2 } from "lucide-react";
import { useNavigate } from "react-router-dom";


const Sidebar = ({ sidebar, setSidebar }) => {
    const { isLoaded, isSignedIn, user } = useUser();
    // const { signOut, openUserProfile } = useUser();
    const navigate = useNavigate();

    if (!isLoaded) {
        return null; // or a loading spinner component
    }

    if (!isSignedIn) {
        return null;
    }

    const navitems = [
        { name: "BlogTitles", icon: <LucideAirplay />, path: "/ai/Blog-Titles" },
        { name: "WriteArticle", icon: <LucideShoppingBag />, path: "/ai/write-article" },
        { name: "ReviewResume", icon: <LucideMail />, path: "/ai/review-resume" },
        { name: "RemoveObject", icon: <LucideUser />, path: "/ai/remove-object" },
        { name: "RemoveBackground", icon: <LucideSettings />, path: "/ai/remove-background" },
        { name: "GenerateImages", icon: <LucideSettings />, path: "/ai/generate-images" },
        { name: "Community", icon: <LucideSettings />, path: "/ai/community" },
        { name: "Game", icon: <LucideGamepad2 />, path: "/ai/game" },
    ]
    return (
        <div>
            <div className="relative flex h-[calc(100vh-57px)] w-full max-w-[20rem] flex-col rounded-xl bg-white bg-clip-border p-4 text-gray-700 shadow-xl shadow-blue-gray-900/5">
                <div className="p-4 mb-2 flex flex-col justify-center items-center">

                    <img src={user.imageUrl} alt={user.fullName || "User Avatar"} className="rounded-full w-15 h-15 " />
                    <div>{user.fullName}</div>
                </div>


                <nav className="flex min-w-[240px] flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700">

                    {navitems.map((item, index) => {
                        return (
                            <div key={index} role="button" className="flex items-center w-full p-3 cursor-pointer  hover:text-[18px]" onClick={() => navigate(item.path)}>
                                <div className={({isActive}) =>`bg-rose-500 flex items-center w-full ${isActive ? 'bg-amber-600 text-white' : ''}`}>
                                    {({isActive}) => (  <div className={`grid mr-4 place-items-center ${isActive ? 'text-white' : ''}}`}>
                                        {item.icon}
                                    </div>)}
                                  
                                
                                {item.name}
                                </div>
                            </div>
                        );
                    })}
                </nav>
            </div>
        </div>
    )
}

export default Sidebar
