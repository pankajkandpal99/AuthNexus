import { Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { getFullImageUrl } from "../../utils/imageUtils";

interface ImageUploadManagerProps {
  images: (string | File)[];
  onChange: (images: (string | File)[]) => void;
  maxImages?: number;
  ButtonText?: string;
  acceptedFormats?: string;
  maxFileSizeMB?: number;
}

type ImagePreviewMap = Record<number, string>;

const ImageUploadManager: React.FC<ImageUploadManagerProps> = ({
  images,
  onChange,
  maxImages = 5,
  ButtonText = "Upload Image",
  acceptedFormats = "image/jpeg, image/png, image/webp",
  maxFileSizeMB = 5,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreviews, setImagePreviews] = useState<ImagePreviewMap>({});
  const [currentImages, setCurrentImages] = useState<(string | File)[]>(images);

  useEffect(() => {
    setCurrentImages(images);
  }, [images]);

  const showError = (message: string) => {
    toast.error(message);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    if (currentImages.length >= maxImages) {
      showError(`Maximum ${maxImages} images allowed.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const file = event.target.files[0];
    const validTypes = acceptedFormats.split(", ");

    if (!validTypes.includes(file.type)) {
      showError(`Invalid file type. Accepted formats: ${acceptedFormats}`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > maxFileSizeMB * 1024 * 1024) {
      showError(`File size exceeds ${maxFileSizeMB}MB limit`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const newImages = [...currentImages, file];
    setCurrentImages(newImages);
    onChange(newImages);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreviews((prev) => ({
        ...prev,
        [newImages.length - 1]: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (index: number) => {
    const newImages = currentImages.filter((_, i) => i !== index);
    setCurrentImages(newImages);

    onChange(newImages);

    const newPreviews: ImagePreviewMap = {};
    let newIndex = 0;

    currentImages.forEach((_, i) => {
      if (i !== index && imagePreviews[i]) {
        newPreviews[newIndex] = imagePreviews[i];
        newIndex++;
      }
    });

    setImagePreviews(newPreviews);
  };

  const getImageSrc = (image: string | File, index: number) => {
    if (typeof image === "string") {
      return getFullImageUrl(image);
    }

    return imagePreviews[index] || "";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept={acceptedFormats}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            className="w-full hover:bg-transparent cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-1" /> {ButtonText}
          </Button>
        </div>
      </div>

      {currentImages.length === 0 && (
        <div className="text-muted-foreground text-sm text-center py-4">
          No images added yet
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentImages.map((image, index) => {
          const src = getImageSrc(image, index);
          if (!src) return null;

          return (
            <div key={index} className="relative group">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={src}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute cursor-pointer top-2 right-2 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-8 w-8"
                onClick={() => handleRemoveImage(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 sm:p-2 text-xs truncate">
                {typeof image === "string" ? image : image.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImageUploadManager;
