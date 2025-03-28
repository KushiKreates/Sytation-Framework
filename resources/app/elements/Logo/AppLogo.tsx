import clsx from 'clsx';
import { LucideBook } from 'lucide-react';


interface AppLogoProps {
    className?: string;
}

export default function AppLogo({ className }: AppLogoProps) {
    return (
        <>
            <div className={clsx(
                "bg-sidebar-primary text-sidebar-primary-foreground ml-3",
                "flex aspect-square size-8 items-center justify-center rounded-md"
            )}>
                <LucideBook  className="size-5 text-white dark:text-black" />
            </div>
            <div className={clsx(
                " grid flex-1 text-left text-sm"
            )}>
                {/*<span className={clsx(
                    "mb-0.5 truncate ml-3 leading-none font-semibold"
                )}> Study Labs</span>*/}
            </div>
        </>
    );
}