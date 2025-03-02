import Link from "next/link";

export default function Home() {
    return (
        <>
            <div className="flex w-full h-full absolute overflow-hidden">
                <div className="flex justify-center items-center w-full h-full bg-red-800">
                    <Link href="/" className="text-2xl font-bold text-center">
                        Send back
                    </Link>
                </div>
            </div>
        </>
    );
}
