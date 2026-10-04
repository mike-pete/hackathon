import Image from "next/image";
import type { PersonProfile } from "./actions";

export default function PersonCard({ person }: { person: PersonProfile }) {
  return (
    <div className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <Image
        src={person.profilePicUrl}
        alt={person.jobTitle}
        width={56}
        height={56}
        className="h-14 w-14 shrink-0 rounded-full object-cover"
        unoptimized
      />
      <div className="min-w-0">
        <p className="font-semibold leading-snug">{person.jobTitle}</p>
        <a
          href={`mailto:${person.email}`}
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          {person.email}
        </a>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {person.description}
        </p>
      </div>
    </div>
  );
}
