import { useEffect, useRef, useState } from 'react';
import type { RecognizeResult } from 'tesseract.js';
import { Carousel, CarouselItem } from './components/Carousel';
import { ColorPicker } from './components/ColorPicker';
import { Container } from './components/Container';
import { ImagePreview } from './components/ImagePreview';
import { ImageUpload } from './components/ImageUpload';
import { Progress } from './components/Progress';
import { TextRenderer } from './components/TextRenderer';
import { type ColorRange, HSV, RGB } from './libs/color';
import { loadImage, useCanvasSize, useContainerSize } from './libs/image';
import { type RecognizeProgress, applyMask, colorSegmentation, recognize, threshold } from './libs/ocr';

function App() {
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useContainerSize(containerRef);
  const canvasSize = useCanvasSize(image, containerSize);

  const [canvas1, setCanvas1] = useState<HTMLCanvasElement | undefined>(undefined);
  const [canvas2, setCanvas2] = useState<HTMLCanvasElement | undefined>(undefined);
  const [canvas3, setCanvas3] = useState<HTMLCanvasElement | undefined>(undefined);

  const [result, setResult] = useState<RecognizeResult>();
  const [progress, setProgress] = useState<RecognizeProgress>();
  const [color, setColor] = useState<ColorRange<HSV> | undefined>();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('eng');

  const handleClearImage = () => {
    setImage(undefined);
    setResult(undefined);
    setColor(undefined);
  };

  const handleImageUpload = async (file: File) => {
    const image = await loadImage(file);
    setImage(image);
  };

  const handleColorChange = (rgb: RGB) => {
    /** convert RGB to HSV */
    const hsv = RGB.toHSV(rgb);

    /** create a color range for the mask */
    const [lower, upper] = HSV.range(hsv, [20, 40, 40]);
    setColor({ lower, upper, current: hsv });
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  useEffect(() => {
    if (!image) return;

    const run = async () => {
      try {
        const thresholdCanvas = threshold(image);
        setCanvas1(thresholdCanvas);

        let maskCanvas: HTMLCanvasElement | undefined = undefined;
        if (color) {
          maskCanvas = colorSegmentation({
            srcImg: image,
            lowerHsv: color.lower,
            upperHsv: color.upper,
          });
          setCanvas2(maskCanvas);

          const imageMaskedCanvas = applyMask(image, maskCanvas);
          setCanvas3(imageMaskedCanvas);
        }

        /** TODO only run highlight detecttion of color change and update it live when hovering? */
        /** TODO draw bounding boxes for words and highligted areas */
        /** TODO add color picker lense and cursor */
        const result = await recognize({
          srcImg: thresholdCanvas,
          maskImg: maskCanvas,
          thresholdPercentage: 25,
          language: selectedLanguage,
          onProgress: (progress) => setProgress(progress),
        });
        setProgress(undefined);
        setResult(result);
      } catch (error) {
        /** const e = cv.exceptionFromPtr(error); */
        console.error(error);
      }
    };

    run();
  }, [image, color, selectedLanguage]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-100">
      <h1 className="text-4xl font-bold font-mono text-gray-800 p-4">Highlights</h1>
      <p className="font-mono">
        Upload an image to start the OCR process.
        <br />
        If the image contains highlights, use the color picker to select the highlight color.
      </p>

      <div className="container mx-auto p-4">
        <div className="grid xl:grid-cols-2 gap-4">
          <Container ref={containerRef}>
            {image ? (
              <div>
                <Carousel>
                  <CarouselItem active>
                    <ColorPicker
                      onColorChange={handleColorChange}
                      onClearImage={handleClearImage}
                      image={image}
                      size={canvasSize}
                    />
                  </CarouselItem>
                  {canvas1 ? (
                    <CarouselItem>
                      <ImagePreview size={canvasSize} source={canvas1} />
                    </CarouselItem>
                  ) : null}
                  {canvas2 ? (
                    <CarouselItem>
                      <ImagePreview size={canvasSize} source={canvas2} />
                    </CarouselItem>
                  ) : null}
                  {canvas3 ? (
                    <CarouselItem>
                      <ImagePreview size={canvasSize} source={canvas3} />
                    </CarouselItem>
                  ) : null}
                </Carousel>
              </div>
            ) : (
              <div>
                <ImageUpload onUpload={handleImageUpload} />
              </div>
            )}
          </Container>
          <Container>
            {progress ? <Progress progress={progress?.progress} status={progress?.status} /> : null}
            <TextRenderer 
              highlightColor={color?.current} 
              result={result} 
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
            />
          </Container>
        </div>
      </div>
    </main>
  );
}

export default App;
