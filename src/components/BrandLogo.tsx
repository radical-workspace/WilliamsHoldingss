"use client";
import Image from "next/image";
import { useState } from "react";

type Props = {
	width: number;
	height: number;
	rounded?: number;
};

export default function BrandLogo({ width, height, rounded = 8 }: Props) {
	const [src, setSrc] = useState("/logo-williams-holdings.png");
	return (
		<Image
			src={src}
			alt="Williams Holdings"
			width={width}
			height={height}
			priority
			sizes={`${width}px`}
			onError={() => setSrc("/favicon.svg")}
			style={{
				objectFit: "contain",
				borderRadius: rounded,
				background: "transparent",
			}}
		/>
	);
}
