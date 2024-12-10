import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function ImageButton({
    src,
    alt,
    name,
    onClick,
}: {
    src: string;
    alt: string;
    name: string;
    onClick?: () => void;
}) {
    return (
        <div
            className={cn(
                "flex",
                "items-center",
                "space-x-4",
                "p-2",
                "hover:bg-secondary",
                "rounded-md",
                "cursor-pointer"
            )}
            onClick={onClick}
        >
            <Avatar>
                <AvatarImage src={src} />
                <AvatarFallback>{alt}</AvatarFallback>
            </Avatar>
            <div className="flex-1">{name}</div>
        </div>
    );
}
