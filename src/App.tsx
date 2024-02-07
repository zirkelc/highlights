import { useEffect, useRef, useState } from "react";
import { RecognizeResult } from "tesseract.js";
import { ColorPicker } from "./components/ColorPicker";
import { ImagePreview } from "./components/ImagePreview";
import { ImageUpload } from "./components/ImageUpload";
import { TextRenderer } from "./components/TextRenderer";
import { ColorRange, HSV, RGB } from "./libs/color";
import { applyMask, colorSegmentation, recognize, threshold } from "./libs/ocr";
import { Container } from "./components/Container";
import { Tabs } from "./components/Tabs";
import { Carousel, CarouselItem } from "./components/Carousel";



function App() {
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  }>();
  const [canvas, setCanvas] = useState<HTMLCanvasElement | undefined>(undefined);
  const [canvas2, setCanvas2] = useState<HTMLCanvasElement | undefined>(undefined);
  const [canvas4, setCanvas4] = useState<HTMLCanvasElement | undefined>(undefined);

  const containerRef = useRef<HTMLDivElement>(null);

  const [result, setResult] = useState<RecognizeResult>();
  const [progress, setProgress] = useState<number>();
  const [color, setColor] = useState<ColorRange<HSV> | undefined>();

  const handleClearImage = () => {
    setImage(undefined)
    setResult(undefined)
    setColor(undefined)
  };

  const handleImageUpload = (file: File) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onloadend = (readEvent) => {
      const src = readEvent.target?.result?.toString();
      if (!src) throw Error("Could not read file...");

      const newImage = new Image();
      newImage.src = src;
      newImage.onload = () => {
        const rect = containerRef.current?.getBoundingClientRect();

        const availableWidth = rect?.width ?? Number.POSITIVE_INFINITY;
        const reducedImageWidth = Math.min(newImage.width, availableWidth);
        const scaleFactor = reducedImageWidth / newImage.width;

        const width = reducedImageWidth;
        const height = newImage.height * scaleFactor;

        setImageSize({ width, height });
        setImage(newImage);
      };
    };

    // const src = URL.createObjectURL(file);
    // const newImage = new Image()
    // newImage.crossOrigin = 'Anonymous'
    // newImage.onload = () => setImage(newImage);
    // newImage.src = src
  };

  const handleColorChange = (rgb: RGB) => {
    // const hsv = RGB.toHSV(rgb);
    console.log("color", { rgb });

    // convert RGB to HSV
    const hsv = RGB.toHSV(rgb);

    // create a color range for the mask
    const [lower, upper] = HSV.range(hsv, [20, 40, 40]);

    setProgress(undefined);
    setColor({ lower, upper, current: hsv });
  };

  useEffect(() => {
    if (!image) return;

    console.log("size", imageSize);

    // setLoading(true);
    // setProgress(0);

    const run = async () => {
      try {
        // TODO create one working canvas for OCR re-do all steps for ImagePreview?

        const thresholdCanvas = threshold(image);
        setCanvas(thresholdCanvas);

        let maskCanvas: HTMLCanvasElement | undefined = undefined;
        if (color) {
          maskCanvas = colorSegmentation({
            srcImg: image,
            lowerHsv: color.lower,
            upperHsv: color.upper,
          });
          setCanvas2(maskCanvas);

          const imageMaskedCanvas = applyMask(image, maskCanvas);
          setCanvas4(imageMaskedCanvas);
        }

        const result = await recognize({
          srcImg: thresholdCanvas, maskImg: maskCanvas,
          thresholdPercentage: 25,
          onProgress: (progress) => setProgress(progress)
        });
        console.log(result);
        setResult(result);

        //     // setLoading(false);
      } catch (error) {
        // const e = cv.exceptionFromPtr(error);
        console.error(error);
        // setLoading(false);
      }
    };

    run();
  }, [image, imageSize, color]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-100">
      <h1 className="text-4xl font-bold font-mono text-gray-800 p-4">
        Highlights
      </h1>
      <p className="font-mono">
        Upload an image to start the OCR process.<br />If the image contains highlights, use the color picker to select the highlight color.
      </p>


      <div className="container mx-auto p-4">
        <div className="grid xl:grid-cols-2 gap-4">
          <Container ref={containerRef}>
            {image ? (
              // TODO resize each canvas again on window resize
              <div>
                {/* <Tabs /> */}
                <Carousel>
                  <CarouselItem active>
                    <ColorPicker
                      onColorChange={handleColorChange}
                      onClearImage={handleClearImage}
                      image={image}
                      size={imageSize}
                    />
                  </CarouselItem>
                  {canvas ? (
                    <CarouselItem>
                      <ImagePreview image={image} size={imageSize} sourceCanvas={canvas} />
                    </CarouselItem>
                  ) : null}
                  {canvas2 ? (
                    <CarouselItem>
                      <ImagePreview image={image} size={imageSize} sourceCanvas={canvas2} />
                    </CarouselItem>
                  ) : null}
                  {canvas4 ? (
                    <CarouselItem>
                      <ImagePreview image={image} size={imageSize} sourceCanvas={canvas4} />
                    </CarouselItem>
                  ) : null}
                </Carousel>

                {/* 
                <ImagePreview image={image} sourceCanvas={canvas} />
                <ImagePreview image={image} sourceCanvas={canvas2} />
                <ImagePreview image={image} sourceCanvas={canvas3} />
                <ImagePreview image={image} sourceCanvas={canvas4} /> */}
              </div>
            ) : (
              <div>
                <ImageUpload onUpload={handleImageUpload} />
              </div>
            )}
          </Container>
          <Container>
            <TextRenderer highlightColor={color?.current} result={result} progress={progress} />
          </Container>
        </div>
      </div>
    </main>
  );
}

export default App;
