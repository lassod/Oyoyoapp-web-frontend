import { Button } from "@/components/ui/button";
import { DashboardHeader, DashboardHeaderText } from "@/components/ui/containers";

const Ticket = ({ params }: any) => {
  const { ticketId } = params;
  return (
    <div className='relative mx-auto mt-[150px] pr-4 md:pr-0'>
      <DashboardHeader>
        <DashboardHeaderText>View Transaction / {ticketId}</DashboardHeaderText>

        <span className='flex flex-row gap-[10px]'>
          <Button variant={"secondary"} className='flex flex-row justify-center items-center gap-[8px]'>
            Contact support
          </Button>
          <Button
            variant={"secondary"}
            className='flex flex-row justify-center items-center gap-[8px] bg-red-600 text-white'
          >
            Issue refund
          </Button>
        </span>
      </DashboardHeader>

      <div className='message'>
        <p>Subject</p>
        <h1 className='text-black'>I got my package broken</h1>
        <p>Created on Sat 12 may, 2023</p>
      </div>
    </div>
  );
};

export default Ticket;
