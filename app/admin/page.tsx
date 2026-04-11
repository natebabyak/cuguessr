import { createClient } from "@/lib/supabase/client";
import { PhotoCard } from "./photo-card";

export default async function Page() {
  const supabase = createClient();
  const { data: photos } = await supabase
    .from("photos")
    .select()
    .eq("verified", false);

  return (
    <main className="flex max-w-5xl flex-col gap-4 p-4">
      {photos?.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </main>
  );
}
