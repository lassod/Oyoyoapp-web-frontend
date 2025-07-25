"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  CircleCheck,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  CalendarSearchIcon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useGetOnboardingStatus,
  usePostKycFront,
  usePostKycSelfie,
  usePostKycSubmit,
  usePostKycType,
  usePostOnboarding,
} from "@/hooks/wallet";
import { FaCamera, FaCreditCard } from "react-icons/fa";
import {
  FaBoltLightning,
  FaCalendar,
  FaCartShopping,
  FaPassport,
  FaShieldHalved,
} from "react-icons/fa6";
import { useToast } from "@/components/ui/use-toast";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import Image from "next/image";
import Stripe_Success from "../assets/images/Stripe_Success.svg";
import { useSession } from "next-auth/react";
import { LogoLoader, SkeletonDemo } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

const VerificationPage = ({ overview }: any) => {
  const [isSelfie, setIsSelfie] = useState(false);
  const [showKycOption, setShowKycOption] = useState(false);
  const [isSelfieMode, setIsSelfieMode] = useState(false);
  const [finalSubmit, setFinalSubmit] = useState<any>(null);
  const [popup, setPopup] = useState(false);
  const [isKyc, setIsKyc] = useState(false);
  const { data: onboardStatus, status } = useGetOnboardingStatus();
  const { data: session } = useSession();
  const { mutation } = usePostOnboarding();
  const [isApproved, setIsApproved] = useState(false);
  const [isStripe, setIsStripe] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [isReview, setIsReview] = useState(false);

  useEffect(() => {
    if (onboardStatus) {
      if (onboardStatus.kycRecord?.status === "IN_REVIEW") setIsReview(true);
      else if (onboardStatus.kycRecord?.status === "APPROVED")
        setIsApproved(true);
      else if (onboardStatus.kycRecord?.status === "APPROVED")
        setIsApproved(true);
      else if (
        !onboardStatus?.onboardingStatus?.stripe &&
        session?.stripeConnectId
      )
        setIsStripe(true);
      else if (onboardStatus?.onboardingStatus?.stripe) setIsApproved(true);
      else if (onboardStatus.kycRecord?.status === "REJECTED")
        setIsRejected(true);
    }
  }, [onboardStatus]);

  console.log("sad", onboardStatus);

  const handleKycVerification = () => {
    setPopup(true);
    mutation.mutate({
      onboardingType: "KYC",
      platform: "web",
    });
  };

  if (status !== "success") return <SkeletonDemo />;
  return (
    <div className="flex flex-col gap-3 mt-10 mx-auto max-w-[400px]">
      <h5>{session?.stripeConnectId ? "Stripe" : "KYC"} Verification</h5>
      <p>Verify Your Identity for a Secure Experience</p>

      {popup ? (
        <div className="flex gap-4 flex-col">
          <Image
            className="mx-auto"
            width={187}
            height={187}
            src={Stripe_Success}
            alt="Stripe_Success"
          />
          <p>
            To proceed, Oyoyo needs to gather additional information to ensure
            compliance with local regulations.
          </p>
          <h6>Complete verification to be able to...</h6>
          <div className="flex flex-col gap-3">
            {KycVerificationData.map((item: any) => (
              <div className="flex gap-2 items-center" key={item.text}>
                <item.icon />
                <p className="text-black"> {item.text} </p>
              </div>
            ))}
          </div>
          <Button
            className="ml-0 mt-4"
            onClick={() => {
              setPopup(false);
              setShowKycOption(true);
            }}
          >
            Next
          </Button>
        </div>
      ) : showKycOption ? (
        <KycOptions
          isSelfie={isSelfie}
          setIsKyc={setIsKyc}
          setShowKycOption={setShowKycOption}
          setIsSelfieMode={setIsSelfieMode}
          setFinalSubmit={setFinalSubmit}
          onboardStatus={onboardStatus}
        />
      ) : isKyc ? (
        <KycVerification
          onboardStatus={onboardStatus}
          overview={overview}
          setIsKyc={setIsKyc}
          finalSubmit={finalSubmit}
          setFinalSubmit={setFinalSubmit}
          setShowKycOption={setShowKycOption}
          status={status}
        />
      ) : isSelfieMode ? (
        <SelfieUpload
          setShowKycOption={setShowKycOption}
          setIsSelfieMode={setIsSelfieMode}
          setIsSelfie={setIsSelfie}
        />
      ) : isStripe ? (
        <StripeVerification isPending={isPending} isRejected={isRejected} />
      ) : isReview ? (
        <div className="flex flex-col items-center justify-center">
          <Image
            width={400}
            height={400}
            src={Stripe_Success}
            alt="Stripe_Success"
          />
          <span className="text-center">
            Your KYC verification status is:{" "}
            <b className="text-red-700">
              {" "}
              {onboardStatus?.kycRecord?.status || "IN REVIEW"}
            </b>
          </span>
        </div>
      ) : isApproved ? (
        <div className="flex flex-col items-center justify-center">
          <Image
            width={400}
            height={400}
            src={Stripe_Success}
            alt="Stripe_Success"
          />
          <h6 className="text-center">Verification Successful</h6>
        </div>
      ) : (
        <Button type="button" className="ml-0" onClick={handleKycVerification}>
          {isRejected ? "Restart" : "Begin"} Verification
        </Button>
      )}
    </div>
  );
};

export default VerificationPage;

export const StripeVerification = ({ isPending, isRejected }: any) => {
  const { mutation } = usePostOnboarding();
  const { toast } = useToast();

  const handleStripe = () => {
    mutation.mutate(
      {
        onboardingType: "STRIPE",
        platform: "web",
      },
      {
        onSuccess: async (response: any) => {
          toast({
            variant: "success",
            title: "Successful",
            description: response.data.message,
          });
          console.log(response.data);
          window.location.href = response.data.url;
        },
      }
    );
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" className="ml-0">
          {isPending ? "Complete" : isRejected ? "Restart" : "Complete"}{" "}
          Verification
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="left-[50%] top-[50%]">
        <AlertDialogHeader className="flex-row gap-4">
          <div className="h-10 w-10 flex items-center justify-center rounded-full mt-2 bg-[#EDFDF4]">
            <div className="bg-[#EDFDF4]">
              <CircleCheck className="text-green-500" />
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <div>
              <h6 className="text-left pb-2">Stripe Verification</h6>
              <p className="text-left">
                You will be redirected to stripe.com to begin your verification
                process
              </p>
            </div>
          </div>
        </AlertDialogHeader>
        <div className="flex justify-end mt-2">
          <div className="flex max-w-[235px] gap-2">
            <AlertDialogCancel>
              <Button variant={"secondary"}>Close</Button>
            </AlertDialogCancel>
            <Button
              onClick={handleStripe}
              className="bg-green-500 ml-0 w-[116px]"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

type DocumentType =
  | "Driver's License"
  | "International Passport"
  | "National ID Card";

export const KycVerification = ({
  setIsKyc,
  setShowKycOption,
  onboardStatus,
  finalSubmit,
  setFinalSubmit,
  status,
}: any) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [kycFrontImage, setKycFrontImage] = useState<any>(null);
  const { mutation: kycType } = usePostKycType();
  const { mutation: kycFront } = usePostKycFront();
  const { mutation: kycSubmit } = usePostKycSubmit();
  const router = useRouter();

  console.log(onboardStatus);

  const KycOptionData = [
    {
      id: 3,
      icon: FaCalendar,
      title: "I am an event planner",
      text: "Organizes events and hires vendors to bring them to life",
      url: "/dashboard/events/new-event",
    },
    {
      id: 4,
      icon: FaCartShopping,
      title: "I am an event vendor",
      text: "Offers event-related products or services like catering, decor and more.",
      url: "/dashboard/service",
    },
  ];

  const uplodedDocs = [
    {
      icon: FaCamera,
      title: "Uploaded Selfie",
      url: onboardStatus?.kycRecord?.selfieUrl,
    },
    {
      icon: FaPassport,
      title: "Uploaded ID Card",
      url: onboardStatus?.kycRecord?.documentFrontUrl,
    },
  ];

  useEffect(() => {
    if (onboardStatus)
      if (onboardStatus?.kycRecord?.documentType === "DRIVER_LICENSE")
        setSelectedDoc("Driver's License");
      else if (onboardStatus?.kycRecord?.documentType === "PASSPORT")
        setSelectedDoc("International Passport");
      else if (onboardStatus?.kycRecord?.documentType === "NATIONAL_ID")
        setSelectedDoc("National ID Card");
  }, [onboardStatus]);

  const getDocumentTypeValue = (docType: any) => {
    switch (docType) {
      case "Driver's License":
        return "DRIVER_LICENSE";
      case "International Passport":
        return "PASSPORT";
      case "National ID Card":
        return "NATIONAL_ID";
      default:
        return "";
    }
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    docType: DocumentType
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedDoc(docType);

      const frontImage = new FormData();
      frontImage.append("documentFront", event.target.files[0]);

      setKycFrontImage(frontImage);
    }
  };

  const handleProceed = async () => {
    kycType.mutate(
      {
        documentType: getDocumentTypeValue(selectedDoc),
      },
      {
        onSuccess: () =>
          kycFront.mutate(kycFrontImage, {
            onSuccess: () => setFinalSubmit(true),
          }),
      }
    );
  };

  return (
    <div className="mt-4 flex gap-2 flex-col">
      {status !== "success" ? (
        <LogoLoader />
      ) : isUploaded ? (
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <h4>What best describes you</h4>
            <p>Choose your role to continue</p>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {KycOptionData.map((data) => (
              <button
                key={data.id}
                onClick={() => {
                  // if (data?.id === 3) {
                  //   setIsKyc(true);
                  //   setFinalSubmit(true);
                  //   setShowKycOption(false);
                  // } else
                  router.push(data.url);
                }}
                className={`disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 border grid grid-cols-[1fr,20px] gap-5 justify-between items-center cursor-pointer rounded-lg p-5 
            hover:text-red-700 hover:border-red-700`}
              >
                <span className="flex flex-col gap-1">
                  <div className="flex gap-2 items-center">
                    <data.icon />
                    <p className="text-black font-medium"> {data.title} </p>
                  </div>
                  <p className="text-left"> {data.text} </p>
                </span>

                <ChevronRight />
              </button>
            ))}
          </div>
        </div>
      ) : finalSubmit ? (
        <div className="flex flex-col gap-4">
          <p className="text-green-500 bg-green-50 p-4 rounded-lg">
            {selectedDoc} uploaded successfully!
          </p>

          <div className="space-y-2">
            <h4>Review and Submit KYC</h4>
            <p>
              Review your details and submit to complete verification. Your
              information is secure and used solely to confirm your identity.
            </p>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {uplodedDocs.map((data, i: number) => (
              <button
                key={i}
                className={`border grid grid-cols-[1fr,20px] gap-5 justify-between items-center cursor-pointer rounded-lg p-5 
            hover:text-red-700 hover:border-red-700`}
              >
                <span
                  className="flex flex-col gap-1"
                  onClick={() => router.push(data.url)}
                >
                  <div className="flex gap-2 items-center">
                    <data.icon />
                    <p className="text-black font-medium"> {data.title} </p>
                  </div>
                  {data?.url && (
                    <Image
                      src={data?.url}
                      alt="Image"
                      width={100}
                      height={100}
                      className="object-cover max-w-[100px] h-[80px] ml-7"
                    />
                  )}
                </span>

                <CheckCircle2 size={20} className="text-green-600" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-7">
          <div className="space-y-2">
            <h6>Upload a Document</h6>
            <p>Please select a document type to continue:</p>
          </div>
          {[
            "Driver's License",
            "International Passport",
            "National ID Card",
          ].map((doc: any) => (
            <label
              key={doc}
              className={`border flex justify-between items-center cursor-pointer rounded-lg p-5 
            hover:text-red-700 hover:border-red-700 ${
              selectedDoc === doc
                ? "border-green-500 text-green-500"
                : "border-gray-300"
            }`}
            >
              <span onClick={() => setSelectedDoc(doc as DocumentType)}>
                {doc}
              </span>
              {selectedDoc === doc ? <CheckCircle2 /> : <ChevronRight />}
              <input
                type="file"
                onChange={(event) =>
                  handleFileUpload(event, doc as DocumentType)
                }
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
              />
            </label>
          ))}
        </div>
      )}

      {finalSubmit ? (
        <Button
          disabled={kycSubmit.isPending}
          onClick={() =>
            kycSubmit.mutate(
              {},
              {
                onSuccess: () => {
                  setIsUploaded(true);
                  setFinalSubmit(false);
                },
              }
            )
          }
          className="w-full gap-2"
        >
          Submit{" "}
          {kycSubmit.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
        </Button>
      ) : kycFrontImage && !isUploaded ? (
        <Button
          disabled={kycFront.isPending || kycSubmit.isPending}
          onClick={handleProceed}
          className="mt-5 mr-0"
        >
          {kycFront.isPending || kycSubmit.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Save"
          )}
        </Button>
      ) : isUploaded ? (
        <Button
          onClick={() => {
            setIsKyc(false);
            setIsUploaded(false);
            setShowKycOption(true);
          }}
          className="mt-5 ml-0"
        >
          Back
        </Button>
      ) : (
        <Button
          onClick={() => {
            setIsKyc(false);
            setShowKycOption(true);
          }}
          className="mt-5 ml-0"
        >
          Back
        </Button>
      )}
    </div>
  );
};

export const KycOptions = ({
  setShowKycOption,
  setFinalSubmit,
  setIsSelfieMode,
  isSelfie,
  setIsKyc,
  onboardStatus,
}: any) => {
  const router = useRouter();

  const handleDocChange = (data: any) => {
    if (data.id === 1) {
      setIsSelfieMode(true);
      setShowKycOption(false);
    }
    if (data.id === 2) {
      setIsKyc(true);
      setShowKycOption(false);
    }
    if (data.id === 3) {
      setIsKyc(true);
      setFinalSubmit(true);
      setShowKycOption(false);
    }
    // if (data.id === 3) router.push("/dashboard/events/new-event");
    if (data.id === 4) router.push("/dashboard/service");
  };

  const KycOptionData = [
    {
      icon: FaCamera,
      id: 1,
      title: "Take a Selfie",
      text: "Capture a photo of yourself using your device’s camera.",
      isUpdated: isSelfie || onboardStatus?.kycRecord?.selfieUrl,
      disabled: isSelfie || onboardStatus?.kycRecord?.selfieUrl,
    },
    {
      id: 2,
      icon: FaPassport,
      title: "Upload an ID",
      text: "Upload a valid government-issued ID (e.g., passport, driver’s license",
      disabled: !isSelfie || onboardStatus?.kycRecord?.documentFrontUrl,
      isUpdated: onboardStatus?.kycRecord?.documentFrontUrl,
    },
    {
      id: 3,
      icon: FaCalendar,
      title: "I am an event planner",
      text: "Organizes events and hires vendors to bring them to life",
      disabled: !onboardStatus?.kycRecord?.documentFrontUrl,
    },
    {
      id: 4,
      icon: FaCartShopping,
      title: "I am an event vendor",
      text: "Offers event-related products or services like catering, decor and more.",
      disabled: !onboardStatus?.kycRecord?.documentFrontUrl,
    },
  ];

  return (
    <div className="mt-4 flex gap-2 flex-col">
      <p>
        Please complete the following steps by providing a clear selfie and a
        valid government-issued ID. Your information will remain confidential
        and will only be used for verification purposes.
      </p>

      {/* Document Type Options */}
      <div className="flex flex-col gap-4 mt-7">
        {KycOptionData.map((data) => (
          <button
            disabled={data.disabled}
            key={data.id}
            className={`disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 border grid grid-cols-[1fr,20px] gap-5 justify-between items-center cursor-pointer rounded-lg p-5 
            hover:text-red-700 hover:border-red-700 ${
              data?.isUpdated
                ? "border-green-500 text-green-500"
                : "border-gray-300"
            }`}
          >
            <span
              className="flex flex-col gap-1"
              onClick={() => handleDocChange(data)}
            >
              <div className="flex gap-2 items-center">
                <data.icon />
                <p className="text-black font-medium"> {data.title} </p>
              </div>
              <p className="text-left"> {data.text} </p>
            </span>

            {data?.isUpdated ? <CheckCircle2 /> : <ChevronRight />}
          </button>
        ))}
      </div>

      <Button
        onClick={() => {
          setShowKycOption(false);
        }}
        className="mt-5 ml-0"
      >
        Back
      </Button>
    </div>
  );
};

export const SelfieUpload = ({
  setIsSelfie,
  setShowKycOption,
  setIsSelfieMode,
}: any) => {
  const webcamRef = useRef<Webcam>(null);
  const mutation = usePostKycSelfie();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [capturedImage, setCapturedImage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const successAudio = new Audio("/success.mp3");
  const errorAudio = new Audio("/error.mp3");

  useEffect(() => {
    const loadModels = async () => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(
          "/models/tiny_face_detector/tiny_face_detector_model-weights_manifest.json"
        ),
        faceapi.nets.faceLandmark68Net.loadFromUri(
          "/models/face_landmark_68/face_landmark_68_model-weights_manifest.json"
        ),
      ]);
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  const validateUserAction = async () => {
    if (webcamRef.current && modelsLoaded) {
      const image: any = webcamRef.current.video;
      const detection = await faceapi
        .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (detection) {
        setError(null);
        const capturedImage: any = webcamRef.current.getScreenshot();
        setCapturedImage(capturedImage);
        successAudio.play();
        setIsImage(true);
      } else {
        setError("Face not detected. Please ensure your face is visible.");
        errorAudio.play();
      }
    }
  };

  useEffect(() => {
    if (!modelsLoaded || !webcamRef.current || isImage) return;

    const interval = setInterval(() => {
      validateUserAction();
    }, 1000);

    return () => clearInterval(interval);
  }, [modelsLoaded]);

  const dataURLToFile = (dataUrl: string, filename: string) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const captureSelfie = () => {
    if (capturedImage) {
      const selfieFile = dataURLToFile(capturedImage, "selfie.jpg");
      const formData = new FormData();
      formData.append("selfie", selfieFile);
      mutation.mutate(formData, {
        onSuccess: (response) => {
          toast({
            variant: "success",
            title: "Successful",
            description: response.data.message,
          });
          setCapturedImage(null);
          setIsSelfieMode(false);
          setShowKycOption(true);
          setIsSelfie(true);
        },
        onError: (error: any) => {
          if (
            error.response.data.errors[0].message ===
            "Invalid action. You have already completed this step. Current step: SELFIE_UPLOAD"
          ) {
            setCapturedImage(null);
            setIsSelfieMode(false);
            setShowKycOption(true);
            setIsSelfie(true);
          }
        },
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      {isImage ? (
        <>
          {mutation.isPending && <LogoLoader />}
          {/* Display captured image */}
          <img
            src={webcamRef.current?.getScreenshot() || ""}
            alt="Captured selfie"
            className="w-[400px] h-[400px] object-cover rounded-[30px] border-4 border-white shadow-lg"
          />

          {/* Buttons for upload and retake */}
          <div className="flex gap-4 mt-6">
            <Button variant={"default"} onClick={captureSelfie}>
              Upload Image
            </Button>
            <Button
              variant={"secondary"}
              onClick={() => {
                setIsImage(false);
                setCapturedImage(null);
                setError(null);
              }}
            >
              Retake Image
            </Button>
          </div>
        </>
      ) : (
        <>
          <Webcam
            className="h-300px w-full shadow-lg shadow-gray-300 border-4 border-white rounded-[30px]"
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={400}
            height={400}
          />
          {error ? (
            <p className="text-red-500 text-center mt-5">{error}</p>
          ) : (
            <h6 className="my-5">Please look straight</h6>
          )}
          <div className="flex mt-5 gap-4">
            <Button
              variant={"secondary"}
              onClick={() => {
                setIsSelfieMode(false);
                setShowKycOption(true);
              }}
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export const KycVerificationData = [
  {
    icon: FaCreditCard,
    text: "Make secure payments and transactions.",
  },
  {
    icon: FaBoltLightning,
    text: "Access all account features without restrictions.",
  },
  {
    icon: FaShieldHalved,
    text: "Protect your personal information with enhanced security.",
  },
];
