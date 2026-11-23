import { MDXRemote } from "next-mdx-remote/rsc";
import { Link } from "@/i18n/navigation";

/** Renders the MDX body on the server (no client JS). Internal links get locale-aware routing. */
export function Mdx({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={{
        p: (props) => <p className="mt-4 max-w-[60ch] text-lg text-n-700" {...props} />,
        a: ({ href = "", children }) =>
          href.startsWith("/") ? (
            <Link href={href} className="font-medium text-maroon underline underline-offset-4">{children}</Link>
          ) : (
            <a href={href} rel="noopener" className="font-medium text-maroon underline underline-offset-4">{children}</a>
          ),
      }}
    />
  );
}
