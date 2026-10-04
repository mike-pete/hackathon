// The page is a client component, so the segment config lives here.
// The first Exa people research for a job can take a couple of minutes.
export const maxDuration = 300;

export default function JobsLayout({ children }: LayoutProps<"/jobs">) {
  return children;
}
