import { cn } from "@/lib/utils";
import ImageButton from "./ImageButton";
import { useState } from "react";
import DeskWindow from "@/app/(wallpaper)/DeskWindow";

export const imgs = [
  { src: "814533.jpg", offset: { x: 0, y: 170 }, mirror: true },
  {
    src: "wp9252450-4k-nature-dual-monitor-wallpapers.jpg",
    offset: { x: 0, y: 0 },
    mirror: false,
  },
  {
    src: "wp7631361-2-monitor-wallpapers.jpg",
    offset: { x: 0, y: 0 },
    mirror: false,
  },
  {
    src: "wp9042733-fight-4k-dual-monitor-wallpapers.jpg",
    offset: { x: 0, y: 0 },
    mirror: false,
  },
  {
    src: "wp9252552-4k-nature-dual-monitor-wallpapers.jpg",
    offset: { x: -500, y: 0 },
    mirror: true,
  },
  {
    src: "img1.wallspic.com-futurism-illustration-digital_art-stage-capital_city-7785x3500.jpg",
    offset: { x: 0, y: 0 },
    mirror: false,
  },
  {
    src: "create-realistic-concept-art-environment-and-landscape-5dc4.jpg",
    offset: { x: 0, y: 0 },
    mirror: false,
  },
  { src: "tl4zsrio9wu91.png", offset: { x: 0, y: 0 }, mirror: false },
  {
    src: "landscape-horizon-wilderness-mountain-cloud-sky-457338-pxhere.com.jpg",
    offset: {
      x: 0,
      y: 300,
    },
    mirror: false,
  },
  {
    src: "lakeside-sunrise-early-morning-minimal-art-gradient-7680x3215-4587.png",
    offset: {
      x: 0,
      y: 0,
    },
    mirror: false,
  },
  {
    src: "pexels-markusspiske-144352.jpg",
    offset: {
      x: 0,
      y: 50,
    },
    mirror: true,
  },
  {
    src: "scenery-pink-lakeside-sunset-lake-landscape-scenic-panorama-7680x3215-144.png",
    offset: {
      x: 0,
      y: -100,
    },
    mirror: false,
  },
  {
    src: "pexels-dreamypixel-547115.jpg",
    offset: {
      x: 0,
      y: 0,
    },
    mirror: false,
  },
  {
    src: "dual-monitor-nebula-wallpaper-eac08bc76ddaadf923043caf9a5b8d3f.jpg",
    offset: {
      x: 0,
      y: 0,
    },
    mirror: false,
  },
  {
    src: "BEAUTIFUL FLOWER FIELD 562023.jpg",
    offset: {
      x: 0,
      y: 0,
    },
    mirror: false,
  },
];

export default function ImagePicker(props: {
  setImg: (img: {
    src: string;
    offset: { x: number; y: number };
    mirror: boolean;
  }) => void;
}) {
  const [show, setShow] = useState(false);

  return (
    <>
      {!show && (
        <div
          className={cn(
            "absolute",
            "top-0",
            "left-0",
            "bg-background",
            "cursor-pointer",
            "p-2",
            "rounded-br-xl",
            "z-10",
          )}
          onClick={() => setShow(true)}
        >
          Show
        </div>
      )}
      {show && (
        <DeskWindow
          default={{ x: 2700, y: 500, width: 600, height: 1000 }}
          onClosed={() => setShow(false)}
        >
          <div className="flex flex-col">
            {imgs.map((img, idx) => (
              <ImageButton
                key={idx}
                src={img.src}
                alt={img.src.substring(0, 2)}
                name={img.src}
                onClick={() => {
                  props.setImg(img);
                }}
              />
            ))}
          </div>
        </DeskWindow>
      )}
    </>
  );
}
