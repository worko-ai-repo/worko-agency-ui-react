import CognitoAgencyServiceObj from "@Utils/CognitoAgency.utils"; // <-- your new agency service
import { validationRules } from "@Utils/FormValidator.utils";
import { Info } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
// optional: if you want to redirect after success
import { useNavigate } from "react-router-dom";
import httpServiceObj from "@Services/ApiHandler.service";
import { getToastOptions } from "@Utils/Toast.utils";

type FormValues = { email: string; password: string };

const AgencyLoginForm = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const [showPassword, setShowPassword] = useState(false);
  const agencyBaseUrl = import.meta.env.APP_PROXY_AGENCY_BASE

  const onSubmit = async (data: FormValues) => {
    const loginData = {
      email: data.email,
      password: data.password,
    };
    try {
      const { response, error } = await CognitoAgencyServiceObj.handleSignIn({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error(error.message || "Login failed",getToastOptions({}));
        return;
      }

      if (response && response.isValid && response.isValid()) {
        toast.success("Logged in (agency) successfully",getToastOptions({}));
        let sub = "b1e33d0a-f0e1-70c4-a2c3-c608c7a7c517"
        const { response } = await httpServiceObj.get<any>(`${agencyBaseUrl}/agency-user/${sub}/cognito`, true, {}, true);
        console.log(response)

        const id = "5HWCYGNW71E32A5GY6133TFH8Q"
        const {anotherResponse} = await httpServiceObj.get<any>(`${agencyBaseUrl}/agency-user/${response.id}`, true, {}, true)
        console.log(anotherResponse)
        setTimeout(() => {
            window.location.href = `/${import.meta.env.APP_PROXY_DASH}/agency`;
          }, 2000);
      } else {
        toast.error("Login did not complete",getToastOptions({}));
      }
    } catch (e: any) {
      toast.error(e?.message || "Something went wrong during login",getToastOptions({}));
    }
  };

  return (
    <form
      onSubmit={handleSubmit((data) =>
        toast.promise(() => onSubmit(data), {
          pending: "Signing in...",
          error: "Error during sign-in",
          success: "Signed in",
        })
      )}
      className="w-full"
    >
      <p className="font-semibold text-gray-700 text-2xl text-center">Agency Login</p>

      <div className="bg-orange-100 p-3 mt-2 rounded-xl">
        <Info className="mr-2 p-0.5 text-orange-500 inline-block" />
        <span className="text-orange-500 leading-none tracking-tighter font-semibold text-xs">
          Use your agency credentials to sign in.
        </span>
      </div>

      <div className="mainForm min-w-full grid sm:grid-cols-[repeat(auto,_minmax(500px,500px))] grid-row-[min-content] w-full px-2 sm:px-3 md:py-6 rounded-2xl mx-auto sm:py-2 min-h-[250px]">
        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            className="input_primary auth_input"
            // use a generic email rule if you have one; avoid "corporateEmail"
            {...register("email", validationRules.email ?? validationRules.corporateEmail)}
          />
          {errors.email && <p className="text-sm text-left text-red-500">{String(errors.email.message)}</p>}
        </div>

        <div className="relative">
          <label className="block font-medium">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            className={`input_primary auth_input ${errors.password ? "error" : ""}`}
            {...register("password", validationRules.password)}
          />
          <span className="absolute right-3 top-9 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <i className="fa-regular fa-eye-slash mt-2" /> : <i className="fa-regular fa-eye mt-2" />}
          </span>
          {errors.password && <p className="text-sm text-left text-red-500">{String(errors.password.message)}</p>}
        </div>

        <a
          onClick={() => navigate("/auth/resetpassword", { state: { pagetype: "AGENCY" } })}
          className="text-right cursor-pointer text-sm text-blue-500"
        >
          Forgot password?
        </a>
      </div>

      <button type="submit" className="btn_primary w-[250px]">Login</button>
    </form>
  );
};

export default AgencyLoginForm;


// import { validationRules } from '@Utils/FormValidator.utils';
// import { getToastOptions } from '@Utils/Toast.utils';
// import React, { useState } from 'react'
// import { useForm, SubmitHandler } from 'react-hook-form'
// import { useNavigate } from "react-router-dom";
// import { toast } from 'react-toastify';

// interface AgencyLoginFormProps{

// }

// type FormValues = {
//   email: string
//   password: string
// }

// const AgencyLoginForm:React.FC<AgencyLoginFormProps> = ({}) => {
//   const {register, handleSubmit, formState: { errors }} = useForm<FormValues>({mode: "onChange",defaultValues: {email: "",password: ""}})
//   const navigate = useNavigate();
//   const [showPassword, setShowPassword] = useState(false);

//   const onSubmit: SubmitHandler<FormValues> = (data) => {
//     // toast.success(data, getToastOptions({}))
//     window.location.href = "/agency-dashboard"
//     console.log(data)
//   }

//   return (
//         <form
//           onSubmit={handleSubmit(onSubmit)}
//           className="w-full ">
//           <p className="font-semibold text-gray-700 text-2xl text-center ">Agency Login </p>
//           <div className="mainForm min-w-full grid sm:grid-cols-[repeat(auto,_minmax(500px,500px))] grid-row-[min-content]   w-full px-2 sm:px-3 md:py-6 rounded-2xl mx-auto sm:py-2 min-h-[250px] ">
//             <div>
//             <label className="block font-medium">Email id</label>
//             <input
//                 type="email"
//                 className="input_primary auth_input "
//                 {...register("email", validationRules.corporateEmail)}
//             />
//             {errors.email && (
//                 <p className="text-sm text-left text-red-500">{errors.email.message?.toString()}</p>
//             )}
//             </div>
    
//             {/* Password */}
//                 <div className="relative">
//                 <label className="block font-medium">Password</label>
//                 <input
//                     type={showPassword ? "text" : "password"}
//                     className={`input_primary auth_input  ${errors.password && "error"}`}
//                     {...register("password", validationRules.password)}
//                 />
//                 <span
//                     className="absolute right-3 top-9 cursor-pointer"
//                     onClick={() => setShowPassword(!showPassword)}>
//                     {showPassword ? (
//                     <i className="fa-regular fa-eye-slash mt-2"></i>
//                     ) : (
//                     <i className="fa-regular fa-eye mt-2"></i>
//                     )}
//                 </span>
//                 {errors.password && (
//                     <p className="text-sm text-left text-red-500">{errors.password.message?.toString()}</p>
//                 )}
//                 </div>
            
//             {/* forget password */}
//             <a
//               onClick={() => navigate("/auth/resetpassword", { state: { pagetype: "AGENCY" } })}
//               className="text-right cursor-pointer text-sm text-blue-500 ">
//               Forgot password?
//             </a>

//           </div>
//           <button type="submit" className="btn_primary w-[250px]">
//             Login
//           </button>
//         </form>
//   )
// }

// export default AgencyLoginForm