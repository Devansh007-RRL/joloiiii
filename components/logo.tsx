import { cn } from "@/lib/utils";

export function LogoIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn(className)}
            {...props}
        >
            <path d="M32 58C46.3594 58 58 46.3594 58 32C58 17.6406 46.3594 6 32 6C17.6406 6 6 17.6406 6 32C6 46.3594 17.6406 58 32 58Z" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            <g stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="stroke-primary-foreground">
                <path d="M24 24H40"/>
                <path d="M24 32H40"/>
                <path d="M27 18C27 18 30 18 34 24C38 30 34 36 30 36H24L38 46"/>
            </g>
        </svg>
    )
}
