import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Oyoyo from "../../assets/images/Oyoyo.svg";
import Envelope from "../../assets/images/envelope.svg";
import Apple from "../../assets/images/apple.svg";
import Facebook from "../../assets/images/facebook.svg";
import Google from "../../assets/images/google.svg";
import SignupEmail from "../SignupEmail/SignUpEmail";
import Background from "../../authBackground/Background";

const Create = ({ personal }: { personal: boolean }) => {
  const [email, setEmail] = useState(false);
  return (
    <>
      {email ? (
        <SignupEmail personal={personal} />
      ) : (
        <section className='create'>
          <Background />
          <div className='container'>
            <Image src={Oyoyo} alt='Envelope' />
            <h2>Create an account</h2>
            <p className='text'>
              Already have an account?{" "}
              <Link className='text-red-700 font-medium hover:text-black' href='login'>
                Sign In
              </Link>
            </p>
            <div className='wrapper'>
              <span>
                <div className='line'></div>
                <p>or</p>
                <div className='line'></div>
              </span>
              <div className='sub_wrapper'>
                <Link href='#' onClick={() => setEmail(true)}>
                  <Image src={Envelope} alt='Envelope' />
                  <p>Sign up with Email</p>
                </Link>
                <Link href='#'>
                  <Image src={Apple} alt='Envelope' />
                  <p>Sign up with Apple</p>
                </Link>
                <Link href='#'>
                  <Image src={Facebook} alt='Envelope' />
                  <p>Sign up with Facebook</p>
                </Link>
                <Link href='#'>
                  <Image src={Google} alt='Envelope' />
                  <p>Sign up with Google</p>
                </Link>
              </div>
            </div>
            <p className='text2'>
              By proceeding, you agree to our{" "}
              <Link className='text-red-700 font-medium hover:text-black' href='#'>
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href='#' className='text-red-700 font-medium hover:text-black'>
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </section>
      )}
    </>
  );
};

export default Create;
