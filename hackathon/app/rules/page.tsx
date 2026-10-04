import RulesEditor from "./rules-editor";

export default function RulesPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 overflow-y-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">Rules</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Define the rules that shape which jobs and people surface for you.
      </p>
      <RulesEditor />
    </main>
  );
}
