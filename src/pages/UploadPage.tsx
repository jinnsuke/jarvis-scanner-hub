import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ImagePlus, Upload, Crop, X, LogOut, CalendarIcon } from "lucide-react";
import { useDocuments } from "@/context/DocumentContext";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { io, Socket } from "socket.io-client";
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const HOSPITALS = [
  { value: "AH", label: "Alexandra Hospital (AH)" },
  { value: "CGH", label: "Changi General Hospital (CGH)" },
  { value: "IMH", label: "Institute of Mental Health (IMH)" },
  { value: "KTPH", label: "Khoo Teck Puat Hospital (KTPH)" },
  { value: "KKH", label: "KK Women's and Children's Hospital (KKH)" },
  { value: "NUH", label: "National University Hospital (NUH)" },
  { value: "NTFGH", label: "Ng Teng Fong General Hospital (NTFGH)" },
  { value: "SKH", label: "Sengkang General Hospital (SKH)" },
  { value: "SGH", label: "Singapore General Hospital (SGH)" },
  { value: "TTSH", label: "Tan Tock Seng Hospital (TTSH)" },
  { value: "WH", label: "Woodlands Health (WH)" },
  { value: "MAH", label: "Mount Alvernia Hospital (MAH)" },
  { value: "FPH", label: "Farrer Park Hospital (FPH)" },
  { value: "GEH", label: "Gleneagles Hospital (GEH)" },
  { value: "MEH", label: "Mount Elizabeth Hospital (MEH)" },
  { value: "MENH", label: "Mount Elizabeth Novena Hospital (MENH)" },
  { value: "PEH", label: "Parkway East Hospital (PEH)" },
  { value: "RH", label: "Raffles Hospital (RH)" },
  { value: "TMC", label: "Thomson Medical Centre (TMC)" },
  { value: "NCID", label: "National Centre for Infectious Diseases (NCID)" },
  { value: "NHCS", label: "National Heart Centre Singapore (NHCS)" },
  { value: "NCCS", label: "National Cancer Centre Singapore (NCCS)" },
  { value: "NDCS", label: "National Dental Centre Singapore (NDCS)" },
  { value: "NNI", label: "National Neuroscience Institute (NNI)" },
  { value: "SNEC", label: "Singapore National Eye Centre (SNEC)" },
  { value: "SACH", label: "St. Andrew's Community Hospital (SACH)" },
  { value: "SLH", label: "St. Luke's Hospital (SLH)" },
];

const UploadPage = () => {
  const navigate = useNavigate();
  const { addNewDocument } = useDocuments();
  const { toast } = useToast();
  const { user, logout, token } = useAuth();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [procedureDate, setProcedureDate] = useState<Date | undefined>(undefined);
  const [hospital, setHospital] = useState("");
  const [doctor, setDoctor] = useState("");
  const [procedure, setProcedure] = useState("");
  const [billingNo, setBillingNo] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState<CropType>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const progressRef = useRef(0);
  
  useEffect(() => {
    if (procedureDate && hospital && doctor && procedure && billingNo) {
      const formattedDate = format(procedureDate, "yyyyMMdd");
      const sanitizedDoctor = doctor.trim().replace(/\s+/g, '_');
      const sanitizedProcedure = procedure.trim().replace(/\s+/g, '_');
      const sanitizedBillingNo = billingNo.trim();
      
      const newDocumentName = `${formattedDate}_${hospital}_${sanitizedDoctor}_${sanitizedProcedure}_${sanitizedBillingNo}`
        .replace(/[^a-zA-Z0-9-_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      
      setDocumentName(newDocumentName);
      console.log('Generated document name:', newDocumentName);
    } else {
      setDocumentName("");
    }
  }, [procedureDate, hospital, doctor, procedure, billingNo]);
  
  const initSocket = () => {
    const socket = io("http://localhost:3000");
    
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });
    
    socket.on("upload-progress", (data: { progress: number }) => {
      if (data.progress > progressRef.current) {
        progressRef.current = data.progress;
        setUploadProgress(data.progress);
      }
    });
    
    socket.on("upload-complete", () => {
      progressRef.current = 100;
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        progressRef.current = 0;
      }, 1000);
    });
    
    socket.on("upload-error", (error: string) => {
      setIsUploading(false);
      progressRef.current = 0;
      setUploadProgress(0);
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
    if (!selectedFile || !documentName || !procedureDate || !hospital || !doctor || !procedure || !billingNo) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!socketInstance) {
      const socket = initSocket();
      setSocketInstance(socket);
    }
    
    progressRef.current = 0;
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("documentName", documentName);
    formData.append("procedureDate", procedureDate.toISOString());
    formData.append("hospital", hospital);
    formData.append("doctor", doctor);
    formData.append("procedure", procedure);
    formData.append("billingNo", billingNo);
    
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
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-bsc-lightgray">
      <Navbar showSearch={false}>
        <span className="text-sm font-medium text-gray-700">
          Welcome, {user?.name}
        </span>
      </Navbar>
      
      <main className="container px-4 py-6 mx-auto sm:py-10">
        <div className="max-w-2xl p-6 mx-auto mt-4 bg-white rounded-lg shadow-md">
          <h2 className="mb-6 text-xl font-bold text-center text-bsc-blue sm:text-2xl">
            Upload Post-Case Charge Form
          </h2>
          
          <div className="grid gap-6 mb-6">
            {documentName && (
              <div className="p-3 bg-gray-50 rounded-lg border">
                <Label className="text-sm text-gray-500">Generated Document Name:</Label>
                <p className="mt-1 font-medium text-gray-900 break-all">{documentName}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="procedureDate">Procedure Date</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !procedureDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {procedureDate ? format(procedureDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={procedureDate}
                    onSelect={(date) => {
                      setProcedureDate(date);
                      setCalendarOpen(false);
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospital">Hospital</Label>
              <Select value={hospital} onValueChange={setHospital}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select hospital..." />
                </SelectTrigger>
                <SelectContent>
                  {HOSPITALS.map((h) => (
                    <SelectItem key={h.value} value={h.value}>
                      {h.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor</Label>
              <Input
                id="doctor"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                placeholder="Enter Doctor's first name followed by last name (e.g. Tim Tan)"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="procedure">Procedure</Label>
              <Input
                id="procedure"
                value={procedure}
                onChange={(e) => setProcedure(e.target.value)}
                placeholder="Enter procedure name"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingNo">Billing Number</Label>
              <Input
                id="billingNo"
                value={billingNo}
                onChange={(e) => setBillingNo(e.target.value)}
                placeholder="Enter billing number"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Upload Document</Label>
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
          </div>
          
          {isUploading && (
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Uploading...</span>
                <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
          
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || !documentName || !procedureDate || !hospital || !doctor || !procedure || !billingNo || showCropper || isUploading}
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
