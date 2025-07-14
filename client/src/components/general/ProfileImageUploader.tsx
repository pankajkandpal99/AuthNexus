import { Upload, X } from "lucide-react";
import { useRef, useState, useEffect } from "react"; // Add useEffect
import { Button } from "../ui/button";
import { toast } from "sonner";
import { getFullImageUrl } from "../../utils/imageUtils";

interface ProfileImageUploaderProps {
  value: File | string | null;
  currentImage?: string;
  onChange: (file: File | null) => void;
  size?: "sm" | "md" | "lg";
}

export const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
  value,
  currentImage,
  onChange,
  size = "md",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (value instanceof File) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(value);
    } else if (typeof value === "string") {
      setPreview(getFullImageUrl(value));
    } else if (value === null && currentImage) {
      setPreview(currentImage);
    } else {
      setPreview(null);
    }
  }, [value, currentImage]);

  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload JPEG, PNG, or WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      onChange(file);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`relative ${sizeClasses[size]}`}>
        {preview ? (
          <>
            <img
              src={preview}
              alt="Profile preview"
              className="w-full h-full rounded-full object-cover border-4 border-primary/20 shadow-md"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="w-full h-full rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
            <span className="text-muted-foreground text-sm">No image</span>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg, image/png, image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        {preview ? "Change Profile Picture" : "Upload Profile Picture"}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        Recommended: Square image (max 5MB)
      </p>
    </div>
  );
};

// import { Upload, X } from "lucide-react";
// import { useRef, useState } from "react";
// import { Button } from "../ui/button";
// import { toast } from "sonner";

// interface ProfileImageUploaderProps {
//   value: File | string | null;
//   currentImage?: string;
//   onChange: (file: File | null) => void;
//   size?: "sm" | "md" | "lg";
// }

// export const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
//   value,
//   currentImage,
//   onChange,
//   size = "md",
// }) => {
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [preview, setPreview] = useState<string | null>(
//     // typeof value === "string" ? value : null
//     value instanceof File ? null : value || currentImage || null
//   );

//   const sizeClasses = {
//     sm: "w-24 h-24",
//     md: "w-32 h-32",
//     lg: "w-40 h-40",
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const validTypes = ["image/jpeg", "image/png", "image/webp"];
//     if (!validTypes.includes(file.type)) {
//       toast.error("Invalid file type. Please upload JPEG, PNG, or WEBP.");
//       return;
//     }

//     if (file.size > 5 * 1024 * 1024) {
//       toast.error("File size exceeds 5MB limit");
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = () => {
//       setPreview(reader.result as string);
//       onChange(file);
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleRemove = () => {
//     setPreview(null);
//     onChange(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   return (
//     <div className="flex flex-col items-center gap-4">
//       <div className={`relative ${sizeClasses[size]}`}>
//         {preview ? (
//           <>
//             <img
//               src={preview}
//               alt="Profile preview"
//               className="w-full h-full rounded-full object-cover border-4 border-primary/20 shadow-md"
//             />
//             <button
//               type="button"
//               onClick={handleRemove}
//               className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
//             >
//               <X className="h-4 w-4" />
//             </button>
//           </>
//         ) : (
//           <div className="w-full h-full rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
//             <span className="text-muted-foreground text-sm">No image</span>
//           </div>
//         )}
//       </div>

//       <input
//         type="file"
//         ref={fileInputRef}
//         accept="image/jpeg, image/png, image/webp"
//         onChange={handleFileChange}
//         className="hidden"
//       />

//       <Button
//         type="button"
//         variant="outline"
//         onClick={() => fileInputRef.current?.click()}
//         className="flex items-center gap-2"
//       >
//         <Upload className="h-4 w-4" />
//         {preview ? "Change Profile Picture" : "Upload Profile Picture"}
//       </Button>

//       <p className="text-sm text-muted-foreground text-center">
//         Recommended: Square image (max 5MB)
//       </p>
//     </div>
//   );
// };
