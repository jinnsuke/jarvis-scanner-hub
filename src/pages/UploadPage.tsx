import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ImagePlus, Upload, Crop, X } from "lucide-react";
import { useDocuments } from "@/context/DocumentContext";
import { useToast } from "@/components/ui/use-toast";
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const UploadPage = () => {
  const navigate = useNavigate();
  const { addNewDocument } = useDocuments();
  const { toast } = useToast();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState<CropType>();
  const imgRef = useRef<HTMLImageElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Generate a default name from the file name
      const defaultName = file.name.split('.')[0];
      setDocumentName(defaultName);
      
      // Create a preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Initialize the cropper
      setShowCropper(true);
      setCrop(undefined); // Reset crop when a new image is selected
    }
  };
  
  function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
  ) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    );
  }
  
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 16 / 9));
  };
  
  const getCroppedImg = (image: HTMLImageElement, crop: CropType): Promise<string> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Set canvas dimensions to the actual cropped dimensions
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return Promise.reject(new Error('No 2d context'));
    }
    
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY,
    );
    
    // Use higher quality in the toBlob method
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          return;
        }
        const croppedUrl = URL.createObjectURL(blob);
        resolve(croppedUrl);
      }, 'image/jpeg', 1.0); // Use highest quality (1.0)
    });
  };
  
  const applyCrop = async () => {
    if (!imgRef.current || !crop) return;
    
    try {
      const croppedUrl = await getCroppedImg(imgRef.current, crop);
      setPreviewUrl(croppedUrl);
      setShowCropper(false);
      
      // Convert the cropped image URL to a Blob
      const response = await fetch(croppedUrl);
      const blob = await response.blob();
      
      // Create a new File object from the Blob
      const croppedFile = new File([blob], selectedFile?.name || "cropped-image.jpg", {
        type: 'image/jpeg',
        lastModified: new Date().getTime(),
      });
      
      setSelectedFile(croppedFile);
      
      toast({
        title: "Image cropped",
        description: "The image has been cropped successfully.",
      });
    } catch (error) {
      console.error("Error cropping image:", error);
      toast({
        title: "Crop failed",
        description: "There was an error cropping the image.",
        variant: "destructive",
      });
    }
  };
  
  const cancelCrop = () => {
    setShowCropper(false);
  };
  
  const handleUpload = async () => {
    if (selectedFile && documentName) {
      // FormData to upload the file
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        // Upload the file to the backend
        const response = await fetch("http://localhost:3000/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        
        if (response.ok) {
          // Add the document to your local context/state if needed
          addNewDocument(documentName, previewUrl || "");
          
          toast({
            title: "Document uploaded",
            description: "Your document has been successfully uploaded.",
          });
          
          // Navigate to gallery
          navigate("/gallery");
        } else {
          toast({
            title: "Upload failed",
            description: `Error: ${data.message}`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        toast({
          title: "Upload failed",
          description: "There was an error uploading the file.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Upload failed",
        description: "Please select a file and provide a name.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-bsc-lightgray">
      <Navbar showSearch={false} />
      
      <main className="container px-4 py-6 mx-auto sm:py-10">
        <div className="max-w-md p-6 mx-auto mt-4 bg-white rounded-lg shadow-md">
          <h2 className="mb-6 text-xl font-bold text-center text-bsc-blue sm:text-2xl">
            Upload Post-Case Charge Form
          </h2>
          
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium">Document Name</label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-bsc-blue"
              placeholder="Enter document name"
            />
          </div>
          
          <div className="mb-6">
            {showCropper && previewUrl ? (
              <div className="flex flex-col space-y-4">
                <div className="p-2 border rounded bg-gray-50 flex justify-center">
                  <ReactCrop
                    crop={crop}
                    onChange={c => setCrop(c)}
                    aspect={undefined}
                    className="max-h-[350px] mx-auto"
                  >
                    <img 
                      src={previewUrl} 
                      alt="Preview for cropping" 
                      ref={imgRef}
                      onLoad={onImageLoad}
                      className="max-w-full max-h-[350px] object-contain"
                    />
                  </ReactCrop>
                </div>
                <div className="flex justify-between">
                  <Button
                    onClick={cancelCrop}
                    variant="outline"
                    className="flex-1 mr-2"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={applyCrop}
                    className="flex-1 ml-2 bg-bsc-blue hover:bg-blue-700"
                    disabled={!crop?.width || !crop?.height}
                  >
                    <Crop className="w-4 h-4 mr-2" />
                    Apply Crop
                  </Button>
                </div>
              </div>
            ) : previewUrl ? (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="object-contain w-full max-h-64 border rounded"
                />
                <div className="absolute bottom-2 right-2 flex space-x-2">
                  <button
                    onClick={() => setShowCropper(true)}
                    className="p-2 bg-white rounded shadow-md text-bsc-blue hover:bg-gray-100"
                    title="Crop image"
                  >
                    <Crop className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="p-2 bg-white rounded shadow-md text-red-500 hover:bg-gray-100"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded cursor-pointer border-bsc-blue bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImagePlus className="w-10 h-10 mb-3 text-bsc-blue" />
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG or PDF (MAX. 10MB)</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
          
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || !documentName || showCropper}
            className="w-full bg-bsc-blue hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
