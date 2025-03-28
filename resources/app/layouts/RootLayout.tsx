import { ReactNode } from "react";
import { Outlet } from "react-router-dom";


export default function RootLayout(props: { children?: ReactNode }) {
    return (
        
    <main className="">
        
        <Outlet />
       
    </main>
        
    );
}