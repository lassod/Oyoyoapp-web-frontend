import bg from "../../assets/images/andrea-mininni.jpg";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Reveal1, Reveal3 } from "../../animations/Text";

const HeroPage = () => {
  return (
    <div className='bg-lines'>
      <section className='rounded-[20px] h-auto max-w-[1380px] w-full max-h-[400px] top-[65px] mx-auto md:rounded-[50px]'>
        <div className='z-10 flex flex-col justify-center items-center text-center relative top-[158px] gap-6 px-4 md:px-6'>
          <Reveal1>
            <h1 className='max-w-[792px] text-center'>Transform Your Events with Oyoyo Events App</h1>
          </Reveal1>
          <span className='text-red-700 font-bold'>Plan. Connect. Celebrate</span>
          <Reveal3>
            <p className='max-w-[588px] w-full'>
              Prepare to transform your planning journey with a platform crafted to simplify, streamline, and enhance
              every facet of event management.
            </p>
          </Reveal3>
          <Link rel='noopener noreferrer' href='#contact'>
            <Button variant={"landmark"} className='max-w-[142px]'>
              Get the app
            </Button>
          </Link>

          <div className='w-full md:mt-8 rounded-[10px] max-h-[300px] overflow-hidden'>
            <Image src={bg} alt='BACKGROUND' className='bg-black shadow-lg rounded-xl' />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroPage;
