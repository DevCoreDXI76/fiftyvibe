import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: (props) => <h2 className="mt-8 text-xl font-bold text-navy" {...props} />,
    h3: (props) => <h3 className="mt-6 text-lg font-semibold text-navy" {...props} />,
    p: (props) => <p className="mt-4 leading-relaxed text-navy" {...props} />,
    ul: (props) => <ul className="mt-4 list-disc pl-6 text-navy" {...props} />,
    ol: (props) => <ol className="mt-4 list-decimal pl-6 text-navy" {...props} />,
    li: (props) => <li className="mt-1" {...props} />,
    a: (props) => <a className="underline decoration-amber" {...props} />,
    strong: (props) => <strong className="font-semibold text-navy" {...props} />,
    ...components,
  };
}
