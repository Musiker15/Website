import type { MDXComponents as MDXComponentsType } from "mdx/types";
import Link from "next/link";
import { Callout } from "./Callout";
import { isExternal } from "@/lib/utils";

/**
 * Custom-Mappings für MDX-Inhalte. Werden vom renderMDX-Helper genutzt.
 */
export const mdxComponents: MDXComponentsType = {
  // Custom-Komponenten direkt in MDX nutzbar
  Callout,

  // Links: interne → next/link, externe → mit rel & target
  a: ({ href = "", children, ...rest }) => {
    if (isExternal(href)) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  },

  // Bilder mit lazy-loading
  // Wir nutzen bewusst <img> statt next/image, weil MDX-Inhalte keine
  // statisch bekannten Bildmaße haben (Autoren geben sie nicht an).
  img: ({ src, alt, ...rest }) => {
    return <img src={src as string} alt={alt ?? ""} loading="lazy" decoding="async" {...rest} />;
  },
};
