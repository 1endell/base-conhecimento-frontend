
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Regex to match [[wikilinks]]
  const processWikiLinks = (text: string) => {
    return text.replace(/\[\[(.*?)\]\]/g, (match, title) => {
      // In a real app, you'd map titles to IDs. For now, we search by title or just link placeholder
      return `[${title}](#/search?q=${encodeURIComponent(title)})`;
    });
  };

  const processedContent = processWikiLinks(content);

  return (
    <div className="prose dark:prose-invert prose-indigo max-w-none">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => {
            const isExternal = props.href?.startsWith('http');
            if (isExternal) {
              return <a {...props} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline" />;
            }
            return <a {...props} className="text-indigo-600 hover:underline" />;
          }
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
