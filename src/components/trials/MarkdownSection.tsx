import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';

export default function MarkdownSection({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ node: _n, ...props }) => <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4" {...props} />,
        h3: ({ node: _n, ...props }) => <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3" {...props} />,
        p: ({ node: _n, ...props }) => <p className="text-slate-700 leading-relaxed mb-4" {...props} />,
        ul: ({ node: _n, ...props }) => <ul className="list-disc list-inside space-y-2 mb-4 text-slate-700" {...props} />,
        strong: ({ node: _n, ...props }) => <strong className="font-bold text-slate-900" {...props} />,
        a: ({ node: _n, href, children, ...props }) => {
          if (href?.startsWith('/')) {
            return (
              <Link
                to={href}
                className="text-neuro-600 font-medium underline underline-offset-2 hover:opacity-80"
                {...props}
              >
                {children}
              </Link>
            );
          }
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neuro-600 font-medium underline underline-offset-2 hover:opacity-80"
              {...props}
            >
              {children}
            </a>
          );
        },
        table: ({ node: _n, ...props }) => <div className="overflow-x-auto mb-6"><table className="w-full text-sm border-collapse border border-slate-200" {...props} /></div>,
        thead: ({ node: _n, ...props }) => <thead className="bg-slate-50" {...props} />,
        th: ({ node: _n, ...props }) => <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-900" {...props} />,
        td: ({ node: _n, ...props }) => <td className="border border-slate-200 px-3 py-2 text-slate-700" {...props} />,
        tr: ({ node: _n, ...props }) => <tr className="even:bg-slate-50 even:" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
