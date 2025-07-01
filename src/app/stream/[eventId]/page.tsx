import LiveStream from "@/components/dashboard/events/LiveStream";

export async function generateMetadata({ params }: any) {
  const event = await fetchEventData(params);

  if (!event)
    return {
      title: "Guest Event",
      description: "Discover Oyoyo Events, the ultimate AI-powered event management platform...",
    };

  return {
    title: event?.title || "Guest Event",
    description: event?.description || "Discover Oyoyo Events, the ultimate AI-powered event management platform...",
    openGraph: {
      images: event?.media,
    },
  };
}

async function fetchEventData(params: any) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_BACKEND_URL}/events/${params.eventId}`);
  const json = await res.json();
  return json.data;
}

export default async function Page({ params }: any) {
  return <LiveStream params={params} />;
}
