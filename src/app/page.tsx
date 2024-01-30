"use client";

import { ColorPicker } from "@/components/ColorPicker";
import { ImageUpload } from "@/components/ImageUpload";
import { TextRenderer } from "@/components/TextRenderer";
import { applyMask, colorSegmentation, denoise, recognize, threshold } from "@/libs/ocr";
import { useEffect, useMemo, useState } from "react";
import { RecognizeResult } from "tesseract.js";

export default function Home() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [result, setResult] = useState<RecognizeResult>();

  // const clearImage = () => setImage(null);

  const handleImageUpload = (file: File) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onloadend = (readEvent) => {
      const src = readEvent.target?.result?.toString();
      if (!src)
        throw Error("Could not read file...");

      const newImage = new Image();
      newImage.src = src;
      newImage.onload = () => {
        setImage(newImage);
      };
    };

    // const src = URL.createObjectURL(file);
    // const newImage = new Image()
    // newImage.crossOrigin = 'Anonymous'
    // newImage.onload = () => setImage(newImage);
    // newImage.src = src
  };

  const handleColorChange = (color: { red: number; green: number; blue: number }) => {
    console.log(color);
  }

  useEffect(() => {
    if (!image) return;

    // setLoading(true);

    const run = async () => {

      try {
        threshold(image, imageThresholdedRef.current);

        colorSegmentation(image, imageMaskRef.current);

        denoise(imageMaskRef.current, imageDenoisedRef.current);

        applyMask(image, imageMaskOnOriginalRef.current, imageDenoisedRef.current);

        const result = await recognize(
          imageThresholdedRef.current,
          imageDenoisedRef.current,
          25,
        );
        console.log(result);
        setResult(result);

        // setLoading(false);
      } catch (error) {
        // const e = cv.exceptionFromPtr(error);
        console.error(error);
        // setLoading(false);
      }
    };

    run();
  }, [image]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">

      <div className="container mx-auto p-4">
        <div className="grid xl:grid-cols-2 gap-4">
          <div className="bg-red-200 p-4">
            {image
              ? (<ColorPicker onColorChange={handleColorChange} image={image} />)
              : (
                <ImageUpload onUpload={handleImageUpload} />
              )}
          </div>
          <div className="bg-blue-200 p-4">
            <TextRenderer result={result} />
          </div>
        </div>
      </div>

      {/* <div className="mb-32 grid w-full grid-cols-2">

        <div className="rounded-lg border ">
          {image
            ? (<ColorPicker onColorChange={handleColorChange} image={image} />)
            : (
              <ImageUpload onUpload={handleImageUpload} />
            )}

        </div>


        <div className="rounded-lg border ">
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Find in-depth information about Next.js features and API.
          </p>
        </div> */}

      {/* <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Docs{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Find in-depth information about Next.js features and API.
          </p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Learn{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Learn about Next.js in an interactive course with&nbsp;quizzes!
          </p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Templates{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Explore starter templates for Next.js.
          </p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Deploy{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50 text-balance`}>
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a> */}
      {/* </div> */}
    </main >
  );
}
