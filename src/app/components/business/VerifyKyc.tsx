"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { ChevronRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetOnboardingStatus,
  usePostKycFront,
  usePostKycSelfie,
  usePostKycSubmit,
  usePostKycType,
  usePostOnboarding,
} from "@/hooks/wallet";
import { useToast } from "@/components/ui/use-toast";
import { LogoLoader, SkeletonDemo } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import Stripe_Success from "../assets/images/Stripe_Success.svg";
import { FaCamera, FaCreditCard } from "react-icons/fa";
import { FaBoltLightning, FaCalendar, FaCartShopping, FaPassport, FaShieldHalved } from "react-icons/fa6";

/** ------------------------------
 *  VerificationPage (no Stripe)
 *  ------------------------------ */
const VerifyKyc = ({ overview }: any) => {
  const [step, setStep] = useState<"landing" | "why-kyc" | "options" | "selfie" | "document" | "review" | "status">(
    "landing"
  );
  const [isSelfieDone, setIsSelfieDone] = useState(false);
  const [finalSubmitReady, setFinalSubmitReady] = useState(false);
  const [kycFrontFormData, setKycFrontFormData] = useState<FormData | null>(null);

  const { data: onboardStatus, status } = useGetOnboardingStatus();
  const { mutation: startOnboarding } = usePostOnboarding();

  const [derivedStatus, setDerivedStatus] = useState<"APPROVED" | "IN_REVIEW" | "REJECTED" | "NONE">("NONE");

  useEffect(() => {
    if (!onboardStatus) return;
    const s = onboardStatus?.kycRecord?.status;
    if (s === "APPROVED") setDerivedStatus("APPROVED");
    else if (s === "IN_REVIEW") setDerivedStatus("IN_REVIEW");
    else if (s === "REJECTED") setDerivedStatus("REJECTED");
    else setDerivedStatus("NONE");
  }, [onboardStatus]);

  useEffect(() => {
    // route directly to status if there’s a known outcome already
    if (derivedStatus === "APPROVED" || derivedStatus === "IN_REVIEW") {
      setStep("status");
    }
  }, [derivedStatus]);

  const handleBegin = () => {
    // Initialize platform onboarding for KYC (no Stripe)
    startOnboarding.mutate({ onboardingType: "KYC", platform: "web" });
    setStep("why-kyc");
  };

  if (status !== "success") return <SkeletonDemo />;

  return (
    <div className='flex flex-col gap-4 mt-10 mx-auto max-w-[480px]'>
      <h5 className='text-xl font-semibold'>Identity Verification</h5>
      <p className='text-sm text-muted-foreground'>
        Verify your identity to unlock secure features and protect your account.
      </p>

      {step === "landing" &&
        (derivedStatus === "APPROVED" ? (
          <ApprovedBlock />
        ) : derivedStatus === "IN_REVIEW" ? (
          <ReviewBlock current={onboardStatus?.kycRecord?.status} />
        ) : derivedStatus === "REJECTED" ? (
          <div className='flex flex-col items-center justify-center gap-4'>
            <Image width={300} height={300} src={Stripe_Success} alt='status' />
            <span className='text-center'>
              Your KYC status is <b className='text-red-600'>REJECTED</b>. You can restart the process.
            </span>
            <Button className='ml-0' onClick={handleBegin}>
              Restart Verification
            </Button>
          </div>
        ) : (
          <Button type='button' className='ml-0' onClick={handleBegin}>
            Begin Verification
          </Button>
        ))}

      {step === "why-kyc" && <WhyKyc onNext={() => setStep("options")} />}

      {step === "options" && (
        <KycOptions
          isSelfieDone={isSelfieDone}
          onboardStatus={onboardStatus}
          onBack={() => setStep("landing")}
          onGoSelfie={() => setStep("selfie")}
          onGoDocument={() => setStep("document")}
          onPlanner={() => setStep("status")}
          onVendor={() => setStep("status")}
        />
      )}

      {step === "selfie" && (
        <SelfieUpload
          onCancel={() => setStep("options")}
          onSuccess={() => {
            setIsSelfieDone(true);
            setStep("options");
          }}
        />
      )}

      {step === "document" && (
        <KycVerification
          onboardStatus={onboardStatus}
          finalSubmitReady={finalSubmitReady}
          setFinalSubmitReady={setFinalSubmitReady}
          kycFrontFormData={kycFrontFormData}
          setKycFrontFormData={setKycFrontFormData}
          onBack={() => setStep("options")}
          onGoReview={() => setStep("review")}
          onDone={() => setStep("status")}
        />
      )}

      {step === "review" && (
        <KycReview
          onboardStatus={onboardStatus}
          onBack={() => setStep("document")}
          onSubmitSuccess={() => setStep("status")}
        />
      )}

      {step === "status" &&
        (derivedStatus === "APPROVED" ? (
          <ApprovedBlock />
        ) : derivedStatus === "IN_REVIEW" ? (
          <ReviewBlock current={onboardStatus?.kycRecord?.status} />
        ) : (
          <div className='flex flex-col items-center justify-center gap-4'>
            <Image width={300} height={300} src={Stripe_Success} alt='status' />
            <span className='text-center'>
              Your KYC verification is submitted. You’ll be notified when it’s reviewed.
            </span>
            <Button className='ml-0' onClick={() => setStep("landing")}>
              Back to start
            </Button>
          </div>
        ))}
    </div>
  );
};

export default VerifyKyc;

/** ------------------------------
 *  Small status blocks
 *  ------------------------------ */
const ApprovedBlock = () => (
  <div className='flex flex-col items-center justify-center gap-4'>
    <Image width={300} height={300} src={Stripe_Success} alt='success' />
    <h6 className='text-center text-green-700 font-medium'>Verification Successful</h6>
  </div>
);

const ReviewBlock = ({ current }: { current?: string }) => (
  <div className='flex flex-col items-center justify-center gap-4'>
    <Image width={300} height={300} src={Stripe_Success} alt='in-review' />
    <span className='text-center'>
      Your KYC verification status is: <b className='text-amber-600'>{current || "IN_REVIEW"}</b>
    </span>
  </div>
);

/** ------------------------------
 *  Why KYC (benefits)
 *  ------------------------------ */
const WhyKyc = ({ onNext }: { onNext: () => void }) => {
  return (
    <div className='flex flex-col gap-4'>
      <Image className='mx-auto' width={187} height={187} src={Stripe_Success} alt='kyc' />
      <p className='text-sm'>
        To proceed, we need additional information to comply with regulations and keep your account secure.
      </p>
      <h6 className='font-medium'>Verification lets you:</h6>
      <div className='flex flex-col gap-3'>
        {KycVerificationData.map((item) => (
          <div className='flex gap-2 items-center' key={item.text}>
            <item.icon />
            <p className='text-black'> {item.text} </p>
          </div>
        ))}
      </div>
      <Button className='ml-0 mt-2' onClick={onNext}>
        Next
      </Button>
    </div>
  );
};

export const KycVerificationData = [
  { icon: FaCreditCard, text: "Make secure payments and transactions." },
  { icon: FaBoltLightning, text: "Access all features without restrictions." },
  { icon: FaShieldHalved, text: "Protect your personal information." },
];

/** ------------------------------
 *  Options step
 *  ------------------------------ */
const KycOptions = ({
  isSelfieDone,
  onboardStatus,
  onBack,
  onGoSelfie,
  onGoDocument,
  onPlanner,
  onVendor,
}: {
  isSelfieDone: boolean;
  onboardStatus: any;
  onBack: () => void;
  onGoSelfie: () => void;
  onGoDocument: () => void;
  onPlanner: () => void;
  onVendor: () => void;
}) => {
  const hasSelfie = isSelfieDone || !!onboardStatus?.kycRecord?.selfieUrl;
  const hasDocument = !!onboardStatus?.kycRecord?.documentFrontUrl;

  const items = [
    {
      id: 1,
      icon: FaCamera,
      title: "Take a Selfie",
      text: "Capture a clear selfie using your device camera.",
      disabled: hasSelfie, // done already → locked
      done: hasSelfie,
      onClick: onGoSelfie,
    },
    {
      id: 2,
      icon: FaPassport,
      title: "Upload an ID",
      text: "Upload a valid government ID (passport, driver’s license, etc.).",
      disabled: !hasSelfie || hasDocument, // require selfie first
      done: hasDocument,
      onClick: onGoDocument,
    },
    {
      id: 3,
      icon: FaCalendar,
      title: "I am an event planner",
      text: "Organize events and hire vendors.",
      disabled: !hasDocument,
      done: false,
      onClick: onPlanner,
    },
    {
      id: 4,
      icon: FaCartShopping,
      title: "I am an event vendor",
      text: "Offer event-related products or services.",
      disabled: !hasDocument,
      done: false,
      onClick: onVendor,
    },
  ];

  return (
    <div className='mt-2 flex flex-col gap-4'>
      <p className='text-sm'>
        Complete the steps below. Your data remains confidential and is used only for verification.
      </p>

      <div className='flex flex-col gap-4 mt-4'>
        {items.map((it) => (
          <button
            key={it.id}
            disabled={it.disabled}
            onClick={() => it.onClick()}
            className={`border grid grid-cols-[1fr,20px] gap-5 items-center rounded-lg p-5 text-left disabled:opacity-50 disabled:cursor-not-allowed
              hover:text-red-700 hover:border-red-700 ${
                it.done ? "border-green-500 text-green-600" : "border-gray-300"
              }`}
          >
            <span className='flex flex-col gap-1'>
              <div className='flex gap-2 items-center'>
                <it.icon />
                <p className='text-black font-medium'>{it.title}</p>
              </div>
              <p className='text-sm text-muted-foreground'>{it.text}</p>
            </span>
            {it.done ? <CheckCircle2 /> : <ChevronRight />}
          </button>
        ))}
      </div>

      <Button variant='secondary' onClick={onBack} className='mt-3 ml-0'>
        Back
      </Button>
    </div>
  );
};

/** ------------------------------
 *  Selfie capture & upload
 *  ------------------------------ */
const SelfieUpload = ({ onCancel, onSuccess }: { onCancel: () => void; onSuccess: () => void }) => {
  const webcamRef = useRef<Webcam>(null);
  const { mutate, isPending } = usePostKycSelfie();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isReadyToUpload, setIsReadyToUpload] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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

  const validateAndCapture = async () => {
    if (!webcamRef.current || !modelsLoaded) return;
    const video: any = webcamRef.current.video;
    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();

    if (detection) {
      setError(null);
      const shot = webcamRef.current.getScreenshot();
      if (shot) {
        setCapturedImage(shot);
        setIsReadyToUpload(true);
      }
    } else {
      setError("Face not detected. Ensure proper lighting and keep your face within the frame.");
    }
  };

  const dataURLToFile = (dataUrl: string, filename: string) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const uploadSelfie = () => {
    if (!capturedImage) return;
    const selfieFile = dataURLToFile(capturedImage, "selfie.jpg");
    const formData = new FormData();
    formData.append("selfie", selfieFile);

    mutate(formData, {
      onSuccess: (res: any) => {
        toast({ variant: "success", title: "Selfie uploaded", description: res?.data?.message || "Success" });
        onSuccess();
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.errors?.[0]?.message;
        if (msg?.includes("already completed")) onSuccess();
      },
    });
  };

  return (
    <div className='flex flex-col items-center gap-4'>
      {!isReadyToUpload ? (
        <>
          <Webcam
            className='w-[400px] h-[400px] object-cover rounded-[24px] border shadow'
            audio={false}
            ref={webcamRef}
            screenshotFormat='image/jpeg'
            width={400}
            height={400}
          />
          {error ? (
            <p className='text-red-500 text-center'>{error}</p>
          ) : (
            <p className='text-sm'>Align your face and ensure good lighting.</p>
          )}
          <div className='flex gap-3 mt-2'>
            <Button variant='secondary' onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={validateAndCapture}>Capture</Button>
          </div>
        </>
      ) : (
        <>
          <img
            src={capturedImage || ""}
            alt='Captured selfie'
            className='w-[400px] h-[400px] object-cover rounded-[24px] border shadow'
          />
          <div className='flex gap-3'>
            <Button
              variant='secondary'
              onClick={() => {
                setIsReadyToUpload(false);
                setCapturedImage(null);
              }}
            >
              Retake
            </Button>
            <Button onClick={uploadSelfie} disabled={isPending}>
              {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : "Upload"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

/** ------------------------------
 *  Document upload & selection
 *  ------------------------------ */
type DocumentType = "Driver's License" | "International Passport" | "National ID Card";

const KycVerification = ({
  onboardStatus,
  finalSubmitReady,
  setFinalSubmitReady,
  kycFrontFormData,
  setKycFrontFormData,
  onBack,
  onGoReview,
  onDone,
}: {
  onboardStatus: any;
  finalSubmitReady: boolean;
  setFinalSubmitReady: (v: boolean) => void;
  kycFrontFormData: FormData | null;
  setKycFrontFormData: (v: FormData | null) => void;
  onBack: () => void;
  onGoReview: () => void;
  onDone: () => void;
}) => {
  const router = useRouter();
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const { mutation: kycType } = usePostKycType();
  const { mutation: kycFront } = usePostKycFront();

  useEffect(() => {
    const t = onboardStatus?.kycRecord?.documentType;
    if (t === "DRIVER_LICENSE") setSelectedDoc("Driver's License");
    else if (t === "PASSPORT") setSelectedDoc("International Passport");
    else if (t === "NATIONAL_ID") setSelectedDoc("National ID Card");
  }, [onboardStatus]);

  const getApiDocType = (doc: DocumentType | null) => {
    if (!doc) return "";
    if (doc === "Driver's License") return "DRIVER_LICENSE";
    if (doc === "International Passport") return "PASSPORT";
    return "NATIONAL_ID";
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, doc: DocumentType) => {
    if (!e.target.files?.length) return;
    setSelectedDoc(doc);
    const fd = new FormData();
    fd.append("documentFront", e.target.files[0]);
    setKycFrontFormData(fd);
  };

  const saveDocument = () => {
    if (!selectedDoc || !kycFrontFormData) return;

    kycType.mutate(
      { documentType: getApiDocType(selectedDoc) },
      {
        onSuccess: () => {
          kycFront.mutate(kycFrontFormData, {
            onSuccess: () => {
              setFinalSubmitReady(true);
              onGoReview();
            },
          });
        },
      }
    );
  };

  const uploaded = [
    { icon: FaCamera, title: "Uploaded Selfie", url: onboardStatus?.kycRecord?.selfieUrl },
    { icon: FaPassport, title: "Uploaded ID Card", url: onboardStatus?.kycRecord?.documentFrontUrl },
  ];

  return (
    <div className='flex flex-col gap-4'>
      {!finalSubmitReady ? (
        <>
          <div className='space-y-1'>
            <h6 className='font-medium'>Upload a Document</h6>
            <p className='text-sm text-muted-foreground'>Select a document type and upload a clear image.</p>
          </div>

          {(["Driver's License", "International Passport", "National ID Card"] as DocumentType[]).map((doc) => (
            <label
              key={doc}
              className={`border flex justify-between items-center rounded-lg p-5 cursor-pointer hover:text-red-700 hover:border-red-700
                ${selectedDoc === doc ? "border-green-500 text-green-600" : "border-gray-300"}`}
            >
              <span onClick={() => setSelectedDoc(doc)}>{doc}</span>
              {selectedDoc === doc ? <CheckCircle2 /> : <ChevronRight />}
              <input
                type='file'
                accept='.jpg,.jpeg,.png,.pdf'
                className='hidden'
                onChange={(e) => handleFileUpload(e, doc)}
              />
            </label>
          ))}

          <div className='flex gap-3'>
            <Button variant='secondary' className='ml-0' onClick={onBack}>
              Back
            </Button>
            <Button
              className='ml-0'
              disabled={!kycFrontFormData || !selectedDoc || kycType.isPending || kycFront.isPending}
              onClick={saveDocument}
            >
              {kycType.isPending || kycFront.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : "Save"}
            </Button>
          </div>
        </>
      ) : (
        <div className='flex flex-col gap-4'>
          <p className='text-green-600 bg-green-50 p-4 rounded-lg'>{selectedDoc} uploaded successfully!</p>

          <div className='space-y-1'>
            <h4 className='font-semibold'>Review</h4>
            <p className='text-sm text-muted-foreground'>Confirm your uploads before you submit for verification.</p>
          </div>

          <div className='flex flex-col gap-4'>
            {uploaded.map((it, i) => (
              <div key={i} className='border grid grid-cols-[1fr,20px] gap-5 items-center rounded-lg p-5'>
                <span className='flex flex-col gap-1'>
                  <div className='flex items-center gap-2'>
                    <it.icon />
                    <p className='text-black font-medium'>{it.title}</p>
                  </div>
                  {it.url && (
                    <Image
                      src={it.url}
                      alt='preview'
                      width={120}
                      height={90}
                      className='object-cover max-w-[120px] h-[90px] ml-7 rounded-md border'
                    />
                  )}
                </span>
                <CheckCircle2 className='text-green-600' size={20} />
              </div>
            ))}
          </div>

          <div className='flex gap-3'>
            <Button variant='secondary' className='ml-0' onClick={onBack}>
              Back
            </Button>
            <Button className='ml-0' onClick={onGoReview}>
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

/** ------------------------------
 *  Final submit step
 *  ------------------------------ */
const KycReview = ({
  onboardStatus,
  onBack,
  onSubmitSuccess,
}: {
  onboardStatus: any;
  onBack: () => void;
  onSubmitSuccess: () => void;
}) => {
  const { mutation: kycSubmit } = usePostKycSubmit();

  return (
    <div className='flex flex-col gap-4'>
      <div className='space-y-1'>
        <h4 className='font-semibold'>Submit KYC</h4>
        <p className='text-sm text-muted-foreground'>
          Submit to complete verification. We’ll review and notify you shortly.
        </p>
      </div>

      <Button
        className='w-full'
        disabled={kycSubmit.isPending}
        onClick={() =>
          kycSubmit.mutate(
            {},
            {
              onSuccess: () => onSubmitSuccess(),
            }
          )
        }
      >
        {kycSubmit.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : "Submit"}
      </Button>

      <Button variant='secondary' className='ml-0' onClick={onBack}>
        Back
      </Button>
    </div>
  );
};
