import { AgencyJobsList } from '@Interfaces/AgencyDashboardList.dto';
import { SendIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import DuplicateModal from './DuplicateModal';
import httpServiceObj from '@Services/ApiHandler.service';
import { toast } from 'react-toastify';
import { getToastOptions } from '@Utils/Toast.utils';
import { useAppContext } from '@Context/App.context';

interface UploadToAwsData{
  awsS3SignedUrl: string;
  cloudFileName: string;
  fileExtension: string;
  fileMimeType: string;
  userFileName: string;
}

interface UploadProfileProps{
    dashboardType:string;
    onClose: () => void;
    isOpen: boolean;
    rowData: AgencyJobsList | null;
}

interface FormValues {
  candidateName: string;
  candidateEmail: string;
  candidateContact: string;
  currentCompany: string;
  currentDesignation: string;
  totalYOE:number | null;
  relevantYOE:number | null;
  currentCTC:number | null;
  expectedCTC:number | null;
  location:string;
  relocate:boolean;
  noticePeriod:number | null;
  negotiable:boolean;
  cv: FileList;
  comments:string;
}

const UploadProfile:React.FC<UploadProfileProps> = ({dashboardType,onClose,isOpen,rowData}) => {
  const { register, handleSubmit, reset, setValue, watch,formState: { errors },} = useForm<FormValues>({ mode: "onChange",
        defaultValues: {
          candidateName: "",
          candidateEmail: "",
          candidateContact:"",
          currentCompany: "",
          currentDesignation: "",
          totalYOE:null,
          relevantYOE:null,
          currentCTC:null,
          expectedCTC:null,
          location:"",
          relocate:true,
          noticePeriod:null,
          negotiable:true,
          comments:"",
        },
      });
      const [visible, setVisible] = useState(false);
      const [isAnimatingIn, setIsAnimatingIn] = useState(false);
      const [isSubmitting,setIsSubmitting]  = useState(false);
      const [isDuplicateModal,setIsDuplicateModal] = useState(false);
      const agencyBaseUrl = import.meta.env.APP_PROXY_AGENCY_BASE
      const { userDetails } = useAppContext();

      useEffect(() => {
      if (isOpen) {
          setVisible(true);
          const timer = setTimeout(() => setIsAnimatingIn(true), 10);
          return () => clearTimeout(timer);
      } else {
          setIsAnimatingIn(false);
          const timer = setTimeout(() => setVisible(false), 300);
          return () => clearTimeout(timer);
      }
      }, [isOpen]);
  
    const formSubmit = async (data: any) => {
      setIsSubmitting(true)
      data.relocate = data.relocate === "true" || data.relocate === "yes" ? true : false;

      if(!data.candidateName || !data.candidateEmail || !data.candidateContact || !data.currentCompany
        || !data.currentDesignation || !data.totalYOE || !data.relevantYOE || !data.currentCTC || !data.expectedCTC || !data.location || data.relocate === undefined || !data.noticePeriod || data.negotiable === undefined || !data.cv?.length){
          toast.error("please fill all the required fields",getToastOptions({}))
          return
      }
      if(!rowData){
        toast.error("Company details not found",getToastOptions({}))
        return
      }
      if(!userDetails){
        toast.error("User details not found",getToastOptions({}))
        return
      }
        try {
        // 1. creating request to upload file to aws we will get awsS3SignedUrl as response
        const cvFile = data.cv?.[0];
        const payloadForAws = {
          companyId: rowData?.jobDetails?.companyId,
          jobId: rowData?.jobDetails?.id,
          fileName: cvFile.name,
          fileMimeType: "application/pdf"
        }
        const responseFromAws = await creatingRequestToUploadToAws(payloadForAws);
          // console.log(responseFromAws,"response from aws")
          if (!responseFromAws.success) {
            toast.error("Failed to upload contract copy", getToastOptions({}));
            return;
          }

          // 2. upload cv to s3 bucket this will give s3filename
          const payloadForFileUpload = {
            fileType: responseFromAws?.data?.fileMimeType
          }
          const fileUpload = await uploadFileToAws(responseFromAws?.data?.awsS3SignedUrl, cvFile,payloadForFileUpload);

          // 3. only posting cloudfilename
          const updatedPayload = {
            companyId: rowData?.jobDetails?.companyId,
            jobId: rowData?.jobDetails?.id,
            candidateParsedCvAwsS3FileName: responseFromAws?.data?.cloudFileName,
          }
          const createResponse = await uploadingProfileWithOnlyCVName(updatedPayload);
          // console.log(createResponse,'createResponse')
          if (!createResponse?.success) {
            toast.error("upload profie failed. Please try again.", getToastOptions({}));
            return;
          }

          // 3. posting full data 
          const payload={
              name: data?.candidateName,
              email: data?.candidateEmail,
              phoneNumberDetails: {
                  number: data?.candidateContact,
                  countryCode: 91
              },
              currentCompany: data?.currentCompany,
              currentDesignation: data?.currentDesignation,
              totalYOE: data?.totalYOE,
              relevantYOE: data?.relevantYOE ,
              currentCTC: data?.currentCTC,
              expectedCTC: data?.expectedCTC,
              noticePeriod: data?.noticePeriod,
              location: data?.location,
              readyToRelocate: data?.relocate,
              isNoticePeriodNegotiable: data?.negotiable,
              cvAwsS3FileName: responseFromAws?.data?.cloudFileName,
              companyId: rowData?.jobDetails?.companyId,
              jobId: rowData?.jobDetails?.id,
              agencyUserInviteId:rowData?.agencyUserInviteId,
          } as any;

          if (data?.comments?.trim()) {
            payload.agencyComments = data.comments.trim();
          }
          
          const uploadResponse:any = await uploadingProfileWithAllFields(payload);
          // console.log(uploadResponse,"uploadResponse")
          if (!uploadResponse.success) {
            toast.error("Failed to invite agency. Please try again.", getToastOptions({}));
            return; 
          }
          toast.success("Profile uploaded successfully",getToastOptions({}))
          reset()
          onClose()
        } catch (error) {
          console.log(error)
          toast.error("Network error please try again later",getToastOptions({}))
        } finally{
          setIsSubmitting(false)
        }
      }
    
      const uploadingProfileWithAllFields = async (payload: any) => {
        try {
          const { response } = await httpServiceObj.post(`${agencyBaseUrl}/agency-user-submission/`, payload, true, {}, true);
          if (response) {
            return { success: true, data: response };
          }
          return { success: false };
        } catch (error) {
          console.error("Upload failed:", error);
          return { success: false, error };
        }
      };

      const creatingRequestToUploadToAws = async (payload: any) => {
        try {
          const { response } = await httpServiceObj.post<UploadToAwsData>(`${agencyBaseUrl}/file/gsu2u/AGENCY_SUBMIT_USER_CV`, payload, true, {}, true);
          if (response) {
            return { success: true, data: response };
          }
          return { success: false };
        } catch (error) {
          console.error("Upload failed:", error);
          return { success: false, error };
        }
      };

      const uploadFileToAws = async (url:any,contractFile:any,payload: any) => {
        try {
          const { response } = await httpServiceObj.put(url, contractFile, false, payload, true);
          if (response) {
            return { success: true, data: response };
          }
          return { success: false };
        } catch (error) {
          console.error("Upload failed:", error);
          return { success: false, error };
        }
      };

      const uploadingProfileWithOnlyCVName = async (payload: any) => {
        try {
          const { response } = await httpServiceObj.post(`${agencyBaseUrl}/agency-user-submission/candidate-parse-cv`, payload, true, {}, true);
          if (response) {
            return { success: true, data: response };
          }
          return { success: false };
        } catch (error) {
          console.error("Agency creation failed:", error);
          return { success: false, error };
        }
      };

    return (
      <div
        className={`fixed inset-0 z-50 flex items-start justify-end transition-opacity duration-300 ease-in-out ${
          isAnimatingIn ? "bg-black bg-opacity-50" : "bg-opacity-0 bg-black"
        } ${visible ? "visible" : "invisible"}`}>
        <div
          className={`bg-white rounded-l-lg p-6 w-full max-w-md relative transform transition-transform duration-300 ease-in-out self-auto max-h-[100vh] overflow-y-auto ${
            isAnimatingIn ? "translate-x-0" : "translate-x-full"
          }`}>
          <button
            onClick={()=>{
                reset();
                onClose();}}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
            ×
          </button>
  
          <h2 className="text-xl font-semibold mb-4 text-left">Upload profile</h2>
  
          <form onSubmit={handleSubmit(formSubmit)}>
            <div className='text-left'>
                <label>Candidate name<span className='text-red-500'>*</span></label>
                <input
                placeholder='Rahul yadav'
                type="text"
                className="input_primary auth_input capitalize"
                {...register("candidateName", { required: "Candidate name is required." })}
                />
                {errors.candidateName && <p className="text-red-500 text-sm mt-1">{errors.candidateName.message}</p>}
            </div>
  
              <div className='text-left'>
                  <label htmlFor="">Candidate email<span className='text-red-500'>*</span></label>
                  <input 
                  placeholder='rahulyadav@gmail.com'
                  type="text" 
                  className="input_primary auth_input"
                  {...register("candidateEmail", {
                    required: "Candidate email is required",
                    pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email",
                    },
                    })}
                  />
                {errors.candidateEmail && <p className="text-red-500 text-sm mt-1">{errors.candidateEmail.message}</p>}
              </div>
  
                <div className='text-left'>
                  <label htmlFor="">Current contact no<span className='text-red-500'>*</span></label>
                  <input
                  placeholder='Enter valid contact number'
                  maxLength={10}
                    type="text"
                    className="input_primary auth_input capitalize"
                    {...register("candidateContact", {
                        required: "candidate contact number is required",
                        pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Contact number must be exactly 10 digits",
                        },
                    })}
                    onInput={(e) => {
                        const input = e.target as HTMLInputElement;
                        input.value = input.value.replace(/\D/g, ''); // remove non-digits
                    }}
                    />
                  {errors.candidateContact && <p className="text-red-500 text-sm mt-1">{errors.candidateContact.message}</p>}
              </div>

              {/* ask if current company is optional or manditory*/}
              <div className='text-left'>
                  <label htmlFor="">Current company<span className='text-red-500'>*</span></label>
                  <input 
                  placeholder='Infosys'
                  type="text" 
                  className="input_primary auth_input"
                  {...register("currentCompany",{required:"Current company is required"})}
                  />
                  {errors.currentCompany && <p className="text-red-500 text-sm mt-1">{errors.currentCompany.message}</p>}
              </div>

              <div className='text-left'>
                  <label htmlFor="">Current designation<span className='text-red-500'>*</span></label>
                  <input 
                    placeholder='sales manager'
                    type="text" 
                    className="input_primary auth_input capitalize"
                    {...register("currentDesignation", {required: "please specify the designation"})}
                  />
                {errors.currentDesignation && <p className="text-red-500 text-sm mt-1">{errors.currentDesignation.message}</p>}
              </div>

            {/* ask if experience is in months how to handle and what is its a fresher*/} {/* total and relevant yoe */}
            <div className='flex flex-row gap-3'>
                <div className='text-left'>
                    <label htmlFor="">Total YOE (in years)<span className='text-red-500'>*</span></label>
                    <input 
                      placeholder='total experience'
                      type="number" 
                      className="input_primary auth_input"
                      {...register("totalYOE",{required:"total experience must be filled"})}
                    />
                    {errors.totalYOE && <p className="text-red-500 text-sm mt-1">{errors.totalYOE.message}</p>}
                </div>
                <div className='text-left'>
                    <label htmlFor="">Relevant YOE (in years)<span className='text-red-500'>*</span></label>
                    <input 
                    placeholder='relevant experience'
                    type="number" 
                    className="input_primary auth_input"
                    {...register("relevantYOE",{required:"relevant experience must be filled"})}
                    />
                    {errors.relevantYOE && <p className="text-red-500 text-sm mt-1">{errors.relevantYOE.message}</p>}
                </div>
            </div>

            {/* current and expected ctc */}
            <div className='flex flex-row gap-3'>
                <div className='text-left'>
                    <label htmlFor="">Current CTC (in LPA)<span className='text-red-500'>*</span></label>
                    <input 
                    placeholder='5'
                    type="number" 
                    className="input_primary auth_input"
                    {...register("currentCTC",{required:"current Ctc is required"})}
                    />
                    {errors.currentCTC && <p className="text-red-500 text-sm mt-1">{errors.currentCTC.message}</p>}
                </div>
                <div className='text-left'>
                    <label htmlFor="">Expected CTC (in LPA)<span className='text-red-500'>*</span></label>
                    <input 
                    placeholder='7'
                    type="number" 
                    className="input_primary auth_input"
                    {...register("expectedCTC",{required:"expected Ctc is required"})}
                    />
                    {errors.expectedCTC && <p className="text-red-500 text-sm mt-1">{errors.expectedCTC.message}</p>}
                </div>
            </div>

            {/* location and preference */}
            <div className='flex flex-row gap-3'>
                <div className='text-left flex-1'>
                    <label htmlFor="">Location (current)<span className='text-red-500'>*</span></label>
                    <input 
                    placeholder='mumbai'
                    type="text" 
                    className="input_primary auth_input"
                    {...register("location",{required:"current location is required"})}
                    />
                    {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
                </div>
                <div className='text-left flex-1'>
                    <label htmlFor="">Ready to relocate<span className='text-red-500'>*</span></label>
                    <select
                      className="input_primary auth_input text-gray-300"
                      {...register("relocate", {
                        required: "relocation preference is required",
                      })}
                      onChange={(e) => {
                        const value = e.target.value === "true";
                        setValue("relocate", value)
                      }}
                      defaultValue="true"
                    >
                      <option value="">Choose</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>

                    {errors.relocate && <p className="text-red-500 text-sm mt-1">{errors.relocate.message}</p>}
                </div>
            </div>

            {/* notice period and negotiable */}
            <div className='flex flex-row gap-3 justify-center items-center'>
                <div className='text-left flex-1'>
                    <label htmlFor="">Notice period (in days)<span className='text-red-500'>*</span></label>
                    <input 
                      placeholder='Notice Period'
                      type="number" 
                      className="input_primary auth_input"
                      {...register("noticePeriod",{required:"notice period is required"})}
                    />
                    {errors.noticePeriod && <p className="text-red-500 text-sm mt-1">{errors.noticePeriod.message}</p>}
                </div>
                <div className='text-left flex-1'>
                    <label htmlFor="negotiable" className="flex items-center gap-2">
                    <input
                      id="negotiable"
                      type="checkbox"
                      className="accent-blue-600 w-4 h-4"
                      {...register("negotiable")}
                    />
                    Negotiable<span className='text-red-500'>*</span>
                    </label>
                {errors.negotiable && <p className="text-red-500 text-[11px] mt-1">{errors.negotiable.message}</p>}
                </div>

            </div>

            <div className='text-left mt-4'>
            <label htmlFor="cv">CV (PDF only)<span className='text-red-500'>*</span></label>
            <input
                type="file"
                accept="application/pdf"
                {...register("cv", {
                required: "please upload candidate cv",
                validate: {
                    isPdf: (value: FileList) =>
                    value?.[0]?.type === "application/pdf" || "Only PDF files are allowed.",
                    isUnder5MB: (value: FileList) =>
                    value?.[0]?.size <= 5 * 1024 * 1024 || "File size must be under 5MB",
                },
                })}
                className="input_primary auth_input"
            />
            {errors.cv && (
                <p className="text-red-500 text-sm mt-1">{errors.cv.message}</p>
            )}
            </div>

            <div className='text-left flex-1'>
                <label htmlFor="">Any comments</label>
                <textarea 
                placeholder='comments'
                className="input_primary auth_input"
                {...register("comments")}
                />
            </div>

            <div className="flex justify-start mt-4">
              <button
              disabled = {isSubmitting} 
              className="flex items-center gap-1 px-3 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                <SendIcon className='h-4 w-4'/>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
        {/* <DuplicateModal
          onClose={()=>setIsDuplicateModal(false)}
          isOpen={isDuplicateModal}
          /> */}
      </div>
    )
  }

export default UploadProfile