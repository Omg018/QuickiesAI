import { SignIn, UserProfile, useUser, UserAvatar, SignOutButton, useClerk } from "@clerk/clerk-react"
import { LucideGamepad2, LogOut,LucideLayoutDashboard,LucidePencilLine,LucideFileEdit,LucideUserCheck,LucideEraser,LucideCameraOff,LucideImagePlus, LucideUsers } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";

const Sidebar = ({ sidebar, setSidebar }) => {
    const { isLoaded, isSignedIn, user } = useUser();
    const {signOut, openUserProfile} = useClerk();
    const navigate = useNavigate();


    if (!isLoaded) {
        return null; 
    }

    if (!isSignedIn) {
        return null;
    }

    const navitems = [
        { name: "Dashboard", icon: <LucideLayoutDashboard />, path: "/ai/dashboard" },
        { name: "BlogTitles", icon: <LucidePencilLine />, path: "/ai/Blog-Titles" },
        { name: "WriteArticle", icon: <LucideFileEdit />, path: "/ai/write-article" },
        { name: "ReviewResume", icon: <LucideUserCheck />, path: "/ai/review-resume" },
        { name: "RemoveObject", icon: <LucideEraser />, path: "/ai/remove-object" },
        { name: "RemoveBackground", icon: <LucideCameraOff />, path: "/ai/remove-background" },
        { name: "GenerateImages", icon: <LucideImagePlus />, path: "/ai/generate-images" },
        { name: "Community", icon: <LucideUsers />, path: "/ai/community" },
        { name: "Game", icon: <LucideGamepad2 />, path: "/ai/Game" },
    ]
    return (
        <div>
            <div className="relative flex h-[calc(100vh-57px)] w-full max-w-[20rem] flex-col rounded-xl bg-white bg-clip-border p-4 text-gray-700 shadow-xl shadow-blue-gray-900/5">
                <div className="p-4 mb-2 flex flex-col justify-center items-center">
                    <UserAvatar className="rounded-full w-12 h-12" /> 
                    <div className="mt-2 font-semibold text-lg text-gray-900">{user.fullName || user.emailAddresses[0].emailAddress}</div>
                </div>

                <nav className="flex min-w-[240px] flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700 overflow-y-auto">
                    {navitems.map((item, index) => {
                        return (
                            <NavLink
                                key={index}
                                to={item.path}
                                className={({ isActive }) => 
                                    `flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start cursor-pointer 
                                     ${isActive 
                                        ? 'bg-amber-600 text-white font-medium' // Active styles
                                        : 'text-blue-gray-700 hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900' // Default styles
                                     }`
                                }
                                role="button"
                            >
                                <div className={`grid mr-4 place-items-center`}>
                                    {item.icon}
                                </div>
                                {item.name}
                            </NavLink>
                        );
                    })}
                </nav>

             
                <div className="p-2 border-t mt-auto">
                    <div 
                        className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start "
                                  
                    >
                        <div className="place-items-center flex flex-row cursor-pointer">
                            <div onClick={openUserProfile} className="flex items-center flex-row mr-4">
                                <img src={user.imageUrl} alt="" className="w-12 h-12 rounded-full mr-3" />
                                {user.fullName}
                            </div>
                            
                            <LogOut onClick={signOut} className="w-4 text-gray-400 hover:text-gray-600"/>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sidebar
