import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your content here...',
  height = '300px',
}) => {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background',
    'align',
    'code-block'
  ];

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ height }}
      />
      <style>{`
        .rich-text-editor .ql-container {
          min-height: ${height};
          font-family: inherit;
        }
        
        .rich-text-editor .ql-editor {
          min-height: calc(${height} - 42px);
          font-size: 14px;
          line-height: 1.6;
        }
        
        .rich-text-editor .ql-toolbar {
          border-top: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
        }
        
        .rich-text-editor .ql-container {
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-bottom: 1px solid #ccc;
          border-top: none;
          border-radius: 0 0 8px 8px;
        }
        
        .rich-text-editor .ql-toolbar .ql-formats {
          margin-right: 12px;
        }
        
        /* Custom styling for better integration */
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9CA3AF;
          font-style: normal;
        }
        
        /* Code block styling */
        .rich-text-editor .ql-editor pre.ql-syntax {
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          padding: 12px;
          margin: 8px 0;
          overflow-x: auto;
        }
        
        /* Blockquote styling */
        .rich-text-editor .ql-editor blockquote {
          border-left: 4px solid #6366f1;
          padding-left: 16px;
          margin: 16px 0;
          color: #4b5563;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
