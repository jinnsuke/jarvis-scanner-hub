import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ImagePlus, Upload, Crop, X, LogOut } from "lucide-react";
import { useDocuments } from "@/context/DocumentContext";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { io, Socket } from "socket.io-client";
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useAuth } from "@/context/AuthContext";

const UploadPage = () => {
  const navigate = useNavigate();
  const { addNewDocument } = useDocuments();
  const { toast } = useToast();
  const { user, logout, token } = useAuth();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState<CropType>();
  const imgRef = useRef<HTMLImageElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  
  const initSocket = () => {
    const socket = io("http://localhost:3000");
    
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });
    
    socket.on("upload-progress", (data: { progress: number }) => {
      setUploadProgress(data.progress);
    });
    
    socket.on("upload-complete", () => {
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    });
    
    socket.on("upload-error", (error: string) => {
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: error,
        variant: "destructive",
      });
    });
    
    return socket;
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      const defaultName = file.name.split('.')[0];
      setDocumentName(defaultName);
      
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      setShowCropper(true);
      setCrop(undefined);
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
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          return;
        }
        const croppedUrl = URL.createObjectURL(blob);
        resolve(croppedUrl);
      }, 'image/jpeg', 1.0);
    });
  };
  
  const applyCrop = async () => {
    if (!imgRef.current || !crop) return;
    
    try {
      const croppedUrl = await getCroppedImg(imgRef.current, crop);
      setPreviewUrl(croppedUrl);
      setShowCropper(false);
      
      const response = await fetch(croppedUrl);
      const blob = await response.blob();
      
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
      if (!socketInstance) {
        const socket = initSocket();
        setSocketInstance(socket);
      }
      
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("documentName", documentName);
      
      if (socketInstance) {
        formData.append("socketId", socketInstance.id);
      }
      
      try {
        setIsUploading(true);
        setUploadProgress(0);
        
        const response = await fetch("http://localhost:3000/api/upload", {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
          credentials: 'include',
          mode: 'cors'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        addNewDocument(documentName, previewUrl || "");
        
        toast({
          title: "Document uploaded",
          description: "Your document has been successfully uploaded.",
        });
        
        navigate("/gallery");
      } catch (error) {
        console.error("Error uploading file:", error);
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "There was an error uploading the file.",
          variant: "destructive",
        });
        setIsUploading(false);
      }
    } else {
      toast({
        title: "Upload failed",
        description: "Please select a file and provide a name.",
        variant: "destructive",
      });
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-bsc-lightgray">
      <Navbar showSearch={false}>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">
            Welcome, {user?.name}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </Navbar>
      
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
          
          {isUploading && (
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Uploading...</span>
                <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-gray-500 text-center">Connected to socket server, waiting for progress updates...</p>
            </div>
          )}
          
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || !documentName || showCropper || isUploading}
            className="w-full bg-bsc-blue hover:bg-blue-700"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
