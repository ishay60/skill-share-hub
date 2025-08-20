import React from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

interface SafeHTMLContentProps {
  content: string;
  type: 'html' | 'markdown';
  className?: string;
  allowInteractive?: boolean;
}

const SafeHTMLContent: React.FC<SafeHTMLContentProps> = ({
  content,
  type,
  className = '',
  allowInteractive = false,
}) => {
  const processContent = () => {
    let htmlContent = content;
    
    // Convert markdown to HTML if needed
    if (type === 'markdown') {
      htmlContent = marked(content, {
        breaks: true,
        gfm: true,
      }) as string;
    }
    
    // Configure DOMPurify
    const purifyConfig = {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'strike', 'del',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote', 'pre', 'code',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span',
        ...(allowInteractive ? ['button', 'input', 'form', 'select', 'textarea', 'script'] : []),
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id',
        'target', 'rel',
        'style', // For inline styles
        ...(allowInteractive ? ['onclick', 'onchange', 'type', 'value', 'name'] : []),
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
      ADD_TAGS: allowInteractive ? ['iframe'] : [],
      ADD_ATTR: allowInteractive ? ['allow', 'allowfullscreen', 'frameborder', 'scrolling'] : [],
    };
    
    // Sanitize the HTML
    const sanitizedHTML = DOMPurify.sanitize(htmlContent, purifyConfig);
    
    return sanitizedHTML;
  };

  const sanitizedContent = processContent();

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      style={{
        // Custom prose styling for better integration
        '--tw-prose-body': '#374151',
        '--tw-prose-headings': '#111827',
        '--tw-prose-lead': '#4b5563',
        '--tw-prose-links': '#6366f1',
        '--tw-prose-bold': '#111827',
        '--tw-prose-counters': '#6b7280',
        '--tw-prose-bullets': '#d1d5db',
        '--tw-prose-hr': '#e5e7eb',
        '--tw-prose-quotes': '#111827',
        '--tw-prose-quote-borders': '#e5e7eb',
        '--tw-prose-captions': '#6b7280',
        '--tw-prose-code': '#111827',
        '--tw-prose-pre-code': '#e5e7eb',
        '--tw-prose-pre-bg': '#1f2937',
        '--tw-prose-th-borders': '#d1d5db',
        '--tw-prose-td-borders': '#e5e7eb',
      } as React.CSSProperties}
    />
  );
};

export default SafeHTMLContent;
